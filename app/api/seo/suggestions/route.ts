import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateContent } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { content, primaryKeyword, secondaryKeywords, currentScore } = await request.json();

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

    // Generate AI-powered SEO suggestions
    const prompt = `You are an SEO expert. Analyze the following content and provide specific, actionable suggestions to improve its SEO score.

Primary Keyword: ${primaryKeyword}
Secondary Keywords: ${secondaryKeywords?.join(', ') || 'None'}
Current SEO Score: ${currentScore}/100

Content:
${content}

Provide 5-7 specific, actionable suggestions to improve this content's SEO. Focus on:
- Keyword placement and density
- Heading structure and optimization
- Content quality and readability
- Internal structure improvements
- Meta elements (if applicable)

Format your response as a JSON array of strings, like:
["Suggestion 1", "Suggestion 2", "Suggestion 3"]`;

    const result = await generateContent([
      {
        role: 'system',
        content: 'You are an SEO expert providing actionable advice.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ], {
      temperature: 0.3,
      maxTokens: 1000,
    });

    // Try to parse JSON from response
    let suggestions: string[] = [];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: split by newlines and clean up
        suggestions = result
          .split('\n')
          .filter(line => line.trim().length > 10)
          .map(line => line.replace(/^[-•*\d.]+\s*/, '').trim())
          .slice(0, 7);
      }
    } catch (e) {
      // If parsing fails, return as plain text suggestions
      suggestions = [result];
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error generating SEO suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}


