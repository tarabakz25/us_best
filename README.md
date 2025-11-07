# UsBest! — 共創型広告プラットフォーム

UsBest!は、ユーザーと企業が広告を通じてプロダクト共創を行うプラットフォームです。

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **バックエンド**: Supabase (Auth, Postgres, Storage, Realtime, Edge Functions)
- **パッケージマネージャー**: Bun

## セットアップ

### 1. 依存関係のインストール

```bash
bun install
```

### 2. Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. `.env.local`ファイルを作成し、以下の環境変数を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. データベースマイグレーションの実行

SupabaseダッシュボードのSQL Editorで、`supabase/migrations/001_initial_schema.sql`の内容を実行してください。

### 4. ストレージバケットの作成

Supabaseダッシュボードで以下のストレージバケットを作成：

- `ads`: 広告メディア用
- `ugc`: ユーザー生成コンテンツ用

各バケットのパブリックアクセス設定は要件に応じて設定してください。

### 5. 開発サーバーの起動

```bash
bun dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## プロジェクト構造

```
├── app/                    # Next.js App Router
│   ├── api/               # API Route Handlers
│   │   ├── ads/          # 広告関連API
│   │   ├── comments/     # コメント関連API
│   │   ├── ugc/          # UGC関連API
│   │   ├── tester/       # テスター関連API
│   │   └── rewards/      # 報酬関連API
│   └── ...
├── lib/
│   ├── supabase/         # Supabaseクライアント設定
│   ├── actions/          # Server Actions
│   │   ├── participation.ts  # 参加アクション
│   │   ├── moderation.ts     # モデレーション
│   │   ├── queries.ts         # データ取得
│   │   └── storage.ts         # ストレージ操作
│   └── types/            # 型定義
├── supabase/
│   └── migrations/       # データベースマイグレーション
└── docs/                 # ドキュメント
```

## API エンドポイント

### 広告

- `GET /api/ads` - 広告一覧取得
- `GET /api/ads/[id]` - 広告詳細取得

### コメント

- `GET /api/ads/[id]/comments` - コメント一覧取得
- `POST /api/ads/[id]/comments` - コメント投稿
- `POST /api/comments/[id]/actions` - コメント操作（採用・ピン留め）

### UGC

- `GET /api/ads/[id]/ugc` - UGC一覧取得
- `POST /api/ads/[id]/ugc` - UGC投稿
- `POST /api/ads/[id]/ugc/init` - UGCアップロード用署名URL取得
- `POST /api/ugc/[id]/adopt` - UGC採用

### アンケート

- `GET /api/ads/[id]/survey` - アンケート取得
- `POST /api/ads/[id]/survey` - アンケート回答

### テスター

- `GET /api/ads/[id]/tester` - テスターキャンペーン取得
- `POST /api/ads/[id]/tester` - テスター応募
- `POST /api/tester/reports` - テスターレポート投稿

### 報酬

- `GET /api/rewards` - 報酬一覧取得

## Server Actions

- `lib/actions/participation.ts` - 参加関連アクション
- `lib/actions/moderation.ts` - モデレーション関連アクション
- `lib/actions/queries.ts` - データ取得アクション
- `lib/actions/storage.ts` - ストレージ操作アクション

## データベーススキーマ

主要なテーブル：

- `users` - ユーザー情報
- `advertisers` - 広告主情報
- `ads` - 広告
- `comments` - コメント
- `ugc` - ユーザー生成コンテンツ
- `surveys` - アンケート
- `survey_questions` - アンケート質問
- `survey_answers` - アンケート回答
- `tester_campaigns` - テスターキャンペーン
- `tester_applicants` - テスター応募者
- `tester_reports` - テスターレポート
- `rewards` - 報酬
- `ad_exposures` - 広告露出履歴
- `audit_logs` - 監査ログ

詳細は`supabase/migrations/001_initial_schema.sql`を参照してください。

## セキュリティ

- Row Level Security (RLS) がすべてのテーブルで有効化されています
- ユーザー認証はSupabase Authを使用
- 監査ログが重要な操作に記録されます
- PRバッジがUGC承認時に自動付与されます

## 開発

### 型チェック

```bash
npx tsc --noEmit
```

### リント

```bash
bun run lint
```

## ドキュメント

- [アプリケーション要件](./docs/app.md)
- [アーキテクチャ設計](./docs/architecture.md)

## ライセンス

Private
