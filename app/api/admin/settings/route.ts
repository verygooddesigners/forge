import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkApiPermission } from '@/lib/auth-config';
import { invalidateCached } from '@/lib/settings-cache';

/**
 * Maps admin UI key names → api_keys.service_name values
 * The api_keys table pre-dates this route and uses short service names.
 */
const KEY_TO_SERVICE: Record<string, string> = {
  claude_api_key: 'claude',
  tavily_api_key: 'tavily',
  openai_api_key: 'openai',
};

const ALLOWED_KEYS = Object.keys(KEY_TO_SERVICE) as Array<keyof typeof KEY_TO_SERVICE>;

function isAllowedKey(key: string): key is keyof typeof KEY_TO_SERVICE {
  return key in KEY_TO_SERVICE;
}

/** Mask a secret: show first 12 chars + bullets */
function maskSecret(value: string): string {
  if (!value || value.length < 8) return '••••••••';
  return value.slice(0, 12) + '••••••••••••••••••••';
}

/**
 * GET /api/admin/settings
 * Returns masked values for all managed API keys (reads from api_keys table).
 */
export async function GET() {
  try {
    const { user, allowed } = await checkApiPermission('can_manage_api_keys');
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('api_keys')
      .select('service_name, key_encrypted, updated_at')
      .in('service_name', Object.values(KEY_TO_SERVICE));

    if (error) throw error;

    // Return masked values — never expose raw secrets to the client
    const settings: Record<string, { masked: string; updatedAt: string | null }> = {};
    for (const uiKey of ALLOWED_KEYS) {
      const serviceName = KEY_TO_SERVICE[uiKey];
      const row = data?.find(r => r.service_name === serviceName);
      settings[uiKey] = {
        masked: row?.key_encrypted ? maskSecret(row.key_encrypted) : '',
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
 * Upserts into api_keys table and invalidates the server-side cache.
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

    const serviceName = KEY_TO_SERVICE[key];
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('api_keys')
      .upsert(
        {
          service_name: serviceName,
          key_encrypted: value.trim(),
          updated_by: user.id,
        },
        { onConflict: 'service_name' }
      );

    if (error) throw error;

    // Invalidate server-side cache so resolvers pick up the new key immediately
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
