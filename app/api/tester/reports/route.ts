import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, media_urls } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Get applicant record
    const { data: applicant, error: applicantError } = await supabase
      .from('tester_applicants')
      .select('id, campaign_id')
      .eq('user_id', user.id)
      .eq('status', 'selected')
      .single();

    if (applicantError || !applicant) {
      return NextResponse.json(
        { error: 'No selected application found' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('tester_reports')
      .insert({
        applicant_id: applicant.id,
        content,
        media_urls: media_urls || [],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update applicant status to completed
    await supabase
      .from('tester_applicants')
      .update({ status: 'completed' })
      .eq('id', applicant.id);

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

