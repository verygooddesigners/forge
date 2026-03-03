import { NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/settings-cache';
import { createAdminClient } from '@/lib/supabase/admin';

async function resolveTavilyApiKey(): Promise<string | null> {
  const cached = getCached('tavily_api_key');
  if (cached) return cached;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('api_keys')
      .select('key_encrypted')
      .eq('service_name', 'tavily')
      .single();
    if (data?.key_encrypted) {
      setCached('tavily_api_key', data.key_encrypted);
      return data.key_encrypted;
    }
  } catch { /* fall through */ }
  return process.env.TAVILY_API_KEY || null;
}

/**
 * GET /api/generate/health/tavily
 * Verifies the Tavily API key is valid with a minimal search request.
 */
export async function GET() {
  const apiKey = await resolveTavilyApiKey();

  if (!apiKey) {
    return NextResponse.json(
      { status: 'error', message: 'TAVILY_API_KEY is not configured' },
      { status: 503 }
    );
  }

  const start = Date.now();
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: 'ping',
        max_results: 1,
        search_depth: 'basic',
      }),
    });

    const latency = Date.now() - start;

    if (!response.ok) {
      const message =
        response.status === 401 || response.status === 403
          ? 'API key is invalid or expired'
          : response.status === 429
          ? 'Rate limited — too many requests'
          : `Tavily API returned HTTP ${response.status}`;

      return NextResponse.json(
        { status: 'error', message, latency },
        { status: 503 }
      );
    }

    return NextResponse.json({ status: 'healthy', latency });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Tavily API unreachable';
    return NextResponse.json(
      { status: 'error', message, latency: Date.now() - start },
      { status: 503 }
    );
  }
}
