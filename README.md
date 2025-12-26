# MLTG Web Application 🎁

**MetagriLabo Thanks Gift (MLTG) NFT交換プラットフォーム**

NFTを実物商品と交換できるWeb3アプリケーション。ユーザーは保有するNFTを選択し、配送情報を入力することで、農産物やオリジナルTシャツなどの物理的な商品と交換できます。

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 📋 目次

- [主要機能](#主要機能)
- [技術スタック](#技術スタック)
- [セットアップ](#セットアップ)
- [開発](#開発)
- [環境変数](#環境変数)
- [使用方法](#使用方法)
- [デプロイ](#デプロイ)
- [トラブルシューティング](#トラブルシューティング)
- [ドキュメント](#ドキュメント)
- [貢献](#貢献)
- [ライセンス](#ライセンス)

---

## ✨ 主要機能

### 🔐 ウォレット接続
- **MetaMask統合** - 安全なウォレット接続
- **WalletConnect対応** - モバイルウォレット対応
- **マルチチェーン** - Polygon, Ethereum, Base等に対応

### 🖼️ NFT管理
- **保有NFT一覧表示** - 所有するMLTG NFTを自動表示
- **IPFS画像表示** - 分散型ストレージから画像を取得
- **リアルタイム更新** - アカウント・ネットワーク変更を自動検知

### 📦 商品交換システム
- **配送情報入力** - 名前、住所、電話番号、メールアドレス
- **サイズ選択** - Tシャツ交換時のサイズ指定（S/M/L/XL/その他）
- **NFT自動転送** - 交換時に管理者ウォレットへ自動転送
- **注文データ管理** - Airtableで注文情報を一元管理

### 🎨 ユーザー体験
- **リアルタイムバリデーション** ⭐NEW
  - 名前、郵便番号、メール、電話番号の自動検証
  - エラーメッセージの即座表示
- **エラー通知システム** ⭐NEW
  - 分かりやすいエラーメッセージ
  - トランザクション失敗時の詳細説明
- **ローディングインジケーター** ⭐NEW
  - NFT読み込み中のスピナー表示
- **Polygon自動切り替え** ⭐NEW
  - ワンクリックでPolygonネットワークに切り替え

---

## 🛠️ 技術スタック

### フロントエンド
- **React** 18.2.0 - UIフレームワーク
- **React Bootstrap** 2.5.0 - UIコンポーネント
- **React Router DOM** 6.4.2 - ルーティング

### Web3
- **ThirdWeb SDK** 3.10.67 - スマートコントラクト操作
- **ethers.js** 5.7.2 - Ethereum相互作用
- **WalletConnect** 1.8.0 - モバイルウォレット接続

### 外部サービス
- **Moralis API** - NFTメタデータ取得
- **Airtable API** - 注文データ保存
- **IPFS** - NFT画像ホスティング
- **Firebase Hosting** - Webホスティング

### 開発ツール
- **Create React App** 5.0.1 - 開発環境
- **CRACO** 7.1.0 - Webpack設定拡張

---

## 🚀 セットアップ

### 必要要件

- Node.js 16.x 以上
- npm 8.x 以上
- MetaMask ブラウザ拡張機能
- Moralis API Key
- Airtable Personal Access Token
- ThirdWeb Client ID

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/NouJouJin/MLTGwebAppTest.git
cd MLTGwebAppTest

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .env ファイルを編集してAPI Keyを設定
```

### 環境変数の設定

`.env.local` ファイルをローカル開発用に作成し、Vercelでは管理画面で環境変数を設定します。

**サーバーサイド環境変数**（Vercel管理画面で設定）:
```bash
MORALIS_API_KEY=your_moralis_api_key
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_base_id
AIRTABLE_NFT_TABLE_ID=your_nft_table_id
AIRTABLE_ORDERS_TABLE_ID=your_orders_table_id
NFT_CONTRACT_ADDRESS=your_contract_address
```

**クライアントサイド環境変数**:
```bash
REACT_APP_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
```

> **セキュリティ**: APIキーはサーバーサイドのみで使用され、ブラウザには露出しません。

詳細なセットアップ手順は [SETUP_GUIDE.md](SETUP_GUIDE.md) を参照してください。

---

## 💻 開発

### 開発サーバーの起動

```bash
npm start
```

ブラウザで `http://localhost:3000` を開きます。

### ビルド

```bash
npm run build
```

最適化されたプロダクションビルドが `build/` フォルダに生成されます。

### テスト

```bash
npm test
```

### コードフォーマット

```bash
# ESLintチェック（推奨設定）
npm run lint

# 自動修正
npm run lint:fix
```

---

## 🔐 環境変数

### 必須環境変数

| 変数名 | 説明 | 取得方法 |
|--------|------|---------|
| `REACT_APP_MORALIS_API_KEY` | NFTデータ取得用API Key | [Moralis](https://moralis.io/) でアカウント作成 |
| `REACT_APP_THIRDWEB_CLIENT_ID` | スマートコントラクト操作用Client ID | [ThirdWeb](https://thirdweb.com/) でアカウント作成 |
| `REACT_APP_AIRTABLE_API_KEY` | 注文データ保存用API Key | [Airtable](https://airtable.com/create/tokens) でトークン作成 |

### セキュリティ重要事項

⚠️ **重要**:
- `.env` ファイルは **絶対にGitにコミットしないこと**
- API Keyを公開リポジトリに含めないこと
- 本番環境では別のAPI Keyを使用すること

---

## 📖 使用方法

### 1. ウォレット接続

1. MetaMaskブラウザ拡張機能をインストール
2. ページ上部の「MetaMaskに接続」ボタンをクリック
3. MetaMaskで接続を承認

### 2. NFT確認

- 接続後、自動的に保有するMLTG NFTが表示されます
- NFTが表示されない場合は、「Polygonネットワークに切り替える」ボタンをクリック

### 3. 商品交換

1. 交換したいNFTの「引き換え」ラジオボタンを選択
2. 配送情報フォームに必要事項を入力
   - **名前**: 2文字以上
   - **郵便番号**: `123-4567` 形式
   - **住所**: 都道府県から番地まで
   - **電話番号**: `090-1234-5678` 形式
   - **メールアドレス**: 有効なメール形式
   - **サイズ**: Tシャツの場合のみ（S/M/L/XL/その他）
3. 「申し込む」ボタンをクリック
4. 入力内容を確認
5. MetaMaskでトランザクションを承認
6. 完了メッセージを確認

---

## 🌐 デプロイ

### AWSへのデプロイ

### 環境変数の設定（本番環境）

本番環境では、以下のいずれかの方法で環境変数を設定：

1. **ビルド時注入**（簡単）
   ```bash
   # .env.production を作成
   cp .env .env.production
   # API Keyを本番用に変更
   npm run build
   ```

2. **Firebase Functions経由**（推奨）
   - セキュアな環境変数管理
   - クライアントにAPI Keyを露出しない

詳細は [SPECIFICATION.md](SPECIFICATION.md#デプロイメント) を参照。

---

## 🐛 トラブルシューティング

### NFTが表示されない

**症状**: ウォレット接続後もNFT一覧が空

**解決方法**:
1. Polygonネットワークに接続されているか確認
2. 「Polygonネットワークに切り替える」ボタンをクリック
3. ページをリロード

### 環境変数が読み込まれない

**症状**: `undefined` エラーが発生

**解決方法**:
```bash
# 開発サーバーを再起動
# Ctrl+C で停止
npm start
```

### トランザクションが失敗する

**症状**: "NFTの転送に失敗しました"

**解決方法**:
1. ウォレットにMATIC（ガス代）があるか確認
2. ネットワークがPolygon Mainnetか確認
3. NFTの所有権を確認

その他の問題は [SPECIFICATION.md](SPECIFICATION.md#トラブルシューティング) を参照。

---

## 📚 ドキュメント

- **[SPECIFICATION.md](SPECIFICATION.md)** - 詳細技術仕様書
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - セットアップガイド
- **[API_REFERENCE.md](API_REFERENCE.md)** - API仕様書
- **[.env.example](.env.example)** - 環境変数テンプレート

---

## 🏗️ プロジェクト構造

```
MLTGwebAppTest/
├── .env                    # 環境変数（Gitに含めない）
├── .env.example            # 環境変数テンプレート
├── .gitignore              # Git除外ファイル
├── package.json            # プロジェクト設定
├── craco.config.js         # Webpack設定
├── firebase.json           # Firebase設定
├── README.md               # このファイル
├── SPECIFICATION.md        # 技術仕様書
├── SETUP_GUIDE.md          # セットアップガイド
├── API_REFERENCE.md        # API仕様書
├── public/                 # 静的ファイル
│   ├── index.html          # HTMLテンプレート
│   └── ...
└── src/                    # ソースコード
    ├── App.js              # メインコンポーネント
    ├── App.css             # スタイル
    ├── index.js            # エントリーポイント
    └── images/             # 画像資産
```

---

## 🤝 貢献

プロジェクトへの貢献を歓迎します！

### 貢献方法

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m '機能追加: 素晴らしい機能'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### コーディング規約

- ESLintの設定に従う
- コミットメッセージは日本語で明確に
- テストを追加（該当する場合）
- ドキュメントを更新

詳細は [SPECIFICATION.md](SPECIFICATION.md#開発ガイドライン) を参照。

---

## 🔒 セキュリティ

セキュリティ上の問題を発見した場合は、公開Issueではなく、直接プロジェクトメンテナーに連絡してください。

### セキュリティベストプラクティス

- API Keyを公開しない
- ユーザーの秘密鍵を保存しない
- トランザクション内容を明確に表示
- 入力値を常にバリデーション

詳細は [SPECIFICATION.md](SPECIFICATION.md#セキュリティ) を参照。

---

## 📝 変更履歴

### v1.1.0 (2025-10-30)

#### 追加
- ✨ フォームバリデーション機能
- ✨ エラー通知システム
- ✨ Polygon自動切り替え機能
- ✨ ローディングインジケーター
- 📚 詳細な技術仕様書

#### 改善
- 🔒 API Keyを環境変数に移行
- 🎨 エラーハンドリングの強化
- 🐛 NFT読み込みの並列化

#### 修正
- 🐛 不要なCDNスクリプトを削除
- 🔒 .gitignoreに.envを追加

### v1.0.0 (2025-01-03)

- 🎉 初回リリース

---

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

---

## 👥 クレジット

- **開発**: Studymeter Inc.
- **デザイン**: MetagriLabo
- **Web3統合**: ThirdWeb
- **NFTデータ**: Moralis
- **データベース**: Airtable

---

## 📞 サポート

質問や問題がある場合：

- 📖 [ドキュメント](SPECIFICATION.md)を確認
- 🐛 [Issue](https://github.com/NouJouJin/MLTGwebAppTest/issues)を作成
- 💬 プロジェクトメンテナーに連絡

---

## 🌟 謝辞

このプロジェクトは以下のオープンソースプロジェクトを使用しています：

- [React](https://reactjs.org/)
- [ThirdWeb](https://thirdweb.com/)
- [ethers.js](https://docs.ethers.io/)
- [Bootstrap](https://getbootstrap.com/)
- [Create React App](https://create-react-app.dev/)

すべての貢献者とメンテナーに感謝します！

---

**Made with ❤️ by MetagriLabo Team**
