export type User = {
  id: string;
  name: string | null;
  interests: string[];
  total_points: number;
  created_at: string;
  updated_at: string;
};

export type Advertiser = {
  id: string;
  org_name: string;
  email: string;
  wallet_balance: number;
  created_at: string;
  updated_at: string;
};

export type Ad = {
  id: string;
  advertiser_id: string;
  media_url: string;
  thumbnail_url: string | null;
  description: string | null;
  title: string;
  tags: string[];
  status: 'active' | 'paused' | 'archived';
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  ad_id: string;
  user_id: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'adopted';
  is_pinned: boolean;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
};

export type UGC = {
  id: string;
  ad_id: string;
  user_id: string;
  media_url: string;
  thumbnail_url: string | null;
  type: 'video' | 'image';
  status: 'pending' | 'approved' | 'rejected' | 'adopted';
  quality_score: number;
  pr_badge: boolean;
  created_at: string;
  updated_at: string;
};

export type Survey = {
  id: string;
  ad_id: string;
  title: string;
  description: string | null;
  status: 'active' | 'paused' | 'closed';
  created_at: string;
  updated_at: string;
};

export type SurveyQuestion = {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: 'single' | 'multiple' | 'text';
  options: Record<string, unknown> | null;
  order_index: number;
  created_at: string;
};

export type SurveyAnswer = {
  id: string;
  survey_id: string;
  question_id: string;
  user_id: string;
  answer_text: string | null;
  answer_options: Record<string, unknown> | null;
  created_at: string;
};

export type TesterCampaign = {
  id: string;
  ad_id: string;
  title: string;
  description: string;
  max_applicants: number;
  status: 'open' | 'closed' | 'completed';
  created_at: string;
  updated_at: string;
};

export type TesterApplicant = {
  id: string;
  campaign_id: string;
  user_id: string;
  application_data: Record<string, unknown>;
  status: 'pending' | 'selected' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
};

export type TesterReport = {
  id: string;
  applicant_id: string;
  content: string;
  media_urls: string[];
  created_at: string;
  updated_at: string;
};

export type Reward = {
  id: string;
  ad_id: string;
  user_id: string;
  type: 'coupon' | 'point';
  value: string;
  status: 'pending' | 'issued' | 'used' | 'expired';
  source_type: 'comment' | 'ugc' | 'tester' | 'survey';
  source_id: string | null;
  coupon_code: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdExposure = {
  id: string;
  ad_id: string;
  user_id: string | null;
  exposed_at: string;
};

