import { generateContent } from '@/lib/ai';

export interface SourceNote {
  title: string;
  url: string;
  source_domain: string;
  notes: string;
}

export async function generateSourceNotes(
  title: string,
  url: string,
  fullContent: string
): Promise<string> {
  const truncated = fullContent.slice(0, 8000);
  const response = await generateContent(
    [
      {
        role: 'system',
        content:
          'You are a news research assistant for sports journalists. Extract the most important information from the article for use in writing a news story. Be factual and precise. Use bullet points.',
      },
      {
        role: 'user',
        content: `Article: "${title}"\nSource: ${url}\n\nContent:\n${truncated}\n\nExtract and organize the key information under these headings:\n\n**Key Facts** — the most important factual claims, outcomes, decisions, announcements\n**Quotes** — notable direct quotes (include attribution)\n**Statistics & Numbers** — scores, stats, percentages, rankings, money figures\n**Timeline** — key dates, recent history relevant to this story\n**Context** — background information that helps explain the significance`,
      },
    ],
    { temperature: 0.1, maxTokens: 1500 }
  );
  return response;
}

export async function generateMasterNotes(
  sourceNotes: SourceNote[],
  pitchHeadline: string,
  pitchSynopsis: string
): Promise<string> {
  if (sourceNotes.length === 0) return '';

  const notesText = sourceNotes
    .map((n) => `=== SOURCE: ${n.title} (${n.source_domain}) ===\n${n.notes}`)
    .join('\n\n');

  const response = await generateContent(
    [
      {
        role: 'system',
        content:
          'You are a senior sports news editor. Synthesize research notes from multiple sources into a comprehensive master brief for a journalist writing a news article. Cross-reference facts, flag any discrepancies, and prioritize the most newsworthy elements.',
      },
      {
        role: 'user',
        content: `Story: "${pitchHeadline}"\nAngle: ${pitchSynopsis}\n\nSource notes from ${sourceNotes.length} sources:\n\n${notesText}\n\nCreate a master brief with:\n\n**Lead Elements** — the 2-3 most newsworthy facts that should lead the story\n**Key Verified Facts** — facts confirmed by multiple sources (note how many)\n**Best Quotes** — the strongest quotes available across all sources\n**Supporting Data** — key stats, numbers, and rankings\n**Story Context** — essential background for the reader\n**Potential Angles** — 2-3 specific angles or aspects worth highlighting in the article\n\nNote any contradictions or unverified claims across sources.`,
      },
    ],
    { temperature: 0.2, maxTokens: 2500 }
  );
  return response;
}
