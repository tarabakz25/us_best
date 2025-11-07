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
    const { action } = body; // 'adopt', 'pin', 'reply'

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case 'adopt':
        updateData = { status: 'adopted' };
        break;
      case 'pin':
        updateData = { is_pinned: true };
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('comments')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // If adopted, create reward
    if (action === 'adopt') {
      await supabase.from('rewards').insert({
        ad_id: data.ad_id,
        user_id: data.user_id,
        type: 'coupon',
        value: 'COMMENT_ADOPTION_REWARD',
        source_type: 'comment',
        source_id: params.id,
        status: 'pending',
      });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

