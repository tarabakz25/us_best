// 仮データ（MVP用）

import { Ad, Comment, UGC, Survey, TesterCampaign } from '@/types';

export const mockAds: Ad[] = [
  {
    id: '1',
    advertiserId: 'adv1',
    advertiserName: 'TechStart Inc.',
    mediaUrl: '/next.svg',
    mediaType: 'image',
    title: '新しいAIアシスタントアプリ',
    description: '日常業務を効率化する次世代AIアシスタント。あなたの意見で一緒に作り上げませんか？',
    ctaText: '詳細を見る',
    ctaUrl: 'https://example.com',
    tags: ['AI', 'プロダクティビティ', 'アプリ'],
    createdAt: '2025-01-15T10:00:00Z',
    hasComments: true,
    hasUGC: true,
    hasSurvey: true,
    hasTester: true,
  },
  {
    id: '2',
    advertiserId: 'adv2',
    advertiserName: 'EcoBrand',
    mediaUrl: '/vercel.svg',
    mediaType: 'image',
    title: 'サステナブルな日用品シリーズ',
    description: '環境に優しい選択を。あなたの体験談をシェアしてください。',
    ctaText: '商品を見る',
    ctaUrl: 'https://example.com',
    tags: ['エコ', 'ライフスタイル', '日用品'],
    createdAt: '2025-01-14T15:30:00Z',
    hasComments: true,
    hasUGC: true,
    hasSurvey: false,
    hasTester: false,
  },
  {
    id: '3',
    advertiserId: 'adv3',
    advertiserName: 'FitLife',
    mediaUrl: '/globe.svg',
    mediaType: 'image',
    title: '新しいフィットネスアプリ',
    description: 'あなたのフィードバックで、より良いアプリに。',
    ctaText: 'アプリをダウンロード',
    ctaUrl: 'https://example.com',
    tags: ['フィットネス', 'ヘルスケア', 'アプリ'],
    createdAt: '2025-01-13T09:00:00Z',
    hasComments: true,
    hasUGC: false,
    hasSurvey: true,
    hasTester: true,
  },
];

export const mockComments: Record<string, Comment[]> = {
  '1': [
    {
      id: 'c1',
      adId: '1',
      userId: 'u1',
      userName: 'ユーザーA',
      content: 'UIが直感的で使いやすそう！改善点があれば教えてください。',
      status: 'approved',
      createdAt: '2025-01-15T11:00:00Z',
      isPinned: true,
      replyFromAdvertiser: 'ありがとうございます！フィードバックを反映させます。',
    },
    {
      id: 'c2',
      adId: '1',
      userId: 'u2',
      userName: 'ユーザーB',
      content: '音声認識の精度を上げてほしいです。',
      status: 'approved',
      createdAt: '2025-01-15T12:00:00Z',
    },
  ],
  '2': [
    {
      id: 'c3',
      adId: '2',
      userId: 'u3',
      userName: 'ユーザーC',
      content: '実際に使ってみて、とても良かったです！',
      status: 'approved',
      createdAt: '2025-01-14T16:00:00Z',
    },
  ],
};

export const mockUGC: Record<string, UGC[]> = {
  '1': [
    {
      id: 'ugc1',
      adId: '1',
      userId: 'u1',
      userName: 'ユーザーA',
      mediaUrl: '/next.svg',
      type: 'image',
      approved: true,
      createdAt: '2025-01-15T13:00:00Z',
      qualityScore: 85,
    },
  ],
};

export const mockSurveys: Record<string, Survey> = {
  '1': {
    id: 's1',
    adId: '1',
    title: 'AIアシスタントに関するアンケート',
    description: 'あなたの意見をお聞かせください',
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: 'AIアシスタントをどのくらい使いますか？',
        options: ['毎日', '週に数回', '月に数回', 'ほとんど使わない'],
        required: true,
      },
      {
        id: 'q2',
        type: 'multiple',
        question: '重視する機能は？（複数選択可）',
        options: ['音声認識', 'タスク管理', 'スケジュール管理', '情報検索'],
        required: true,
      },
      {
        id: 'q3',
        type: 'text',
        question: 'その他のご意見・ご要望',
        required: false,
      },
    ],
  },
  '3': {
    id: 's2',
    adId: '3',
    title: 'フィットネスアプリに関するアンケート',
    description: 'あなたのフィットネス習慣について教えてください',
    questions: [
      {
        id: 'q4',
        type: 'single',
        question: '週に何回運動しますか？',
        options: ['毎日', '週3-4回', '週1-2回', 'ほとんどしない'],
        required: true,
      },
    ],
  },
};

export const mockTesterCampaigns: Record<string, TesterCampaign> = {
  '1': {
    id: 't1',
    adId: '1',
    title: 'AIアシスタントβテスター募集',
    description: '新機能をいち早く体験し、フィードバックをお寄せください。',
    requirements: ['iOS/Android対応デバイス', '日常的にアプリを使用する環境'],
    maxApplicants: 100,
    currentApplicants: 45,
    winners: [],
    status: 'open',
    deadline: '2025-02-15T23:59:59Z',
  },
  '3': {
    id: 't2',
    adId: '3',
    title: 'フィットネスアプリβテスター',
    description: '新しいトレーニング機能をテストしてください。',
    requirements: ['運動習慣がある方'],
    maxApplicants: 50,
    currentApplicants: 23,
    winners: [],
    status: 'open',
    deadline: '2025-02-20T23:59:59Z',
  },
};

