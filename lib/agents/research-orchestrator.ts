/**
 * Research Orchestrator — agentic loop for the research pipeline.
 * Coordinates: Tavily search → QA relevance filter → Fact verification → optional follow-up → SEO keywords.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { loadAgentConfig, callClaude } from './base';
import type { AgentMessage } from './types';
import { loadTrustedSources, searchTavily } from '@/lib/research';
import { evaluateResearchRelevance } from './quality-assurance';
import { verifyFacts } from './fact-verification';
import { generateKeywordSuggestions } from './seo-optimization';
import type {
  ResearchArticle,
  ResearchStory,
  SuggestedKeyword,
  KeywordImportance,
  OrchestratorLogEntry,
  OrchestratorLogType,
} from '@/types';
import type { FactVerificationResult } from './fact-verification';

const MAX_LOOPS = 4;

export interface ResearchPipelineInput {
  projectId: string;
  headline: string;
  primaryKeyword: string;
  secondaryKeywords?: string[];
  topic?: string;
  additionalDetails?: string;
}

export interface ResearchPipelineProgressEvent {
  type: OrchestratorLogType;
  message: string;
  timestamp?: string;
}

export interface ResearchPipelineResult {
  stories: ResearchStory[];
  suggested_keywords: SuggestedKeyword[];
  orchestrator_log: OrchestratorLogEntry[];
  loops_completed: number;
  research_brief: {
    articles: ResearchArticle[];
    verified_facts: FactVerificationResult['verified_facts'];
    disputed_facts: FactVerificationResult['disputed_facts'];
    fact_check_complete: boolean;
    research_timestamp: string;
    confidence_score: number;
  };
}

function logEntry(type: OrchestratorLogType, message: string): OrchestratorLogEntry {
  return { timestamp: new Date().toISOString(), message, type };
}

/**
 * Orchestrator decision: should we run another search? Returns { done } or { done, followUpQuery }.
 */
async function orchestratorDecision(
  factResult: FactVerificationResult,
  loopsCompleted: number
): Promise<{ done: boolean; followUpQuery?: string }> {
  if (loopsCompleted >= MAX_LOOPS) {
    return { done: true };
  }
  const hasDisputes = factResult.disputed_facts && factResult.disputed_facts.length > 0;
  const lowConfidence = factResult.confidence_score < 70;
  if (!hasDisputes && !lowConfidence) {
    return { done: true };
  }

  const config = await loadAgentConfig('research_orchestrator');
  if (!config.enabled) {
    return { done: true };
  }

  const userMessage = `Current fact verification result:
- verified_facts: ${factResult.verified_facts.length}
- disputed_facts: ${factResult.disputed_facts.length}
- confidence_score: ${factResult.confidence_score}
- loops_completed: ${loopsCompleted}

${factResult.disputed_facts?.length ? `Disputed facts:\n${factResult.disputed_facts.map((f) => f.fact).join('\n')}` : ''}

Respond with JSON only: {"done": true, "reason": "..."} OR {"done": false, "followUpQuery": "search query", "reason": "..."}`;

  const messages: AgentMessage[] = [
    { role: 'system', content: config.systemPrompt },
    { role: 'user', content: userMessage },
  ];
  const response = await callClaude(messages, config);
  if (!response.success || !response.content) {
    return { done: true };
  }
  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { done: true };
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.done === true) return { done: true };
    if (parsed.done === false && typeof parsed.followUpQuery === 'string') {
      return { done: false, followUpQuery: parsed.followUpQuery.trim() };
    }
  } catch {
    // ignore parse errors
  }
  return { done: true };
}

/**
 * Generate one-line synopses for each article via Claude.
 */
async function generateSynopses(
  articles: ResearchArticle[],
  headline: string
): Promise<Map<string, string>> {
  if (articles.length === 0) return new Map();
  const config = await loadAgentConfig('content_generation');
  if (!config.enabled) {
    return new Map(articles.map((a) => [a.id, a.description?.slice(0, 120) || a.title]));
  }
  const list = articles.map((a) => ({ id: a.id, title: a.title, description: (a.description || '').slice(0, 300) }));
  const userMessage = `For each article, write a single short sentence (synopsis) that summarizes what the article says and why it's relevant to this headline: "${headline}".

Articles:
${JSON.stringify(list, null, 2)}

Respond with JSON only: { "synopses": { "id1": "synopsis 1", "id2": "synopsis 2", ... } }`;

  const messages: AgentMessage[] = [
    { role: 'system', content: 'You output only valid JSON. No markdown, no explanation.' },
    { role: 'user', content: userMessage },
  ];
  const response = await callClaude(messages, config);
  const map = new Map<string, string>();
  if (!response.success || !response.content) {
    articles.forEach((a) => map.set(a.id, a.description?.slice(0, 120) || a.title));
    return map;
  }
  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return map;
    const parsed = JSON.parse(jsonMatch[0]);
    const synopses = parsed.synopses || {};
    articles.forEach((a) => {
      if (typeof synopses[a.id] === 'string') map.set(a.id, synopses[a.id]);
      else map.set(a.id, a.description?.slice(0, 120) || a.title);
    });
  } catch {
    articles.forEach((a) => map.set(a.id, a.description?.slice(0, 120) || a.title));
  }
  return map;
}

/**
 * Run the full research pipeline and report progress via callback.
 */
export async function runResearchPipeline(
  supabase: SupabaseClient,
  input: ResearchPipelineInput,
  onProgress: (event: ResearchPipelineProgressEvent) => void
): Promise<ResearchPipelineResult> {
  const log: OrchestratorLogEntry[] = [];
  const { projectId, headline, primaryKeyword, secondaryKeywords = [], topic = '', additionalDetails = '' } = input;

  const push = (type: OrchestratorLogType, message: string) => {
    const entry = logEntry(type, message);
    log.push(entry);
    onProgress({ type, message, timestamp: entry.timestamp });
  };

  const trustedSourcesMap = await loadTrustedSources(supabase);
  let currentQuery = [headline, primaryKeyword, ...secondaryKeywords, topic, additionalDetails].filter(Boolean).join(' ');
  let allArticles: ResearchArticle[] = [];
  let lastFactResult: FactVerificationResult | null = null;
  let loopsCompleted = 0;

  while (loopsCompleted < MAX_LOOPS) {
    push('search', `Searching for: ${currentQuery.slice(0, 60)}...`);
    const articles = await searchTavily(
      currentQuery,
      trustedSourcesMap,
      { max_results: 15, days: 21, search_depth: 'advanced' },
      `research-${projectId}`
    );
    push('search', `Found ${articles.length} articles`);
    if (articles.length === 0 && loopsCompleted === 0) {
      push('error', 'No articles found');
      break;
    }
    if (articles.length > 0) {
      allArticles = articles;
    }

    push('evaluate', 'Evaluating relevance and timeliness...');
    const filtered = await evaluateResearchRelevance({
      articles: allArticles,
      headline,
      topic: topic || undefined,
    });
    push('evaluate', `${filtered.length} articles passed relevance check`);
    if (filtered.length === 0) {
      if (loopsCompleted === 0) break;
      break;
    }

    push('verify', 'Verifying facts across sources...');
    lastFactResult = await verifyFacts({
      articles: filtered,
      topic: headline,
      context: topic || undefined,
    });
    push('verify', `Verification complete. Confidence: ${lastFactResult.confidence_score}`);

    const decision = await orchestratorDecision(lastFactResult, loopsCompleted + 1);
    loopsCompleted += 1;

    if (decision.done) {
      if (decision.followUpQuery) push('followup', `Stopping: ${decision.followUpQuery}`);
      break;
    }
    if (decision.followUpQuery) {
      push('followup', `Follow-up search: ${decision.followUpQuery}`);
      currentQuery = decision.followUpQuery;
    } else {
      break;
    }
  }

  push('keywords', 'Discovering keyword opportunities...');
  const topicForSeo = [headline, primaryKeyword, ...secondaryKeywords].filter(Boolean).join(' ');
  const keywordResponse = await generateKeywordSuggestions(topicForSeo, secondaryKeywords);
  const suggested_keywords: SuggestedKeyword[] = [];
  if (keywordResponse.success && keywordResponse.content) {
    try {
      const jsonMatch = keywordResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const primary: string[] = parsed.primary || [];
        const secondary: string[] = parsed.secondary || [];
        const longTail: string[] = parsed.longTail || [];
        primary.forEach((k: string) => suggested_keywords.push({ keyword: k, importance: 'high' as KeywordImportance }));
        secondary.forEach((k: string) => suggested_keywords.push({ keyword: k, importance: 'medium' as KeywordImportance }));
        longTail.forEach((k: string) => suggested_keywords.push({ keyword: k, importance: 'low' as KeywordImportance }));
      }
    } catch {
      // ignore
    }
  }

  const synopsisMap = await generateSynopses(allArticles, headline);
  const stories: ResearchStory[] = allArticles
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, 15)
    .map((a, i) => ({
      ...a,
      synopsis: synopsisMap.get(a.id) || a.description?.slice(0, 150),
      is_selected: i < 5,
      verification_status: lastFactResult ? (lastFactResult.confidence_score >= 70 ? 'verified' : 'unresolved') : 'pending',
    }));

  push('complete', 'Research complete');

  const research_brief = lastFactResult
    ? {
        articles: allArticles,
        verified_facts: lastFactResult.verified_facts,
        disputed_facts: lastFactResult.disputed_facts,
        fact_check_complete: true,
        research_timestamp: new Date().toISOString(),
        confidence_score: lastFactResult.confidence_score,
      }
    : {
        articles: allArticles,
        verified_facts: [],
        disputed_facts: [],
        fact_check_complete: false,
        research_timestamp: new Date().toISOString(),
        confidence_score: 0,
      };

  return {
    stories,
    suggested_keywords,
    orchestrator_log: log,
    loops_completed: loopsCompleted,
    research_brief,
  };
}
