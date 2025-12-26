# API リファレンス

**MLTG Web Application - API仕様書**

このドキュメントは、MLTG Web Applicationで使用するAPIの詳細仕様を記載しています。

> **セキュリティ注意**: すべての外部APIへのアクセスはサーバーサイドのプロキシ経由で行われます。APIキーはクライアントに露出しません。

---

## 目次

1. [APIプロキシ概要](#apiプロキシ概要)
2. [NFT取得API](#nft取得api)
3. [NFT情報取得API](#nft情報取得api)
4. [注文送信API](#注文送信api)
5. [ThirdWeb SDK](#thirdweb-sdk)
6. [エラーハンドリング](#エラーハンドリング)

---

## APIプロキシ概要

### セキュリティアーキテクチャ

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Browser   │────▶│  Vercel API     │────▶│  External    │
│  (Client)   │     │  (Serverless)   │     │  APIs        │
└─────────────┘     └─────────────────┘     └──────────────┘
                           │
                    ┌──────┴──────┐
                    │ API Keys    │
                    │ (Server-side│
                    │  only)      │
                    └─────────────┘
```

### 利点

- APIキーがブラウザに露出しない
- レート制限をサーバーサイドで制御可能
- 入力値のサーバーサイドバリデーション

---

## NFT取得API

ユーザーが所有するNFTの一覧を取得します。

### エンドポイント

```
GET /api/moralis-nfts
```

### パラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-------|------|------|
| `address` | string | ✅ | ウォレットアドレス（0x...） |
| `chain` | string | ✅ | ブロックチェーン名（polygon, eth等） |

### リクエスト例

```javascript
const account = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
const chainName = "polygon";

const response = await fetch(
  `/api/moralis-nfts?address=${account}&chain=${chainName}`
);

const data = await response.json();
```

### レスポンス例

```json
{
  "total": 2,
  "page": 0,
  "page_size": 100,
  "result": [
    {
      "token_address": "0x...",
      "token_id": "1",
      "amount": "1",
      "name": "MLTG Collection",
      "metadata": "{...}"
    }
  ]
}
```

### レスポンスフィールド

| フィールド | 型 | 説明 |
|-----------|-------|------|
| `token_address` | string | NFTコントラクトアドレス |
| `token_id` | string | トークンID |
| `amount` | string | 所有数量 |
| `name` | string | コントラクト名 |
| `metadata` | string | JSON形式のメタデータ |

---

## NFT情報取得API

NFTのToken IDからAirtableの商品情報を取得します。

### エンドポイント

```
GET /api/airtable-nft-info
```

### パラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-------|------|------|
| `tokenAddress` | string | ✅ | NFTコントラクトアドレス |
| `tokenId` | string | ✅ | トークンID |

### リクエスト例

```javascript
const response = await fetch(
  `/api/airtable-nft-info?tokenAddress=0x...&tokenId=1`
);

const data = await response.json();
```

### レスポンス例

```json
{
  "records": [
    {
      "id": "rec...",
      "fields": {
        "Key_ID": "rec...",
        "Thanks_Gift": "オリジナルTシャツ",
        "Contract_ID": "0x...",
        "Token_ID": 1
      }
    }
  ]
}
```

---

## 注文送信API

NFT交換時の配送情報を保存します。

### エンドポイント

```
POST /api/airtable-orders
```

### リクエストヘッダー

```
Content-Type: application/json
```

### リクエストボディ

```json
{
  "records": [
    {
      "fields": {
        "Key_ID": "rec...",
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

### フィールド詳細

| フィールド | 型 | 必須 | 説明 |
|-----------|-------|------|------|
| `Key_ID` | string | ✅ | NFTのKey ID |
| `Thanks_Gift` | string | ✅ | 商品名 |
| `Name` | string | ✅ | 受取人名（2文字以上） |
| `Zip_Code` | string | ✅ | 郵便番号（123-4567形式） |
| `Address` | string | ✅ | 住所 |
| `Tel` | string | ✅ | 電話番号（000-0000-0000形式） |
| `Mail` | string | ✅ | メールアドレス |
| `Notes` | string | ⬜ | 備考 |
| `Size` | string | ⬜ | サイズ（Tシャツの場合） |
| `Size_Other` | string | ⬜ | その他サイズ |

### リクエスト例

```javascript
const response = await fetch('/api/airtable-orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    records: [
      {
        fields: {
          Key_ID: 'rec...',
          Thanks_Gift: 'オリジナルTシャツ',
          Name: '山田太郎',
          Zip_Code: '123-4567',
          Address: '東京都渋谷区...',
          Tel: '090-1234-5678',
          Mail: 'test@example.com',
          Notes: '',
          Size: 'M',
          Size_Other: ''
        }
      }
    ]
  })
});

const data = await response.json();
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
const chainName = "polygon";
const sdk = ThirdwebSDK.fromSigner(signer, chainName);
```

### NFT転送（ERC1155）

```javascript
// コントラクト取得
const contract = await sdk.getContract(nft.token_address);

// 転送先、トークンID、数量を指定
const toAddress = "0x..."; // 管理者ウォレット
const tokenId = "1";
const amount = 1;

await contract.erc1155.transfer(toAddress, tokenId, amount);
```

**注意**:
- ユーザーのMetaMaskで署名が必要
- ガス代が自動計算される
- トランザクション完了を待機

---

## エラーハンドリング

### APIプロキシエラー

| ステータスコード | 意味 | 対処方法 |
|----------------|------|---------|
| 400 | バリデーションエラー | リクエストパラメータを確認 |
| 405 | メソッド不許可 | 正しいHTTPメソッドを使用 |
| 500 | サーバーエラー | 環境変数の設定を確認 |

### トランザクションエラー

| エラーコード | 意味 | ユーザーメッセージ |
|-------------|------|-------------------|
| 4001 | ユーザーキャンセル | "トランザクションがキャンセルされました" |
| -32603 | 内部エラー | "NFTの転送に失敗しました" |
| insufficient funds | ガス代不足 | "ガス代が不足しています" |

### 実装例

```javascript
try {
  await contract.erc1155.transfer(walletAddress, tokenId, amount);
} catch (error) {
  if (error.code === 4001) {
    setError("トランザクションがキャンセルされました");
  } else if (error.message?.includes("insufficient funds")) {
    setError("ガス代が不足しています");
  } else {
    setError("予期しないエラーが発生しました");
  }
}
```

---

## 対応チェーン一覧

| チェーン名 | Chain ID | 16進数 |
|-----------|---------|--------|
| Ethereum Mainnet | 1 | 0x1 |
| Polygon Mainnet | 137 | 0x89 |
| Base Mainnet | 8453 | 0x2105 |
| Base Sepolia | 84532 | 0x14980 |

---

## 参考リンク

- [Moralis API ドキュメント](https://docs.moralis.io/web3-data-api/evm/reference)
- [Airtable API ドキュメント](https://airtable.com/developers/web/api/introduction)
- [ThirdWeb SDK ドキュメント](https://portal.thirdweb.com/typescript/v4)
- [ethers.js ドキュメント](https://docs.ethers.io/v5/)

---

**更新日**: 2025-12-26
**バージョン**: 2.0.0 (セキュリティ強化版)
