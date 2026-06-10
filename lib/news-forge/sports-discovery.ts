import { generateContent } from '@/lib/ai';
import { searchTavily, loadTrustedSources } from '@/lib/research';
import { createAdminClient } from '@/lib/supabase/admin';

export interface NewsSite {
  id: string;
  name: string;
  slug: string;
  state: string;
  state_code: string;
  cities: string[];
  default_sports: string[];
  default_teams: Array<{ name: string; sport: string; league: string }>;
}

export interface TrendingItem {
  name: string;
  reason: string;
  is_major_event: boolean;
  sport?: string;
  league?: string;
}

export interface SportsDiscovery {
  trending_sports: TrendingItem[];
  trending_teams: TrendingItem[];
  reasoning: string;
}

export async function discoverSportingEvents(
  site: NewsSite,
  currentDate: string
): Promise<SportsDiscovery> {
  const supabase = createAdminClient();
  const trustedSourcesMap = await loadTrustedSources(supabase);

  const teamNames = site.default_teams.map((t) => t.name);
  const queries = [
    `${site.state} sports major events news ${currentDate}`,
    `${teamNames.slice(0, 4).join(' OR ')} current news playoffs championship`,
    `sports betting ${site.state} top stories today`,
  ];

  const allArticles: any[] = [];
  for (const q of queries) {
    try {
      const results = await searchTavily(q, trustedSourcesMap, { max_results: 8, days: 14 });
      allArticles.push(...results);
    } catch {
      // skip failed query
    }
  }

  if (allArticles.length === 0) {
    return {
      trending_sports: [],
      trending_teams: [],
      reasoning: 'No current sports news found for this region.',
    };
  }

  const articleSummaries = allArticles
    .slice(0, 20)
    .map((a) => `- ${a.title}: ${a.description || ''}`)
    .join('\n');

  const defaultSports = site.default_sports.join(', ');
  const defaultTeams = teamNames.join(', ');

  const prompt = `You are a sports news analyst. Based on the following recent news headlines from ${site.state}, identify what sports and teams are most newsworthy right now.

Default sports for this site: ${defaultSports}
Default teams for this site: ${defaultTeams}
Current date: ${currentDate}

Recent headlines:
${articleSummaries}

Return a JSON object with this exact structure:
{
  "trending_sports": [
    {"name": "Sport/League Name", "reason": "Why it's trending", "is_major_event": true/false}
  ],
  "trending_teams": [
    {"name": "Team Name", "sport": "Sport", "league": "League", "reason": "Why they're trending", "is_major_event": true/false}
  ],
  "reasoning": "Brief explanation of what's happening in ${site.state} sports right now"
}

Rules:
- Mark is_major_event=true ONLY for playoffs, championships, finals, draft, major trades, or historic events
- Include sports/teams already in the defaults only if they have active news worth highlighting
- Add sports/teams NOT in the defaults if there is significant breaking news
- Keep trending_sports to max 6 items, trending_teams to max 8 items
- Return ONLY valid JSON, no markdown`;

  const response = await generateContent(
    [{ role: 'user', content: prompt }],
    { temperature: 0.2, maxTokens: 1500 }
  );

  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as SportsDiscovery;
  } catch {
    return {
      trending_sports: [],
      trending_teams: [],
      reasoning: response.slice(0, 200),
    };
  }
}
