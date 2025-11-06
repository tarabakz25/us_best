// 型定義

export interface User {
  id: string;
  name: string;
  email?: string;
  interests: string[];
  totalPoints: number;
}

export interface Ad {
  id: string;
  advertiserId: string;
  advertiserName: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  title: string;
  description: string;
  ctaText?: string;
  ctaUrl?: string;
  tags: string[];
  createdAt: string;
  // 共創アクションの有無
  hasComments: boolean;
  hasUGC: boolean;
  hasSurvey: boolean;
  hasTester: boolean;
}

export interface Comment {
  id: string;
  adId: string;
  userId: string;
  userName: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'adopted';
  createdAt: string;
  isPinned?: boolean;
  replyFromAdvertiser?: string;
}

export interface UGC {
  id: string;
  adId: string;
  userId: string;
  userName: string;
  mediaUrl: string;
  type: 'video' | 'image';
  approved: boolean;
  reward?: Reward;
  createdAt: string;
  qualityScore?: number;
}

export interface Survey {
  id: string;
  adId: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  responses?: SurveyResponse[];
}

export interface SurveyQuestion {
  id: string;
  type: 'single' | 'multiple' | 'text';
  question: string;
  options?: string[];
  required: boolean;
}

export interface SurveyResponse {
  id: string;
  userId: string;
  answers: Record<string, string | string[]>;
  completedAt: string;
}

export interface TesterCampaign {
  id: string;
  adId: string;
  title: string;
  description: string;
  requirements?: string[];
  maxApplicants: number;
  currentApplicants: number;
  winners: string[];
  status: 'open' | 'closed' | 'completed';
  deadline?: string;
}

export interface TesterApplication {
  id: string;
  campaignId: string;
  userId: string;
  status: 'pending' | 'selected' | 'rejected' | 'completed';
  appliedAt: string;
  report?: TesterReport;
}

export interface TesterReport {
  id: string;
  applicationId: string;
  content: string;
  mediaUrls?: string[];
  submittedAt: string;
}

export interface Reward {
  id: string;
  adId: string;
  userId: string;
  type: 'coupon' | 'point';
  value: string | number;
  status: 'pending' | 'granted' | 'used';
  grantedAt?: string;
  expiresAt?: string;
}

export interface ParticipationHistory {
  comments: Comment[];
  ugc: UGC[];
  surveys: SurveyResponse[];
  testerApplications: TesterApplication[];
  rewards: Reward[];
}

