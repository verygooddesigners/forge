import { NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/settings-cache';
import { createAdminClient } from '@/lib/supabase/admin';

async function resolveOpenAIApiKey(): Promise<string | null> {
  const cached = getCached('openai_api_key');
  if (cached) return cached;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('api_keys')
      .select('key_encrypted')
      .eq('service_name', 'openai')
      .single();
    if (data?.key_encrypted) {
      setCached('openai_api_key', data.key_encrypted);
      return data.key_encrypted;
    }
  } catch { /* fall through */ }
  return process.env.OPENAI_API_KEY || null;
}

/**
 * GET /api/generate/health/openai
 * Verifies the OpenAI API key is valid using the free /v1/models endpoint.
 * This does not generate tokens or incur usage costs.
 */
export async function GET() {
  const apiKey = await resolveOpenAIApiKey();

  if (!apiKey) {
    return NextResponse.json(
      { status: 'error', message: 'OPENAI_API_KEY is not configured' },
      { status: 503 }
    );
  }

  const start = Date.now();
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const latency = Date.now() - start;

    if (!response.ok) {
      const message =
        response.status === 401
          ? 'API key is invalid or expired'
          : response.status === 429
          ? 'Rate limited — too many requests'
          : `OpenAI API returned HTTP ${response.status}`;

      return NextResponse.json(
        { status: 'error', message, latency },
        { status: 503 }
      );
    }

    return NextResponse.json({ status: 'healthy', latency });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'OpenAI API unreachable';
    return NextResponse.json(
      { status: 'error', message, latency: Date.now() - start },
      { status: 503 }
    );
  }
}
