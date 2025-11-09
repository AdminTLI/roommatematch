#!/usr/bin/env tsx

/**
 * DUO Programme Sync Script
 * 
 * Fetches programme data from DUO's "Overzicht Erkenningen ho" CSV and upserts
 * to the programmes database table. Optionally exports JSON files for backup.
 * 
 * Usage:
 *   pnpm tsx scripts/sync-duo-programmes.ts [--export-json] [--enrich]
 * 
 * Environment variables:
 *   DUO_ERKENNINGEN_CSV_URL - Override default DUO CSV URL
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (required for DB writes)
 * 
 * Output:
 *   - Upserts to programmes table in Supabase
 *   - Optional: /data/programmes/<institutionId>.json (if --export-json flag)
 *   - /data/programmes/.coverage-report.json - Coverage report
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { readFileSync, existsSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { DuoRow, Programme, ProgrammesByLevel, DegreeLevel } from '@/types/programme';
import { Institution } from '@/types/institution';
import { loadInstitutions } from '@/lib/loadInstitutions';
import { normalise, mapSector, getInstitutionBrinCode, validateInstitutionMappings, counters } from '@/lib/duo/erkenningen';
import { resolveDuoCsv, resolveDuoErkenningenCsv } from '@/lib/duo/ckan';
import { parseHoOpleidingsoverzicht } from '@/lib/duo/ho-opleidingsoverzicht';
import { upsertProgrammesForInstitution, getProgrammeCountsByInstitution } from '@/lib/programmes/repo';

// Load .env.local if it exists
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
  // .env.local doesn't exist or can't be read - that's okay
}

const DEFAULT_CSV_URL = process.env.DUO_ERKENNINGEN_CSV_URL || 
  'https://onderwijsdata.duo.nl/dataset/bb07cc6e-00fe-4100-9528-a0c5fd27d2fb/resource/0b2e9c4a-2c8e-4b2a-9f3a-1c2d3e4f5g6h/download/overzicht-erkenningen-ho.csv';

// Parse command line arguments
const exportJson = process.argv.includes('--export-json');
const runEnrichment = process.argv.includes('--enrich');

/**
 * Coverage report structure
 */
interface CoverageReport {
  syncedAt: string;
  sourceUrl: string;
  institutions: Array<{
    id: string;
    slug: string;
    brin: string | null;
    hasBrin: boolean;
    programmes: {
      bachelor: number;
      premaster: number;
      master: number;
    };
    missingLevels: DegreeLevel[];
    status: 'complete' | 'incomplete' | 'missing';
  }>;
  summary: {
    totalInstitutions: number;
    onboardingInstitutions: number;
    completeInstitutions: number;
    incompleteInstitutions: number;
    totalProgrammes: number;
  };
  failures: string[]; // Onboarding institutions that lack data
}

/**
 * Fetch HO Opleidingsoverzicht CSV data (primary source)
 */
async function fetchHoCsv(): Promise<string | null> {
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
    console.warn(`⚠️  Failed to fetch HO Opleidingsoverzicht CSV: ${error}`);
    console.warn('   Will fall back to Erkenningen CSV if available');
    return null;
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
 * Normalize institution name for fuzzy matching
 */
function normalizeInstitutionName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\b(university|universiteit|hogeschool|university of|university &|university and)\b/gi, '')
    .trim();
}

/**
 * Group programmes by institution BRIN code AND by name (for fallback matching)
 */
function groupByInstitution(rows: DuoRow[]): { byCode: Map<string, DuoRow[]>, byName: Map<string, DuoRow[]> } {
  console.log('🏢 Grouping programmes by institution...');
  
  const byCode = new Map<string, DuoRow[]>();
  const byName = new Map<string, DuoRow[]>();
  
  for (const row of rows) {
    const instCode = row.INSTELLINGSCODE;
    const instName = row.INSTELLINGSNAAM;
    
    if (instCode) {
      // Normalize BRIN code: uppercase and trim
      const normalizedCode = instCode.toUpperCase().trim();
      if (!byCode.has(normalizedCode)) {
        byCode.set(normalizedCode, []);
      }
      byCode.get(normalizedCode)!.push(row);
    }
    
    if (instName) {
      // Group by normalized name for fallback matching
      const normalizedName = normalizeInstitutionName(instName);
      if (!byName.has(normalizedName)) {
        byName.set(normalizedName, []);
      }
      byName.get(normalizedName)!.push(row);
    }
  }
  
  console.log(`✅ Grouped into ${byCode.size} institutions by code, ${byName.size} by name`);
  return { byCode, byName };
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
 * Write programme data to JSON file (optional, behind --export-json flag)
 */
async function writeProgrammeFile(institutionId: string, programmes: ProgrammesByLevel): Promise<void> {
  if (!exportJson) return;
  
  const outputDir = path.join(process.cwd(), 'data', 'programmes');
  await fs.mkdir(outputDir, { recursive: true });
  
  const outputPath = path.join(outputDir, `${institutionId}.json`);
  await fs.writeFile(outputPath, JSON.stringify(programmes, null, 2), 'utf8');
}

/**
 * Write coverage report
 */
async function writeCoverageReport(report: CoverageReport): Promise<void> {
  const outputDir = path.join(process.cwd(), 'data', 'programmes');
  await fs.mkdir(outputDir, { recursive: true });
  
  const reportPath = path.join(outputDir, '.coverage-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
}

/**
 * Validate coverage for onboarding institutions
 */
function validateCoverage(
  report: CoverageReport,
  onboardingInstitutions: Institution[]
): { isValid: boolean; failures: string[] } {
  const failures: string[] = [];
  
  for (const inst of onboardingInstitutions) {
    const instReport = report.institutions.find(i => i.id === inst.id);
    
    if (!instReport) {
      failures.push(inst.id);
      continue;
    }
    
    // Check if institution has BRIN code
    if (!instReport.hasBrin) {
      failures.push(inst.id);
      continue;
    }
    
    // Check if any level is missing (zero programmes)
    if (instReport.missingLevels.length > 0) {
      failures.push(inst.id);
    }
  }
  
  return {
    isValid: failures.length === 0,
    failures
  };
}

/**
 * Main sync function
 */
async function main(): Promise<void> {
  console.log('🚀 Starting DUO programme sync...');
  if (exportJson) {
    console.log('📦 JSON export enabled (--export-json flag)');
  }
  console.log('');
  
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    }
    
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
    
    // Resolve source URL for reporting (try HO first, fallback to Erkenningen)
    let sourceUrl = 'unknown';
    try {
      sourceUrl = await resolveDuoCsv('ho-opleidingsoverzicht', /opleidingsoverzicht/i);
    } catch (error) {
      try {
        sourceUrl = await resolveDuoErkenningenCsv();
      } catch (err) {
        console.warn('⚠️  Could not resolve source URL for reporting');
      }
    }
    
    // Ensure we have at least one data source
    if (!hoCsv && !erkCsv) {
      throw new Error('Failed to fetch both HO Opleidingsoverzicht and Erkenningen CSV files. Please check your internet connection and try again.');
    }
    
    // Parse and group CSV data once (before the loop for efficiency)
    let erkRowsByCode: Map<string, DuoRow[]> | null = null;
    let erkRowsByName: Map<string, DuoRow[]> | null = null;
    if (erkCsv) {
      console.log('');
      console.log('📄 Parsing Erkenningen CSV data...');
      const erkRows = parseCsv(erkCsv);
      const grouped = groupByInstitution(erkRows);
      erkRowsByCode = grouped.byCode;
      erkRowsByName = grouped.byName;
      
      // Debug: Show sample of BRIN codes found in CSV
      const sampleCodes = Array.from(erkRowsByCode.keys()).slice(0, 10);
      console.log(`   Sample BRIN codes in CSV: ${sampleCodes.join(', ')}`);
    }
    
    // Load our institutions (onboarding subset)
    const institutions = loadInstitutions();
    const allInstitutions = [...institutions.wo, ...institutions.wo_special, ...institutions.hbo];
    const onboardingInstitutions = allInstitutions; // All institutions in loadInstitutions are used in onboarding
    
    // Process each institution
    console.log('');
    console.log('📚 Processing institutions and upserting to database...');
    
    const coverageReport: CoverageReport = {
      syncedAt: new Date().toISOString(),
      sourceUrl,
      institutions: [],
      summary: {
        totalInstitutions: allInstitutions.length,
        onboardingInstitutions: onboardingInstitutions.length,
        completeInstitutions: 0,
        incompleteInstitutions: 0,
        totalProgrammes: 0
      },
      failures: []
    };
    
    for (const institution of allInstitutions) {
      const brinCode = getInstitutionBrinCode(institution.id);
      
      // Try HO Opleidingsoverzicht first (primary source)
      let programmes: ProgrammesByLevel = { bachelor: [], premaster: [], master: [] };
      let source = 'none';
      
      if (!brinCode) {
        console.log(`⏭️  Skipping ${institution.label} (no BRIN code)`);
        coverageReport.institutions.push({
          id: institution.id,
          slug: institution.id,
          brin: null,
          hasBrin: false,
          programmes: { bachelor: 0, premaster: 0, master: 0 },
          missingLevels: ['bachelor', 'premaster', 'master'],
          status: 'missing'
        });
        continue;
      }
      
      // Normalize BRIN code for matching (uppercase)
      const normalizedBrinCode = brinCode.toUpperCase().trim();
      
      if (hoCsv) {
        try {
          const sector = mapSector(brinCode);
          // Try both normalized and original BRIN code
          programmes = parseHoOpleidingsoverzicht(hoCsv, normalizedBrinCode, sector);
          if (programmes.bachelor.length === 0 && programmes.premaster.length === 0 && programmes.master.length === 0) {
            // Try original BRIN code if normalized didn't work
            programmes = parseHoOpleidingsoverzicht(hoCsv, brinCode, sector);
          }
          source = 'HO Opleidingsoverzicht';
        } catch (error) {
          console.warn(`⚠️  HO Opleidingsoverzicht failed for ${institution.label}: ${error}`);
        }
      }
      
      // If HO yields no programmes, try Erkenningen as fallback
      const totalFromHo = programmes.bachelor.length + programmes.premaster.length + programmes.master.length;
      if (totalFromHo === 0 && erkRowsByCode && erkRowsByName) {
        try {
          // Strategy 1: Try normalized BRIN code first
          let institutionRows = erkRowsByCode.get(normalizedBrinCode);
          
          // Strategy 2: Try original BRIN code (in case CSV uses different format)
          if (!institutionRows) {
            institutionRows = erkRowsByCode.get(brinCode);
          }
          
          // Strategy 3: Fallback to name-based matching
          if (!institutionRows) {
            const normalizedInstitutionName = normalizeInstitutionName(institution.label);
            institutionRows = erkRowsByName.get(normalizedInstitutionName);
            
            // Try partial matches if exact match fails
            if (!institutionRows) {
              for (const [name, rows] of erkRowsByName.entries()) {
                if (normalizedInstitutionName.includes(name) || name.includes(normalizedInstitutionName)) {
                  institutionRows = rows;
                  console.log(`   ℹ️  ${institution.label}: Matched by name "${name}"`);
                  break;
                }
              }
            }
          }
          
          if (institutionRows && institutionRows.length > 0) {
            programmes = processInstitutionProgrammes(
              institution.id,
              institution.label,
              institutionRows
            );
            source = 'Erkenningen (fallback)';
          } else {
            // Debug: show what BRIN codes are available for this institution
            const availableCodes = Array.from(erkRowsByCode.keys()).filter(code => 
              code.includes(brinCode.substring(0, 2)) || brinCode.includes(code.substring(0, 2))
            );
            if (availableCodes.length > 0) {
              console.log(`   ⚠️  ${institution.label}: BRIN ${brinCode} not found, but found similar codes: ${availableCodes.slice(0, 3).join(', ')}`);
            }
          }
        } catch (error) {
          console.warn(`⚠️  Erkenningen fallback failed for ${institution.label}: ${error}`);
        }
      }
      
      // Upsert to database
      const allProgrammes = [...programmes.bachelor, ...programmes.premaster, ...programmes.master];
      if (allProgrammes.length > 0) {
        try {
          await upsertProgrammesForInstitution(institution.id, allProgrammes);
        } catch (error) {
          console.error(`❌ Failed to upsert programmes for ${institution.label}:`, error);
          throw error;
        }
      }
      
      // Write JSON file if flag is set
      await writeProgrammeFile(institution.id, programmes);
      
      const total = programmes.bachelor.length + programmes.premaster.length + programmes.master.length;
      console.log(`📚 ${institution.label} → B:${programmes.bachelor.length} PM:${programmes.premaster.length} M:${programmes.master.length} (${total} total) [${source}]`);
      
      // Determine missing levels (for onboarding institutions)
      const missingLevels: DegreeLevel[] = [];
      if (programmes.bachelor.length === 0) missingLevels.push('bachelor');
      if (programmes.premaster.length === 0) missingLevels.push('premaster');
      if (programmes.master.length === 0) missingLevels.push('master');
      
      const status = total === 0 ? 'missing' : missingLevels.length === 0 ? 'complete' : 'incomplete';
      
      coverageReport.institutions.push({
        id: institution.id,
        slug: institution.id,
        brin: brinCode,
        hasBrin: true,
        programmes: {
          bachelor: programmes.bachelor.length,
          premaster: programmes.premaster.length,
          master: programmes.master.length
        },
        missingLevels,
        status
      });
      
      // Update summary
      coverageReport.summary.totalProgrammes += total;
      if (status === 'complete') {
        coverageReport.summary.completeInstitutions++;
      } else if (status === 'incomplete' || status === 'missing') {
        coverageReport.summary.incompleteInstitutions++;
      }
    }
    
    // Validate coverage for onboarding institutions
    console.log('');
    console.log('🔍 Validating coverage for onboarding institutions...');
    const coverageValidation = validateCoverage(coverageReport, onboardingInstitutions);
    
    if (!coverageValidation.isValid) {
      coverageReport.failures = coverageValidation.failures;
      console.error('');
      console.error('❌ Coverage validation failed!');
      console.error(`   ${coverageValidation.failures.length} onboarding institution(s) lack complete programme data:`);
      coverageValidation.failures.forEach(id => {
        const inst = onboardingInstitutions.find(i => i.id === id);
        const report = coverageReport.institutions.find(i => i.id === id);
        console.error(`   - ${inst?.label || id}: ${report?.missingLevels.join(', ') || 'missing BRIN'}`);
      });
    } else {
      console.log('✅ All onboarding institutions have complete programme data');
    }
    
    // Write coverage report
    await writeCoverageReport(coverageReport);
    
    console.log('');
    console.log('📊 Sync Statistics:');
    console.log(`   Total programmes: ${coverageReport.summary.totalProgrammes.toLocaleString()}`);
    console.log(`   Institutions processed: ${coverageReport.institutions.length}`);
    console.log(`   Complete institutions: ${coverageReport.summary.completeInstitutions}`);
    console.log(`   Incomplete institutions: ${coverageReport.summary.incompleteInstitutions}`);
    console.log(`   Onboarding institutions: ${coverageReport.summary.onboardingInstitutions}`);
    console.log(`   Synced at: ${coverageReport.syncedAt}`);
    console.log('');
    console.log('🔍 Classification Counters:');
    console.log(`   Kept Bachelor: ${counters.keptBachelor.toLocaleString()}`);
    console.log(`   Kept Pre-master: ${counters.keptPremaster.toLocaleString()}`);
    console.log(`   Kept Master: ${counters.keptMaster.toLocaleString()}`);
    console.log(`   Skipped Other: ${counters.skippedOther.toLocaleString()}`);
    
    console.log('');
    if (coverageValidation.isValid) {
      console.log('✅ Programme sync completed successfully!');
      
      // Optionally run enrichment
      if (runEnrichment) {
        console.log('');
        console.log('🔗 Running enrichment...');
        try {
          const { enrichProgrammes } = await import('./enrich-programmes');
          await enrichProgrammes();
        } catch (error) {
          console.error('❌ Enrichment failed:', error);
          // Don't fail the sync if enrichment fails
          console.warn('⚠️  Continuing despite enrichment failure');
        }
      }
    } else {
      console.error('❌ Programme sync completed with coverage failures!');
      process.exit(1);
    }
    
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
