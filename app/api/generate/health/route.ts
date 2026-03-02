import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

/**
 * GET /api/generate/health
 * Lightweight AI API health check — verifies the Claude API key is valid
 * by making a minimal single-token completion request.
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
    const client = new Anthropic({ apiKey });
    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'ping' }],
    });

    return NextResponse.json({
      status: 'healthy',
      latency: Date.now() - start,
      model: 'claude-haiku-4-5-20251001',
    });
  } catch (err: any) {
    const message =
      err?.status === 401
        ? 'API key is invalid or expired'
        : err?.status === 429
        ? 'Rate limited — too many requests'
        : err?.message ?? 'Claude API unreachable';

    return NextResponse.json(
      { status: 'error', message, latency: Date.now() - start },
      { status: 503 }
    );
  }
}
