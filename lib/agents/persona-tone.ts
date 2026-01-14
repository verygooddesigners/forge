import { loadAgentConfig, callClaude } from './base';
import { AgentMessage, AgentResponse } from './types';

export interface ToneAdaptationRequest {
  content: string;
  targetTone?: string;
  targetVoice?: string;
  writerModelContext?: string;
  preserveKeywords?: string[];
}

/**
 * Persona & Tone Agent
 * Adapts content to specific voices and tones
 */
export async function adaptTone(
  request: ToneAdaptationRequest
): Promise<AgentResponse> {
  const config = await loadAgentConfig('persona_tone');
  
  if (!config.enabled) {
    return {
      success: false,
      error: 'Persona & Tone Agent is currently disabled',
    };
  }
  
  let userMessage = `Please adapt the tone and voice of the following content:\n\n`;
  userMessage += `CONTENT:\n${request.content}\n\n`;
  
  if (request.targetTone) {
    userMessage += `TARGET TONE: ${request.targetTone}\n`;
  }
  
  if (request.targetVoice) {
    userMessage += `TARGET VOICE: ${request.targetVoice}\n`;
  }
  
  if (request.writerModelContext) {
    userMessage += `\nWRITER STYLE TO MATCH:\n${request.writerModelContext}\n`;
  }
  
  if (request.preserveKeywords && request.preserveKeywords.length > 0) {
    userMessage += `\nIMPORTANT: Preserve these keywords for SEO:\n${request.preserveKeywords.join(', ')}\n`;
  }
  
  userMessage += `\nPlease return the adapted content while:
- Maintaining the original meaning and structure
- Adjusting language to match the target tone/voice
- Preserving any specified keywords
- Keeping the same HTML formatting`;
  
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
 * Analyze tone mismatch between content and target
 */
export async function analyzeToneMismatch(
  content: string,
  targetStyle: string
): Promise<AgentResponse> {
  const config = await loadAgentConfig('persona_tone');
  
  if (!config.enabled) {
    return {
      success: false,
      error: 'Persona & Tone Agent is currently disabled',
    };
  }
  
  const userMessage = `Please analyze the tone/voice mismatch between:

CURRENT CONTENT:
${content}

TARGET STYLE:
${targetStyle}

Provide a detailed comparison in JSON format:
{
  "currentTone": "description",
  "targetTone": "description",
  "mismatches": ["specific", "differences"],
  "recommendations": ["how", "to", "adjust"],
  "severity": "low|medium|high"
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

