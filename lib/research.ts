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
const SERPER_URL = 'https://google.serper.dev/search';

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

/**
 * Search Google via Serper.dev for web results (great for evergreen/non-news topics).
 * @param query - Search query string
 * @param trustedSourcesMap - Map of domain -> trusted source row
 * @param maxResults - Number of results to request (default 10)
 * @param idPrefix - Optional prefix for each article id
 */
export async function searchSerper(
  query: string,
  trustedSourcesMap: Map<string, TrustedSourceRow>,
  maxResults: number = 10,
  idPrefix: string = 'serper'
): Promise<ResearchArticle[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    console.warn('[searchSerper] SERPER_API_KEY not configured — skipping');
    return [];
  }

  const response = await fetch(SERPER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify({ q: query, num: maxResults }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('[searchSerper] API error:', text);
    return [];
  }

  const data = await response.json();
  // Serper returns: { organic: [...], knowledgeGraph: {...}, ... }
  const organic: any[] = data.organic || [];

  const articles: ResearchArticle[] = organic.map((result: any, index: number) => {
    let domain = 'unknown';
    try {
      domain = new URL(result.link).hostname.replace('www.', '');
    } catch {
      domain = result.link || 'unknown';
    }
    const trustedSource = trustedSourcesMap.get(domain);
    const trustScore = trustedSource
      ? trustScoreFromLevel(trustedSource.trust_level)
      : 0.5;

    // Serper provides a relevance position (1 = top), convert to score (0-1)
    const positionScore = Math.max(0.3, 1 - (result.position - 1) * 0.07);

    return {
      id: `${idPrefix}-${index}-${Date.now()}`,
      title: result.title,
      description: result.snippet || '',
      url: result.link,
      source: trustedSource?.name || domain,
      published_date: result.date || new Date().toISOString(),
      image_url: undefined,
      relevance_score: positionScore,
      trust_score: trustScore,
      is_trusted: trustScore >= 0.7,
      is_flagged: false,
      full_content: result.snippet || '',
    };
  });

  articles.sort((a, b) => b.relevance_score - a.relevance_score);
  return articles;
}

/**
 * Merge two article arrays, deduplicating by URL (Tavily takes precedence).
 * Returns up to maxResults articles sorted by relevance_score descending.
 */
export function mergeArticles(
  primary: ResearchArticle[],
  secondary: ResearchArticle[],
  maxResults: number = 20
): ResearchArticle[] {
  const seen = new Set<string>(primary.map((a) => a.url));
  const merged = [...primary];
  for (const article of secondary) {
    if (!seen.has(article.url)) {
      seen.add(article.url);
      merged.push(article);
    }
  }
  merged.sort((a, b) => b.relevance_score - a.relevance_score);
  return merged.slice(0, maxResults);
}
