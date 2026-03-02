import { NextResponse } from 'next/server';

/**
 * GET /api/generate/health
 * Lightweight AI API health check — verifies the Claude API key is valid
 * by making a minimal single-token completion request.
 * Uses raw fetch to match the rest of the codebase (no @anthropic-ai/sdk dependency).
 */
export async function GET() {
  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { status: 'error', message: 'CLAUDE_API_KEY is not configured' },
      { status: 503 }
    );
  }

  const start = Date.now();
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }],
      }),
    });

    const latency = Date.now() - start;

    if (!response.ok) {
      const message =
        response.status === 401
          ? 'API key is invalid or expired'
          : response.status === 429
          ? 'Rate limited — too many requests'
          : `Claude API returned HTTP ${response.status}`;

      return NextResponse.json(
        { status: 'error', message, latency },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      latency,
      model: 'claude-haiku-4-5-20251001',
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Claude API unreachable';
    return NextResponse.json(
      { status: 'error', message, latency: Date.now() - start },
      { status: 503 }
    );
  }
}
