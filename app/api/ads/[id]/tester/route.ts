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

    const body = await request.json();
    const { application_data } = body;

    if (!application_data) {
      return NextResponse.json({ error: 'Application data is required' }, { status: 400 });
    }

    // Get tester campaign for this ad
    const { data: campaign, error: campaignError } = await supabase
      .from('tester_campaigns')
      .select('id, max_applicants')
      .eq('ad_id', params.id)
      .eq('status', 'open')
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'No open tester campaign found' },
        { status: 404 }
      );
    }

    // Check if user already applied
    const { data: existing } = await supabase
      .from('tester_applicants')
      .select('id')
      .eq('campaign_id', campaign.id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'You have already applied to this campaign' },
        { status: 400 }
      );
    }

    // Check applicant count
    const { count } = await supabase
      .from('tester_applicants')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaign.id);

    if (count && count >= campaign.max_applicants) {
      return NextResponse.json(
        { error: 'Campaign is full' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('tester_applicants')
      .insert({
        campaign_id: campaign.id,
        user_id: user.id,
        application_data,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Record ad exposure
    await supabase.from('ad_exposures').insert({
      ad_id: params.id,
      user_id: user.id,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tester_campaigns')
      .select('*')
      .eq('ad_id', params.id)
      .eq('status', 'open')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'No open campaign found' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

