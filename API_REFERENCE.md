# API リファレンス

**MLTG Web Application - 外部API仕様書**

このドキュメントは、MLTG Web Applicationで使用する外部APIの詳細仕様を記載しています。

---

## 目次

1. [Moralis API](#moralis-api)
2. [Airtable API](#airtable-api)
3. [ThirdWeb SDK](#thirdweb-sdk)
4. [エラーハンドリング](#エラーハンドリング)
5. [レート制限](#レート制限)

---

## Moralis API

### 概要

Moralis APIは、ブロックチェーン上のNFTメタデータを取得するために使用します。

**Base URL**: `https://deep-index.moralis.io/api/v2.2/`

### 認証

すべてのリクエストには`X-API-Key`ヘッダーが必要です。

```javascript
headers: {
  'X-API-Key': process.env.REACT_APP_MORALIS_API_KEY,
  'accept': 'application/json'
}
```

---

### エンドポイント

#### 1. ウォレットのNFT取得

ユーザーが所有するNFTの一覧を取得します。

**エンドポイント**:
```
GET /{address}/nft
```

**パラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-------|------|------|
| `address` | string | ✅ | ウォレットアドレス（path parameter） |
| `chain` | string | ✅ | ブロックチェーン名（例: "polygon", "eth"） |
| `token_addresses` | string | ⬜ | フィルタリングするコントラクトアドレス |
| `limit` | number | ⬜ | 取得件数（最大100） |

**リクエスト例**:

```javascript
const account = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
const contractAddress = "0x30961b851A8A766014E53955694b3210718066e5";
const chainName = "polygon";

const response = await fetch(
  `https://deep-index.moralis.io/api/v2.2/${account}/nft?chain=${chainName}&token_addresses=${contractAddress}&limit=100`,
  {
    method: "GET",
    headers: {
      "accept": "application/json",
      "X-API-Key": process.env.REACT_APP_MORALIS_API_KEY,
    },
  }
);

const data = await response.json();
```

**レスポンス例**:

```json
{
  "total": 2,
  "page": 0,
  "page_size": 100,
  "cursor": null,
  "result": [
    {
      "token_address": "0x30961b851a8a766014e53955694b3210718066e5",
      "token_id": "1",
      "owner_of": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
      "block_number": "43534123",
      "block_number_minted": "43534000",
      "token_hash": "abcdef123456",
      "amount": "1",
      "contract_type": "ERC1155",
      "name": "MLTG Collection",
      "symbol": "MLTG",
      "token_uri": "https://ipfs.io/ipfs/Qm...",
      "metadata": "{\"name\":\"MLTG #1\",\"description\":\"...\",\"image\":\"ipfs://Qm...\"}",
      "last_token_uri_sync": "2025-01-15",
      "last_metadata_sync": "2025-01-15",
      "minter_address": "0x..."
    }
  ],
  "status": "SYNCED"
}
```

**レスポンスフィールド**:

| フィールド | 型 | 説明 |
|-----------|-------|------|
| `token_address` | string | NFTコントラクトアドレス |
| `token_id` | string | トークンID |
| `amount` | string | 所有数量 |
| `name` | string | コントラクト名 |
| `metadata` | string | JSON形式のメタデータ |

**エラーレスポンス**:

```json
{
  "message": "Invalid API Key",
  "statusCode": 401
}
```

---

## Airtable API

### 概要

Airtable APIは、NFT情報の取得と注文データの保存に使用します。

**Base URL**: `https://api.airtable.com/v0/`
**Base ID**: `appq0R9tJ2BkvKhRt`

### 認証

すべてのリクエストには`Authorization`ヘッダーが必要です。

```javascript
headers: {
  'Authorization': `Bearer ${process.env.REACT_APP_AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json'
}
```

---

### エンドポイント

#### 1. NFTトークン情報取得

NFTのToken IDとContract IDからAirtableの商品情報を取得します。

**エンドポイント**:
```
GET /v0/{baseId}/{tableId}
```

**パラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-------|------|------|
| `baseId` | string | ✅ | `appq0R9tJ2BkvKhRt` |
| `tableId` | string | ✅ | `tblGeRuC0iRypjYfl` |
| `filterByFormula` | string | ✅ | AND条件での絞り込み |

**リクエスト例**:

```javascript
const tokenAddress = "0x30961b851A8A766014E53955694b3210718066e5";
const tokenId = "1";

const response = await fetch(
  `https://api.airtable.com/v0/appq0R9tJ2BkvKhRt/tblGeRuC0iRypjYfl?filterByFormula=AND(%7BContract_ID%7D%3D%22${tokenAddress}%22%2C%7BToken_ID%7D%3D${tokenId})`,
  {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${process.env.REACT_APP_AIRTABLE_API_KEY}`,
    },
  }
);

const data = await response.json();
```

**URLエンコード詳細**:
```
filterByFormula=AND({Contract_ID}="0x30961...",{Token_ID}=1)
↓
filterByFormula=AND(%7BContract_ID%7D%3D%220x30961...%22%2C%7BToken_ID%7D%3D1)
```

**レスポンス例**:

```json
{
  "records": [
    {
      "id": "rec65kFu48ut5GPhC",
      "fields": {
        "Key_ID": "rec65kFu48ut5GPhC",
        "Thanks_Gift": "オリジナルTシャツ",
        "Contract_ID": "0x30961b851A8A766014E53955694b3210718066e5",
        "Token_ID": 1,
        "Description": "MetagriLabo オリジナルTシャツ"
      },
      "createdTime": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**レスポンスフィールド**:

| フィールド | 型 | 説明 |
|-----------|-------|------|
| `Key_ID` | string | Airtableレコードの一意識別子 |
| `Thanks_Gift` | string | 交換可能な商品名 |
| `Contract_ID` | string | NFTコントラクトアドレス |
| `Token_ID` | number | NFTトークンID |

---

#### 2. 注文データ保存

NFT交換時の配送情報をAirtableに保存します。

**エンドポイント**:
```
POST /v0/{baseId}/{tableId}
```

**パラメータ**:

| パラメータ | 型 | 必須 | 説明 |
|-----------|-------|------|------|
| `baseId` | string | ✅ | `appq0R9tJ2BkvKhRt` |
| `tableId` | string | ✅ | `tbld2laNlKCi7B2GW` |

**リクエストボディ**:

```json
{
  "records": [
    {
      "fields": {
        "Key_ID": "rec65kFu48ut5GPhC",
        "Thanks_Gift": "オリジナルTシャツ",
        "Name": "山田太郎",
        "Zip_Code": "123-4567",
        "Address": "東京都渋谷区...",
        "Tel": "090-1234-5678",
        "Mail": "test@example.com",
        "Notes": "贈答用",
        "Size": "M",
        "Size_Other": ""
      }
    }
  ]
}
```

**フィールド詳細**:

| フィールド | 型 | 必須 | 説明 |
|-----------|-------|------|------|
| `Key_ID` | string | ✅ | NFTのKey ID |
| `Thanks_Gift` | string | ✅ | 商品名 |
| `Name` | string | ✅ | 受取人名 |
| `Zip_Code` | string | ✅ | 郵便番号 |
| `Address` | string | ✅ | 住所 |
| `Tel` | string | ✅ | 電話番号 |
| `Mail` | string | ✅ | メールアドレス |
| `Notes` | string | ⬜ | 備考 |
| `Size` | string | ⬜ | サイズ（Tシャツの場合） |
| `Size_Other` | string | ⬜ | その他サイズ |

**リクエスト例**:

```javascript
const response = await fetch(
  `https://api.airtable.com/v0/appq0R9tJ2BkvKhRt/tbld2laNlKCi7B2GW`,
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.REACT_APP_AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      records: [
        {
          fields: {
            Key_ID: "rec65kFu48ut5GPhC",
            Thanks_Gift: "オリジナルTシャツ",
            Name: "山田太郎",
            Zip_Code: "123-4567",
            Address: "東京都渋谷区...",
            Tel: "090-1234-5678",
            Mail: "test@example.com",
            Notes: "",
            Size: "M",
            Size_Other: ""
          }
        }
      ]
    })
  }
);

const data = await response.json();
```

**レスポンス例**:

```json
{
  "records": [
    {
      "id": "recABC123",
      "fields": {
        "Key_ID": "rec65kFu48ut5GPhC",
        "Thanks_Gift": "オリジナルTシャツ",
        "Name": "山田太郎",
        ...
      },
      "createdTime": "2025-01-15T12:34:56.000Z"
    }
  ]
}
```

---

## ThirdWeb SDK

### 概要

ThirdWeb SDKは、スマートコントラクトとの相互作用に使用します。

**ドキュメント**: https://portal.thirdweb.com/

### 初期化

```javascript
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";

// MetaMaskプロバイダーからSDK初期化
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer = await provider.getSigner();

// チェーン名の指定
const chainName = "polygon"; // または "mainnet", "goerli" 等
const sdk = ThirdwebSDK.fromSigner(signer, chainName);
```

---

### 主な操作

#### 1. コントラクト取得

```javascript
const contractAddress = "0x30961b851A8A766014E53955694b3210718066e5";
const contract = await sdk.getContract(contractAddress);
```

#### 2. NFT転送（ERC1155）

```javascript
// 転送先、トークンID、数量を指定
const toAddress = "0x6D8Dd5Cf6fa8DB2be08845b1380e886BFAb03E07";
const tokenId = "1";
const amount = 1;

await contract.erc1155.transfer(toAddress, tokenId, amount);
```

**トランザクション**:
- ユーザーのMetaMaskで署名が必要
- ガス代が自動計算される
- トランザクション完了を待機

---

## エラーハンドリング

### Moralis API エラー

| ステータスコード | 意味 | 対処方法 |
|----------------|------|---------|
| 401 | 認証エラー | API Keyを確認 |
| 404 | NFTが見つからない | アドレスとチェーンを確認 |
| 429 | レート制限超過 | リクエスト間隔を空ける |
| 500 | サーバーエラー | 時間を置いて再試行 |

**実装例**:

```javascript
const response = await fetch(url, options);

if (!response.ok) {
  if (response.status === 401) {
    throw new Error('Moralis API Key が無効です');
  } else if (response.status === 429) {
    throw new Error('リクエスト回数が制限を超えました');
  } else {
    throw new Error(`Moralis API Error: ${response.status}`);
  }
}
```

---

### Airtable API エラー

| ステータスコード | 意味 | 対処方法 |
|----------------|------|---------|
| 401 | 認証エラー | API Keyを確認 |
| 403 | 権限エラー | Airtableの権限設定を確認 |
| 404 | ベース/テーブルが見つからない | Base IDとTable IDを確認 |
| 422 | バリデーションエラー | 送信データの形式を確認 |

**実装例**:

```javascript
const response = await fetch(url, { method, headers, body });

if (!response.ok) {
  const errorData = await response.json();
  console.error('Airtable API Error:', errorData);

  if (response.status === 422) {
    throw new Error(`バリデーションエラー: ${errorData.error.message}`);
  } else {
    throw new Error(`Airtable API Error: ${response.status}`);
  }
}
```

---

### トランザクションエラー

| エラーコード | 意味 | ユーザーメッセージ |
|-------------|------|-------------------|
| 4001 | ユーザーキャンセル | "トランザクションがキャンセルされました" |
| -32603 | 内部エラー | "NFTの転送に失敗しました。ガス代が不足している可能性があります" |
| insufficient funds | ガス代不足 | "ガス代が不足しています。ウォレットに十分なMATICがあることを確認してください" |

**実装例**:

```javascript
try {
  await contract.erc1155.transfer(walletAddress, tokenId, amount);
} catch (error) {
  if (error.code === 4001) {
    setError("トランザクションがキャンセルされました");
  } else if (error.code === -32603) {
    setError("NFTの転送に失敗しました。ガス代が不足している可能性があります");
  } else if (error.message && error.message.includes("insufficient funds")) {
    setError("ガス代が不足しています。ウォレットに十分なMATICがあることを確認してください");
  } else {
    setError(`予期しないエラーが発生しました: ${error.message}`);
  }
}
```

---

## レート制限

### Moralis API

| プラン | リクエスト数 | 備考 |
|--------|-----------|------|
| Free | 2,400 リクエスト/日 | 毎日リセット |
| Pro | 250,000 リクエスト/月 | 分単位で制限 |

**ベストプラクティス**:
- 並列リクエストを最小化
- レスポンスをキャッシュ
- エラー時は指数バックオフで再試行

**実装例**:

```javascript
// タイムアウト付きfetch
const fetchWithTimeout = (url, options, timeout = 30000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};
```

---

### Airtable API

| プラン | リクエスト数 | 備考 |
|--------|-----------|------|
| Free | 5 リクエスト/秒 | レコード作成は低速 |
| Plus | 10 リクエスト/秒 | - |

**ベストプラクティス**:
- バッチ処理を使用（最大10レコード）
- 429エラー時はRetry-Afterヘッダーを確認

---

## 付録

### 対応チェーン一覧

| チェーン名 | Chain ID | 16進数 | Moralis名 | ThirdWeb名 |
|-----------|---------|--------|-----------|-----------|
| Ethereum Mainnet | 1 | 0x1 | eth | mainnet |
| Goerli Testnet | 5 | 0x5 | goerli | goerli |
| Polygon Mainnet | 137 | 0x89 | polygon | polygon |
| Mumbai Testnet | 80001 | 0x13881 | mumbai | mumbai |
| Base Mainnet | 8453 | 0x2105 | base | base |
| Base Sepolia | 84532 | 0x14980 | base-sepolia | base-sepolia |

---

### 参考リンク

- [Moralis API ドキュメント](https://docs.moralis.io/web3-data-api/evm/reference)
- [Airtable API ドキュメント](https://airtable.com/developers/web/api/introduction)
- [ThirdWeb SDK ドキュメント](https://portal.thirdweb.com/typescript/v4)
- [ethers.js ドキュメント](https://docs.ethers.io/v5/)

---

**更新日**: 2025-10-30
**バージョン**: 1.1.0
