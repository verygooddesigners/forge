import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateContent } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { projectId, headline, primaryKeyword, secondaryKeywords, topic, wordCount } = await request.json();

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

    // Use AI to suggest related terms and LSI keywords
    const prompt = `You are an SEO expert. For the following topic, suggest 10-15 related keywords and LSI (Latent Semantic Indexing) terms that should be naturally included in the content.

Primary Keyword: ${primaryKeyword}
Secondary Keywords: ${secondaryKeywords?.join(', ') || 'None'}
Headline: ${headline}
Topic: ${topic || 'Not specified'}

Provide keywords that are semantically related and would help search engines understand the content's context. Include variations, long-tail keywords, and related concepts.

Return as a JSON array of strings, like: ["keyword1", "keyword2", "keyword3"]`;

    let suggestedKeywords: string[] = [];
    try {
      const response = await generateContent([
        { role: 'system', content: 'You are an SEO expert specialized in keyword research.' },
        { role: 'user', content: prompt }
      ], { temperature: 0.6, maxTokens: 500 });

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestedKeywords = JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error generating suggested keywords:', error);
      // Fallback suggestions
      suggestedKeywords = [
        `${primaryKeyword} guide`,
        `${primaryKeyword} tips`,
        `best ${primaryKeyword}`,
      ];
    }

    // Calculate ideal ranges based on word count
    const targetWords = wordCount || 3000;
    const idealKeywordCount = Math.max(1, Math.floor(targetWords * 0.015)); // 1.5% density

    // Build suggested terms list
    const suggestedTerms = [
      {
        term: primaryKeyword.toLowerCase(),
        current: 0,
        target: `${Math.floor(idealKeywordCount * 0.6)}-${Math.ceil(idealKeywordCount * 1.2)}`,
        status: 'under' as const,
        category: 'Primary',
      },
      ...(secondaryKeywords || []).map((keyword: string) => ({
        term: keyword.toLowerCase(),
        current: 0,
        target: `${Math.floor(idealKeywordCount * 0.3)}-${Math.ceil(idealKeywordCount * 0.7)}`,
        status: 'under' as const,
        category: 'Secondary',
      })),
      ...suggestedKeywords.slice(0, 10).map((keyword: string) => ({
        term: keyword.toLowerCase(),
        current: 0,
        target: `2-${Math.ceil(idealKeywordCount * 0.4)}`,
        status: 'under' as const,
        category: 'Suggested',
      })),
    ];

    return NextResponse.json({
      success: true,
      suggestedTerms,
      suggestedWordCount: { min: Math.floor(targetWords * 0.85), max: Math.ceil(targetWords * 1.15) },
      suggestedHeadings: { min: Math.floor(targetWords / 150), max: Math.ceil(targetWords / 80) },
      suggestedParagraphs: { min: Math.floor(targetWords / 50), max: Math.ceil(targetWords / 25) },
      suggestedImages: { min: Math.floor(targetWords / 300), max: Math.ceil(targetWords / 150) },
    });
  } catch (error) {
    console.error('Error in SEO package analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze SEO package' },
      { status: 500 }
    );
  }
}

