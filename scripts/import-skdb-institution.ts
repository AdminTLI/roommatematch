#!/usr/bin/env tsx

/**
 * Import programmes for one institution from the SKDB opleidingen dump.
 *
 * Usage:
 *   SKDB_DUMP_PATH=./data/skdb-opleidingen.csv pnpm tsx scripts/import-skdb-institution.ts fontys
 */

import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import { loadInstitutions } from '@/lib/loadInstitutions';
import { getInstitutionBrinCode } from '@/lib/duo/erkenningen';

const SKDB_DUMP_PATH = process.env.SKDB_DUMP_PATH || './data/skdb-opleidingen.csv';
const SKDB_INSTELLINGEN_PATH = path.join(path.dirname(SKDB_DUMP_PATH), 'skdb-instellingen.csv');

const INSTITUTION_SYNONYMS: Record<string, string> = {
  'Fontys Hogeschool': 'fontys',
  'Hogeschool De Kempel': 'dekempel',
  'Universiteit voor Humanistiek': 'uvh',
};

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
  const name = (record.NaamOpleiding || record.naam || '').toLowerCase();
  const niveau = (record.niveau || record.Niveau || '').toString().toLowerCase();
  if (
    name.includes('pre-master') ||
    name.includes('schakelprogramma') ||
    name.includes('premaster') ||
    name.includes('schakel')
  ) {
    return 'premaster';
  }
  if (niveau.includes('master') || name.includes('master')) return 'master';
  return 'bachelor';
}

async function main(): Promise<void> {
  loadEnvLocal();
  const slug = process.argv[2];
  if (!slug) {
    throw new Error('Usage: pnpm tsx scripts/import-skdb-institution.ts <institution-slug>');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const institutions = loadInstitutions();
  const institution = [...institutions.wo, ...institutions.wo_special, ...institutions.hbo].find(
    (i) => i.id === slug
  );
  if (!institution) {
    throw new Error(`Unknown institution slug: ${slug}`);
  }

  const instRows = parse(readFileSync(SKDB_INSTELLINGEN_PATH, 'utf-8'), {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  const skdbInst = instRows.find((row) => {
    const synonymSlug = INSTITUTION_SYNONYMS[row.Instelling || ''];
    return synonymSlug === slug || (row.Instelling || '').toLowerCase().includes(slug);
  });

  if (!skdbInst) {
    throw new Error(`No SKDB institution row found for slug: ${slug}`);
  }

  const skdbInstId = skdbInst.Instelling_SK123ID;
  const opleidingen = parse(readFileSync(SKDB_DUMP_PATH, 'utf-8'), {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  const rows = opleidingen.filter((r) => String(r.Instelling_SK123ID) === String(skdbInstId));
  const brinCode = getInstitutionBrinCode(slug);
  const sector =
    institution.kind === 'hbo' ? 'hbo' : institution.kind === 'wo_special' ? 'wo_special' : 'wo';

  const supabase = createClient(supabaseUrl, supabaseKey);

  const crohoOwner = new Map<string, string>();
  let crohoFrom = 0;
  const crohoPageSize = 1000;
  while (true) {
    const { data: existingCrohoRows, error: crohoError } = await supabase
      .from('programmes')
      .select('croho_code, institution_slug')
      .not('croho_code', 'is', null)
      .range(crohoFrom, crohoFrom + crohoPageSize - 1);

    if (crohoError) throw crohoError;
    if (!existingCrohoRows?.length) break;

    for (const row of existingCrohoRows) {
      if (row.croho_code) {
        crohoOwner.set(String(row.croho_code), row.institution_slug);
      }
    }

    crohoFrom += crohoPageSize;
    if (existingCrohoRows.length < crohoPageSize) break;
  }

  const usedCrohoInBatch = new Set<string>();
  const payload = rows.map((record) => {
    let crohoCode = (record.Opleidingscode || '').toString() || null;
    const crohoTakenByOther =
      crohoCode && crohoOwner.has(crohoCode) && crohoOwner.get(crohoCode) !== slug;
    const crohoDuplicateInBatch = crohoCode ? usedCrohoInBatch.has(crohoCode) : false;

    if (crohoTakenByOther || crohoDuplicateInBatch) {
      crohoCode = null;
    } else if (crohoCode) {
      usedCrohoInBatch.add(crohoCode);
      crohoOwner.set(crohoCode, slug);
    }

    return {
    institution_slug: slug,
    brin_code: brinCode || null,
    rio_code: null,
    name: record.NaamOpleiding || record.naam,
    name_en: record.NaamOpleidingEngels || record.naamEn || null,
    level: determineDegreeLevel(record),
    sector,
    modes: [],
    is_variant: false,
    croho_code: crohoCode,
    language_codes: [],
    faculty: null,
    active: true,
    skdb_only: true,
    sources: { duo: false, skdb: true },
    enrichment_status: 'enriched',
    skdb_updated_at: new Date().toISOString(),
  };
  });

  await supabase.from('programmes').delete().eq('institution_slug', slug);

  const batchSize = 100;
  let inserted = 0;
  for (let i = 0; i < payload.length; i += batchSize) {
    const batch = payload.slice(i, i + batchSize);
    const { error } = await supabase.from('programmes').insert(batch);
    if (error) throw error;
    inserted += batch.length;
  }

  console.log(`✅ Imported ${inserted} programmes for ${institution.label} (${slug})`);
}

main().catch((error) => {
  console.error('❌', error);
  process.exit(1);
});
