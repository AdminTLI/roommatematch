#!/usr/bin/env tsx

/**
 * DUO Programme Sync Script
 * 
 * Fetches programme data from DUO's "Overzicht Erkenningen ho" CSV and generates
 * JSON files for each institution containing their programmes by level.
 * 
 * Usage:
 *   pnpm tsx scripts/sync-duo-programmes.ts
 * 
 * Environment variables:
 *   DUO_ERKENNINGEN_CSV_URL - Override default DUO CSV URL
 * 
 * Output:
 *   /data/programmes/<institutionId>.json - Programme data per institution
 *   /data/programmes/.sync-metadata.json - Sync statistics and timestamp
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { DuoRow, Programme, ProgrammesByLevel, DegreeLevel } from '@/types/programme';
import { Institution } from '@/types/institution';
import { loadInstitutions } from '@/lib/loadInstitutions';
import { normalise, mapSector, getInstitutionBrinCode, validateInstitutionMappings, counters } from '@/lib/duo/erkenningen';
import { resolveDuoCsv, resolveDuoErkenningenCsv } from '@/lib/duo/ckan';
import { parseHoOpleidingsoverzicht } from '@/lib/duo/ho-opleidingsoverzicht';

const DEFAULT_CSV_URL = process.env.DUO_ERKENNINGEN_CSV_URL || 
  'https://onderwijsdata.duo.nl/dataset/bb07cc6e-00fe-4100-9528-a0c5fd27d2fb/resource/0b2e9c4a-2c8e-4b2a-9f3a-1c2d3e4f5g6h/download/overzicht-erkenningen-ho.csv';

/**
 * Fetch HO Opleidingsoverzicht CSV data (primary source)
 */
async function fetchHoCsv(): Promise<string> {
  console.log('📡 Resolving HO Opleidingsoverzicht CSV URL...');
  
  try {
    const url = await resolveDuoCsv('ho-opleidingsoverzicht', /opleidingsoverzicht/i);
    console.log(`   Resolved URL: ${url}`);
    
    console.log('📡 Fetching HO Opleidingsoverzicht CSV data...');
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RoommateMatch/1.0 (programme-data-sync)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    console.log(`✅ Fetched ${csvText.length.toLocaleString()} characters`);
    return csvText;
  } catch (error) {
    throw new Error(`Failed to fetch HO Opleidingsoverzicht CSV: ${error}`);
  }
}

/**
 * Fetch Erkenningen CSV data (fallback source)
 */
async function fetchErkCsv(): Promise<string | null> {
  console.log('📡 Resolving Erkenningen CSV URL (fallback)...');
  
  try {
    const url = await resolveDuoErkenningenCsv();
    console.log(`   Resolved URL: ${url}`);
    
    console.log('📡 Fetching Erkenningen CSV data...');
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RoommateMatch/1.0 (programme-data-sync)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    console.log(`✅ Fetched ${csvText.length.toLocaleString()} characters`);
    return csvText;
  } catch (error) {
    console.warn(`⚠️  Failed to fetch Erkenningen CSV (fallback): ${error}`);
    return null;
  }
}

/**
 * Parse CSV and return DUO rows
 */
function parseCsv(csvText: string): DuoRow[] {
  console.log('📄 Parsing CSV data...');
  
  try {
    const rows = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true // Handle varying column counts
    }) as DuoRow[];
    
    console.log(`✅ Parsed ${rows.length.toLocaleString()} rows`);
    return rows;
  } catch (error) {
    throw new Error(`Failed to parse CSV: ${error}`);
  }
}

/**
 * Group programmes by institution BRIN code
 */
function groupByInstitution(rows: DuoRow[]): Map<string, DuoRow[]> {
  console.log('🏢 Grouping programmes by institution...');
  
  const byInstitution = new Map<string, DuoRow[]>();
  
  for (const row of rows) {
    const instCode = row.INSTELLINGSCODE;
    if (!instCode) continue;
    
    if (!byInstitution.has(instCode)) {
      byInstitution.set(instCode, []);
    }
    byInstitution.get(instCode)!.push(row);
  }
  
  console.log(`✅ Grouped into ${byInstitution.size} institutions`);
  return byInstitution;
}

/**
 * Process programmes for a single institution
 */
function processInstitutionProgrammes(
  institutionId: string,
  institutionName: string,
  rows: DuoRow[]
): ProgrammesByLevel {
  const sector = mapSector(rows[0]?.INSTELLINGSCODE || '');
  const programmes: ProgrammesByLevel = {
    bachelor: [],
    premaster: [],
    master: []
  };
  
  let processed = 0;
  let skipped = 0;
  
  for (const row of rows) {
    try {
      const programme = normalise(row, sector);
      if (programme) {
        programmes[programme.level].push(programme);
        processed++;
      } else {
        skipped++;
      }
    } catch (error) {
      console.warn(`⚠️  Skipping invalid programme in ${institutionName}:`, error);
      skipped++;
    }
  }
  
  // Sort programmes alphabetically by name
  for (const level of ['bachelor', 'premaster', 'master'] as DegreeLevel[]) {
    programmes[level].sort((a, b) => a.name.localeCompare(b.name));
  }
  
  if (skipped > 0) {
    console.log(`   ⚠️  Skipped ${skipped} invalid programmes`);
  }
  
  return programmes;
}

/**
 * Write programme data to JSON file
 */
async function writeProgrammeFile(institutionId: string, programmes: ProgrammesByLevel): Promise<void> {
  const outputDir = path.join(process.cwd(), 'data', 'programmes');
  await fs.mkdir(outputDir, { recursive: true });
  
  const outputPath = path.join(outputDir, `${institutionId}.json`);
  await fs.writeFile(outputPath, JSON.stringify(programmes, null, 2), 'utf8');
}

/**
 * Write sync metadata
 */
async function writeSyncMetadata(stats: {
  syncedAt: string;
  sourceUrl: string;
  totalProgrammes: number;
  byLevel: Record<DegreeLevel, number>;
  institutions: number;
  institutionsWithProgrammes: number;
}): Promise<void> {
  const outputDir = path.join(process.cwd(), 'data', 'programmes');
  await fs.mkdir(outputDir, { recursive: true });
  
  const metadataPath = path.join(outputDir, '.sync-metadata.json');
  await fs.writeFile(metadataPath, JSON.stringify(stats, null, 2), 'utf8');
}

/**
 * Main sync function
 */
async function main(): Promise<void> {
  console.log('🚀 Starting DUO programme sync...');
  console.log('');
  
  try {
    // Validate institution mappings
    console.log('🔍 Validating institution mappings...');
    const validation = validateInstitutionMappings();
    if (validation.missing.length > 0) {
      console.warn(`⚠️  Missing BRIN codes for ${validation.missing.length} institutions:`);
      validation.missing.forEach(id => console.warn(`   - ${id}`));
      console.warn('   These institutions will be skipped.');
    }
    console.log(`✅ Validated ${validation.total - validation.missing.length}/${validation.total} institutions`);
    console.log('');
    
    // Fetch both datasets
    const hoCsv = await fetchHoCsv();
    const erkCsv = await fetchErkCsv();
    
    // Load our institutions
    const institutions = loadInstitutions();
    const allInstitutions = [...institutions.wo, ...institutions.wo_special, ...institutions.hbo];
    
    // Process each institution
    console.log('');
    console.log('📚 Processing institutions...');
    
    const stats = {
      syncedAt: new Date().toISOString(),
      sourceUrl: 'HO Opleidingsoverzicht (primary) + Erkenningen (fallback)',
      totalProgrammes: 0,
      byLevel: { bachelor: 0, premaster: 0, master: 0 } as Record<DegreeLevel, number>,
      institutions: allInstitutions.length,
      institutionsWithProgrammes: 0
    };
    
    for (const institution of allInstitutions) {
      const brinCode = getInstitutionBrinCode(institution.id);
      if (!brinCode) {
        console.log(`⏭️  Skipping ${institution.label} (no BRIN code)`);
        continue;
      }
      
      // Try HO Opleidingsoverzicht first (primary source)
      let programmes: ProgrammesByLevel = { bachelor: [], premaster: [], master: [] };
      let source = 'none';
      
      try {
        const sector = mapSector(brinCode);
        programmes = parseHoOpleidingsoverzicht(hoCsv, brinCode, sector);
        source = 'HO Opleidingsoverzicht';
      } catch (error) {
        console.warn(`⚠️  HO Opleidingsoverzicht failed for ${institution.label}: ${error}`);
      }
      
      // If HO yields no programmes, try Erkenningen as fallback
      const totalFromHo = programmes.bachelor.length + programmes.premaster.length + programmes.master.length;
      if (totalFromHo === 0 && erkCsv) {
        try {
          const erkRows = parseCsv(erkCsv);
          const byInstitution = groupByInstitution(erkRows);
          const institutionRows = byInstitution.get(brinCode);
          
          if (institutionRows && institutionRows.length > 0) {
            programmes = processInstitutionProgrammes(
              institution.id,
              institution.label,
              institutionRows
            );
            source = 'Erkenningen (fallback)';
          }
        } catch (error) {
          console.warn(`⚠️  Erkenningen fallback failed for ${institution.label}: ${error}`);
        }
      }
      
      await writeProgrammeFile(institution.id, programmes);
      
      const total = programmes.bachelor.length + programmes.premaster.length + programmes.master.length;
      console.log(`📚 ${institution.label} → B:${programmes.bachelor.length} PM:${programmes.premaster.length} M:${programmes.master.length} (${total} total) [${source}]`);
      
      // Update statistics
      stats.totalProgrammes += total;
      stats.byLevel.bachelor += programmes.bachelor.length;
      stats.byLevel.premaster += programmes.premaster.length;
      stats.byLevel.master += programmes.master.length;
      if (total > 0) stats.institutionsWithProgrammes++;
    }
    
    // Write sync metadata
    await writeSyncMetadata(stats);
    
    console.log('');
    console.log('📊 Sync Statistics:');
    console.log(`   Total programmes: ${stats.totalProgrammes.toLocaleString()}`);
    console.log(`   Bachelor: ${stats.byLevel.bachelor.toLocaleString()}`);
    console.log(`   Pre-master: ${stats.byLevel.premaster.toLocaleString()}`);
    console.log(`   Master: ${stats.byLevel.master.toLocaleString()}`);
    console.log(`   Institutions with programmes: ${stats.institutionsWithProgrammes}/${stats.institutions}`);
    console.log(`   Synced at: ${stats.syncedAt}`);
    console.log('');
    console.log('🔍 Classification Counters:');
    console.log(`   Kept Bachelor: ${counters.keptBachelor.toLocaleString()}`);
    console.log(`   Kept Pre-master: ${counters.keptPremaster.toLocaleString()}`);
    console.log(`   Kept Master: ${counters.keptMaster.toLocaleString()}`);
    console.log(`   Skipped Other: ${counters.skippedOther.toLocaleString()}`);
    
    console.log('');
    console.log('✅ Programme sync completed successfully!');
    
  } catch (error) {
    console.error('');
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as syncDuoProgrammes };
