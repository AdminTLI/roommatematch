#!/usr/bin/env tsx

/**
 * Bulk-correct programme degree levels from the SKDB opleidingen dump.
 * Fixes misclassified rows (e.g. masters stored as premaster after a bad sync).
 *
 * Usage:
 *   SKDB_DUMP_PATH=./data/skdb-opleidingen.csv pnpm tsx scripts/fix-programme-levels-from-skdb.ts
 */

import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

const SKDB_DUMP_PATH = process.env.SKDB_DUMP_PATH || './data/skdb-opleidingen.csv';
const BATCH_SIZE = 50;
const PAGE_SIZE = 1000;

function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...valueParts] = trimmed.split('=');
    if (!key || valueParts.length === 0) continue;
    const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

function determineDegreeLevel(record: Record<string, string>): 'bachelor' | 'master' | 'premaster' {
  const name = (record.NaamOpleiding || record.naam || record.name || '').toLowerCase();
  const niveau = (record.niveau || record.Niveau || record.graad || '').toString().toLowerCase();

  if (
    name.includes('pre-master') ||
    name.includes('schakelprogramma') ||
    name.includes('premaster') ||
    name.includes('schakel')
  ) {
    return 'premaster';
  }
  if (niveau.includes('master') || name.includes('master')) return 'master';
  if (niveau.includes('bachelor') || name.includes('bachelor')) return 'bachelor';
  return 'bachelor';
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

async function main(): Promise<void> {
  loadEnvLocal();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  if (!existsSync(SKDB_DUMP_PATH)) {
    throw new Error(`SKDB dump not found: ${SKDB_DUMP_PATH}`);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const records = parse(readFileSync(SKDB_DUMP_PATH, 'utf-8'), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const levelByCroho = new Map<string, 'bachelor' | 'master' | 'premaster'>();
  const levelByName = new Map<string, 'bachelor' | 'master' | 'premaster'>();

  for (const record of records) {
    const croho = (record.Opleidingscode || record.crohoCode || '').toString().trim();
    const name = normalizeName(record.NaamOpleiding || record.naam || '');
    const level = determineDegreeLevel(record);
    if (croho) levelByCroho.set(croho, level);
    if (name) levelByName.set(name, level);
  }

  console.log(`📄 Loaded ${records.length} SKDB rows (${levelByCroho.size} CROHO codes)`);

  const toUpdate: Array<{ id: string; level: 'bachelor' | 'master' | 'premaster'; name: string }> = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('programmes')
      .select('id, name, level, croho_code')
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data?.length) break;

    for (const row of data) {
      const expected =
        (row.croho_code && levelByCroho.get(String(row.croho_code))) ||
        levelByName.get(normalizeName(row.name));

      if (expected && expected !== row.level) {
        toUpdate.push({ id: row.id, level: expected, name: row.name });
      }
    }

    from += PAGE_SIZE;
    if (data.length < PAGE_SIZE) break;
  }

  console.log(`🔧 ${toUpdate.length} programmes need level correction`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
    const batch = toUpdate.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(({ id, level }) =>
        supabase.from('programmes').update({ level }).eq('id', id)
      )
    );

    for (const result of results) {
      if (result.error) failed++;
      else updated++;
    }

    if ((i + BATCH_SIZE) % 500 === 0 || i + BATCH_SIZE >= toUpdate.length) {
      console.log(`   Progress: ${Math.min(i + BATCH_SIZE, toUpdate.length)}/${toUpdate.length}`);
    }
  }

  const { count: masterCount } = await supabase
    .from('programmes')
    .select('*', { count: 'exact', head: true })
    .eq('level', 'master');

  console.log('');
  console.log(`✅ Updated ${updated} programmes (${failed} failed)`);
  console.log(`📊 Master programmes in database: ${masterCount ?? 0}`);

  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error('❌', error);
  process.exit(1);
});
