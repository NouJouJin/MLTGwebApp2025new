// Vercel Serverless Function: Airtable NFT Info API Proxy
// APIキーとBase ID/Table IDをサーバーサイドで管理

export default async function handler(req, res) {
  // CORSヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tokenAddress, tokenId } = req.query;

  if (!tokenAddress || !tokenId) {
    return res.status(400).json({ error: 'Missing required parameters: tokenAddress, tokenId' });
  }

  // Ethereumアドレスの検証
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!addressRegex.test(tokenAddress)) {
    return res.status(400).json({ error: 'Invalid tokenAddress format' });
  }

  // tokenIdの検証（数値のみ）
  if (!/^\d+$/.test(tokenId)) {
    return res.status(400).json({ error: 'Invalid tokenId format' });
  }

  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_NFT_TABLE_ID;

  if (!apiKey || !baseId || !tableId) {
    console.error('Airtable configuration is missing');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const formula = `AND({Contract_ID}="${tokenAddress}",{Token_ID}=${tokenId})`;
    const encodedFormula = encodeURIComponent(formula);

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${tableId}?filterByFormula=${encodedFormula}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Airtable API error: ${response.status}`);
      return res.status(response.status).json({ error: 'Failed to fetch NFT info' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching NFT info:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
