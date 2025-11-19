import { createClient } from './supabase/server';

/**
 * Find training content for a model
 * Since we're using Claude-only (no embeddings), we'll return the most recent examples
 * Claude will use all available examples to understand the writer's style
 */
export async function findSimilarTrainingContent(
  modelId: string,
  queryText: string,
  limit: number = 5
) {
  const supabase = await createClient();
  
  // Get training content for this model (most recent first)
  const { data: allContent, error: fetchError } = await supabase
    .from('training_content')
    .select('id, content, analyzed_style')
    .eq('model_id', modelId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (fetchError || !allContent) {
    console.error('Error fetching training content:', fetchError);
    return [];
  }

  return allContent;
}

/**
 * Build a context string from retrieved training examples
 */
export function buildContextFromExamples(examples: any[]): string {
  if (examples.length === 0) {
    return 'No specific writing examples available.';
  }

  return examples
    .map((example, index) => {
      const styleNotes = example.analyzed_style 
        ? `\n\nStyle Analysis:\n- Tone: ${example.analyzed_style.tone || 'N/A'}\n- Voice: ${example.analyzed_style.voice || 'N/A'}\n- Vocabulary: ${example.analyzed_style.vocabulary_level || 'N/A'}\n- Sentence Structure: ${example.analyzed_style.sentence_structure || 'N/A'}`
        : '';
      return `Example ${index + 1}:\n${example.content}${styleNotes}`;
    })
    .join('\n\n---\n\n');
}

/**
 * Create a prompt for content generation using RAG
 */
export function buildContentGenerationPrompt(
  headline: string,
  primaryKeyword: string,
  secondaryKeywords: string[],
  wordCount: number,
  brief: string,
  writerContext: string,
  masterInstructions?: string
): string {
  return `You are a professional content writer tasked with creating SEO-optimized content.

${masterInstructions ? `MASTER INSTRUCTIONS:\n${masterInstructions}\n\n` : ''}

WRITER STYLE EXAMPLES:
${writerContext}

ASSIGNMENT:
- Headline: ${headline}
- Primary Keyword: ${primaryKeyword}
- Secondary Keywords: ${secondaryKeywords.join(', ')}
- Target Word Count: ${wordCount} words

BRIEF/SCAFFOLD:
${brief}

INSTRUCTIONS:
1. Write in the exact style demonstrated in the writer examples above
2. Follow the brief/scaffold structure precisely
3. Naturally incorporate the primary keyword ${primaryKeyword} throughout
4. Include secondary keywords: ${secondaryKeywords.join(', ')}
5. Aim for approximately ${wordCount} words
6. Write engaging, informative content that would rank well in search results
7. Match the tone, voice, and style from the examples
8. Use Markdown formatting for headings (# for H1, ## for H2, ### for H3)
9. Write clear paragraphs separated by blank lines

Write the complete article now in plain text with Markdown formatting:`;
}


