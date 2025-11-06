# セットアップ手順（統合後）

## 1. 依存関係のインストール

```bash
cd /Users/kz/.cursor/worktrees/us_best/EoDuS
bun install
```

## 2. Supabaseプロジェクトのセットアップ

### 2-1. Supabaseプロジェクト作成
1. [Supabase](https://supabase.com)でプロジェクトを作成
2. プロジェクトURLとAPIキーを取得

### 2-2. 環境変数の設定
プロジェクトルートに `.env.local` ファイルを作成：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**重要**: `.env.local`は`.gitignore`に含まれているため、Gitにはコミットされません。

## 3. データベースマイグレーションの実行

SupabaseダッシュボードのSQL Editorで、以下の順序で実行：

1. **初期スキーマ**: `supabase/migrations/001_initial_schema.sql`
2. **不足カラム追加**: `supabase/migrations/002_add_missing_columns.sql`（新規作成）

## 4. ストレージバケットの作成

Supabaseダッシュボードの「Storage」セクションで以下を作成：

### `ugc` バケット
- **名前**: `ugc`
- **公開バケット**: ✅ 有効（UGCは公開表示されるため）
- **ファイルサイズ制限**: 100MB（推奨）
- **許可されたMIMEタイプ**: `image/*,video/*`

### `ads` バケット（オプション）
- **名前**: `ads`
- **公開バケット**: ✅ 有効
- 広告メディア用（既に外部URLを使用している場合は不要）

## 5. 認証設定（オプション）

現在のコードでは認証が必須ではありませんが、コメント投稿やUGC投稿には認証が必要です。

### 認証を有効にする場合：
1. Supabaseダッシュボードの「Authentication」で認証方法を設定
2. メール認証を有効化（推奨）
3. 必要に応じてOAuthプロバイダーを追加

### 認証を無効にする場合（開発用）：
- APIルートの認証チェックをコメントアウト
- または、テスト用のユーザーを作成

## 6. テストデータの投入（開発用）

開発・テスト用にサンプルデータを投入：

```sql
-- テスト用広告主
INSERT INTO public.advertisers (id, org_name, email)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'TechStart Inc.', 'test@techstart.com'),
  ('00000000-0000-0000-0000-000000000002', 'EcoBrand', 'test@ecobrand.com');

-- テスト用広告（共創機能付き）
INSERT INTO public.ads (
  id, advertiser_id, title, description, media_url, media_type,
  tags, has_comments, has_ugc, has_survey, has_tester, status
)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '新しいAIアシスタントアプリ',
  '日常業務を効率化する次世代AIアシスタント。あなたの意見で一緒に作り上げませんか？',
  'https://via.placeholder.com/800x600',
  'image',
  ARRAY['AI', 'プロダクティビティ', 'アプリ'],
  TRUE, TRUE, TRUE, TRUE,
  'active'
);
```

## 7. 開発サーバーの起動

```bash
bun dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 8. 動作確認チェックリスト

- [ ] 広告一覧が表示される
- [ ] 広告詳細モーダルが開く
- [ ] コメント投稿ができる
- [ ] UGCアップロードができる（署名URL取得→アップロード→投稿）
- [ ] アンケート回答ができる
- [ ] テスター応募ができる

## トラブルシューティング

### エラー: "Cannot find module 'next/server'"
→ `bun install` を実行して依存関係をインストール

### エラー: "Unauthorized" が表示される
→ 認証が必要なAPIを呼び出している可能性があります。Supabaseでユーザーを作成するか、認証チェックを一時的に無効化

### UGCアップロードが失敗する
→ Supabase Storageの`ugc`バケットが作成されているか確認
→ バケットの公開設定を確認
→ 環境変数`NEXT_PUBLIC_SUPABASE_URL`が正しく設定されているか確認

### データが表示されない
→ データベースマイグレーションが実行されているか確認
→ Supabaseダッシュボードでテーブルにデータが存在するか確認
→ ブラウザのコンソールでエラーを確認

