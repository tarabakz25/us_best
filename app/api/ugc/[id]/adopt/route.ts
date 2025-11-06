import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to adopt UGC (advertiser role)
    // For MVP, we'll use a simple check - in production, verify permissions table
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Update UGC status to adopted
    const { data, error } = await supabase
      .from('ugc')
      .update({ status: 'adopted' })
      .eq('id', params.id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'UGC not found' }, { status: 404 });
    }

    // Create reward (this would typically be done via Edge Function with proper validation)
    // For MVP, we'll create a basic reward record
    const { error: rewardError } = await supabase.from('rewards').insert({
      ad_id: data.ad_id,
      user_id: user_id,
      type: 'coupon',
      value: 'UGC_ADOPTION_REWARD',
      source_type: 'ugc',
      source_id: params.id,
      status: 'pending',
    });

    if (rewardError) {
      console.error('Failed to create reward:', rewardError);
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

