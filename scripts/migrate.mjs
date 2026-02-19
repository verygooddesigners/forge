#!/usr/bin/env node
/**
 * Supabase migration runner using the Management API.
 * Usage: node scripts/migrate.mjs [migration-file.sql]
 *   - No args: applies all unapplied migrations in supabase/migrations/
 *   - With arg: applies a specific migration file
 *
 * Requires SUPABASE_ACCESS_TOKEN in .env.local (from https://supabase.com/dashboard/account/tokens)
 * The token must belong to the account that owns the Supabase project.
 */

import { readFileSync, readdirSync } from 'fs';
import { resolve, join, basename } from 'path';

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local');
const env = {};
try {
  readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=["']?(.+?)["']?\s*$/);
    if (match) env[match[1].trim()] = match[2].trim();
  });
} catch {
  console.error('Could not read .env.local');
  process.exit(1);
}

const TOKEN = env.SUPABASE_ACCESS_TOKEN;

// Extract project ref from NEXT_PUBLIC_SUPABASE_URL
// URL format: https://<project-ref>.supabase.co
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const PROJECT_REF = supabaseUrl ? supabaseUrl.replace('https://', '').split('.')[0] : null;

if (!TOKEN) {
  console.error('❌ Missing SUPABASE_ACCESS_TOKEN in .env.local');
  console.error('   Get a Personal Access Token from: https://supabase.com/dashboard/account/tokens');
  console.error('   The token must belong to the account that owns this project.');
  process.exit(1);
}

if (!PROJECT_REF) {
  console.error('❌ Could not determine project ref from NEXT_PUBLIC_SUPABASE_URL');
  process.exit(1);
}

console.log(`🔗 Target project: ${PROJECT_REF}`);

async function runSQL(sql, label) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const data = await res.json();
  if (!res.ok || data?.message) {
    const msg = data?.message || JSON.stringify(data);
    console.error(`❌ ${label}: ${msg}`);
    if (msg.includes('privileges')) {
      console.error('');
      console.error('   The SUPABASE_ACCESS_TOKEN does not have access to this project.');
      console.error('   You need a token from the account that owns project: ' + PROJECT_REF);
      console.error('   Get one at: https://supabase.com/dashboard/account/tokens');
      console.error('');
      console.error('   Alternatively, run this SQL directly in the Supabase Dashboard:');
      console.error('   https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new');
      console.error('');
      console.error('--- SQL to run ---');
      console.error(sql);
      console.error('--- end SQL ---');
    }
    return false;
  }
  console.log(`✅ ${label}`);
  return true;
}

async function main() {
  const specificFile = process.argv[2];
  const migrationsDir = resolve(process.cwd(), 'supabase/migrations');

  let files;
  if (specificFile) {
    files = [specificFile.includes('/') ? specificFile : join(migrationsDir, specificFile)];
  } else {
    files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort()
      .map(f => join(migrationsDir, f));
  }

  for (const filePath of files) {
    const name = basename(filePath);
    const sql = readFileSync(filePath, 'utf8');
    await runSQL(sql, name);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
