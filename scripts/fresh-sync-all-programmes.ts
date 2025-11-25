#!/usr/bin/env tsx

/**
 * Fresh Sync - Delete all programmes and re-insert from SKDB CSV
 * 
 * This script:
 * 1. Deletes ALL existing programmes from the database
 * 2. Parses ALL programmes from SKDB CSV
 * 3. Maps institution IDs to slugs using the mapping file
 * 4. Inserts ALL programmes fresh
 * 5. Verifies final count matches expected
 * 
 * WARNING: This will delete all existing programme data!
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
  
  if (niveau.includes('master') || name.includes('pre-master') || name.includes('schakelprogramma') || name.includes('premaster')) {
    return 'premaster';
  }
  if (niveau.includes('master') || name.includes('master')) {
    return 'master';
  }
  return 'bachelor';
}

async function deleteAllProgrammes(): Promise<number> {
  console.log('🗑️  Deleting all existing programmes...');
  
  // First, get the count
  const { count: initialCount } = await supabase
    .from('programmes')
    .select('*', { count: 'exact', head: true });
  
  console.log(`   Found ${initialCount || 0} programmes to delete...`);
  
  if (initialCount === 0) {
    console.log(`   ✅ No programmes to delete\n`);
    return 0;
  }
  
  // Delete all at once using a simple DELETE query
  const { error, count: deletedCount } = await supabase
    .from('programmes')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // This matches all rows
  
  if (error) {
    console.error(`❌ Error deleting programmes:`, error);
    // Try batch deletion as fallback
    let totalDeleted = 0;
    let batchDeleted = 1;
    
    while (batchDeleted > 0) {
      const { data, error: batchError } = await supabase
        .from('programmes')
        .delete()
        .select('id')
        .limit(1000);
      
      if (batchError) {
        console.error(`❌ Error in batch delete:`, batchError);
        break;
      }
      
      batchDeleted = data?.length || 0;
      totalDeleted += batchDeleted;
      
      if (batchDeleted > 0) {
        console.log(`   Deleted ${totalDeleted} programmes so far...`);
      }
    }
    
    console.log(`   ✅ Deleted ${totalDeleted} programmes\n`);
    return totalDeleted;
  }
  
  // Verify deletion
  const { count: finalCount } = await supabase
    .from('programmes')
    .select('*', { count: 'exact', head: true });
  
  if (finalCount && finalCount > 0) {
    console.warn(`   ⚠️  Warning: ${finalCount} programmes still remain after delete`);
  } else {
    console.log(`   ✅ Successfully deleted all ${initialCount} programmes\n`);
  }
  
  return initialCount || 0;
}

async function main() {
  console.log('🚀 Fresh Programme Sync - Starting from scratch\n');
  console.log('⚠️  WARNING: This will delete ALL existing programmes!\n');
  
  // Step 1: Delete all existing programmes
  await deleteAllProgrammes();
  
  // Step 2: Load mappings
  console.log('📋 Loading institution mappings...');
  const institutionMapping = await loadInstitutionMapping();
  const slugMap = buildInstitutionSlugMap();
  console.log(`   ✅ Institution slug map: ${slugMap.size} entries\n`);
  
  // Step 3: Parse CSV
  console.log('📄 Parsing SKDB CSV...');
  const csvContent = readFileSync(SKDB_DUMP_PATH, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as any[];
  
  console.log(`   Found ${records.length} programmes in CSV\n`);
  
  // Step 4: Process programmes
  const programmesToInsert: any[] = [];
  const unmatched: any[] = [];
  const crohoCodeSet = new Set<string>(); // Track CROHO codes to handle duplicates
  
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
    let crohoCode = record.Opleidingscode || record.crohoCode || record.croho_code;
    const studielast = record.Studielast || record.studielast;
    
    // Handle duplicate CROHO codes - if we've seen this CROHO code before, set it to null
    // This allows programmes with the same CROHO code to coexist (they'll be differentiated by name+institution+level)
    if (crohoCode) {
      const crohoStr = crohoCode.toString();
      if (crohoCodeSet.has(crohoStr)) {
        // Duplicate CROHO code - set to null to avoid unique constraint violation
        crohoCode = null;
      } else {
        crohoCodeSet.add(crohoStr);
      }
    }
    
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
      croho_code: crohoCode ? crohoCode.toString() : null, // May be null if duplicate
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
  
  // Step 5: Deduplicate programmes by CROHO code (keep first occurrence)
  console.log('🔍 Deduplicating programmes...');
  const seenCroho = new Set<string>();
  const deduplicatedProgrammes: any[] = [];
  let duplicatesRemoved = 0;
  
  for (const prog of programmesToInsert) {
    if (prog.croho_code && seenCroho.has(prog.croho_code)) {
      // Duplicate CROHO code - set to null and keep it
      prog.croho_code = null;
      duplicatesRemoved++;
    } else if (prog.croho_code) {
      seenCroho.add(prog.croho_code);
    }
    deduplicatedProgrammes.push(prog);
  }
  
  console.log(`   ✅ Removed ${duplicatesRemoved} duplicate CROHO codes\n`);
  
  // Step 6: Insert all programmes in batches
  console.log('💾 Inserting programmes to database...\n');
  
  const BATCH_SIZE = 100;
  let totalInserted = 0;
  let totalFailed = 0;
  
  for (let i = 0; i < deduplicatedProgrammes.length; i += BATCH_SIZE) {
    const batch = deduplicatedProgrammes.slice(i, i + BATCH_SIZE);
    
    const { data, error } = await supabase
      .from('programmes')
      .insert(batch)
      .select('id');
    
    if (error) {
      // Try individual inserts for this batch
      for (const prog of batch) {
        const { error: individualError } = await supabase
          .from('programmes')
          .insert(prog);
        
        if (individualError) {
          // If still fails, try without CROHO code
          if (individualError.code === '23505' && prog.croho_code) {
            const progWithoutCroho = { ...prog, croho_code: null };
            const { error: retryError } = await supabase
              .from('programmes')
              .insert(progWithoutCroho);
            
            if (retryError) {
              console.error(`   ❌ Failed: ${prog.name}`, retryError.message);
              totalFailed++;
            } else {
              totalInserted++;
            }
          } else {
            console.error(`   ❌ Failed: ${prog.name}`, individualError.message);
            totalFailed++;
          }
        } else {
          totalInserted++;
        }
      }
    } else {
      totalInserted += data?.length || 0;
    }
    
    if ((i + BATCH_SIZE) % 500 === 0 || i + BATCH_SIZE >= deduplicatedProgrammes.length) {
      console.log(`   Inserted ${Math.min(i + BATCH_SIZE, deduplicatedProgrammes.length)}/${deduplicatedProgrammes.length}... (success: ${totalInserted}, failed: ${totalFailed})`);
    }
  }
  
  console.log('\n📊 Final Statistics:');
  console.log(`   Total processed: ${programmesToInsert.length}`);
  console.log(`   Duplicates removed: ${duplicatesRemoved}`);
  console.log(`   Successfully inserted: ${totalInserted}`);
  console.log(`   Failed: ${totalFailed}`);
  console.log(`   Unmatched: ${unmatched.length}`);
  
  // Step 7: Verify final count
  const { count: finalCount } = await supabase
    .from('programmes')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n📊 Final database count: ${finalCount}`);
  console.log(`   Expected: ${programmesToInsert.length} (excluding ${unmatched.length} unmatched)`);
  
  if (finalCount === programmesToInsert.length) {
    console.log(`   ✅ SUCCESS! All programmes are in the database!`);
  } else {
    console.log(`   ⚠️  Discrepancy: ${programmesToInsert.length - (finalCount || 0)} programmes missing`);
  }
  
  // Step 8: Check Avans International Business specifically
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
  
  // Step 9: Count by level
  const { data: byLevel } = await supabase
    .from('programmes')
    .select('level')
    .limit(10000);
  
  const levelCounts: Record<string, number> = { bachelor: 0, master: 0, premaster: 0 };
  byLevel?.forEach(p => {
    if (p.level in levelCounts) {
      levelCounts[p.level]++;
    }
  });
  
  console.log(`\n📊 Programmes by level:`);
  console.log(`   Bachelor: ${levelCounts.bachelor}`);
  console.log(`   Master: ${levelCounts.master}`);
  console.log(`   Premaster: ${levelCounts.premaster}`);
  
  console.log('\n✅ Fresh sync complete!');
}

main().catch(console.error);

