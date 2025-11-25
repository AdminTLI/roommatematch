#!/usr/bin/env tsx

/**
 * Comprehensive fix to ensure ALL SKDB programmes are saved to the database
 * 
 * This script:
 * 1. Parses ALL programmes from SKDB CSV
 * 2. Maps institution IDs to slugs (with fallback if mapping file missing)
 * 3. Inserts/updates ALL programmes, ensuring they're actually saved
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

// Create institution ID to name mapping from CSV if possible
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
      
      console.log(`   ✅ Loaded ${mapping.size} institution mappings from file`);
    } catch (error) {
      console.warn(`   ⚠️  Could not load institution mapping file: ${error}`);
    }
  } else {
    console.log(`   ⚠️  Institution mapping file not found: ${instellingenPath}`);
    console.log(`   Will try to infer from programme CSV...`);
  }
  
  return mapping;
}

// Build reverse mapping: institution name -> slug
function buildInstitutionSlugMap(): Map<string, string> {
  const map = new Map<string, string>();
  
  for (const inst of allInstitutions) {
    // Map by label (which is the name)
    const label = inst.label || '';
    if (label) {
      map.set(label.toLowerCase(), inst.id);
    }
    
    // Map by id as well (for direct matching)
    if (inst.id) {
      map.set(inst.id.toLowerCase(), inst.id);
    }
    
    // Map variations
    if (label) {
      const variations = [
        label.replace(/^(hogeschool|university|universiteit)\s+/i, ''),
        label.replace(/\s+(hogeschool|university|universiteit)$/i, ''),
        label.replace(/^(hogeschool|university|universiteit)\s+/i, '').replace(/\s+(hogeschool|university|universiteit)$/i, '')
      ];
      
      for (const variant of variations) {
        if (variant && variant !== label) {
          map.set(variant.toLowerCase(), inst.id);
        }
      }
    }
  }
  
  return map;
}

function mapInstitutionToSlug(institutionName: string, slugMap: Map<string, string>): string | null {
  if (!institutionName) return null;
  
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
  
  if (niveau.includes('master') || name.includes('pre-master') || name.includes('schakelprogramma')) {
    return 'premaster';
  }
  if (niveau.includes('master') || name.includes('master')) {
    return 'master';
  }
  return 'bachelor';
}

async function upsertProgramme(
  programme: any,
  institutionSlug: string,
  stats: { inserted: number; updated: number; failed: number }
): Promise<void> {
  const brinCode = getInstitutionBrinCode(institutionSlug);
  const institutions = loadInstitutions();
  const allInsts = [...institutions.wo, ...institutions.wo_special, ...institutions.hbo];
  const institution = allInsts.find(inst => inst.id === institutionSlug);
  const sector = institution?.kind === 'hbo' ? 'hbo' : 
                 institution?.kind === 'wo_special' ? 'wo_special' : 'wo';
  
  const now = new Date().toISOString();
  const insertData: any = {
    institution_slug: institutionSlug,
    brin_code: brinCode || null,
    rio_code: null,
    name: programme.name,
    name_en: programme.nameEn || null,
    level: programme.degreeLevel,
    sector,
    modes: [],
    is_variant: false,
    discipline: null,
    sub_discipline: null,
    croho_code: programme.crohoCode || null,
    language_codes: programme.languageCodes || [],
    faculty: programme.faculty || null,
    active: programme.active !== false,
    ects_credits: programme.ectsCredits || null,
    duration_years: programme.durationYears || null,
    duration_months: programme.durationMonths || null,
    admission_requirements: programme.admissionRequirements || null,
    skdb_only: true,
    sources: { duo: false, skdb: true },
    metadata: {},
    enrichment_status: 'enriched',
    skdb_updated_at: now
  };
  
  // Strategy: Try INSERT first, handle conflicts by updating
  const { data: insertResult, error: insertError } = await supabase
    .from('programmes')
    .insert(insertData)
    .select('id');
  
  if (!insertError && insertResult && insertResult.length > 0) {
    // Successfully inserted
    stats.inserted++;
    return;
  }
  
  // If insert failed due to unique constraint, update existing
  if (insertError && insertError.code === '23505') {
    // Find the existing programme
    let existingId: string | null = null;
    
    // Try by CROHO code first (most reliable)
    if (programme.crohoCode) {
      const { data } = await supabase
        .from('programmes')
        .select('id')
        .eq('croho_code', programme.crohoCode)
        .maybeSingle();
      
      if (data) existingId = data.id;
    }
    
    // If not found, try by name + institution + level
    if (!existingId) {
      const { data } = await supabase
        .from('programmes')
        .select('id')
        .eq('institution_slug', institutionSlug)
        .eq('level', programme.degreeLevel)
        .eq('name', programme.name) // Exact match, not ilike
        .maybeSingle();
      
      if (data) existingId = data.id;
    }
    
    if (existingId) {
      // Update existing programme
      const { data: updateResult, error: updateError } = await supabase
        .from('programmes')
        .update(insertData)
        .eq('id', existingId)
        .select('id');
      
      if (updateError) {
        console.error(`❌ Failed to update ${programme.name}:`, updateError.message);
        stats.failed++;
      } else if (updateResult && updateResult.length > 0) {
        // Update succeeded and affected rows
        stats.updated++;
      } else {
        // Update affected 0 rows - programme was deleted, insert it
        console.warn(`⚠️  Update affected 0 rows for ${programme.name}, inserting as new...`);
        const { error: retryError } = await supabase
          .from('programmes')
          .insert(insertData);
        
        if (retryError) {
          console.error(`❌ Failed to insert ${programme.name} (retry):`, retryError.message);
          stats.failed++;
        } else {
          stats.inserted++;
        }
      }
    } else {
      // Conflict but can't find existing - might be a different unique constraint
      // Try inserting without croho_code if that's the issue
      if (programme.crohoCode) {
        const insertWithoutCroho = { ...insertData };
        delete insertWithoutCroho.croho_code;
        
        const { error: retryError } = await supabase
          .from('programmes')
          .insert(insertWithoutCroho);
        
        if (retryError) {
          console.error(`❌ Failed to insert ${programme.name} (no croho):`, retryError.message);
          stats.failed++;
        } else {
          stats.inserted++;
        }
      } else {
        console.error(`❌ Unique constraint violation but can't find existing programme: ${programme.name}`);
        stats.failed++;
      }
    }
  } else if (insertError) {
    console.error(`❌ Failed to insert ${programme.name}:`, insertError.message);
    stats.failed++;
  }
}

async function main() {
  console.log('🚀 Comprehensive Programme Sync Fix\n');
  
  // Load institution mapping
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
  
  // Process each programme
  const programmes: any[] = [];
  const unmatched: any[] = [];
  
  console.log('🔗 Mapping programmes to institutions...');
  
  for (const record of records) {
    // Get institution name
    let institutionName = record.institution || record.university || record.Instelling_Naam || record.naam_instelling;
    
    // If we have institution ID, try to map it
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
    
    // Parse programme data
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
    
    programmes.push({
      institution: institutionName,
      institutionSlug,
      name: programmeName,
      nameEn: record.NaamOpleidingEngels || record.naamEn || record.nameEn,
      crohoCode: crohoCode ? crohoCode.toString() : undefined,
      degreeLevel,
      languageCodes: (record.Talen || record.languageCodes || '').split(',').filter(Boolean),
      faculty: record.Faculteit || record.faculty,
      active: record.Actief !== 'false' && record.status !== 'ended',
      ectsCredits: studielast ? parseInt(studielast.toString()) : undefined,
      durationYears,
      durationMonths,
      admissionRequirements: record.ToelatingsEisenMbo || record.toelatingsEisen || record.admissionRequirements
    });
  }
  
  console.log(`   ✅ Mapped ${programmes.length} programmes to institutions`);
  console.log(`   ⚠️  ${unmatched.length} programmes could not be matched\n`);
  
  // Upsert all programmes
  console.log('💾 Upserting programmes to database...\n');
  const stats = { inserted: 0, updated: 0, failed: 0 };
  
  for (let i = 0; i < programmes.length; i++) {
    const programme = programmes[i];
    await upsertProgramme(programme, programme.institutionSlug, stats);
    
    if ((i + 1) % 100 === 0) {
      console.log(`   Processed ${i + 1}/${programmes.length}... (inserted: ${stats.inserted}, updated: ${stats.updated}, failed: ${stats.failed})`);
    }
  }
  
  console.log('\n📊 Final Statistics:');
  console.log(`   Total processed: ${programmes.length}`);
  console.log(`   Inserted: ${stats.inserted}`);
  console.log(`   Updated: ${stats.updated}`);
  console.log(`   Failed: ${stats.failed}`);
  console.log(`   Unmatched: ${unmatched.length}`);
  
  // Verify final count
  const { count: finalCount } = await supabase
    .from('programmes')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n📊 Final database count: ${finalCount}`);
  console.log(`   Expected: ${programmes.length} (excluding ${unmatched.length} unmatched)`);
  
  // Check Avans specifically
  const avansSlug = mapInstitutionToSlug('Avans Hogeschool', slugMap);
  if (avansSlug) {
    const { data: avansProgrammes } = await supabase
      .from('programmes')
      .select('name, level')
      .eq('institution_slug', avansSlug)
      .eq('level', 'bachelor')
      .ilike('name', '%international%business%');
    
    console.log(`\n🎯 Avans International Business (Bachelor): ${avansProgrammes?.length || 0} programmes`);
    if (avansProgrammes && avansProgrammes.length > 0) {
      avansProgrammes.forEach(p => console.log(`   ✅ ${p.name}`));
    }
  }
  
  console.log('\n✅ Sync complete!');
}

main().catch(console.error);

