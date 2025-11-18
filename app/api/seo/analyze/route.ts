import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeSEO } from '@/lib/seo';

export async function POST(request: NextRequest) {
  try {
    const { content, primaryKeyword, secondaryKeywords } = await request.json();

    if (!content || !primaryKeyword) {
      return NextResponse.json(
        { error: 'Content and primary keyword required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Analyze SEO
    const analysis = analyzeSEO(
      content,
      primaryKeyword,
      secondaryKeywords || []
    );

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error in SEO analyze:', error);
    return NextResponse.json(
      { error: 'Failed to analyze SEO' },
      { status: 500 }
    );
  }
}


