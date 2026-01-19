import { loadAgentConfig, callClaude, streamClaude } from './base';
import { AgentMessage, AgentResponse } from './types';
import { ResearchBrief } from '@/types';

export interface ContentGenerationRequest {
  brief: string;
  primaryKeywords: string[];
  secondaryKeywords?: string[];
  writerModelContext?: string;
  targetWordCount?: number;
  additionalInstructions?: string;
  researchBrief?: ResearchBrief;
}

/**
 * Content Generation Agent
 * Generates articles based on briefs, keywords, and writer models
 */
export async function generateContent(
  request: ContentGenerationRequest
): Promise<AgentResponse> {
  const config = await loadAgentConfig('content_generation');
  
  if (!config.enabled) {
    return {
      success: false,
      error: 'Content Generation Agent is currently disabled',
    };
  }
  
  // Build user message with all context
  let userMessage = `Please generate an article based on the following:\n\n`;
  userMessage += `BRIEF:\n${request.brief}\n\n`;
  userMessage += `PRIMARY KEYWORDS: ${request.primaryKeywords.join(', ')}\n`;
  
  if (request.secondaryKeywords && request.secondaryKeywords.length > 0) {
    userMessage += `SECONDARY KEYWORDS: ${request.secondaryKeywords.join(', ')}\n`;
  }
  
  if (request.targetWordCount) {
    userMessage += `TARGET WORD COUNT: ${request.targetWordCount}\n`;
  }
  
  if (request.writerModelContext) {
    userMessage += `\nWRITER STYLE CONTEXT:\n${request.writerModelContext}\n`;
  }
  
  if (request.additionalInstructions) {
    userMessage += `\nADDITIONAL INSTRUCTIONS:\n${request.additionalInstructions}\n`;
  }
  
  userMessage += `\nIMPORTANT: Output ONLY markdown format (## for headings, ** for bold, - for lists). Do NOT use HTML tags like <p>, <h2>, <table>, etc.`;
  
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
 * Stream content generation
 */
export async function generateContentStream(
  request: ContentGenerationRequest
): Promise<ReadableStream> {
  const config = await loadAgentConfig('content_generation');
  
  if (!config.enabled) {
    throw new Error('Content Generation Agent is currently disabled');
  }
  
  // Build user message with research brief
  let userMessage = `Please generate an article based on the following:\n\n`;
  userMessage += `BRIEF:\n${request.brief}\n\n`;
  userMessage += `PRIMARY KEYWORDS: ${request.primaryKeywords.join(', ')}\n`;
  
  if (request.secondaryKeywords && request.secondaryKeywords.length > 0) {
    userMessage += `SECONDARY KEYWORDS: ${request.secondaryKeywords.join(', ')}\n`;
  }
  
  if (request.targetWordCount) {
    userMessage += `TARGET WORD COUNT: ${request.targetWordCount}\n`;
  }
  
  if (request.writerModelContext) {
    userMessage += `\nWRITER STYLE CONTEXT:\n${request.writerModelContext}\n`;
  }
  
  if (request.additionalInstructions) {
    userMessage += `\nADDITIONAL INSTRUCTIONS:\n${request.additionalInstructions}\n`;
  }

  // Add research brief with verified facts for streaming
  if (request.researchBrief && request.researchBrief.fact_check_complete) {
    userMessage += `\n\nVERIFIED RESEARCH:\n`;
    userMessage += `Total Sources: ${request.researchBrief.articles.filter(a => !a.is_flagged).length}\n`;
    userMessage += `Confidence Score: ${request.researchBrief.confidence_score}%\n\n`;
    
    if (request.researchBrief.verified_facts.length > 0) {
      userMessage += `VERIFIED FACTS (use these in your content):\n`;
      request.researchBrief.verified_facts.forEach((fact, idx) => {
        userMessage += `${idx + 1}. ${fact.fact} [Confidence: ${fact.confidence.toUpperCase()}]\n`;
        userMessage += `   Sources: ${fact.sources.join(', ')}\n`;
      });
    }
    
    if (request.researchBrief.disputed_facts.length > 0) {
      userMessage += `\nDISPUTED FACTS (avoid using these):\n`;
      request.researchBrief.disputed_facts.forEach((fact, idx) => {
        userMessage += `${idx + 1}. ${fact.fact}\n`;
        userMessage += `   Issue: ${fact.explanation}\n`;
      });
    }
    
    userMessage += `\nIMPORTANT: Only use verified facts. When citing statistics or quotes, reference the source naturally in the text.\n`;
  }
  
  userMessage += `\nIMPORTANT: Output ONLY markdown format (## for headings, ** for bold, - for lists). Do NOT use HTML tags like <p>, <h2>, <table>, etc.`;
  
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
  
  return streamClaude(messages, config);
}

