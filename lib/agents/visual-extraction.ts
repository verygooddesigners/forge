import { loadAgentConfig, callClaude } from './base';
import { AgentMessage, AgentMessageContent, AgentResponse, VisualExtractionSpecialConfig } from './types';

export interface VisualExtractionRequest {
  imageData: string; // base64 encoded image
  imageType: string; // e.g., 'image/png', 'image/jpeg'
  extractionType: 'table' | 'text' | 'structured' | 'general';
  expectedFields?: string[];
}

export interface VisualExtractionResult {
  data: any;
  confidence: number;
  dataType: string;
  warnings?: string[];
  usedFallback?: boolean;
}

/**
 * Visual Data Extraction Agent
 * Extracts structured data from images
 */
export async function extractFromImage(
  request: VisualExtractionRequest
): Promise<AgentResponse> {
  const config = await loadAgentConfig('visual_extraction');
  
  if (!config.enabled) {
    return {
      success: false,
      error: 'Visual Extraction Agent is currently disabled',
    };
  }
  
  const specialConfig = config.specialConfig as VisualExtractionSpecialConfig;
  
  // Build user message with extraction instructions
  let userMessage = `Please extract data from the provided image.\n\n`;
  userMessage += `EXTRACTION TYPE: ${request.extractionType}\n`;
  
  if (request.expectedFields && request.expectedFields.length > 0) {
    userMessage += `EXPECTED FIELDS: ${request.expectedFields.join(', ')}\n`;
  }
  
  userMessage += `\nPlease return the extracted data in JSON format with:
{
  "data": extracted_data_structure,
  "confidence": 0-1 (your confidence in the extraction),
  "dataType": "description of data structure",
  "warnings": ["any", "issues", "or", "uncertainties"]
}`;
  
  // Build message with image
  const messageContent: AgentMessageContent[] = [
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: request.imageType,
        data: request.imageData,
      },
    },
    {
      type: 'text',
      text: userMessage,
    },
  ];
  
  const messages: AgentMessage[] = [
    {
      role: 'system',
      content: config.systemPrompt,
    },
    {
      role: 'user',
      content: messageContent,
    },
  ];
  
  // Try primary extraction with Claude
  const response = await callClaude(messages, config);
  
  // Check if fallback is needed
  if (response.success && response.content) {
    try {
      const result: VisualExtractionResult = JSON.parse(response.content);
      
      // Check if we should use fallback
      const shouldUseFallback = 
        specialConfig.enableFallback &&
        (
          (specialConfig.fallbackTrigger === 'lowConfidence' && result.confidence < specialConfig.confidenceThreshold) ||
          (specialConfig.fallbackTrigger === 'denseText' && result.dataType.includes('dense')) ||
          (specialConfig.fallbackTrigger === 'both' && result.confidence < specialConfig.confidenceThreshold)
        );
      
      if (shouldUseFallback) {
        // Try fallback with GPT-4o Vision
        const fallbackResponse = await extractWithGPT4Vision(request, userMessage);
        if (fallbackResponse.success) {
          return {
            ...fallbackResponse,
            metadata: {
              ...fallbackResponse.metadata,
              usedFallback: true,
            },
          };
        }
      }
      
      return response;
    } catch (error) {
      console.warn('Failed to parse extraction result:', error);
    }
  }
  
  return response;
}

/**
 * Fallback extraction using GPT-4o Vision
 */
async function extractWithGPT4Vision(
  request: VisualExtractionRequest,
  instructions: string
): Promise<AgentResponse> {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured for fallback');
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: instructions,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${request.imageType};base64,${request.imageData}`,
                },
              },
            ],
          },
        ],
        max_tokens: 4000,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    return {
      success: true,
      content,
      metadata: {
        model: 'gpt-4o',
        agentKey: 'visual_extraction',
        tokensUsed: data.usage?.total_tokens,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'GPT-4o fallback failed',
    };
  }
}

