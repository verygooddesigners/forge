#!/usr/bin/env node
/**
 * Supabase migration runner using the Management API.
 * Usage: node scripts/migrate.mjs [migration-file.sql]
 *   - No args: applies all unapplied migrations in supabase/migrations/
 *   - With arg: applies a specific migration file
 *
 * Requires SUPABASE_ACCESS_TOKEN in .env.local
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
const PROJECT_REF = 'hjnmeaklpgcjwzafakwt';

if (!TOKEN) {
  console.error('Missing SUPABASE_ACCESS_TOKEN in .env.local');
  process.exit(1);
}

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
    console.error(`❌ ${label}: ${data?.message || JSON.stringify(data)}`);
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
