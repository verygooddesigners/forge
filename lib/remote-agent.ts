import { NextRequest } from 'next/server';

export function validateRemoteAgentToken(request: NextRequest) {
  const expected = process.env.CURSOR_REMOTE_AGENT_TOKEN;

  if (!expected) {
    return {
      ok: false,
      status: 500,
      error: 'Server not configured for remote agent access.',
    };
  }

  const token = request.headers.get('x-cursor-agent-token');
  if (!token || token !== expected) {
    return {
      ok: false,
      status: 401,
      error: 'Unauthorized.',
    };
  }

  return { ok: true };
}
