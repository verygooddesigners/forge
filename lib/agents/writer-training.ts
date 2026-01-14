import { loadAgentConfig, callClaude } from './base';
import { AgentMessage, AgentResponse, WriterTrainingSpecialConfig } from './types';

export interface WriterTrainingRequest {
  samples: string[];
  writerName: string;
  existingContext?: string;
}

export interface WriterStyleAnalysis {
  tone: string;
  voice: string;
  vocabularyLevel: string;
  sentenceStructure: string;
  commonPhrases: string[];
  stylistic_elements: string[];
  summary: string;
}

/**
 * Writer Training Agent
 * Analyzes writing samples and trains writer models
 */
export async function analyzeWritingStyle(
  request: WriterTrainingRequest
): Promise<AgentResponse> {
  const config = await loadAgentConfig('writer_training');
  
  if (!config.enabled) {
    return {
      success: false,
      error: 'Writer Training Agent is currently disabled',
    };
  }
  
  // Build analysis request
  let userMessage = `Please analyze the following writing samples for writer: ${request.writerName}\n\n`;
  
  request.samples.forEach((sample, index) => {
    userMessage += `SAMPLE ${index + 1}:\n${sample}\n\n`;
  });
  
  if (request.existingContext) {
    userMessage += `EXISTING STYLE CONTEXT:\n${request.existingContext}\n\n`;
  }
  
  userMessage += `Please provide a structured analysis in JSON format with the following fields:
{
  "tone": "description of tone (formal/casual, serious/playful, etc.)",
  "voice": "description of voice (active/passive, personal/impersonal, etc.)",
  "vocabularyLevel": "vocabulary complexity (simple, intermediate, advanced)",
  "sentenceStructure": "typical sentence patterns (short, varied, complex, etc.)",
  "commonPhrases": ["array", "of", "frequently", "used", "phrases"],
  "stylistic_elements": ["unique", "writing", "quirks"],
  "summary": "overall writing style summary"
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
  
  const response = await callClaude(messages, config);
  
  // Try to parse the JSON response
  if (response.success && response.content) {
    try {
      const analysis = JSON.parse(response.content);
      return {
        ...response,
        content: JSON.stringify(analysis),
      };
    } catch (error) {
      // If JSON parsing fails, return raw content
      console.warn('Failed to parse writer style analysis as JSON:', error);
    }
  }
  
  return response;
}

/**
 * Generate embeddings for writer model (using OpenAI)
 * This is called after style analysis to create vector embeddings
 */
export async function generateWriterEmbeddings(
  content: string
): Promise<number[] | null> {
  const config = await loadAgentConfig('writer_training');
  const specialConfig = config.specialConfig as WriterTrainingSpecialConfig;
  
  if (!specialConfig.useEmbeddings) {
    return null;
  }
  
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      console.warn('OPENAI_API_KEY not configured, skipping embeddings');
      return null;
    }
    
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: specialConfig.embeddingModel || 'text-embedding-3-small',
        input: content,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    return null;
  }
}

