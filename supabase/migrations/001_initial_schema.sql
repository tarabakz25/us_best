-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  interests TEXT[] DEFAULT '{}',
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Advertisers table
CREATE TABLE public.advertisers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_name TEXT NOT NULL,
  email TEXT NOT NULL,
  wallet_balance INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ads table
CREATE TABLE public.ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advertiser_id UUID REFERENCES public.advertisers(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  description TEXT,
  title TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad exposures (for frequency capping and analytics)
CREATE TABLE public.ad_exposures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  exposed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ad_id, user_id, DATE(exposed_at))
);

-- Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'adopted')),
  is_pinned BOOLEAN DEFAULT FALSE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UGC table
CREATE TABLE public.ugc (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  type TEXT NOT NULL CHECK (type IN ('video', 'image')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'adopted')),
  quality_score INTEGER DEFAULT 0,
  pr_badge BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Surveys table
CREATE TABLE public.surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey questions table
CREATE TABLE public.survey_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('single', 'multiple', 'text')),
  options JSONB,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey answers table
CREATE TABLE public.survey_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  answer_text TEXT,
  answer_options JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(survey_id, question_id, user_id)
);

-- Tester campaigns table
CREATE TABLE public.tester_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  max_applicants INTEGER DEFAULT 500,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tester applicants table
CREATE TABLE public.tester_applicants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.tester_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  application_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'selected', 'rejected', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

-- Tester reports table
CREATE TABLE public.tester_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID REFERENCES public.tester_applicants(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rewards table
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('coupon', 'point')),
  value TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'issued', 'used', 'expired')),
  source_type TEXT NOT NULL CHECK (source_type IN ('comment', 'ugc', 'tester', 'survey')),
  source_id UUID,
  coupon_code TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions table (for advertiser access control)
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advertiser_id UUID REFERENCES public.advertisers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(advertiser_id, user_id)
);

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  record_id UUID NOT NULL,
  diff JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ads_advertiser_id ON public.ads(advertiser_id);
CREATE INDEX idx_ads_status ON public.ads(status);
CREATE INDEX idx_ads_tags ON public.ads USING GIN(tags);
CREATE INDEX idx_comments_ad_id ON public.comments(ad_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_status ON public.comments(status);
CREATE INDEX idx_ugc_ad_id ON public.ugc(ad_id);
CREATE INDEX idx_ugc_user_id ON public.ugc(user_id);
CREATE INDEX idx_ugc_status ON public.ugc(status);
CREATE INDEX idx_survey_answers_survey_id ON public.survey_answers(survey_id);
CREATE INDEX idx_survey_answers_user_id ON public.survey_answers(user_id);
CREATE INDEX idx_tester_applicants_campaign_id ON public.tester_applicants(campaign_id);
CREATE INDEX idx_tester_applicants_user_id ON public.tester_applicants(user_id);
CREATE INDEX idx_rewards_user_id ON public.rewards(user_id);
CREATE INDEX idx_rewards_status ON public.rewards(status);
CREATE INDEX idx_ad_exposures_ad_id ON public.ad_exposures(ad_id);
CREATE INDEX idx_ad_exposures_user_id ON public.ad_exposures(user_id);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_exposures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ugc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tester_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tester_applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tester_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Ads policies
CREATE POLICY "Anyone can view active ads"
  ON public.ads FOR SELECT
  USING (status = 'active');

CREATE POLICY "Advertisers can manage their own ads"
  ON public.ads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.permissions
      WHERE permissions.advertiser_id = ads.advertiser_id
      AND permissions.user_id = auth.uid()
      AND permissions.role IN ('owner', 'admin', 'editor')
    )
  );

-- Comments policies
CREATE POLICY "Anyone can view approved comments"
  ON public.comments FOR SELECT
  USING (status IN ('approved', 'adopted'));

CREATE POLICY "Users can insert their own comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- UGC policies
CREATE POLICY "Anyone can view approved UGC"
  ON public.ugc FOR SELECT
  USING (status IN ('approved', 'adopted'));

CREATE POLICY "Users can insert their own UGC"
  ON public.ugc FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending UGC"
  ON public.ugc FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Survey policies
CREATE POLICY "Anyone can view active surveys"
  ON public.surveys FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can answer surveys"
  ON public.survey_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own answers"
  ON public.survey_answers FOR SELECT
  USING (auth.uid() = user_id);

-- Tester policies
CREATE POLICY "Anyone can view open tester campaigns"
  ON public.tester_campaigns FOR SELECT
  USING (status = 'open');

CREATE POLICY "Users can apply to tester campaigns"
  ON public.tester_applicants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own applications"
  ON public.tester_applicants FOR SELECT
  USING (auth.uid() = user_id);

-- Rewards policies
CREATE POLICY "Users can view their own rewards"
  ON public.rewards FOR SELECT
  USING (auth.uid() = user_id);

-- Audit logs policies (admin only - will be handled by service role)
CREATE POLICY "No public access to audit logs"
  ON public.audit_logs FOR SELECT
  USING (false);

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON public.ads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ugc_updated_at BEFORE UPDATE ON public.ugc
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tester_campaigns_updated_at BEFORE UPDATE ON public.tester_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tester_applicants_updated_at BEFORE UPDATE ON public.tester_applicants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON public.rewards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create audit log
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (table_name, operation, actor_id, record_id, diff)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(),
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit log triggers (example for critical tables)
CREATE TRIGGER audit_comments AFTER INSERT OR UPDATE OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_ugc AFTER INSERT OR UPDATE OR DELETE ON public.ugc
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_rewards AFTER INSERT OR UPDATE OR DELETE ON public.rewards
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Function to automatically add PR badge to UGC
CREATE OR REPLACE FUNCTION ensure_pr_badge_on_ugc()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('approved', 'adopted') AND NEW.pr_badge = FALSE THEN
    NEW.pr_badge = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_pr_badge_on_ugc_approval BEFORE UPDATE ON public.ugc
  FOR EACH ROW
  WHEN (NEW.status IN ('approved', 'adopted') AND OLD.status NOT IN ('approved', 'adopted'))
  EXECUTE FUNCTION ensure_pr_badge_on_ugc();

