import { loadAgentConfig, callClaude } from './base';
import { AgentMessage, AgentResponse, QualityAssuranceSpecialConfig } from './types';
import { checkGrammar, LanguageToolResult } from '../languagetool';
import type { ResearchArticle } from '@/types';

export interface QualityCheckRequest {
  content: string;
  checkGrammar?: boolean;
  checkReadability?: boolean;
  checkConsistency?: boolean;
}

export interface QualityCheckResult {
  grammarIssues?: LanguageToolResult;
  readabilityScore?: number;
  readabilityAssessment?: string;
  consistencyIssues?: string[];
  recommendations?: string[];
  overallRating?: number;
}

/**
 * Quality Assurance Agent
 * Reviews content for grammar, readability, and coherence
 */
export async function checkQuality(
  request: QualityCheckRequest
): Promise<AgentResponse> {
  const config = await loadAgentConfig('quality_assurance');
  
  if (!config.enabled) {
    return {
      success: false,
      error: 'Quality Assurance Agent is currently disabled',
    };
  }
  
  const specialConfig = config.specialConfig as QualityAssuranceSpecialConfig;
  const result: QualityCheckResult = {};
  
  // Check grammar using LanguageTool if enabled
  if (request.checkGrammar !== false && specialConfig.useLanguageTool) {
    try {
      const grammarResult = await checkGrammar(
        request.content,
        specialConfig.languageToolStrictness
      );
      result.grammarIssues = grammarResult;
    } catch (error) {
      console.error('LanguageTool check failed:', error);
    }
  }
  
  // Use Claude for readability and consistency checks
  let userMessage = `Please review the following content for quality:\n\n`;
  userMessage += `CONTENT:\n${request.content}\n\n`;
  userMessage += `Please analyze:\n`;
  
  if (request.checkReadability !== false) {
    userMessage += `- Readability (calculate Flesch Reading Ease score if possible)\n`;
  }
  
  if (request.checkConsistency !== false) {
    userMessage += `- Style and tone consistency\n`;
    userMessage += `- Logical flow and coherence\n`;
  }
  
  userMessage += `\nProvide analysis in JSON format:
{
  "readabilityScore": 0-100 (Flesch Reading Ease),
  "readabilityAssessment": "description of readability level",
  "consistencyIssues": ["list", "of", "issues"],
  "recommendations": ["specific", "improvements"],
  "overallRating": 0-100
}`;
  
  const messages: AgentMessage[] = [
    {
      role: 'system',
      content: config.systemPrompt,
    },
    {
      role: 'user',
      content: userMessage,
    },
  ];
  
  const claudeResponse = await callClaude(messages, config);
  
  if (claudeResponse.success && claudeResponse.content) {
    try {
      const analysis = JSON.parse(claudeResponse.content);
      Object.assign(result, analysis);
    } catch (error) {
      console.warn('Failed to parse quality analysis as JSON:', error);
    }
  }
  
  return {
    success: claudeResponse.success,
    content: JSON.stringify(result),
    error: claudeResponse.error,
    metadata: claudeResponse.metadata,
  };
}

export interface EvaluateResearchRelevanceInput {
  articles: ResearchArticle[];
  headline: string;
  topic?: string;
}

/**
 * QA Agent: Evaluate research articles for timeliness and topical relevance.
 * Returns the subset of article IDs that pass (recent and relevant to the story).
 */
export async function evaluateResearchRelevance(
  input: EvaluateResearchRelevanceInput
): Promise<ResearchArticle[]> {
  const { articles, headline, topic } = input;
  if (articles.length === 0) return [];

  const config = await loadAgentConfig('quality_assurance');
  if (!config.enabled) {
    return articles;
  }

  const articlesSummary = articles.map((a, i) => ({
    id: a.id,
    title: a.title,
    source: a.source,
    published_date: a.published_date,
    relevance_score: a.relevance_score,
  }));

  const userMessage = `You are evaluating news articles for a story. Keep only articles that are:
1. TIMELY: Published within the last 3 weeks (or clearly about recent events).
2. RELEVANT: Directly related to the headline and topic below.

HEADLINE: ${headline}
TOPIC: ${topic || 'Not specified'}

ARTICLES (with id):
${JSON.stringify(articlesSummary, null, 2)}

Respond with JSON only: { "keepIds": ["id1", "id2", ...] } — the array of article ids to KEEP. Prefer keeping more rather than fewer if in doubt.`;

  const messages: AgentMessage[] = [
    { role: 'system', content: config.systemPrompt },
    { role: 'user', content: userMessage },
  ];

  const response = await callClaude(messages, config);
  if (!response.success || !response.content) {
    return articles;
  }

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return articles;
    const parsed = JSON.parse(jsonMatch[0]);
    const keepIds = Array.isArray(parsed.keepIds) ? parsed.keepIds : [];
    const idSet = new Set(keepIds);
    return articles.filter((a) => idSet.has(a.id));
  } catch {
    return articles;
  }
}

