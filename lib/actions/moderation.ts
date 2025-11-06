'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function adoptComment(commentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get comment to check ad_id and user_id
  const { data: comment } = await supabase
    .from('comments')
    .select('ad_id, user_id')
    .eq('id', commentId)
    .single();

  if (!comment) {
    throw new Error('Comment not found');
  }

  // Update comment status
  const { data, error } = await supabase
    .from('comments')
    .update({ status: 'adopted' })
    .eq('id', commentId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Create reward
  await supabase.from('rewards').insert({
    ad_id: comment.ad_id,
    user_id: comment.user_id,
    type: 'coupon',
    value: 'COMMENT_ADOPTION_REWARD',
    source_type: 'comment',
    source_id: commentId,
    status: 'pending',
  });

  revalidatePath(`/ads/${comment.ad_id}`);
  return data;
}

export async function adoptUGC(ugcId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get UGC to check ad_id and user_id
  const { data: ugc } = await supabase
    .from('ugc')
    .select('ad_id, user_id')
    .eq('id', ugcId)
    .single();

  if (!ugc) {
    throw new Error('UGC not found');
  }

  // Update UGC status
  const { data, error } = await supabase
    .from('ugc')
    .update({ status: 'adopted' })
    .eq('id', ugcId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Create reward
  await supabase.from('rewards').insert({
    ad_id: ugc.ad_id,
    user_id: ugc.user_id,
    type: 'coupon',
    value: 'UGC_ADOPTION_REWARD',
    source_type: 'ugc',
    source_id: ugcId,
    status: 'pending',
  });

  revalidatePath(`/ads/${ugc.ad_id}`);
  return data;
}

export async function pinComment(commentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get comment to check ad_id
  const { data: comment } = await supabase
    .from('comments')
    .select('ad_id')
    .eq('id', commentId)
    .single();

  if (!comment) {
    throw new Error('Comment not found');
  }

  const { data, error } = await supabase
    .from('comments')
    .update({ is_pinned: true })
    .eq('id', commentId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/ads/${comment.ad_id}`);
  return data;
}

