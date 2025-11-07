/* eslint-disable @typescript-eslint/no-explicit-any */
// APIクライアント関数

import { Ad, Comment, UGC, Survey, TesterCampaign } from '@/types';

const API_BASE = '/api';

// エラーハンドリング用のヘルパー
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.data || data;
}

// 広告一覧取得
export async function fetchAds(params?: {
  tags?: string[];
  cursor?: string;
  limit?: number;
}): Promise<{ data: Ad[]; cursor?: string }> {
  const searchParams = new URLSearchParams();
  if (params?.tags && params.tags.length > 0) {
    searchParams.set('tags', params.tags.join(','));
  }
  if (params?.cursor) {
    searchParams.set('cursor', params.cursor);
  }
  if (params?.limit) {
    searchParams.set('limit', params.limit.toString());
  }

  const url = `${API_BASE}/ads${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);
  return handleResponse<{ data: Ad[]; cursor?: string }>(response);
}

// 広告詳細取得
export async function fetchAd(id: string): Promise<Ad> {
  const response = await fetch(`${API_BASE}/ads/${id}`);
  const result = await handleResponse<{ data: any }>(response);
  
  // データベースのレスポンスをAd型に変換
  return transformAdFromDB(result);
}

// コメント取得
export async function fetchComments(adId: string): Promise<Comment[]> {
  const response = await fetch(`${API_BASE}/ads/${adId}/comments`);
  const result = await handleResponse<any[]>(response);
  return result.map(transformCommentFromDB);
}

// コメント投稿
export async function postComment(
  adId: string,
  content: string,
  parentId?: string
): Promise<Comment> {
  const response = await fetch(`${API_BASE}/ads/${adId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, parent_id: parentId }),
  });
  const result = await handleResponse<any>(response);
  return transformCommentFromDB(result);
}

// UGC取得
export async function fetchUGC(adId: string): Promise<UGC[]> {
  const response = await fetch(`${API_BASE}/ads/${adId}/ugc`);
  const result = await handleResponse<any[]>(response);
  return result.map(transformUGCFromDB);
}

// UGC投稿
export async function postUGC(
  adId: string,
  mediaUrl: string,
  type: 'video' | 'image'
): Promise<UGC> {
  const response = await fetch(`${API_BASE}/ads/${adId}/ugc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_url: mediaUrl, type }),
  });
  const result = await handleResponse<any>(response);
  return transformUGCFromDB(result);
}

// UGCアップロード用の署名URL取得
export async function getUGCUploadUrl(adId: string): Promise<{
  signedUrl: string;
  path: string;
  token: string;
}> {
  const response = await fetch(`${API_BASE}/ads/${adId}/ugc/init`, {
    method: 'POST',
  });
  return handleResponse<{ signedUrl: string; path: string; token: string }>(response);
}

// アンケート取得
export async function fetchSurvey(adId: string): Promise<Survey | null> {
  try {
    const response = await fetch(`${API_BASE}/ads/${adId}/survey`);
    const result = await handleResponse<any>(response);
    return transformSurveyFromDB(result);
  } catch (error: any) {
    if (error.message.includes('404') || error.message.includes('No active survey')) {
      return null;
    }
    throw error;
  }
}

// アンケート回答送信
export async function submitSurveyAnswers(
  adId: string,
  answers: Array<{ question_id: string; answer_text?: string; answer_options?: unknown }>
): Promise<void> {
  const response = await fetch(`${API_BASE}/ads/${adId}/survey`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  await handleResponse(response);
}

// テスターキャンペーン取得
export async function fetchTesterCampaign(adId: string): Promise<TesterCampaign | null> {
  try {
    const response = await fetch(`${API_BASE}/ads/${adId}/tester`);
    const result = await handleResponse<any>(response);
    return transformTesterCampaignFromDB(result);
  } catch (error: any) {
    if (error.message.includes('404') || error.message.includes('No open campaign')) {
      return null;
    }
    throw error;
  }
}

// テスター応募
export async function applyTester(
  adId: string,
  applicationData: Record<string, string>
): Promise<void> {
  const response = await fetch(`${API_BASE}/ads/${adId}/tester`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ application_data: applicationData }),
  });
  await handleResponse(response);
}

// データベースレスポンスからAd型への変換
function transformAdFromDB(dbAd: any): Ad {
  return {
    id: dbAd.id,
    advertiserId: dbAd.advertiser_id,
    advertiserName: dbAd.advertisers?.org_name || dbAd.advertiser_name || 'Unknown',
    mediaUrl: dbAd.media_url,
    mediaType: dbAd.media_type,
    title: dbAd.title,
    description: dbAd.description,
    ctaText: dbAd.cta_text,
    ctaUrl: dbAd.cta_url,
    tags: dbAd.tags || [],
    createdAt: dbAd.created_at,
    hasComments: dbAd.has_comments || false,
    hasUGC: dbAd.has_ugc || false,
    hasSurvey: dbAd.has_survey || false,
    hasTester: dbAd.has_tester || false,
  };
}

// データベースレスポンスからComment型への変換
function transformCommentFromDB(dbComment: any): Comment {
  return {
    id: dbComment.id,
    adId: dbComment.ad_id,
    userId: dbComment.user_id,
    userName: dbComment.users?.name || 'Unknown',
    content: dbComment.content,
    status: dbComment.status,
    createdAt: dbComment.created_at,
    isPinned: dbComment.is_pinned || false,
    replyFromAdvertiser: dbComment.reply_from_advertiser,
  };
}

// データベースレスポンスからUGC型への変換
function transformUGCFromDB(dbUGC: any): UGC {
  return {
    id: dbUGC.id,
    adId: dbUGC.ad_id,
    userId: dbUGC.user_id,
    userName: dbUGC.users?.name || 'Unknown',
    mediaUrl: dbUGC.media_url,
    type: dbUGC.type,
    approved: dbUGC.status === 'approved' || dbUGC.status === 'adopted',
    createdAt: dbUGC.created_at,
    qualityScore: dbUGC.quality_score,
  };
}

// データベースレスポンスからSurvey型への変換
function transformSurveyFromDB(dbSurvey: any): Survey {
  return {
    id: dbSurvey.id,
    adId: dbSurvey.ad_id,
    title: dbSurvey.title,
    description: dbSurvey.description,
    questions: (dbSurvey.survey_questions || []).map((q: any) => ({
      id: q.id,
      type: q.type || q.question_type, // 後方互換性のため両方に対応
      question: q.question_text,
      options: q.options || [],
      required: q.required || false,
    })),
  };
}

// データベースレスポンスからTesterCampaign型への変換
function transformTesterCampaignFromDB(dbCampaign: any): TesterCampaign {
  return {
    id: dbCampaign.id,
    adId: dbCampaign.ad_id,
    title: dbCampaign.title,
    description: dbCampaign.description,
    requirements: dbCampaign.requirements || [],
    maxApplicants: dbCampaign.max_applicants,
    currentApplicants: dbCampaign.current_applicants || 0,
    winners: dbCampaign.winners || [],
    status: dbCampaign.status,
    deadline: dbCampaign.deadline,
  };
}

