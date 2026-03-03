// AI Provider abstraction layer - supports Claude API
import { STYLE_ANALYSIS_SYSTEM_PROMPT } from './prompts';
import { getCached, setCached } from './settings-cache';
import { createAdminClient } from './supabase/admin';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

/**
 * Resolve the Claude API key.
 * Priority: DB (system_settings) → CLAUDE_API_KEY env var → ANTHROPIC_API_KEY env var
 * DB value is cached for 5 minutes to avoid a round-trip on every request.
 */
async function resolveClaudeApiKey(): Promise<string> {
  // 1. Check in-memory cache first
  const cached = getCached('claude_api_key');
  if (cached) return cached;

  // 2. Try to load from DB (admin-configured key takes precedence over env var)
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'claude_api_key')
      .single();

    if (data?.value) {
      setCached('claude_api_key', data.value);
      return data.value;
    }
  } catch {
    // DB unavailable or table doesn't exist yet — fall through to env var
  }

  // 3. Fall back to environment variable
  const envKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (envKey) {
    setCached('claude_api_key', envKey);
    return envKey;
  }

  throw new Error('CLAUDE_API_KEY is not configured. Set it in Admin → API Keys or add it to your .env.local file.');
}

/**
 * Generate content using Claude API
 */
export async function generateContent(
  messages: AIMessage[],
  options: AIOptions = {}
): Promise<string> {
  const {
    model = 'claude-sonnet-4-20250514',
    temperature = 0.7,
    maxTokens = 4000,
  } = options;

  const apiKey = await resolveClaudeApiKey();

  // Separate system message from user/assistant messages
  const systemMessage = messages.find(m => m.role === 'system');
  const nonSystemMessages = messages.filter(m => m.role !== 'system');

  // Convert messages format for Claude API
  const claudeMessages = nonSystemMessages.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: claudeMessages,
      system: systemMessage?.content || undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.statusText} - ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Stream content generation using Claude API
 */
export async function streamContent(
  messages: AIMessage[],
  options: AIOptions = {}
): Promise<ReadableStream> {
  const {
    model = 'claude-sonnet-4-20250514',
    temperature = 0.7,
    maxTokens = 4000,
  } = options;

  // Separate system message from user/assistant messages
  const systemMessage = messages.find(m => m.role === 'system');
  const nonSystemMessages = messages.filter(m => m.role !== 'system');

  // Convert messages format for Claude API
  const claudeMessages = nonSystemMessages.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  const apiKey = await resolveClaudeApiKey();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: claudeMessages,
      system: systemMessage?.content || undefined,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.statusText} - ${error}`);
  }

  return response.body!;
}

/**
 * Analyze writing style from content
 */
export async function analyzeWritingStyle(content: string) {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: STYLE_ANALYSIS_SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content,
    },
  ];

  const result = await generateContent(messages, { temperature: 0.3 });

  try {
    return JSON.parse(result);
  } catch {
    // If parsing fails, return a structured default
    return {
      tone: 'professional',
      voice: 'active',
      vocabulary_level: 'intermediate',
      sentence_structure: 'varied',
      key_phrases: [],
    };
  }
}
