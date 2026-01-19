import { loadAgentConfig, callClaude, streamClaude } from './base';
import { AgentMessage, AgentResponse } from './types';

export interface ContentGenerationRequest {
  brief: string;
  primaryKeywords: string[];
  secondaryKeywords?: string[];
  writerModelContext?: string;
  targetWordCount?: number;
  additionalInstructions?: string;
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
  
  // Build user message
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
  
  return streamClaude(messages, config);
}

