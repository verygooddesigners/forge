import { generateContent } from '@/lib/ai';
import type { ResearchArticle } from '@/types';

export interface PitchSource {
  title: string;
  url: string;
  source_domain: string;
  trust_score: number;
  published_date: string;
}

export interface GeneratedPitch {
  headline: string;
  synopsis: string;
  source_score: number;
  sources: PitchSource[];
}

function computeSourceScore(sources: PitchSource[]): number {
  if (sources.length === 0) return 0;
  const avgTrust = sources.reduce((s, a) => s + (a.trust_score || 0.5), 0) / sources.length;
  const countBonus = Math.min(30, sources.length * 4);
  const recencyBonus = sources.some((s) => {
    if (!s.published_date) return false;
    const days = (Date.now() - new Date(s.published_date).getTime()) / 86400000;
    return days < 3;
  }) ? 10 : 0;
  return Math.min(100, Math.round(avgTrust * 60 + countBonus + recencyBonus));
}

export async function generatePitches(
  articles: ResearchArticle[],
  context: { site_name: string; selected_sports: string[]; selected_teams: string[] }
): Promise<GeneratedPitch[]> {
  if (articles.length === 0) return [];

  const articleList = articles
    .slice(0, 25)
    .map((a, i) => `[${i + 1}] ${a.title}\nSource: ${a.source} (trust: ${a.trust_score.toFixed(2)})\nURL: ${a.url}\nDescription: ${a.description || ''}`)
    .join('\n\n');

  const prompt = `You are a sports news editor for ${context.site_name}. Based on these research articles, generate 3–6 distinct story pitches.

Focus: ${context.selected_sports.join(', ')}
Key teams/topics: ${context.selected_teams.join(', ')}

Articles:
${articleList}

Return a JSON array of pitch objects:
[
  {
    "headline": "A compelling, specific news headline",
    "synopsis": "3-5 sentences covering: what happened, who is involved, why it matters to sports bettors and fans in the region, key facts or stats from the sources.",
    "article_indices": [1, 3, 5]
  }
]

Rules:
- Each pitch should cover a distinct story angle (no duplicates)
- Prioritize stories with the most article backing
- Headlines should be specific and factual, not clickbait
- Synopses should mention concrete facts, names, dates, and stats
- Group articles by topic — a pitch can cite multiple articles
- Return ONLY valid JSON, no markdown`;

  const response = await generateContent(
    [{ role: 'user', content: prompt }],
    { temperature: 0.3, maxTokens: 3000 }
  );

  let rawPitches: Array<{ headline: string; synopsis: string; article_indices: number[] }> = [];
  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    rawPitches = JSON.parse(cleaned);
  } catch {
    return [];
  }

  return rawPitches.map((p) => {
    const usedArticles = (p.article_indices || [])
      .map((i) => articles[i - 1])
      .filter(Boolean);

    const sources: PitchSource[] = usedArticles.map((a) => ({
      title: a.title,
      url: a.url,
      source_domain: a.source,
      trust_score: a.trust_score,
      published_date: a.published_date || '',
    }));

    return {
      headline: p.headline,
      synopsis: p.synopsis,
      source_score: computeSourceScore(sources),
      sources,
    };
  });
}
