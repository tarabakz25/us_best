'use server';

import { createClient } from '@/lib/supabase/server';

export async function getSignedUploadUrl(bucket: string, filePath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(filePath);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getSignedUrl(bucket: string, filePath: string, expiresIn: number = 3600) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(error.message);
  }

  return data.signedUrl;
}

