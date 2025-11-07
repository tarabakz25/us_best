import { redirect } from 'next/navigation';
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { updateUserInterests } from '@/lib/actions/participation';
import { createClient } from '@/lib/supabase/server';
import { mockAds } from '@/lib/mockData';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function fetchAvailableTags(supabase: SupabaseServerClient) {
  const { data: tagRows, error } = await supabase
    .from('ads')
    .select('tags');

  const tagSet = new Set<string>();

  if (!error && tagRows) {
    tagRows.forEach((row) => {
      (row?.tags || []).forEach((tag: string) => {
        if (typeof tag === 'string' && tag.trim().length > 0) {
          tagSet.add(tag.trim());
        }
      });
    });
  }

  if (tagSet.size === 0) {
    mockAds.forEach((ad) => {
      ad.tags.forEach((tag) => {
        if (tag.trim().length > 0) {
          tagSet.add(tag.trim());
        }
      });
    });
  }

  return Array.from(tagSet).sort((a, b) => a.localeCompare(b, 'ja'));
}

async function fetchUserInterests(supabase: SupabaseServerClient, userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('interests')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return [] as string[];
  }

  return (data.interests as string[]) || [];
}

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const [tags, interests] = await Promise.all([
    fetchAvailableTags(supabase),
    fetchUserInterests(supabase, user.id),
  ]);

  return (
    <OnboardingForm
      tags={tags}
      defaultInterests={interests}
      onSubmit={updateUserInterests}
    />
  );
}


