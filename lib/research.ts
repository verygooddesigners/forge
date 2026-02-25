/**
 * Shared research utilities: Tavily search and trusted source loading.
 * Used by both the research/story API route and the Research Orchestrator.
 */

import { ResearchArticle } from '@/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface TrustedSourceRow {
  domain: string;
  name: string;
  trust_level: 'high' | 'medium' | 'low' | 'untrusted';
}

export interface TavilySearchOptions {
  max_results?: number;
  days?: number;
  search_depth?: 'basic' | 'advanced';
}

const TAVILY_URL = 'https://api.tavily.com/search';

/**
 * Load trusted sources from the database for scoring search results.
 */
export async function loadTrustedSources(
  supabase: SupabaseClient
): Promise<Map<string, TrustedSourceRow>> {
  const { data: trustedSources } = await supabase
    .from('trusted_sources')
    .select('domain, name, trust_level');
  return new Map((trustedSources || []).map((s) => [s.domain, s]));
}

function trustScoreFromLevel(trust_level: string): number {
  switch (trust_level) {
    case 'high':
      return 0.9;
    case 'medium':
      return 0.7;
    case 'low':
      return 0.4;
    case 'untrusted':
      return 0.2;
    default:
      return 0.5;
  }
}

/**
 * Search Tavily for news/articles and transform results into ResearchArticle format.
 * @param query - Search query string (e.g. headline + keywords + topic)
 * @param trustedSourcesMap - Map of domain -> trusted source row (from loadTrustedSources)
 * @param options - Optional max_results, days, search_depth
 * @param idPrefix - Optional prefix for each article id (e.g. projectId or "research")
 */
export async function searchTavily(
  query: string,
  trustedSourcesMap: Map<string, TrustedSourceRow>,
  options: TavilySearchOptions = {},
  idPrefix: string = 'research'
): Promise<ResearchArticle[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY is not configured');
  }

  const {
    max_results = 15,
    days = 21,
    search_depth = 'advanced',
  } = options;

  const response = await fetch(TAVILY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth,
      include_answer: false,
      include_images: true,
      include_raw_content: false,
      max_results,
      days,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Tavily API error:', text);
    throw new Error('Tavily search failed');
  }

  const data = await response.json();
  const results = data.results || [];

  const articles: ResearchArticle[] = results.map((result: any, index: number) => {
    let domain = 'unknown';
    try {
      domain = new URL(result.url).hostname.replace('www.', '');
    } catch {
      domain = result.url || 'unknown';
    }
    const trustedSource = trustedSourcesMap.get(domain);
    const trustScore = trustedSource
      ? trustScoreFromLevel(trustedSource.trust_level)
      : 0.5;

    return {
      id: `${idPrefix}-${index}-${Date.now()}`,
      title: result.title,
      description: result.content,
      url: result.url,
      source: trustedSource?.name || domain,
      published_date: result.published_date || new Date().toISOString(),
      image_url: result.image_url,
      relevance_score: result.score ?? 0.5,
      trust_score: trustScore,
      is_trusted: trustScore >= 0.7,
      is_flagged: false,
      full_content: result.raw_content || result.content,
    };
  });

  articles.sort((a, b) => b.relevance_score - a.relevance_score);
  return articles;
}
