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
    const { media_url, type } = body;

    if (!media_url || !type) {
      return NextResponse.json(
        { error: 'media_url and type are required' },
        { status: 400 }
      );
    }

    if (!['video', 'image'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('ugc')
      .insert({
        ad_id: params.id,
        user_id: user.id,
        media_url,
        type,
        status: 'pending',
        pr_badge: false,
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
      .from('ugc')
      .select('*, users(name)')
      .eq('ad_id', params.id)
      .in('status', ['approved', 'adopted'])
      .order('quality_score', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

