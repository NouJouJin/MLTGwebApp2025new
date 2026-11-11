// Alchemy NFT API helper (Vercel: files starting with "_" are not exposed as routes)
// Moralis の無料枠終了（2026-09-01）に伴い、NFT取得を Alchemy に切り替えるための共通処理。
// レスポンスは既存フロントエンドが期待する Moralis 形式（{ result: [...] }）に変換して返す。

const ALCHEMY_NETWORKS = {
  polygon: 'polygon-mainnet',
  matic: 'polygon-mainnet',
  '0x89': 'polygon-mainnet',
  '137': 'polygon-mainnet',
  eth: 'eth-mainnet',
  ethereum: 'eth-mainnet',
  '0x1': 'eth-mainnet',
  '1': 'eth-mainnet',
};

export const getAlchemyApiKey = () => process.env.ALCHEMY_API_KEY || '';

export const getAlchemyNetwork = (chain) =>
  ALCHEMY_NETWORKS[String(chain || '').toLowerCase()] || '';

export const getAlchemyRpcUrl = (chain = 'polygon') => {
  const apiKey = getAlchemyApiKey();
  const network = getAlchemyNetwork(chain);
  if (!apiKey || !network) return '';
  return `https://${network}.g.alchemy.com/v2/${encodeURIComponent(apiKey)}`;
};

const nftBaseUrl = (network) =>
  `https://${network}.g.alchemy.com/nft/v3/${encodeURIComponent(getAlchemyApiKey())}`;

// Alchemy の NFT 1件を Moralis 形式に変換
export const toMoralisNft = (nft, ownerAddress = null) => {
  const metadata =
    nft?.raw?.metadata && typeof nft.raw.metadata === 'object'
      ? nft.raw.metadata
      : null;
  const hasMetadata = metadata && Object.keys(metadata).length > 0;

  return {
    token_address: (nft?.contract?.address || '').toLowerCase(),
    token_id: String(nft?.tokenId ?? ''),
    contract_type: nft?.tokenType || nft?.contract?.tokenType || null,
    owner_of: ownerAddress ? ownerAddress.toLowerCase() : null,
    amount: String(nft?.balance ?? '1'),
    name: nft?.contract?.name || null,
    symbol: nft?.contract?.symbol || null,
    token_uri: nft?.raw?.tokenUri || nft?.tokenUri || null,
    metadata: hasMetadata ? JSON.stringify(metadata) : null,
    normalized_metadata: hasMetadata ? metadata : null,
  };
};

const fetchJson = async (url) => {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) {
    let detail = '';
    try {
      detail = (await response.text()).slice(0, 300);
    } catch (error) {
      // ignore
    }
    const err = new Error(`Alchemy API error: ${response.status} ${detail}`);
    err.status = response.status;
    throw err;
  }
  return response.json();
};

// ウォレットが保有するNFT（指定コントラクトのみ）
export const getNftsForOwner = async ({ owner, network, contractAddresses, maxPages = 10 }) => {
  const results = [];
  let pageKey = '';

  for (let page = 0; page < maxPages; page += 1) {
    const params = new URLSearchParams({
      owner,
      withMetadata: 'true',
      pageSize: '100',
    });
    contractAddresses.forEach((address) => params.append('contractAddresses[]', address));
    if (pageKey) params.set('pageKey', pageKey);

    const data = await fetchJson(`${nftBaseUrl(network)}/getNFTsForOwner?${params.toString()}`);
    (data.ownedNfts || []).forEach((nft) => results.push(toMoralisNft(nft, owner)));

    pageKey = data.pageKey || '';
    if (!pageKey) break;
  }

  return results;
};

// コレクション内のNFT一覧
export const getNftsForContract = async ({ contractAddress, network, maxPages = 10 }) => {
  const results = [];
  let pageKey = '';

  for (let page = 0; page < maxPages; page += 1) {
    const params = new URLSearchParams({
      contractAddress,
      withMetadata: 'true',
      limit: '100',
    });
    if (pageKey) params.set('startToken', pageKey);

    const data = await fetchJson(`${nftBaseUrl(network)}/getNFTsForContract?${params.toString()}`);
    (data.nfts || []).forEach((nft) => results.push(toMoralisNft(nft)));

    pageKey = data.pageKey || '';
    if (!pageKey) break;
  }

  return results;
};
