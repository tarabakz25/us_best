-- スキーマ修正マイグレーション（統合後の不足カラム追加）

-- adsテーブルに不足しているカラムを追加
ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'video')),
  ADD COLUMN IF NOT EXISTS cta_text TEXT,
  ADD COLUMN IF NOT EXISTS cta_url TEXT,
  ADD COLUMN IF NOT EXISTS has_comments BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_ugc BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_survey BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_tester BOOLEAN DEFAULT FALSE;

-- commentsテーブルに返信カラムを追加
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS reply_from_advertiser TEXT;

-- survey_questionsテーブルのカラム名修正と追加
ALTER TABLE public.survey_questions
  ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('single', 'multiple', 'text')),
  ADD COLUMN IF NOT EXISTS required BOOLEAN DEFAULT FALSE;

-- question_typeからtypeへのデータ移行（既存データがある場合）
UPDATE public.survey_questions
SET type = question_type
WHERE type IS NULL AND question_type IS NOT NULL;

-- 既存のquestion_typeカラムは残しておく（後方互換性のため）
-- 必要に応じて後で削除: ALTER TABLE public.survey_questions DROP COLUMN question_type;

-- tester_campaignsテーブルに不足しているカラムを追加
ALTER TABLE public.tester_campaigns
  ADD COLUMN IF NOT EXISTS requirements TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS current_applicants INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS winners UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;

-- current_applicantsを自動計算する関数
CREATE OR REPLACE FUNCTION update_tester_campaign_applicants()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tester_campaigns
  SET current_applicants = (
    SELECT COUNT(*) 
    FROM public.tester_applicants 
    WHERE campaign_id = NEW.campaign_id
  )
  WHERE id = NEW.campaign_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを作成（応募者数自動更新）
DROP TRIGGER IF EXISTS trigger_update_applicants_count ON public.tester_applicants;
CREATE TRIGGER trigger_update_applicants_count
  AFTER INSERT OR DELETE ON public.tester_applicants
  FOR EACH ROW
  EXECUTE FUNCTION update_tester_campaign_applicants();

-- 既存の応募者数を更新
UPDATE public.tester_campaigns
SET current_applicants = (
  SELECT COUNT(*) 
  FROM public.tester_applicants 
  WHERE campaign_id = tester_campaigns.id
);

-- インデックスの追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_ads_has_comments ON public.ads(has_comments) WHERE has_comments = TRUE;
CREATE INDEX IF NOT EXISTS idx_ads_has_ugc ON public.ads(has_ugc) WHERE has_ugc = TRUE;
CREATE INDEX IF NOT EXISTS idx_ads_has_survey ON public.ads(has_survey) WHERE has_survey = TRUE;
CREATE INDEX IF NOT EXISTS idx_ads_has_tester ON public.ads(has_tester) WHERE has_tester = TRUE;

