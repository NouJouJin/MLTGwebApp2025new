// Vercel Serverless Function: Moralis NFT API Proxy
// APIキーをサーバーサイドで管理し、クライアントに露出させない

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

  const { address, chain } = req.query;

  if (!address || !chain) {
    return res.status(400).json({ error: 'Missing required parameters: address, chain' });
  }

  // Ethereumアドレスの検証
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!addressRegex.test(address)) {
    return res.status(400).json({ error: 'Invalid address format' });
  }

  const apiKey = process.env.MORALIS_API_KEY;
  if (!apiKey) {
    console.error('MORALIS_API_KEY is not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // 有効なコントラクトアドレスを日付範囲に基づいて収集
  const contractAddresses = [];

  const baseContract = process.env.NFT_CONTRACT_ADDRESS;
  if (baseContract) contractAddresses.push(baseContract);

  // 2026年〜2027年3月対象コントラクト
  const contract2027 = process.env.NFT_CONTRACT_ADDRESS_2027;
  if (contract2027) {
    const now = new Date();
    const start = new Date('2026-01-01');
    const end = new Date('2027-04-01'); // 2027年3月末まで
    if (now >= start && now < end) {
      contractAddresses.push(contract2027);
    }
  }

  if (contractAddresses.length === 0) {
    console.error('NFT_CONTRACT_ADDRESS is not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const tokenAddressParams = contractAddresses.map(addr => `token_addresses=${addr}`).join('&');

  try {
    const response = await fetch(
      `https://deep-index.moralis.io/api/v2.2/${address}/nft?chain=${chain}&${tokenAddressParams}&limit=100`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-API-Key': apiKey,
        },
      }
    );

    if (!response.ok) {
      console.error(`Moralis API error: ${response.status}`);
      return res.status(response.status).json({ error: 'Failed to fetch NFT data' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
