import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate signed URL for UGC upload
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const filePath = `ugc/${fileName}`;

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('ugc')
      .createSignedUploadUrl(filePath);

    if (signedUrlError) {
      return NextResponse.json({ error: signedUrlError.message }, { status: 500 });
    }

    return NextResponse.json({
      signedUrl: signedUrlData.signedUrl,
      path: filePath,
      token: signedUrlData.token,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

