import { callClaude, loadAgentConfig } from './base';
import { ResearchArticle, VerifiedFact, DisputedFact } from '@/types';
import { AgentConfig } from './types';
import { FACT_VERIFICATION_PROMPT } from './prompts';

export interface FactVerificationResult {
  verified_facts: VerifiedFact[];
  disputed_facts: DisputedFact[];
  confidence_score: number;
  sources_used: string[];
  verification_timestamp: string;
}

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
  // Load from database using centralized config system
  return await loadAgentConfig('fact_verification');
}
