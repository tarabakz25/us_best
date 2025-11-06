# UsBest! — UXワイヤーフロー & アーキテクチャ設計（v1）

作成: 2025-11-07 (JST)
対象: MVP（Web/SPA + BFF）

---

## 0) MVP前提（今回の方針）

* **広告は仮データ（こちらで用意）を配置**：外部広告主のオンボーディングはMVPでは非対応（将来対応）。
* **技術スタック**：Next.js（App Router）+ **Supabase**（Auth / Postgres / Storage / Realtime / Edge Functions）。
* **目的**：共創アクション（コメント・UGCリプライ・アンケ・テスター）→ データ取得とRLS/透明性まで一気通貫。

## 1) UXワイヤーフロー（主要シナリオ）

> 目的: 「広告を見たら終わり」ではなく、**共創アクション**に自然遷移する導線を可視化。

### 1-1. 初回導線（興味学習 → パーソナライズ）

1. Onboarding: 興味タグ選択（カテゴリ/目的/価格帯/ブランド）
2. ホーム/フィード: 興味スコアで並び替えた広告カード（非侵入型モーダルを開く）
3. モーダル（広告詳細）:

* 上段: メディア（静止画/動画）、コピー、CTA
* 中段: 共創タブ（コメント / UGCリプライ / アンケート / テスター募集）
* 下段: 透明性バッジ（#PR, 利用許諾情報, 出稿者）

4. 初回は「共創タブ」に軽いナッジ（バッジ点灯 + ツールチップ）

### 1-2. 「コメント（口コミ）」フロー

1. 広告モーダル → 共創タブ「コメント」
2. 入力UI（テンプレ: 好き/改善/質問）
3. 送信 → コンプライアンス自動チェック（NG語/PR不要確認）
4. 投稿即時反映（仮公開）→ モデレーションでステータス更新（公開/非公開）
5. 広告主は採用/返信/ピン留め可能（採用でユーザーに特典を自動発行）

### 1-3. 「UGC-Remix（動画リプライ）」フロー

1. 共創タブ「UGCリプライ」→ 録画/アップロード
2. 自動テンプレ適用（イントロ/CTA/PR表記）
3. 投稿 → 変換キュー → 自動審査（権利/露出/不適切判定）
4. 承認後、広告配下のUGCギャラリーに掲載（並び順: 品質スコア）
5. 広告主が「採用」→ 再配信用の許諾ワークフロー → 特典付与

### 1-4. 「アンケート」フロー

1. 共創タブ「アンケート」→ 1–3問の軽量設計
2. 回答完了時に軽リワード（抽選/ポイント）
3. 集計結果の一部をユーザーにも可視化（透明性の演出）

### 1-5. 「テスター募集」フロー

1. 共創タブ「テスター募集」→ 募集要項確認
2. 応募フォーム（利用環境/期待値/SNS/過去レビュー実績）
3. 当選通知（メール/アプリ内）→ 体験タスク → レポート投稿
4. 完了で特典自動付与、広告主側にレポート集約

### 1-6. マイページ

* 参加履歴（コメント/UGC/アンケ/テスター）
* 特典/クーポン一覧、利用状況
* 透明性/同意履歴（PR版数、利用許諾トークン）

---

## 2) 情報設計（UIワイヤー概略）

* **フィードカード**: サムネ/ブランド/短コピー/共創バッジ/保存
* **広告モーダル**: Mediaヘッダ / CTA / 共創タブ（4機能）/ 透明性フッタ
* **共創タブ**:

  * コメント: 並び（採用→評価→新着）、入力テンプレ
  * UGC: グリッド（品質/関連度ソート）、投稿導線ボタン固定
  * アンケ: プログレス + 即時フィードバック
  * テスター: 枠状況/応募/結果トラッキング
* **広告主コンソール**: キャンペーン/UGC承認/報酬/レポート

---

## 3) 画面遷移（簡易）

Home → AdModal → (Comment | UGC | Survey | Tester) → MyPage
↘ AdvertiserConsole（広告主のみ）

---

## 4) アーキテクチャ（MVP）

> 目的: **Next.js + Supabase**で素早く実装し、RLSで安全に共創データを蓄積。

### 4-1. 構成図（論理・MVP）

```
[Web/SPA (Next.js App Router)]
   ├─ UI/Server Actions
   └─ /api/* (Route Handlers)
        │
        ▼
[Supabase]
  ├─ Auth (メール/OTP)
  ├─ Postgres (RLS, Policies, Triggers)
  ├─ Storage (buckets: ads, ugc)
  ├─ Realtime (comments/ugc channels)
  └─ Edge Functions (moderation/transcode hook/cron)

※ 変換はEdge Function→外部ワーカー（ffmpeg, Cloudflare Images 等）に委譲可
```

### 4-2. モジュール責務（サービス分割の“論理”）

* **ad**：広告CRUD/露出制御（頻度/重複回避）※MVPは仮広告のseedと閲覧のみ
* **ugc**：コメント/動画リプライ、Storage入出庫、承認フラグ
* **participation**：アンケ設計/回答、テスター募集/応募/レポ
* **reward**：クーポン/ポイント付与（テーブル + 署名付きコード生成）
* **compliance**：PR表記付与、NG/違反チェック、監査ログ（トリガ/関数）
* **reco**：興味タグ×行動の簡易スコア（SQL + Materialized View）
* **auth**：Supabase Auth（RLSのowner紐付け）
* **analytics**：イベントテーブル + ビュー（24h遅延でレポ）

### 4-3. データストア（Supabase具体）

* **テーブル**：users, ads, ad_exposures, comments, ugc, surveys, survey_questions, survey_answers,
  tester_campaigns, tester_applicants, tester_reports, rewards, permissions, audit_logs
* **ストレージ**：`ads/`（静止画・動画・サムネ）, `ugc/`（ユーザー投稿原本/派生）
* **RLSポリシー**（例）：

  * `comments`: `auth.uid() = user_id` は自分の編集可、公開閲覧は承認済のみ
  * `ugc`: 投稿者本人かつ未承認のみ編集可、公開は承認済 + PR表記必須
  * `rewards`: 所有者本人のみ閲覧、発行はEdge Function経由
  * `audit_logs`: 読取は管理者のみ

### 4-4. API/Route（Next.js例）

* `GET /api/ads?tags=&cursor=` — 仮広告フィード（頻度キャップはSQLで）
* `GET /api/ads/[id]` — 広告詳細 + 透明性メタ
* `POST /api/ads/[id]/comments` — コメント投稿（Server ActionでRLS準拠）
* `POST /api/ads/[id]/ugc/init` — 署名URL発行 → Storage直PUT
* `POST /api/ugc/[id]/submit` — 変換キュー投入（Edge Function呼び出し）
* `POST /api/ads/[id]/survey/answers` — 回答登録
* `POST /api/ads/[id]/tester/apply` — 応募登録
* `POST /api/ugc/[id]/adopt` — 採用（許諾ワークフロー）
* `POST /api/rewards/grant` — 特典発行（Edge Functionで署名生成）

### 4-5. セキュリティ/コンプラ（Supabase流）

* **RLS前提**：全テーブルDENY→ポリシーで許可
* **PR自動表記**：`before insert/update` でPRバッジ付与（欠落時はreject）
* **監査**：`audit_logs` に `table, op, actor, ts, diff` を保存（trigger）
* **モデレーション**：Edge FunctionでNGワード/画像NSFW/著作権ラフ判定→結果を承認列に反映

### 4-6. パフォーマンス/可観測性

* LCP < 2.5s（Next/Image最適化、静的+動的hybrid）
* Realtimeでコメント/UGCの即時反映
* 変換/審査は非同期（ジョブ状態はPolling or Realtime）

## 5) シーケンス（代表）

### 5-1. UGCリプライ投稿（Supabase版）

```
Client → /api/ads/[id]/ugc/init
API → Supabase: generate signedURL (storage path)
Client → Storage: PUT media (signed)
Client → /api/ugc/[id]/submit
API → Edge Function: enqueue(transcode + moderation)
EdgeFn → Postgres: update ugc set approved=true/false, thumbnails
Client: Realtimeで状態更新を受信
```

### 5-2. テスター応募→レポ→特典

```
Client → /api/ads/[id]/tester/apply
DB Trigger → notify EdgeFn (screening optional)
Advertiser (将来) or Admin → select winners (MVPは管理画面で手動)
Client → submit report (form + media)
EdgeFn → rewards.grant (coupon code)
Client → MyPage: rewards wallet updated
```

### 5-1. UGCリプライ投稿

```
Client → BFF: POST /ads/{id}/ugc (init)
BFF → UGC: Create placeholder → Presigned URL
Client → Storage: PUT media
BFF → MQ: enqueue(transcode+moderation)
Worker → Compliance: scan(PR/NG/rights)
Worker → UGC: mark approved & thumbnails
BFF → Client: status=approved
```

### 5-2. テスター応募→レポ→特典

```
Client → Participation: apply(test)
Participation → Advertiser: notify shortlist
Advertiser → Participation: pick winners
Client → Participation: submit report
Participation → Reward: grant coupon
Reward → Client: deliver & wallet update
```

---

## 6) リスク/対策（要点）

* 偽UGC/スパム: デバイス指紋/行動特徴/レート制御 + 手動審査
* 権利/肖像: 同意トークンと撤回API、ブランド再配布はスコープ限定
* 露骨表現/誤情報: ルール + モデレーションUI + 透明性ログ
* 冷スタート: テスター募集×初期UGCコンテストで在庫形成

---

## 7) MVPスコープ境界

* 推薦: まずはルール/重み付け（行動×興味）
* 報酬: クーポン/固定ポイントのみ（金銭送金なし）
* テスター: 1キャンペーン=最大500応募、当選配布はCSV/メール連携

---

## 8) 次アクション

1. 主要画面のLo-Fiワイヤー（Home/AdModal/共創タブ/Console）
2. スキーマ確定（ER図/権利メタ/監査ログ）
3. 2社PoC要件に合わせたAPI優先度の確定
4.
