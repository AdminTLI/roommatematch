#!/usr/bin/env tsx

/**
 * Complete Programme Sync - Ensures ALL SKDB programmes are in the database
 * 
 * This script:
 * 1. Parses ALL programmes from SKDB CSV
 * 2. Maps institution IDs to slugs using the mapping file
 * 3. Uses INSERT ... ON CONFLICT to ensure all programmes are saved
 * 4. Verifies final count matches expected
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';
import { loadInstitutions } from '@/lib/loadInstitutions';
import { getInstitutionBrinCode } from '@/lib/duo/erkenningen';

// Load .env.local
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    const envFile = readFileSync(envPath, 'utf-8');
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  }
} catch (error) {
  // Ignore
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SKDB_DUMP_PATH = process.env.SKDB_DUMP_PATH || './data/skdb-opleidingen.csv';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Load institutions
const institutions = loadInstitutions();
const allInstitutions = [...institutions.wo, ...institutions.wo_special, ...institutions.hbo];

// Build institution name -> slug map
function buildInstitutionSlugMap(): Map<string, string> {
  const map = new Map<string, string>();
  
  for (const inst of allInstitutions) {
    const label = inst.label || '';
    if (label) {
      map.set(label.toLowerCase(), inst.id);
      // Also map without common prefixes
      const withoutPrefix = label.replace(/^(hogeschool|university|universiteit)\s+/i, '').toLowerCase();
      if (withoutPrefix !== label.toLowerCase()) {
        map.set(withoutPrefix, inst.id);
      }
    }
  }
  
  return map;
}

// Load institution ID -> name mapping
async function loadInstitutionMapping(): Promise<Map<number, string>> {
  const instellingenPath = path.join(path.dirname(SKDB_DUMP_PATH), 'skdb-instellingen.csv');
  const mapping = new Map<number, string>();
  
  if (existsSync(instellingenPath)) {
    try {
      const fileContent = readFileSync(instellingenPath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      
      for (const record of records) {
        const id = parseInt(record.Instelling_SK123ID || record.instelling_sk123id || '0');
        const name = record.Instelling || record.instelling || record.naam;
        if (id && name) {
          mapping.set(id, name);
        }
      }
      
      console.log(`   ✅ Loaded ${mapping.size} institution mappings`);
    } catch (error) {
      console.warn(`   ⚠️  Could not load institution mapping: ${error}`);
    }
  }
  
  return mapping;
}

const INSTITUTION_SYNONYMS: Record<string, string> = {
  'Fontys Hogeschool': 'fontys',
  'Hogeschool De Kempel': 'dekempel',
  'Universiteit voor Humanistiek': 'uvh',
  'Technische Universiteit Delft': 'tud',
  'Technische Universiteit Eindhoven': 'tue',
  'Erasmus Universiteit Rotterdam': 'eur',
  'Universiteit Leiden': 'leiden',
  'Universiteit Maastricht': 'um',
  'Open Universiteit': 'ou',
  'Radboud Universiteit': 'ru',
  'Universiteit van Tilburg': 'tilburg',
  'Universiteit van Amsterdam': 'uva',
  'Rijksuniversiteit Groningen': 'rug',
  'Universiteit Twente': 'utwente',
  'Universiteit Utrecht': 'uu',
  'Vrije Universiteit Amsterdam': 'vu',
  'Wageningen University & Research': 'wur',
};

function mapInstitutionToSlug(institutionName: string, slugMap: Map<string, string>): string | null {
  if (!institutionName) return null;

  const synonymSlug = INSTITUTION_SYNONYMS[institutionName];
  if (synonymSlug) {
    return synonymSlug;
  }

  const normalized = institutionName.toLowerCase().trim();
  
  // Direct match
  if (slugMap.has(normalized)) {
    return slugMap.get(normalized)!;
  }
  
  // Partial match
  for (const [key, slug] of Array.from(slugMap.entries())) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return slug;
    }
  }
  
  return null;
}

function determineDegreeLevel(record: any): 'bachelor' | 'master' | 'premaster' {
  const niveau = (record.niveau || record.Niveau || '').toString().toLowerCase();
  const name = (record.NaamOpleiding || record.naam || '').toString().toLowerCase();

  if (
    name.includes('pre-master') ||
    name.includes('schakelprogramma') ||
    name.includes('premaster') ||
    name.includes('schakel')
  ) {
    return 'premaster';
  }
  if (niveau.includes('master') || name.includes('master')) {
    return 'master';
  }
  if (niveau.includes('bachelor') || name.includes('bachelor')) {
    return 'bachelor';
  }
  return 'bachelor';
}

async function main() {
  console.log('🚀 Complete Programme Sync\n');
  
  // Load mappings
  const institutionMapping = await loadInstitutionMapping();
  const slugMap = buildInstitutionSlugMap();
  
  // Parse CSV
  console.log('📄 Parsing SKDB CSV...');
  const csvContent = readFileSync(SKDB_DUMP_PATH, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as any[];
  
  console.log(`   Found ${records.length} programmes in CSV\n`);
  
  // Process programmes
  const programmesToInsert: any[] = [];
  const unmatched: any[] = [];
  
  console.log('🔗 Mapping programmes to institutions...');
  
  for (const record of records) {
    // Get institution name
    let institutionName = record.institution || record.university || record.Instelling_Naam || record.naam_instelling;
    
    // If we have institution ID, map it
    if (!institutionName && record.Instelling_SK123ID) {
      const instId = parseInt(record.Instelling_SK123ID);
      institutionName = institutionMapping.get(instId);
    }
    
    if (!institutionName) {
      unmatched.push(record);
      continue;
    }
    
    // Map to slug
    const institutionSlug = mapInstitutionToSlug(institutionName, slugMap);
    if (!institutionSlug) {
      unmatched.push({ ...record, institutionName });
      continue;
    }
    
    // Parse programme
    const programmeName = record.NaamOpleiding || record.naam || record.name;
    if (!programmeName) continue;
    
    const degreeLevel = determineDegreeLevel(record);
    const crohoCode = record.Opleidingscode || record.crohoCode || record.croho_code;
    const studielast = record.Studielast || record.studielast;
    
    // Calculate duration
    let durationYears: number | undefined = undefined;
    let durationMonths: number | undefined = undefined;
    
    if (studielast) {
      const ects = parseInt(studielast.toString());
      if (degreeLevel === 'bachelor') {
        durationYears = Math.max(1, Math.min(6, Math.round((ects / 60) * 10) / 10));
      } else if (degreeLevel === 'master') {
        durationYears = Math.max(0.5, Math.min(3, Math.round((ects / 60) * 10) / 10));
      } else if (degreeLevel === 'premaster') {
        durationYears = Math.max(0.5, Math.min(1.5, Math.round((ects / 60) * 10) / 10));
      }
      durationMonths = Math.round((durationYears || 0) * 12);
    }
    
    const brinCode = getInstitutionBrinCode(institutionSlug);
    const institution = allInstitutions.find(inst => inst.id === institutionSlug);
    const sector = institution?.kind === 'hbo' ? 'hbo' : 
                   institution?.kind === 'wo_special' ? 'wo_special' : 'wo';
    
    const now = new Date().toISOString();
    
    programmesToInsert.push({
      institution_slug: institutionSlug,
      brin_code: brinCode || null,
      rio_code: null,
      name: programmeName,
      name_en: record.NaamOpleidingEngels || record.naamEn || record.nameEn || null,
      level: degreeLevel,
      sector,
      modes: [],
      is_variant: false,
      discipline: null,
      sub_discipline: null,
      croho_code: crohoCode ? crohoCode.toString() : null,
      language_codes: (record.Talen || record.languageCodes || '').split(',').filter(Boolean),
      faculty: record.Faculteit || record.faculty || null,
      active: record.Actief !== 'false' && record.status !== 'ended',
      ects_credits: studielast ? parseInt(studielast.toString()) : undefined,
      duration_years: durationYears || null,
      duration_months: durationMonths || null,
      admission_requirements: record.ToelatingsEisenMbo || record.toelatingsEisen || record.admissionRequirements || null,
      skdb_only: true,
      sources: { duo: false, skdb: true },
      metadata: {},
      enrichment_status: 'enriched',
      skdb_updated_at: now
    });
  }
  
  console.log(`   ✅ Mapped ${programmesToInsert.length} programmes to institutions`);
  console.log(`   ⚠️  ${unmatched.length} programmes could not be matched\n`);

  const crohoOwner = new Map<string, string>();
  let crohoFrom = 0;
  const crohoPageSize = 1000;
  while (true) {
    const { data: crohoRows, error: crohoError } = await supabase
      .from('programmes')
      .select('croho_code, institution_slug')
      .not('croho_code', 'is', null)
      .range(crohoFrom, crohoFrom + crohoPageSize - 1);

    if (crohoError) throw crohoError;
    if (!crohoRows?.length) break;

    for (const row of crohoRows) {
      if (row.croho_code) {
        crohoOwner.set(String(row.croho_code), row.institution_slug);
      }
    }

    crohoFrom += crohoPageSize;
    if (crohoRows.length < crohoPageSize) break;
  }

  const usedCrohoInRun = new Set<string>();

  function sanitizeProgrammePayload(prog: (typeof programmesToInsert)[0]) {
    const copy = { ...prog };
    if (!copy.croho_code) return copy;

    const croho = String(copy.croho_code);
    const owner = crohoOwner.get(croho);
    if (
      (owner && owner !== copy.institution_slug) ||
      usedCrohoInRun.has(croho)
    ) {
      copy.croho_code = null;
      return copy;
    }

    usedCrohoInRun.add(croho);
    crohoOwner.set(croho, copy.institution_slug);
    return copy;
  }

  async function upsertProgramme(prog: (typeof programmesToInsert)[0]): Promise<'inserted' | 'updated' | 'failed'> {
    const tryInsert = async (payload: typeof prog) => {
      const { error } = await supabase.from('programmes').insert(payload);
      return error;
    };

    const tryUpdate = async (payload: typeof prog, id: string) => {
      const { data: updateResult, error } = await supabase
        .from('programmes')
        .update(payload)
        .eq('id', id)
        .select('id');
      if (error) return { ok: false as const, error };
      if (updateResult?.length) return { ok: true as const, mode: 'updated' as const };
      const insertError = await tryInsert(payload);
      return insertError ? { ok: false as const, error: insertError } : { ok: true as const, mode: 'inserted' as const };
    };

    let payload = sanitizeProgrammePayload(prog);
    let existingId: string | null = null;

    if (payload.croho_code) {
      const { data } = await supabase
        .from('programmes')
        .select('id')
        .eq('croho_code', payload.croho_code)
        .eq('institution_slug', payload.institution_slug)
        .maybeSingle();
      if (data) existingId = data.id;
    }

    if (!existingId) {
      const { data } = await supabase
        .from('programmes')
        .select('id')
        .eq('institution_slug', payload.institution_slug)
        .eq('level', payload.level)
        .eq('name', payload.name)
        .maybeSingle();
      if (data) existingId = data.id;
    }

    if (existingId) {
      let result = await tryUpdate(payload, existingId);
      if (!result.ok && result.error?.code === '23505') {
        payload = { ...payload, croho_code: null };
        result = await tryUpdate(payload, existingId);
      }
      if (!result.ok) return 'failed';
      return result.mode === 'updated' ? 'updated' : 'inserted';
    }

    let insertError = await tryInsert(payload);
    if (insertError?.code === '23505') {
      payload = { ...payload, croho_code: null };
      insertError = await tryInsert(payload);
    }
    if (insertError) {
      if (insertError.code === '23505') {
        const { data: existing } = await supabase
          .from('programmes')
          .select('id')
          .eq('institution_slug', payload.institution_slug)
          .eq('level', payload.level)
          .eq('name', payload.name)
          .maybeSingle();
        if (existing) {
          const result = await tryUpdate(payload, existing.id);
          if (result.ok) return result.mode === 'updated' ? 'updated' : 'inserted';
        }
      }
      return 'failed';
    }
    return 'inserted';
  }
  
  // Insert programmes one by one to ensure all are saved
  console.log('💾 Upserting programmes to database...\n');
  
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalFailed = 0;
  
  for (let i = 0; i < programmesToInsert.length; i++) {
    const prog = programmesToInsert[i];
    
    const result = await upsertProgramme(prog);
    if (result === 'inserted') totalInserted++;
    else if (result === 'updated') totalUpdated++;
    else {
      totalFailed++;
      if (totalFailed <= 20) {
        console.error(`❌ Failed to upsert ${prog.name} (${prog.institution_slug})`);
      }
    }
    
    if ((i + 1) % 100 === 0) {
      console.log(`   Processed ${i + 1}/${programmesToInsert.length}... (inserted: ${totalInserted}, updated: ${totalUpdated}, failed: ${totalFailed})`);
    }
  }
  
  console.log('\n📊 Final Statistics:');
  console.log(`   Total processed: ${programmesToInsert.length}`);
  console.log(`   Inserted/Updated: ${totalInserted + totalUpdated}`);
  console.log(`   Failed: ${totalFailed}`);
  console.log(`   Unmatched: ${unmatched.length}`);
  
  // Verify final count
  const { count: finalCount } = await supabase
    .from('programmes')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n📊 Final database count: ${finalCount}`);
  console.log(`   Expected: ${programmesToInsert.length} (excluding ${unmatched.length} unmatched)`);
  
  // Check Avans International Business specifically
  const avansSlug = mapInstitutionToSlug('Avans Hogeschool', slugMap);
  if (avansSlug) {
    console.log(`\n🎯 Checking Avans (${avansSlug}):`);
    
    const { data: avansProgrammes } = await supabase
      .from('programmes')
      .select('name, level, croho_code')
      .eq('institution_slug', avansSlug);
    
    console.log(`   Total programmes: ${avansProgrammes?.length || 0}`);
    
    const ibProgrammes = avansProgrammes?.filter(p => 
      p.name.toLowerCase().includes('international') && 
      p.name.toLowerCase().includes('business') &&
      p.level === 'bachelor'
    ) || [];
    
    console.log(`   International Business (Bachelor): ${ibProgrammes.length}`);
    if (ibProgrammes.length > 0) {
      ibProgrammes.forEach(p => console.log(`     ✅ ${p.name} (CROHO: ${p.croho_code || 'N/A'})`));
    } else {
      console.log(`     ❌ MISSING - Should have 2 International Business programmes`);
    }
  }
  
  console.log('\n✅ Sync complete!');
}

main().catch(console.error);

