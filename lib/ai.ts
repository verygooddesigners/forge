// AI Provider abstraction layer - supports Claude API

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
 * Generate content using Claude API
 */
export async function generateContent(
  messages: AIMessage[],
  options: AIOptions = {}
): Promise<string> {
  const {
    model = 'claude-3-5-sonnet-20241022',
    temperature = 0.7,
    maxTokens = 4000,
  } = options;

  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('CLAUDE_API_KEY is not configured. Please add it to your .env.local file.');
  }

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
    model = 'claude-3-5-sonnet-20241022',
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

  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('CLAUDE_API_KEY is not configured. Please add it to your .env.local file.');
  }

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
      content: `You are a writing style analyzer. Analyze the following content and provide a detailed analysis of:
- Tone (e.g., professional, casual, authoritative, friendly)
- Voice (e.g., active, passive, direct, narrative)
- Vocabulary level (e.g., simple, intermediate, advanced, technical)
- Sentence structure (e.g., short and punchy, complex, varied, flowing)
- Key phrases or expressions that are characteristic

Return your analysis as a JSON object with these exact keys: tone, voice, vocabulary_level, sentence_structure, key_phrases (array).`,
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


