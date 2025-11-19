/**
 * Centralized prompt templates for AI content generation
 * 
 * This file contains all prompt templates used throughout the application.
 * Benefits:
 * - Easy to update prompts without searching through code
 * - Consistent prompt formatting
 * - Simple A/B testing of variations
 * - Version control of prompt changes
 */

/**
 * System prompt for content generation
 */
export const CONTENT_GENERATION_SYSTEM_PROMPT = 
  'You are an expert content writer specialized in SEO-optimized articles.';

/**
 * Style analysis system prompt
 */
export const STYLE_ANALYSIS_SYSTEM_PROMPT = `You are a writing style analyzer. Analyze the following content and provide a detailed analysis of:
- Tone (e.g., professional, casual, authoritative, friendly)
- Voice (e.g., active, passive, direct, narrative)
- Vocabulary level (e.g., simple, intermediate, advanced, technical)
- Sentence structure (e.g., short and punchy, complex, varied, flowing)
- Key phrases or expressions that are characteristic

Return your analysis as a JSON object with these exact keys: tone, voice, vocabulary_level, sentence_structure, key_phrases (array).`;

/**
 * Build content generation prompt with RAG context
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

/**
 * SEO analysis prompt for generating improvement suggestions
 */
export function buildSEOAnalysisPrompt(
  content: string,
  primaryKeyword: string,
  secondaryKeywords: string[],
  currentScore: number,
  currentIssues: string[]
): string {
  return `You are an SEO expert analyzing content for optimization.

CONTENT TO ANALYZE:
${content}

TARGET KEYWORDS:
- Primary: ${primaryKeyword}
- Secondary: ${secondaryKeywords.join(', ')}

CURRENT SEO SCORE: ${currentScore}/100

CURRENT ISSUES DETECTED:
${currentIssues.map(issue => `- ${issue}`).join('\n')}

Provide 3-5 specific, actionable suggestions to improve this content's SEO performance. Focus on:
1. Keyword placement and density optimization
2. Content structure and readability
3. Meta information and headings
4. Internal linking opportunities
5. Content gaps or missing information

Return suggestions as a JSON array of strings, each being a specific action item.`;
}

/**
 * Auto-optimization prompt for content improvement
 */
export function buildAutoOptimizePrompt(
  content: string,
  primaryKeyword: string,
  secondaryKeywords: string[],
  suggestions: string[]
): string {
  return `You are an SEO content optimizer. Improve the following content based on specific suggestions.

ORIGINAL CONTENT:
${content}

TARGET KEYWORDS:
- Primary: ${primaryKeyword}
- Secondary: ${secondaryKeywords.join(', ')}

OPTIMIZATION SUGGESTIONS TO IMPLEMENT:
${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

INSTRUCTIONS:
1. Make the suggested improvements while preserving the original tone and style
2. Maintain the core message and information
3. Ensure changes feel natural, not forced
4. Preserve all existing markdown formatting
5. Do not add or remove major sections unless suggested

Return the optimized content with all improvements applied:`;
}

/**
 * Internal linking suggestions prompt
 */
export function buildInternalLinkingPrompt(
  content: string,
  primaryKeyword: string,
  availableArticles: Array<{ title: string; url: string; topic: string }>
): string {
  return `You are an SEO specialist focused on internal linking strategy.

CURRENT ARTICLE CONTENT:
${content}

PRIMARY TOPIC/KEYWORD: ${primaryKeyword}

AVAILABLE ARTICLES FOR LINKING:
${availableArticles.map(a => `- "${a.title}" (${a.topic}) - ${a.url}`).join('\n')}

TASK:
Suggest 3-5 specific places in the content where internal links would be valuable. For each suggestion, provide:
1. The exact anchor text to use (quote from the content)
2. Which article to link to
3. Why this link adds value for readers

Return as a JSON array with objects containing: anchor_text, target_article, reason`;
}

/**
 * Competitor analysis prompt
 */
export function buildCompetitorAnalysisPrompt(
  keyword: string,
  yourContent: string,
  competitorContents: Array<{ url: string; title: string; content: string }>
): string {
  return `You are an SEO analyst comparing content against competitors.

TARGET KEYWORD: ${keyword}

YOUR CONTENT:
${yourContent}

TOP COMPETITOR CONTENT:
${competitorContents.map((c, i) => `
COMPETITOR ${i + 1} (${c.url}):
Title: ${c.title}
${c.content}
`).join('\n---\n')}

ANALYSIS TASK:
Compare your content against competitors and identify:
1. Content gaps (topics they cover that you don't)
2. Opportunities (topics you cover better)
3. Keyword usage patterns
4. Content structure differences
5. Unique value propositions in competitor content

Return analysis as JSON with keys: gaps, opportunities, keyword_insights, structure_notes, recommendations`;
}

export default {
  CONTENT_GENERATION_SYSTEM_PROMPT,
  STYLE_ANALYSIS_SYSTEM_PROMPT,
  buildContentGenerationPrompt,
  buildSEOAnalysisPrompt,
  buildAutoOptimizePrompt,
  buildInternalLinkingPrompt,
  buildCompetitorAnalysisPrompt,
};

