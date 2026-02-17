import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateContent } from '@/lib/ai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] }: ChatRequest = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Load assistant settings from ai_settings
    const { data: settings } = await supabase
      .from('ai_settings')
      .select('setting_key, setting_value')
      .in('setting_key', [
        'assistant_system_prompt',
        'assistant_temperature',
        'assistant_model',
        'assistant_max_tokens',
        'assistant_use_web'
      ]);

    // Parse settings with defaults
    const settingsMap = new Map(settings?.map(s => [s.setting_key, s.setting_value]) || []);
    const systemPrompt = settingsMap.get('assistant_system_prompt') || 
      'You are an AI assistant for Forge, a content creation platform. Help users understand features, troubleshoot issues, and learn best practices.';
    const temperature = parseFloat(settingsMap.get('assistant_temperature') || '0.7');
    const model = settingsMap.get('assistant_model') || 'claude-sonnet-4-20250514';
    const maxTokens = parseInt(settingsMap.get('assistant_max_tokens') || '2000');
    const useWeb = settingsMap.get('assistant_use_web') === 'true';

    // Search for relevant Q/A entries
    const { data: qaEntries } = await supabase
      .from('ai_helper_entries')
      .select('question, answer, tags')
      .eq('is_active', true)
      .textSearch('question', message, { type: 'websearch', config: 'english' })
      .limit(5);

    // Build Q/A context
    let qaContext = '';
    if (qaEntries && qaEntries.length > 0) {
      qaContext = '\n\nRelevant Q/A from knowledge base:\n\n' + 
        qaEntries.map((entry, idx) => 
          `${idx + 1}. Q: ${entry.question}\n   A: ${entry.answer}`
        ).join('\n\n');
    }

    // Optionally fetch web context using Tavily
    let webContext = '';
    if (useWeb && process.env.TAVILY_API_KEY) {
      try {
        const tavilyResponse = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY,
            query: message,
            search_depth: 'basic',
            max_results: 3,
          }),
        });

        if (tavilyResponse.ok) {
          const tavilyData = await tavilyResponse.json();
          if (tavilyData.results && tavilyData.results.length > 0) {
            webContext = '\n\nRelevant web information:\n\n' +
              tavilyData.results.map((result: any, idx: number) => 
                `${idx + 1}. ${result.title}\n   ${result.content}\n   Source: ${result.url}`
              ).join('\n\n');
          }
        }
      } catch (webError) {
        console.warn('Web search failed:', webError);
      }
    }

    // Build the full prompt
    const fullSystemPrompt = systemPrompt + qaContext + webContext;

    // Build message array for AI
    const messages = [
      { role: 'system' as const, content: fullSystemPrompt },
      ...history,
      { role: 'user' as const, content: message }
    ];

    // Generate response
    const response = await generateContent(messages, {
      model,
      temperature,
      maxTokens,
    });

    // Return response with sources
    const sources = [
      ...(qaEntries || []).map(entry => ({
        type: 'qa',
        question: entry.question,
        tags: entry.tags,
      })),
    ];

    return NextResponse.json({
      response,
      sources: sources.length > 0 ? sources : undefined,
    });

  } catch (error: any) {
    console.error('Assistant chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', details: error.message },
      { status: 500 }
    );
  }
}
