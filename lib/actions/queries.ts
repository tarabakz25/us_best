'use server';

import { createClient } from '@/lib/supabase/server';

export async function getAds(filters?: { tags?: string[]; cursor?: string; limit?: number }) {
  const supabase = await createClient();
  const tags = filters?.tags || [];
  const cursor = filters?.cursor;
  const limit = filters?.limit || 20;

  let query = supabase
    .from('ads')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (tags.length > 0) {
    query = query.contains('tags', tags);
  }

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    data: data || [],
    cursor: data && data.length > 0 ? data[data.length - 1].created_at : null,
  };
}

export async function getAd(adId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ads')
    .select('*, advertisers(org_name, email)')
    .eq('id', adId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getComments(adId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('comments')
    .select('*, users(name)')
    .eq('ad_id', adId)
    .in('status', ['approved', 'adopted'])
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getUGC(adId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ugc')
    .select('*, users(name)')
    .eq('ad_id', adId)
    .in('status', ['approved', 'adopted'])
    .order('quality_score', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getSurvey(adId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('surveys')
    .select('*, survey_questions(*)')
    .eq('ad_id', adId)
    .eq('status', 'active')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No survey found
    }
    throw new Error(error.message);
  }

  return data;
}

export async function getTesterCampaign(adId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tester_campaigns')
    .select('*')
    .eq('ad_id', adId)
    .eq('status', 'open')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No campaign found
    }
    throw new Error(error.message);
  }

  return data;
}

export async function getUserRewards() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('rewards')
    .select('*, ads(title, media_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getUserParticipation() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const [comments, ugc, surveyAnswers, testerApplications] = await Promise.all([
    supabase
      .from('comments')
      .select('*, ads(title, media_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('ugc')
      .select('*, ads(title, media_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('survey_answers')
      .select('*, surveys(*, ads(title, media_url))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tester_applicants')
      .select('*, tester_campaigns(*, ads(title, media_url))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  return {
    comments: comments.data || [],
    ugc: ugc.data || [],
    surveyAnswers: surveyAnswers.data || [],
    testerApplications: testerApplications.data || [],
  };
}

