// Vercel Serverless Function: Collection NFTs API Proxy（旧 Moralis → 2026-11 Alchemy に切り替え）
// コレクション内のNFT一覧取得。レスポンスは Moralis 形式 { result: [...] } を維持

import { getAlchemyApiKey, getAlchemyNetwork, getNftsForContract } from './_alchemy.js';

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

  const { collection, chain } = req.query;

  if (!collection || !chain) {
    return res.status(400).json({ error: 'Missing required parameters: collection, chain' });
  }

  // Ethereumアドレスの検証
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!addressRegex.test(collection)) {
    return res.status(400).json({ error: 'Invalid collection address format' });
  }

  const alchemyApiKey = getAlchemyApiKey();
  const moralisApiKey = process.env.MORALIS_API_KEY;
  if (!alchemyApiKey && !moralisApiKey) {
    console.error('ALCHEMY_API_KEY is not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    if (alchemyApiKey) {
      const network = getAlchemyNetwork(chain);
      if (!network) {
        return res.status(400).json({ error: 'Unsupported chain' });
      }
      const result = await getNftsForContract({ contractAddress: collection, network });
      return res.status(200).json({ result });
    }

    // 旧経路（Moralis）。ALCHEMY_API_KEY 未設定時のみ使用
    const response = await fetch(
      `https://deep-index.moralis.io/api/v2.2/nft/${collection}?chain=${chain}&format=decimal`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-API-Key': moralisApiKey,
        },
      }
    );

    if (!response.ok) {
      console.error(`Moralis API error: ${response.status}`);
      return res.status(response.status).json({ error: 'Failed to fetch collection NFTs' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching collection NFTs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
