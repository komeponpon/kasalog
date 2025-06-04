# 傘ログ (Kasalog)

傘の位置情報を記録・管理するWebアプリケーションです。NFCタグを使用して傘の現在位置を簡単に記録できます。

## 機能

- NFCタグスキャンによる位置情報の自動記録
- 手動での位置情報入力
- 記録された位置情報の一覧表示
- 地図上での位置表示
- 住所の自動取得

## NFCタグの設定

### 書き込むURLの形式

NFCタグには以下の形式のURLを書き込んでください：

```
https://yourdomain.com/scan?umbrellaId=UMBRELLA_ID
```

### 例

```
https://yourdomain.com/scan?umbrellaId=UMBRELLA_001
https://yourdomain.com/scan?umbrellaId=UMBRELLA_002
```

### 重要な注意点

- `umbrellaId`パラメータは必須です
- 傘ID（`UMBRELLA_ID`）は各傘で一意である必要があります
- HTTPSが必要です（位置情報取得のため）
- NFCタグをスキャンすると自動的に位置記録ページが開きます

## 使用方法

1. NFCタグを傘に取り付け、適切なURLを書き込みます
2. 傘を使用した後、NFCタグをスマートフォンでスキャンします
3. 位置情報の記録方法を選択します：
   - 自動取得（推奨）：GPS位置情報を自動で取得
   - 手動入力：緯度・経度を手動で入力
4. 記録完了後、位置一覧で確認できます

## 開発・デプロイ

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### 開発サーバーの起動

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて結果を確認してください。

`app/page.tsx`を編集することでページの内容を変更できます。ファイルを編集すると自動的にページが更新されます。

### 環境要件

- Node.js
- Supabase（データベース）
- HTTPS環境（本番環境での位置情報取得に必要）

### 技術スタック

- Next.js 15 (App Router)
- TypeScript
- Supabase
- OpenStreetMap (Nominatim API)

### フォント

このプロジェクトは[`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)を使用して[Geist](https://vercel.com/font)フォントを自動的に最適化・読み込みしています。

## 詳細情報

Next.jsについて詳しく学ぶには、以下のリソースを参照してください：

- [Next.js Documentation](https://nextjs.org/docs) - Next.jsの機能とAPIについて学ぶ
- [Learn Next.js](https://nextjs.org/learn) - インタラクティブなNext.jsチュートリアル

[Next.js GitHub repository](https://github.com/vercel/next.js)もチェックしてみてください。フィードバックやコントリビューションを歓迎します！

## デプロイ

Next.jsアプリをデプロイする最も簡単な方法は、Next.jsの制作者による[Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)を使用することです。

詳細については、[Next.jsデプロイメントドキュメント](https://nextjs.org/docs/app/building-your-application/deploying)を確認してください。
