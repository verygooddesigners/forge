import { createClient } from './supabase/server';
import { buildContentGenerationPrompt as buildPrompt } from './prompts';

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
 * Re-exported from prompts.ts for backward compatibility
 */
export const buildContentGenerationPrompt = buildPrompt;


