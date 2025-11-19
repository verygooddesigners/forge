import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { projectId, headline, primaryKeyword, secondaryKeywords, topic } = await request.json();

    if (!projectId || !primaryKeyword) {
      return NextResponse.json(
        { error: 'Project ID and primary keyword required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate suggested terms based on keywords
    // In a real implementation, this would use Claude API or similar
    const suggestedTerms = [
      {
        term: primaryKeyword.toLowerCase(),
        current: 0,
        target: '8-15',
        status: 'under' as const,
        category: 'Primary',
      },
      ...secondaryKeywords.map((keyword: string) => ({
        term: keyword.toLowerCase(),
        current: 0,
        target: '4-8',
        status: 'under' as const,
        category: 'Secondary',
      })),
      // Add some related terms
      {
        term: `${primaryKeyword.toLowerCase()} analysis`,
        current: 0,
        target: '3-6',
        status: 'under' as const,
        category: 'Content',
      },
      {
        term: `${primaryKeyword.toLowerCase()} guide`,
        current: 0,
        target: '2-4',
        status: 'under' as const,
        category: 'Content',
      },
    ];

    return NextResponse.json({
      success: true,
      suggestedTerms,
      suggestedWordCount: { min: 2500, max: 3500 },
      suggestedHeadings: { min: 25, max: 35 },
      suggestedParagraphs: { min: 80, max: 120 },
      suggestedImages: { min: 10, max: 15 },
    });
  } catch (error) {
    console.error('Error in SEO package analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze SEO package' },
      { status: 500 }
    );
  }
}

