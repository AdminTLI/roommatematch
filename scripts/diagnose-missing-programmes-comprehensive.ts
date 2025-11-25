#!/usr/bin/env tsx

/**
 * Comprehensive diagnostic script to identify why programmes are missing
 * 
 * This script will:
 * 1. Check what programmes exist in SKDB CSV for each institution
 * 2. Check what programmes are actually in the database
 * 3. Identify missing programmes
 * 4. Check institution mapping issues
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';

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
import { loadInstitutions } from '@/lib/loadInstitutions';
const institutions = loadInstitutions();
const allInstitutions = [...institutions.wo, ...institutions.wo_special, ...institutions.hbo];

function mapInstitutionToSlug(institutionName: string): string | null {
  const normalized = institutionName.toLowerCase().trim();
  
  // Try exact match
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

async function main() {
  console.log('🔍 Comprehensive Programme Diagnostic\n');
  
  // 1. Parse SKDB CSV
  console.log('📄 Parsing SKDB CSV...');
  const csvContent = readFileSync(SKDB_DUMP_PATH, 'utf-8');
  const records = parse(csvContent, { 
    columns: true, 
    skip_empty_lines: true,
    trim: true
  }) as any[];
  
  console.log(`   Found ${records.length} programmes in CSV\n`);
  
  // 2. Group by institution
  const byInstitution: Record<string, any[]> = {};
  const unmatchedInstitutions = new Set<string>();
  
  for (const record of records) {
    const instName = record.Instelling_Naam || record.institution;
    if (!instName) continue;
    
    const slug = mapInstitutionToSlug(instName);
    if (slug) {
      if (!byInstitution[slug]) byInstitution[slug] = [];
      byInstitution[slug].push(record);
    } else {
      unmatchedInstitutions.add(instName);
    }
  }
  
  console.log(`📊 Institution Mapping:`);
  console.log(`   Mapped: ${Object.keys(byInstitution).length} institutions`);
  console.log(`   Unmatched: ${unmatchedInstitutions.size} institutions\n`);
  
  // 3. Check Avans specifically
  console.log('🎯 Checking Avans Hogeschool:');
  const avansSlug = mapInstitutionToSlug('Avans Hogeschool');
  console.log(`   Slug: ${avansSlug || 'NOT FOUND'}`);
  
  if (avansSlug) {
    const avansProgrammes = byInstitution[avansSlug] || [];
    console.log(`   Programmes in SKDB CSV: ${avansProgrammes.length}`);
    
    // Check for International Business
    const intlBusiness = avansProgrammes.filter(p => 
      (p.NaamOpleiding || p.name || '').toLowerCase().includes('international') &&
      (p.NaamOpleiding || p.name || '').toLowerCase().includes('business')
    );
    console.log(`   International Business programmes: ${intlBusiness.length}`);
    
    if (intlBusiness.length > 0) {
      console.log('\n   Found International Business programmes:');
      intlBusiness.forEach(p => {
        console.log(`     - ${p.NaamOpleiding || p.name} (${p.Niveau || p.niveau || 'unknown level'})`);
        console.log(`       CROHO: ${p.Opleidingscode || p.crohoCode || 'N/A'}`);
      });
    }
    
    // Check database
    const { data: dbProgrammes, error } = await supabase
      .from('programmes')
      .select('id, name, level, croho_code')
      .eq('institution_slug', avansSlug)
      .eq('level', 'bachelor');
    
    if (error) {
      console.error(`   ❌ Error querying database: ${error.message}`);
    } else {
      console.log(`\n   Programmes in database: ${dbProgrammes?.length || 0}`);
      
      const dbIntlBusiness = dbProgrammes?.filter(p => 
        p.name.toLowerCase().includes('international') &&
        p.name.toLowerCase().includes('business')
      ) || [];
      console.log(`   International Business in DB: ${dbIntlBusiness.length}`);
      
      if (dbIntlBusiness.length === 0 && intlBusiness.length > 0) {
        console.log('\n   ⚠️  MISSING: International Business exists in SKDB but not in database!');
      }
    }
  }
  
  // 4. Overall statistics
  console.log('\n📊 Overall Statistics:');
  
  // Count programmes in CSV by level
  const csvByLevel: Record<string, number> = { bachelor: 0, master: 0, premaster: 0 };
  for (const record of records) {
    const niveau = (record.Niveau || record.niveau || '').toString().toLowerCase();
    if (niveau.includes('master') && !niveau.includes('pre')) {
      csvByLevel.master++;
    } else if (niveau.includes('pre') || niveau.includes('schakel')) {
      csvByLevel.premaster++;
    } else {
      csvByLevel.bachelor++;
    }
  }
  
  console.log(`   CSV programmes by level:`);
  console.log(`     Bachelor: ${csvByLevel.bachelor}`);
  console.log(`     Master: ${csvByLevel.master}`);
  console.log(`     Premaster: ${csvByLevel.premaster}`);
  
  // Count programmes in database
  const { count: dbTotal } = await supabase
    .from('programmes')
    .select('*', { count: 'exact', head: true });
  
  const { data: dbByLevel } = await supabase
    .from('programmes')
    .select('level')
    .limit(10000);
  
  const dbLevelCounts: Record<string, number> = { bachelor: 0, master: 0, premaster: 0 };
  dbByLevel?.forEach(p => {
    if (p.level in dbLevelCounts) {
      dbLevelCounts[p.level]++;
    }
  });
  
  console.log(`\n   Database programmes:`);
  console.log(`     Total: ${dbTotal || 0}`);
  console.log(`     Bachelor: ${dbLevelCounts.bachelor}`);
  console.log(`     Master: ${dbLevelCounts.master}`);
  console.log(`     Premaster: ${dbLevelCounts.premaster}`);
  
  const missing = (csvByLevel.bachelor + csvByLevel.master + csvByLevel.premaster) - (dbTotal || 0);
  console.log(`\n   ⚠️  Missing: ${missing} programmes`);
  
  // 5. Check sync report
  console.log('\n📋 Sync Report Analysis:');
  try {
    const reportPath = path.join(process.cwd(), 'data/programmes/.skdb-sync-report.json');
    if (existsSync(reportPath)) {
      const report = JSON.parse(readFileSync(reportPath, 'utf-8'));
      console.log(`   Total processed: ${report.summary.totalSkdbProgrammes}`);
      console.log(`   Matched: ${report.summary.matched}`);
      console.log(`   Enriched: ${report.summary.enriched}`);
      console.log(`   SKDB-only: ${report.summary.skdbOnly}`);
      console.log(`   Failed: ${report.summary.failed}`);
      console.log(`   Not found: ${report.summary.notFound}`);
      
      const expectedSaved = report.summary.matched + report.summary.skdbOnly;
      const actualSaved = dbTotal || 0;
      console.log(`\n   Expected saved: ${expectedSaved}`);
      console.log(`   Actually saved: ${actualSaved}`);
      console.log(`   Discrepancy: ${expectedSaved - actualSaved}`);
    }
  } catch (error) {
    console.log('   Could not load sync report');
  }
  
  console.log('\n✅ Diagnostic complete!');
}

main().catch(console.error);

