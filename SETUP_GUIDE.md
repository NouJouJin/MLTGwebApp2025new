# セットアップガイド

**MLTG Web Application - 開発環境構築手順**

このガイドでは、MLTG Web Applicationの開発環境を構築する手順を詳しく説明します。

---

## 目次

1. [システム要件](#システム要件)
2. [事前準備](#事前準備)
3. [プロジェクトのセットアップ](#プロジェクトのセットアップ)
4. [API Key の取得](#api-keyの取得)
5. [環境変数の設定](#環境変数の設定)
6. [開発サーバーの起動](#開発サーバーの起動)
7. [動作確認](#動作確認)
8. [トラブルシューティング](#トラブルシューティング)

---

## システム要件

### 必須ソフトウェア

| ソフトウェア | 最小バージョン | 推奨バージョン | 確認方法 |
|-------------|-------------|-------------|---------|
| **Node.js** | 16.x | 18.x 以上 | `node --version` |
| **npm** | 8.x | 9.x 以上 | `npm --version` |
| **Git** | 2.x | 最新版 | `git --version` |

### ブラウザ要件

| ブラウザ | バージョン | 備考 |
|---------|----------|------|
| **Chrome** | 最新版 | MetaMask拡張機能が必要 |
| **Firefox** | 最新版 | MetaMask拡張機能が必要 |
| **Brave** | 最新版 | MetaMask組み込み |
| **Edge** | 最新版 | MetaMask拡張機能が必要 |

⚠️ **Safari は Web3 機能が制限されるため非推奨**

---

## 事前準備

### 1. Node.js のインストール

#### Windows

1. [Node.js公式サイト](https://nodejs.org/)から LTS版をダウンロード
2. インストーラーを実行
3. コマンドプロンプトで確認:
   ```cmd
   node --version
   npm --version
   ```

#### macOS

**Homebrewを使用（推奨）**:
```bash
# Homebrewがない場合はインストール
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.jsインストール
brew install node

# 確認
node --version
npm --version
```

**または公式インストーラー**:
[Node.js公式サイト](https://nodejs.org/)からダウンロード

#### Linux (Ubuntu/Debian)

```bash
# NodeSourceリポジトリを追加
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# インストール
sudo apt-get install -y nodejs

# 確認
node --version
npm --version
```

---

### 2. Git のインストール

#### Windows

[Git for Windows](https://git-scm.com/download/win)からダウンロードしてインストール

#### macOS

```bash
brew install git
```

または Xcode Command Line Tools:
```bash
xcode-select --install
```

#### Linux

```bash
sudo apt-get install git
```

---

### 3. MetaMask のインストール

1. Chromeウェブストアにアクセス:
   https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn

2. 「Chromeに追加」をクリック

3. MetaMaskを開いてウォレットを作成:
   - 新規ウォレット作成
   - シークレットリカバリーフレーズを**安全に保管**
   - パスワードを設定

4. Polygonネットワークを追加:
   - ネットワーク一覧を開く
   - 「ネットワークを追加」
   - 以下を入力:
     ```
     ネットワーク名: Polygon Mainnet
     新しいRPC URL: https://polygon-rpc.com/
     チェーンID: 137
     通貨記号: MATIC
     ブロックエクスプローラーのURL: https://polygonscan.com/
     ```

---

## プロジェクトのセットアップ

### 1. リポジトリのクローン

```bash
# HTTPSでクローン
git clone https://github.com/NouJouJin/MLTGwebAppTest.git

# またはSSHでクローン（SSH鍵設定済みの場合）
git clone git@github.com:NouJouJin/MLTGwebAppTest.git

# プロジェクトディレクトリに移動
cd MLTGwebAppTest
```

---

### 2. 依存関係のインストール

```bash
# npmで依存関係をインストール
npm install

# または Yarnを使用する場合
yarn install
```

**インストール時間**: 約3〜5分（ネットワーク速度に依存）

**インストールされるパッケージ例**:
- React 18.2.0
- ThirdWeb SDK 3.10.67
- ethers.js 5.7.2
- React Bootstrap 2.5.0
- その他多数...

---

## API Key の取得

開発には以下の3つのAPI Keyが必要です。

### 1. Moralis API Key

**用途**: NFTメタデータの取得

**取得手順**:

1. [Moralis公式サイト](https://moralis.io/)にアクセス

2. 「Start for Free」をクリックしてアカウント作成

3. ダッシュボードにログイン

4. 左メニューから「Web3 APIs」を選択

5. 「Get Your API Key」をクリック

6. API Keyをコピー（`uhLjLGW17H6xB1OxUtYRwz3O37P669YncgUETfC1z3JVqPMoRqexUsYaZgjMoTmY` のような文字列）

**プラン**:
- Free: 2,400 リクエスト/日（開発には十分）
- Pro: 250,000 リクエスト/月（本番環境推奨）

---

### 2. ThirdWeb Client ID

**用途**: スマートコントラクト操作

**取得手順**:

1. [ThirdWeb公式サイト](https://thirdweb.com/)にアクセス

2. 「Get Started」からアカウント作成

3. ダッシュボードにログイン

4. 「Settings」→「API Keys」を選択

5. 「Create API Key」をクリック

6. Client IDをコピー（`0c798e089b472df352906d153eefbfbc` のような文字列）

**無料で使用可能**

---

### 3. Airtable API Key

**用途**: 注文データの保存

**取得手順**:

1. [Airtable公式サイト](https://airtable.com/)にアクセス

2. アカウント作成してログイン

3. [Personal Access Tokens ページ](https://airtable.com/create/tokens)にアクセス

4. 「Create new token」をクリック

5. トークン名を入力（例: "MLTG Development"）

6. スコープを選択:
   - ✅ `data.records:read`
   - ✅ `data.records:write`

7. ベースを選択:
   - 管理者から共有されたMLTG用ベースを選択

8. 「Create token」をクリック

9. トークンをコピー（`patXXXXX.XXXXXXXX...` のような文字列）

⚠️ **トークンは一度しか表示されないので、必ず安全に保管してください**

**プラン**:
- Free: 1,200 レコード/ベース、5 リクエスト/秒（開発には十分）
- Plus: 5,000 レコード/ベース、10 リクエスト/秒

---

## 環境変数の設定

### 1. .env.example をコピー

```bash
# .env ファイルを作成
cp .env.example .env
```

Windowsの場合:
```cmd
copy .env.example .env
```

---

### 2. .env ファイルを編集

テキストエディタで `.env` ファイルを開き、API Keyを設定します。

```bash
# ソースマップ生成（本番環境では false を推奨）
GENERATE_SOURCEMAP=false

# Moralis API Key
REACT_APP_MORALIS_API_KEY=ここにMoralisのAPI Keyを貼り付け

# ThirdWeb Client ID
REACT_APP_THIRDWEB_CLIENT_ID=ここにThirdWebのClient IDを貼り付け

# Airtable API Key
REACT_APP_AIRTABLE_API_KEY=ここにAirtableのAPI Keyを貼り付け
```

**設定例**:
```bash
GENERATE_SOURCEMAP=false
REACT_APP_MORALIS_API_KEY=your_moralis_api_key_here
REACT_APP_THIRDWEB_CLIENT_ID=your_thirdweb_client_id_here
REACT_APP_AIRTABLE_API_KEY=your_airtable_api_key_here
```

> ⚠️ **注意**: 上記はプレースホルダーです。各サービスから取得した実際のAPIキーを設定してください。

---

### 3. .env ファイルの確認

```bash
# .env ファイルが存在することを確認
ls -la .env

# Windowsの場合
dir .env
```

⚠️ **重要**: `.env` ファイルは `.gitignore` に含まれているため、Gitにコミットされません。これはセキュリティのための重要な設定です。

---

## 開発サーバーの起動

### 1. 開発サーバーを起動

```bash
npm start
```

**成功時の出力例**:
```
Compiled successfully!

You can now view exp in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.100:3000

Note that the development build is not optimized.
To create a production build, use npm run build.

webpack compiled successfully
```

---

### 2. ブラウザで確認

自動的にブラウザが開き、`http://localhost:3000` が表示されます。

開かない場合は手動でアクセス:
- http://localhost:3000

---

### 3. サーバーの停止

```bash
# Ctrl+C を押す
```

---

## 動作確認

### 1. MetaMask 接続テスト

1. ページ上部の「MetaMaskに接続」ボタンをクリック

2. MetaMaskポップアップが表示される

3. 「次へ」→「接続」をクリック

4. 接続成功を確認

---

### 2. Polygon ネットワーク切り替えテスト

1. MetaMaskでPolygonネットワークを選択

2. ページをリロード

3. NFT一覧が表示されることを確認（NFTを所有している場合）

**NFTが表示されない場合**:
- 「Polygonネットワークに切り替える」ボタンが表示される
- ボタンをクリックしてネットワークを切り替え

---

### 3. バリデーションテスト

1. 任意のNFTの「引き換え」ラジオボタンを選択

2. フォームに不正な値を入力:
   - 名前: `A`（1文字）
   - 郵便番号: `1234567`（ハイフンなし）
   - 電話番号: `09012345678`（ハイフンなし）
   - メールアドレス: `test`（無効な形式）

3. 「申し込む」ボタンをクリック

4. エラーメッセージが表示されることを確認

---

## トラブルシューティング

### 問題1: `npm install` が失敗する

**症状**:
```
npm ERR! code EACCES
npm ERR! syscall access
```

**解決方法**:

**Windowsの場合**:
```cmd
# 管理者権限でコマンドプロンプトを開く
npm cache clean --force
npm install
```

**macOS/Linuxの場合**:
```bash
# node_modules を削除
rm -rf node_modules package-lock.json

# 再インストール
npm install
```

---

### 問題2: 環境変数が読み込まれない

**症状**:
```
Moralis API Error: 401
```

**解決方法**:

1. `.env` ファイルが正しい場所にあるか確認:
   ```bash
   ls -la .env
   ```

2. ファイル内容を確認:
   ```bash
   cat .env
   ```

3. **開発サーバーを再起動**:
   ```bash
   # Ctrl+C で停止
   npm start
   ```

⚠️ **重要**: 環境変数を変更した場合は、**必ず開発サーバーを再起動**してください。

---

### 問題3: ポート 3000 が使用中

**症状**:
```
? Something is already running on port 3000. Would you like to run the app on another port instead?
```

**解決方法**:

**方法1**: 別のポートを使用
```
Yes と回答 → 自動的に別のポート（3001等）で起動
```

**方法2**: ポート3000を解放

**Windowsの場合**:
```cmd
# ポート3000を使用しているプロセスを確認
netstat -ano | findstr :3000

# プロセスIDを確認してタスクマネージャーで終了
```

**macOS/Linuxの場合**:
```bash
# ポート3000を使用しているプロセスを確認
lsof -i :3000

# プロセスを終了
kill -9 <PID>
```

---

### 問題4: MetaMask が接続できない

**症状**:
- 「MetaMaskに接続」ボタンを押しても反応がない
- `window.ethereum is undefined` エラー

**解決方法**:

1. MetaMask拡張機能がインストールされているか確認

2. ブラウザを再起動

3. MetaMaskがロックされている場合はアンロック

4. ページをリロード

---

### 問題5: NFT が表示されない

**症状**:
- MetaMask接続後もNFT一覧が空

**解決方法**:

1. **ネットワークを確認**:
   - MetaMaskでPolygon Mainnetに接続されているか確認

2. **「Polygonネットワークに切り替える」ボタンをクリック**

3. **開発者ツールでエラーを確認**:
   ```
   F12 → Console タブ
   ```

4. **API Keyを確認**:
   - Moralis API Keyが正しいか
   - APIの使用制限を超えていないか

---

### 問題6: ビルドエラー

**症状**:
```
Module not found: Error: Can't resolve 'buffer'
```

**解決方法**:

1. `craco.config.js` が存在するか確認

2. 依存関係を再インストール:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. キャッシュをクリア:
   ```bash
   npm cache clean --force
   ```

---

## 次のステップ

セットアップが完了したら、以下のドキュメントを参照してください:

1. **[SPECIFICATION.md](SPECIFICATION.md)** - 詳細な技術仕様
2. **[API_REFERENCE.md](API_REFERENCE.md)** - API仕様書
3. **[README.md](README.md)** - プロジェクト概要

---

## サポート

問題が解決しない場合:

- 📖 [トラブルシューティングガイド](SPECIFICATION.md#トラブルシューティング)を確認
- 🐛 [GitHub Issues](https://github.com/NouJouJin/MLTGwebAppTest/issues)で質問
- 💬 プロジェクトメンテナーに連絡

---

**更新日**: 2025-10-30
**バージョン**: 1.1.0

**Happy Coding! 🎉**
