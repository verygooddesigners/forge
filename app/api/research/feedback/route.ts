import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { projectId, articleId, articleUrl, articleTitle, reason, notes } = await request.json();

    if (!projectId || !articleId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Store feedback in database
    const { data, error } = await supabase
      .from('research_feedback')
      .insert({
        project_id: projectId,
        article_url: articleUrl || '',
        article_title: articleTitle || '',
        feedback_reason: reason,
        additional_notes: notes,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing feedback:', error);
      return NextResponse.json(
        { error: 'Failed to store feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, feedback: data });
  } catch (error: any) {
    console.error('Error in research feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback', details: error.message },
      { status: 500 }
    );
  }
}
