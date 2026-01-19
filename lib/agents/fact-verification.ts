import { callClaude, loadAgentConfig } from './base';
import { ResearchArticle, VerifiedFact, DisputedFact } from '@/types';
import { AgentConfig } from './types';

export interface FactVerificationResult {
  verified_facts: VerifiedFact[];
  disputed_facts: DisputedFact[];
  confidence_score: number;
  sources_used: string[];
  verification_timestamp: string;
}

const SYSTEM_PROMPT = `You are a Fact Verification Agent specializing in cross-referencing information across multiple sources.

Your role is to:
1. Extract factual claims from news articles
2. Cross-reference facts across multiple sources  
3. Identify discrepancies or conflicting information
4. Verify statistics, dates, names, and quotes
5. Assess source credibility
6. Rate confidence level (HIGH/MEDIUM/LOW) for each fact

## Verification Process

For each article provided, you should:
- Extract key factual claims (who, what, when, where, numbers, quotes)
- Compare claims across all sources
- Flag any facts that appear in only one source
- Highlight facts that conflict between sources
- Note facts that are consistently confirmed

## Output Format

Return a JSON object with:
- verified_facts: Array of facts confirmed by multiple sources
- disputed_facts: Array of facts with conflicts or single-source claims
- confidence_score: Overall confidence (0-100)
- key_insights: Important patterns or findings

## Confidence Ratings

- HIGH: Fact appears in 3+ sources with consistent details
- MEDIUM: Fact appears in 2 sources OR single authoritative source
- LOW: Fact appears in 1 source only OR has conflicting details

IMPORTANT: Be extremely careful with statistics, dates, and quotes. Verify exact numbers and wording.`;

export interface FactVerificationInput {
  articles: ResearchArticle[];
  topic: string;
  context?: string;
}

export async function verifyFacts(input: FactVerificationInput): Promise<FactVerificationResult> {
  const { articles, topic, context } = input;

  // Build the prompt with all articles
  const articlesText = articles.map((article, index) => `
SOURCE ${index + 1}: ${article.source} (Trust Score: ${article.trust_score})
Published: ${article.published_date}
Title: ${article.title}
Content: ${article.description}
URL: ${article.url}
`).join('\n---\n');

  const userPrompt = `
TOPIC: ${topic}
${context ? `CONTEXT: ${context}` : ''}

I have ${articles.length} news articles to verify. Please cross-reference the factual claims across these sources and identify verified facts vs disputed facts.

${articlesText}

Please analyze these articles and return a JSON object with the following structure:
{
  "verified_facts": [
    {
      "fact": "string",
      "confidence": "high|medium|low",
      "sources": ["source1", "source2"],
      "verification_date": "ISO date string"
    }
  ],
  "disputed_facts": [
    {
      "fact": "string",
      "conflicting_sources": ["source1", "source2"],
      "explanation": "why this fact is disputed"
    }
  ],
  "confidence_score": 85,
  "key_insights": "Brief summary of overall findings"
}`;

  try {
    // Load agent config for fact verification
    const config = await loadFactVerificationConfig();
    
    const response = await callClaude(
      [
        { role: 'user', content: userPrompt }
      ],
      config
    );

    // Parse the JSON response
    if (!response.content) {
      throw new Error('No content returned from fact verification');
    }
    
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse fact verification response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Transform to our format
    const result: FactVerificationResult = {
      verified_facts: parsed.verified_facts.map((fact: any) => ({
        fact: fact.fact,
        confidence: fact.confidence,
        sources: fact.sources,
        verification_date: fact.verification_date || new Date().toISOString(),
      })),
      disputed_facts: parsed.disputed_facts || [],
      confidence_score: parsed.confidence_score || 0,
      sources_used: articles.map(a => a.source),
      verification_timestamp: new Date().toISOString(),
    };

    return result;
  } catch (error) {
    console.error('Error in fact verification:', error);
    
    // Return a fallback result
    return {
      verified_facts: [],
      disputed_facts: [],
      confidence_score: 0,
      sources_used: articles.map(a => a.source),
      verification_timestamp: new Date().toISOString(),
    };
  }
}

// Helper function to load agent configuration from database
export async function loadFactVerificationConfig(): Promise<AgentConfig> {
  try {
    // Try to load from database
    const config = await loadAgentConfig('fact_verification' as any);
    return config;
  } catch (error) {
    // Return default config with all required properties
    return {
      id: 'fact-verification-default',
      agentKey: 'fact_verification' as any,
      displayName: 'Fact Verification Agent',
      description: 'Verifies facts across multiple sources',
      systemPrompt: SYSTEM_PROMPT,
      temperature: 0.2,
      maxTokens: 3000,
      model: 'claude-sonnet-4-20250514',
      enabled: true,
      guardrails: [],
      specialConfig: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
