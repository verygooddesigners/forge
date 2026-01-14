import { loadAgentConfig, callClaude } from './base';
import { AgentMessage, AgentResponse } from './types';

export interface SEOAnalysisRequest {
  content: string;
  primaryKeyword: string;
  secondaryKeywords?: string[];
  targetLength?: number;
}

export interface SEOScore {
  overall: number;
  keywordDensity: number;
  headingStructure: number;
  contentLength: number;
  keywordPlacement: number;
}

export interface SEOAnalysisResult {
  score: SEOScore;
  recommendations: string[];
  keywordAnalysis: {
    primary: { count: number; density: number };
    secondary: { keyword: string; count: number; density: number }[];
  };
  headingAnalysis: {
    h2Count: number;
    h3Count: number;
    suggestions: string[];
  };
}

/**
 * SEO Optimization Agent
 * Analyzes and optimizes content for search engines
 */
export async function analyzeSEO(
  request: SEOAnalysisRequest
): Promise<AgentResponse> {
  const config = await loadAgentConfig('seo_optimization');
  
  if (!config.enabled) {
    return {
      success: false,
      error: 'SEO Optimization Agent is currently disabled',
    };
  }
  
  let userMessage = `Please analyze the following content for SEO:\n\n`;
  userMessage += `CONTENT:\n${request.content}\n\n`;
  userMessage += `PRIMARY KEYWORD: ${request.primaryKeyword}\n`;
  
  if (request.secondaryKeywords && request.secondaryKeywords.length > 0) {
    userMessage += `SECONDARY KEYWORDS: ${request.secondaryKeywords.join(', ')}\n`;
  }
  
  if (request.targetLength) {
    userMessage += `TARGET LENGTH: ${request.targetLength} words\n`;
  }
  
  userMessage += `\nPlease provide a comprehensive SEO analysis in JSON format with:
{
  "score": {
    "overall": 0-100,
    "keywordDensity": 0-100,
    "headingStructure": 0-100,
    "contentLength": 0-100,
    "keywordPlacement": 0-100
  },
  "recommendations": ["specific", "actionable", "recommendations"],
  "keywordAnalysis": {
    "primary": {"count": number, "density": percentage},
    "secondary": [{"keyword": "word", "count": number, "density": percentage}]
  },
  "headingAnalysis": {
    "h2Count": number,
    "h3Count": number,
    "suggestions": ["heading", "improvements"]
  }
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
  
  return callClaude(messages, config);
}

/**
 * Generate keyword suggestions
 */
export async function generateKeywordSuggestions(
  topic: string,
  existingKeywords?: string[]
): Promise<AgentResponse> {
  const config = await loadAgentConfig('seo_optimization');
  
  if (!config.enabled) {
    return {
      success: false,
      error: 'SEO Optimization Agent is currently disabled',
    };
  }
  
  let userMessage = `Please suggest SEO keywords for the topic: ${topic}\n\n`;
  
  if (existingKeywords && existingKeywords.length > 0) {
    userMessage += `EXISTING KEYWORDS: ${existingKeywords.join(', ')}\n`;
    userMessage += `Please suggest additional related keywords that complement these.\n`;
  }
  
  userMessage += `\nProvide 10-15 keyword suggestions in JSON format:
{
  "primary": ["main", "keywords"],
  "secondary": ["supporting", "keywords"],
  "longTail": ["longer phrase keywords"]
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
  
  return callClaude(messages, config);
}

