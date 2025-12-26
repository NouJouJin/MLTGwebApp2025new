// Vercel Serverless Function: Airtable Orders API Proxy
// 注文データの送信を処理

export default async function handler(req, res) {
  // CORSヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_ORDERS_TABLE_ID;

  if (!apiKey || !baseId || !tableId) {
    console.error('Airtable configuration is missing');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const body = req.body;

    // 必須フィールドの検証
    if (!body.records || !Array.isArray(body.records) || body.records.length === 0) {
      return res.status(400).json({ error: 'Invalid request body: records array is required' });
    }

    const record = body.records[0];
    if (!record.fields) {
      return res.status(400).json({ error: 'Invalid request body: fields is required' });
    }

    const { Name, Zip_Code, Address, Tel, Mail } = record.fields;

    // 基本的なバリデーション
    if (!Name || Name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }

    const zipRegex = /^\d{3}-\d{4}$/;
    if (!zipRegex.test(Zip_Code)) {
      return res.status(400).json({ error: 'Invalid zip code format (expected: 123-4567)' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Mail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const telRegex = /^0\d{1,4}-\d{1,4}-\d{4}$/;
    if (!telRegex.test(Tel)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${tableId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      console.error(`Airtable API error: ${response.status}`);
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: 'Failed to submit order', details: errorData });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error submitting order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
