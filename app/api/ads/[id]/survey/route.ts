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
    const { answers } = body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 });
    }

    // Get survey questions for this ad
    const { data: survey } = await supabase
      .from('surveys')
      .select('id')
      .eq('ad_id', params.id)
      .eq('status', 'active')
      .single();

    if (!survey) {
      return NextResponse.json({ error: 'No active survey found' }, { status: 404 });
    }

    // Insert answers
    const answerInserts = answers.map((answer: { question_id: string; answer_text?: string; answer_options?: unknown }) => ({
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
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('*, survey_questions(*)')
      .eq('ad_id', params.id)
      .eq('status', 'active')
      .single();

    if (surveyError) {
      return NextResponse.json({ error: surveyError.message }, { status: 500 });
    }

    if (!survey) {
      return NextResponse.json({ error: 'No active survey found' }, { status: 404 });
    }

    return NextResponse.json({ data: survey });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

