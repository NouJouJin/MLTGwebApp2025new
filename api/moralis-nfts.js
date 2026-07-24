// Vercel Serverless Function: Moralis NFT API Proxy
// APIキーをサーバーサイドで管理し、クライアントに露出させない

const FARMING_2026_CONTRACT_ADDRESS =
  '0x5ecbe52f8c34888e54393b3a83cc7a838fe0d417';
const IPFS_METADATA_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
];

const parseMetadata = (metadata) => {
  if (!metadata) return {};
  if (typeof metadata === 'object') return metadata;

  try {
    return JSON.parse(metadata) || {};
  } catch (error) {
    return {};
  }
};

const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

const decodeAbiString = (encodedValue) => {
  if (!/^0x[0-9a-fA-F]+$/.test(encodedValue || '')) return '';

  const data = encodedValue.slice(2);
  const offset = Number(BigInt(`0x${data.slice(0, 64)}`)) * 2;
  const length = Number(BigInt(`0x${data.slice(offset, offset + 64)}`)) * 2;
  const valueStart = offset + 64;
  const valueHex = data.slice(valueStart, valueStart + length);
  return Buffer.from(valueHex, 'hex').toString('utf8');
};

const fetchOnChainTokenUri = async (tokenAddress, tokenId) => {
  const thirdwebClientId =
    process.env.THIRDWEB_CLIENT_ID || process.env.REACT_APP_THIRDWEB_CLIENT_ID;
  const polygonRpcUrl =
    process.env.POLYGON_RPC_URL ||
    (thirdwebClientId
      ? `https://137.rpc.thirdweb.com/${encodeURIComponent(thirdwebClientId)}`
      : '');

  if (!polygonRpcUrl) return '';

  const encodedTokenId = BigInt(tokenId).toString(16).padStart(64, '0');
  const response = await fetchWithTimeout(polygonRpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [
        {
          to: tokenAddress,
          data: `0x0e89341c${encodedTokenId}`,
        },
        'latest',
      ],
    }),
  });

  if (!response.ok) return '';

  const rpcResult = await response.json();
  if (!rpcResult.result) return '';

  return decodeAbiString(rpcResult.result).replace(
    /\{id\}/gi,
    encodedTokenId.toLowerCase()
  );
};

const fetchMetadataFromTokenUri = async (tokenUri) => {
  if (!tokenUri) return null;

  const metadataUrls = tokenUri.startsWith('ipfs://')
    ? IPFS_METADATA_GATEWAYS.map(
        (gateway) =>
          `${gateway}${tokenUri.replace(/^ipfs:\/\/(?:ipfs\/)?/, '')}`
      )
    : [tokenUri];

  for (const metadataUrl of metadataUrls) {
    try {
      const response = await fetchWithTimeout(metadataUrl, {
        headers: {
          accept: 'application/json',
        },
      });
      if (!response.ok) continue;

      const metadata = await response.json();
      if (metadata && typeof metadata === 'object') {
        return metadata;
      }
    } catch (error) {
      // Try the next gateway.
    }
  }

  return null;
};

const enrichNftMetadata = async (nft) => {
  if (
    nft.token_address?.toLowerCase() !== FARMING_2026_CONTRACT_ADDRESS ||
    parseMetadata(nft.metadata).name
  ) {
    return nft;
  }

  try {
    const tokenUri = await fetchOnChainTokenUri(
      nft.token_address,
      nft.token_id
    );
    const onChainMetadata = await fetchMetadataFromTokenUri(tokenUri);
    if (!onChainMetadata) return nft;

    const metadata = {
      ...parseMetadata(nft.metadata),
      ...onChainMetadata,
    };

    return {
      ...nft,
      token_uri: tokenUri,
      metadata: JSON.stringify(metadata),
      normalized_metadata: metadata,
    };
  } catch (error) {
    console.error(
      `Failed to load on-chain metadata for ${nft.token_address}/${nft.token_id}:`,
      error
    );
    return nft;
  }
};

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

  // Support both a comma-separated variable and the existing Vercel variables.
  const configuredContractAddresses = [
    process.env.NFT_CONTRACT_ADDRESSES,
    process.env.NFT_CONTRACT_ADDRESS,
    process.env.NFT_CONTRACT_ADDRESS_2027,
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(','))
    .map((contractAddress) => contractAddress.trim())
    .filter(Boolean);

  const seenContractAddresses = new Set();
  const contractAddresses = configuredContractAddresses.filter((contractAddress) => {
    const normalizedAddress = contractAddress.toLowerCase();
    if (seenContractAddresses.has(normalizedAddress)) {
      return false;
    }
    seenContractAddresses.add(normalizedAddress);
    return true;
  });

  if (contractAddresses.length === 0) {
    console.error('NFT contract addresses are not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (
    contractAddresses.length > 10 ||
    contractAddresses.some((contractAddress) => !addressRegex.test(contractAddress))
  ) {
    console.error('NFT contract address configuration is invalid');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const params = new URLSearchParams({
      chain,
      limit: '100',
    });
    contractAddresses.forEach((contractAddress) => {
      params.append('token_addresses', contractAddress);
    });

    const response = await fetch(
      `https://deep-index.moralis.io/api/v2.2/${address}/nft?${params.toString()}`,
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
    if (Array.isArray(data.result)) {
      data.result = await Promise.all(data.result.map(enrichNftMetadata));
    }
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
