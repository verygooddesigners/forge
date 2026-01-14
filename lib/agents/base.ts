import { createClient } from '../supabase/server';
import { AgentConfig, AgentKey, AgentMessage, AgentResponse } from './types';
import { DEFAULT_AGENT_CONFIGS } from './config';
import * as prompts from './prompts';

/**
 * Load agent configuration from database, fallback to default
 */
export async function loadAgentConfig(agentKey: AgentKey): Promise<AgentConfig> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('agent_configs')
      .select('*')
      .eq('agent_key', agentKey)
      .single();
    
    if (error || !data) {
      // Fallback to default config
      return createDefaultConfig(agentKey);
    }
    
    // Convert database format to AgentConfig
    return {
      id: data.id,
      agentKey: data.agent_key as AgentKey,
      displayName: data.display_name,
      description: data.description || '',
      systemPrompt: data.system_prompt,
      temperature: Number(data.temperature),
      maxTokens: data.max_tokens,
      model: data.model,
      enabled: data.enabled,
      guardrails: Array.isArray(data.guardrails) ? data.guardrails : [],
      specialConfig: data.special_config || {},
      updatedBy: data.updated_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error(`Error loading agent config for ${agentKey}:`, error);
    return createDefaultConfig(agentKey);
  }
}

/**
 * Create default config with system prompt
 */
function createDefaultConfig(agentKey: AgentKey): AgentConfig {
  const defaultConfig = DEFAULT_AGENT_CONFIGS[agentKey];
  const systemPrompt = getDefaultSystemPrompt(agentKey);
  
  return {
    id: `default-${agentKey}`,
    ...defaultConfig,
    systemPrompt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get default system prompt for agent
 */
function getDefaultSystemPrompt(agentKey: AgentKey): string {
  switch (agentKey) {
    case 'content_generation':
      return prompts.CONTENT_GENERATION_PROMPT;
    case 'writer_training':
      return prompts.WRITER_TRAINING_PROMPT;
    case 'seo_optimization':
      return prompts.SEO_OPTIMIZATION_PROMPT;
    case 'quality_assurance':
      return prompts.QUALITY_ASSURANCE_PROMPT;
    case 'persona_tone':
      return prompts.PERSONA_TONE_PROMPT;
    case 'creative_features':
      return prompts.CREATIVE_FEATURES_PROMPT;
    case 'visual_extraction':
      return prompts.VISUAL_EXTRACTION_PROMPT;
    default:
      return '';
  }
}

/**
 * Call Claude API with agent configuration
 */
export async function callClaude(
  messages: AgentMessage[],
  config: AgentConfig
): Promise<AgentResponse> {
  try {
    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('CLAUDE_API_KEY is not configured');
    }
    
    // Separate system message from user/assistant messages
    const systemMessage = messages.find(m => m.role === 'system');
    const nonSystemMessages = messages.filter(m => m.role !== 'system');
    
    // Use config system prompt if no system message provided
    const systemContent = systemMessage?.content || config.systemPrompt;
    
    // Convert messages format for Claude API
    const claudeMessages = nonSystemMessages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: typeof msg.content === 'string' ? msg.content : msg.content,
    }));
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        messages: claudeMessages,
        system: systemContent,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.statusText} - ${error}`);
    }
    
    const data = await response.json();
    const content = data.content[0].text;
    
    return {
      success: true,
      content,
      metadata: {
        tokensUsed: data.usage?.total_tokens,
        model: config.model,
        agentKey: config.agentKey,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      metadata: {
        agentKey: config.agentKey,
      },
    };
  }
}

/**
 * Stream Claude API response with agent configuration
 */
export async function streamClaude(
  messages: AgentMessage[],
  config: AgentConfig
): Promise<ReadableStream> {
  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('CLAUDE_API_KEY is not configured');
  }
  
  // Separate system message from user/assistant messages
  const systemMessage = messages.find(m => m.role === 'system');
  const nonSystemMessages = messages.filter(m => m.role !== 'system');
  
  // Use config system prompt if no system message provided
  const systemContent = systemMessage?.content || config.systemPrompt;
  
  // Convert messages format for Claude API
  const claudeMessages = nonSystemMessages.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: typeof msg.content === 'string' ? msg.content : msg.content,
  }));
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      messages: claudeMessages,
      system: systemContent,
      stream: true,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.statusText} - ${error}`);
  }
  
  return response.body!;
}

