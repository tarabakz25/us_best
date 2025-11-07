'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createComment(adId: string, content: string, parentId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      ad_id: adId,
      user_id: user.id,
      content: content.trim(),
      parent_id: parentId || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Record ad exposure
  await supabase.from('ad_exposures').insert({
    ad_id: adId,
    user_id: user.id,
  });

  revalidatePath(`/ads/${adId}`);
  return data;
}

export async function submitUGC(adId: string, mediaUrl: string, type: 'video' | 'image') {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('ugc')
    .insert({
      ad_id: adId,
      user_id: user.id,
      media_url: mediaUrl,
      type,
      status: 'pending',
      pr_badge: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Record ad exposure
  await supabase.from('ad_exposures').insert({
    ad_id: adId,
    user_id: user.id,
  });

  revalidatePath(`/ads/${adId}`);
  return data;
}

export async function submitSurveyAnswers(adId: string, answers: Array<{ question_id: string; answer_text?: string; answer_options?: unknown }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get survey for this ad
  const { data: survey } = await supabase
    .from('surveys')
    .select('id')
    .eq('ad_id', adId)
    .eq('status', 'active')
    .single();

  if (!survey) {
    throw new Error('No active survey found');
  }

  const answerInserts = answers.map((answer) => ({
    survey_id: survey.id,
    question_id: answer.question_id,
    user_id: user.id,
    answer_text: answer.answer_text || null,
    answer_options: answer.answer_options || null,
  }));

  const { data, error } = await supabase
    .from('survey_answers')
    .upsert(answerInserts, { onConflict: 'survey_id,question_id,user_id' })
    .select();

  if (error) {
    throw new Error(error.message);
  }

  // Record ad exposure
  await supabase.from('ad_exposures').insert({
    ad_id: adId,
    user_id: user.id,
  });

  revalidatePath(`/ads/${adId}`);
  return data;
}

export async function applyToTesterCampaign(adId: string, applicationData: Record<string, unknown>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get tester campaign for this ad
  const { data: campaign, error: campaignError } = await supabase
    .from('tester_campaigns')
    .select('id, max_applicants')
    .eq('ad_id', adId)
    .eq('status', 'open')
    .single();

  if (campaignError || !campaign) {
    throw new Error('No open tester campaign found');
  }

  // Check if user already applied
  const { data: existing } = await supabase
    .from('tester_applicants')
    .select('id')
    .eq('campaign_id', campaign.id)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    throw new Error('You have already applied to this campaign');
  }

  // Check applicant count
  const { count } = await supabase
    .from('tester_applicants')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaign.id);

  if (count && count >= campaign.max_applicants) {
    throw new Error('Campaign is full');
  }

  const { data, error } = await supabase
    .from('tester_applicants')
    .insert({
      campaign_id: campaign.id,
      user_id: user.id,
      application_data: applicationData,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Record ad exposure
  await supabase.from('ad_exposures').insert({
    ad_id: adId,
    user_id: user.id,
  });

  revalidatePath(`/ads/${adId}`);
  return data;
}

export async function submitTesterReport(applicantId: string, content: string, mediaUrls?: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Verify applicant belongs to user
  const { data: applicant } = await supabase
    .from('tester_applicants')
    .select('id')
    .eq('id', applicantId)
    .eq('user_id', user.id)
    .eq('status', 'selected')
    .single();

  if (!applicant) {
    throw new Error('No selected application found');
  }

  const { data, error } = await supabase
    .from('tester_reports')
    .insert({
      applicant_id: applicantId,
      content,
      media_urls: mediaUrls || [],
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Update applicant status to completed
  await supabase
    .from('tester_applicants')
    .update({ status: 'completed' })
    .eq('id', applicantId);

  revalidatePath('/mypage');
  return data;
}

export async function updateUserInterests(interests: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('users')
    .update({ interests })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/mypage');
  return data;
}

