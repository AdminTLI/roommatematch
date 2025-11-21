/**
 * Fix missing programmes by re-running the sync with better error handling
 * This script will ensure all matched programmes are actually saved
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'csv-parse/sync';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SKDB_DUMP_PATH = process.env.SKDB_DUMP_PATH || './data/skdb-opleidingen.csv';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface SkdbProgram {
  institution: string;
  name: string;
  nameEn?: string;
  crohoCode?: string;
  degreeLevel: 'bachelor' | 'master' | 'premaster';
  languageCodes: string[];
  faculty?: string;
  active: boolean;
}

function determineDegreeLevel(record: any): 'bachelor' | 'master' | 'premaster' {
  const niveau = (record.niveau || record.Niveau || '').toString().toLowerCase();
  const name = (record.name || record.NaamOpleiding || '').toString().toLowerCase();
  
  if (niveau.includes('master') || name.includes('pre-master') || name.includes('schakelprogramma')) {
    return 'premaster';
  }
  if (niveau.includes('master') || name.includes('master')) {
    return 'master';
  }
  return 'bachelor';
}

function mapInstitutionToSlug(institutionName: string): string | null {
  // Load institution mapping
  const { loadInstitutions } = require('./lib/loadInstitutions');
  const institutions = loadInstitutions();
  const allInstitutions = [
    ...institutions.wo,
    ...institutions.wo_special,
    ...institutions.hbo
  ];
  
  const normalized = institutionName.toLowerCase().trim();
  
  // Try exact match first
  const exact = allInstitutions.find(inst => 
    inst.name.toLowerCase() === normalized ||
    inst.commonName?.toLowerCase() === normalized
  );
  if (exact) return exact.id;
  
  // Try partial match
  const partial = allInstitutions.find(inst =>
    normalized.includes(inst.name.toLowerCase()) ||
    inst.name.toLowerCase().includes(normalized) ||
    (inst.commonName && (
      normalized.includes(inst.commonName.toLowerCase()) ||
      inst.commonName.toLowerCase().includes(normalized)
    ))
  );
  if (partial) return partial.id;
  
  return null;
}

async function parseCSV(): Promise<SkdbProgram[]> {
  console.log('📄 Parsing CSV dump...');
  const content = readFileSync(SKDB_DUMP_PATH, 'utf-8');
  const records = parse(content, { 
    columns: true, 
    skip_empty_lines: true,
    trim: true
  }) as any[];
  
  const programmes: SkdbProgram[] = [];
  
  for (const record of records) {
    const institutionName = record.Instelling_Naam || record.institution;
    const programmeName = record.NaamOpleiding || record.name;
    const crohoCode = record.Opleidingscode || record.crohoCode;
    const niveau = record.Niveau || record.niveau;
    
    if (!institutionName || !programmeName) continue;
    
    const institutionSlug = mapInstitutionToSlug(institutionName);
    if (!institutionSlug) continue;
    
    const degreeLevel = determineDegreeLevel({ niveau, name: programmeName });
    
    programmes.push({
      institution: institutionName,
      name: programmeName,
      nameEn: record.NaamOpleidingEngels || record.nameEn,
      crohoCode: crohoCode ? crohoCode.toString() : undefined,
      degreeLevel,
      languageCodes: (record.Talen || record.languageCodes || '').split(',').filter(Boolean),
      faculty: record.Faculteit || record.faculty,
      active: record.Actief !== 'false' && record.status !== 'ended'
    });
  }
  
  console.log(`✅ Parsed ${programmes.length} programmes`);
  return programmes;
}

async function upsertProgramme(programme: SkdbProgram): Promise<{ success: boolean; isNew: boolean }> {
  const institutionSlug = mapInstitutionToSlug(programme.institution);
  if (!institutionSlug) {
    return { success: false, isNew: false };
  }
  
  // Try to find existing by CROHO code first
  let existingId: string | null = null;
  if (programme.crohoCode) {
    const { data } = await supabase
      .from('programmes')
      .select('id')
      .eq('croho_code', programme.crohoCode)
      .maybeSingle();
    
    if (data) existingId = data.id;
  }
  
  // If not found by CROHO, try by name + institution + level
  if (!existingId) {
    const { data } = await supabase
      .from('programmes')
      .select('id')
      .eq('institution_slug', institutionSlug)
      .eq('level', programme.degreeLevel)
      .ilike('name', `%${programme.name}%`)
      .maybeSingle();
    
    if (data) existingId = data.id;
  }
  
  const insertData: any = {
    institution_slug: institutionSlug,
    name: programme.name,
    name_en: programme.nameEn || null,
    level: programme.degreeLevel,
    croho_code: programme.crohoCode || null,
    language_codes: programme.languageCodes,
    faculty: programme.faculty || null,
    active: programme.active,
    skdb_only: true,
    sources: { duo: false, skdb: true },
    enrichment_status: 'enriched',
    skdb_updated_at: new Date().toISOString()
  };
  
  if (existingId) {
    // Update existing
    const { error } = await supabase
      .from('programmes')
      .update(insertData)
      .eq('id', existingId);
    
    if (error) {
      console.error(`❌ Failed to update ${programme.name}:`, error);
      return { success: false, isNew: false };
    }
    return { success: true, isNew: false };
  } else {
    // Insert new
    const { error } = await supabase
      .from('programmes')
      .insert(insertData);
    
    if (error) {
      // If unique constraint violation, try update
      if (error.code === '23505') {
        const { error: updateError } = await supabase
          .from('programmes')
          .update(insertData)
          .eq('institution_slug', institutionSlug)
          .eq('level', programme.degreeLevel)
          .ilike('name', `%${programme.name}%`);
        
        if (updateError) {
          console.error(`❌ Failed to upsert ${programme.name}:`, updateError);
          return { success: false, isNew: false };
        }
        return { success: true, isNew: false };
      }
      console.error(`❌ Failed to insert ${programme.name}:`, error);
      return { success: false, isNew: false };
    }
    return { success: true, isNew: true };
  }
}

async function main() {
  console.log('🚀 Starting programme fix...\n');
  
  const programmes = await parseCSV();
  
  let successCount = 0;
  let newCount = 0;
  let updateCount = 0;
  let failCount = 0;
  
  console.log(`\n💾 Upserting ${programmes.length} programmes...\n`);
  
  for (let i = 0; i < programmes.length; i++) {
    const programme = programmes[i];
    const result = await upsertProgramme(programme);
    
    if (result.success) {
      successCount++;
      if (result.isNew) {
        newCount++;
      } else {
        updateCount++;
      }
    } else {
      failCount++;
    }
    
    if ((i + 1) % 100 === 0) {
      console.log(`   Processed ${i + 1}/${programmes.length}...`);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Total processed: ${programmes.length}`);
  console.log(`   Success: ${successCount}`);
  console.log(`   New: ${newCount}`);
  console.log(`   Updated: ${updateCount}`);
  console.log(`   Failed: ${failCount}`);
  
  // Verify final count
  const { count } = await supabase
    .from('programmes')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n📊 Final database count: ${count}`);
  console.log('\n✅ Fix complete!');
}

main().catch(console.error);

