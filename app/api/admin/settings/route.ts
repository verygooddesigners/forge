import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkApiPermission } from '@/lib/auth-config';
import { invalidateCached } from '@/lib/settings-cache';

// Keys that are allowed to be managed via the admin UI
const ALLOWED_KEYS = ['claude_api_key', 'tavily_api_key', 'openai_api_key'] as const;
type AllowedKey = typeof ALLOWED_KEYS[number];

function isAllowedKey(key: string): key is AllowedKey {
  return (ALLOWED_KEYS as readonly string[]).includes(key);
}

/** Mask a secret: show first 12 chars + bullets */
function maskSecret(value: string): string {
  if (!value || value.length < 8) return '••••••••';
  return value.slice(0, 12) + '••••••••••••••••••••';
}

/**
 * GET /api/admin/settings
 * Returns masked values of all managed system settings keys.
 */
export async function GET() {
  try {
    const { user, allowed } = await checkApiPermission('can_manage_api_keys');
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('system_settings')
      .select('key, value, updated_at')
      .in('key', ALLOWED_KEYS);

    if (error) throw error;

    // Return masked values — never expose raw secrets to the client
    const settings: Record<string, { masked: string; updatedAt: string | null }> = {};
    for (const key of ALLOWED_KEYS) {
      const row = data?.find(r => r.key === key);
      settings[key] = {
        masked: row ? maskSecret(row.value) : '',
        updatedAt: row?.updated_at ?? null,
      };
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('GET /api/admin/settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/settings
 * Body: { key: string, value: string }
 * Upserts a single setting and invalidates the server-side cache.
 */
export async function PUT(request: NextRequest) {
  try {
    const { user, allowed } = await checkApiPermission('can_manage_api_keys');
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { key, value } = body as { key: string; value: string };

    if (!key || !isAllowedKey(key)) {
      return NextResponse.json({ error: 'Invalid settings key' }, { status: 400 });
    }
    if (!value || typeof value !== 'string' || value.trim().length < 8) {
      return NextResponse.json({ error: 'Value is required and must be at least 8 characters' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('system_settings')
      .upsert(
        { key, value: value.trim(), updated_by: user.id },
        { onConflict: 'key' }
      );

    if (error) throw error;

    // Invalidate server-side cache so lib/ai.ts picks up the new key immediately
    invalidateCached(key);

    return NextResponse.json({
      success: true,
      key,
      masked: maskSecret(value.trim()),
    });
  } catch (error) {
    console.error('PUT /api/admin/settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
