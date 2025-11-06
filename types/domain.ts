export type InterestTag =
  | "サステナブル"
  | "美容・ウェルネス"
  | "スマートホーム"
  | "フードテック"
  | "モビリティ"
  | "クリエイティブツール"
  | "フィンテック"
  | "ライフログ"
  | "エンタメ"
  | "働き方";

export type CommentStatus = "published" | "pending" | "adopted";

export type Comment = {
  id: string;
  userName: string;
  persona: string;
  sentiment: "love" | "improve" | "question";
  content: string;
  status: CommentStatus;
  createdAt: string;
  adoptedReward?: string;
};

export type UGCStatus = "approved" | "pending" | "flagged";

export type UGC = {
  id: string;
  userName: string;
  title: string;
  thumbnail: string;
  description: string;
  status: UGCStatus;
  likes: number;
  updatedAt: string;
};

export type SurveyQuestion =
  | {
      id: string;
      type: "single";
      question: string;
      options: string[];
      stats: Record<string, number>;
    }
  | {
      id: string;
      type: "multi";
      question: string;
      options: string[];
      stats: Record<string, number>;
    }
  | {
      id: string;
      type: "text";
      question: string;
      placeholder: string;
    };

export type SurveyBlueprint = {
  intro: string;
  reward: string;
  closeDate: string;
  questions: SurveyQuestion[];
  transparency: string;
};

export type TesterCampaign = {
  summary: string;
  capacity: number;
  applied: number;
  dueDate: string;
  focus: string[];
  tasks: string[];
  rewards: string;
  stage: "応募受付中" | "選考中" | "テスト中" | "クローズ";
};

export type TransparencyInfo = {
  prLabel: string;
  advertiser: string;
  license: string;
  complianceBadges: string[];
};

export type AdoptionMetric = {
  participationRate: string;
  commentCount: number;
  ugcCount: number;
  testerSpots: number;
};

export type Ad = {
  id: string;
  brand: string;
  productName: string;
  headline: string;
  media: {
    type: "image" | "video";
    url: string;
    alt: string;
  };
  description: string;
  tags: InterestTag[];
  metrics: AdoptionMetric;
  commentTemplates: { label: string; value: string }[];
  comments: Comment[];
  ugcItems: UGC[];
  survey: SurveyBlueprint;
  tester: TesterCampaign;
  transparency: TransparencyInfo;
  featureHighlights: string[];
};

export type ParticipationLogEntry =
  | {
      id: string;
      type: "comment";
      adId: string;
      adName: string;
      status: CommentStatus;
      submittedAt: string;
      sentiment: "love" | "improve" | "question";
    }
  | {
      id: string;
      type: "ugc";
      adId: string;
      adName: string;
      status: UGCStatus;
      submittedAt: string;
    }
  | {
      id: string;
      type: "survey";
      adId: string;
      adName: string;
      submittedAt: string;
    }
  | {
      id: string;
      type: "tester";
      adId: string;
      adName: string;
      submittedAt: string;
      stage: TesterCampaign["stage"];
    };

