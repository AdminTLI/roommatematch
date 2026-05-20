#!/usr/bin/env tsx

/**
 * Programme Coverage Report Script
 * 
 * Queries the programmes table and generates a coverage report comparing
 * against onboarding institutions to identify gaps.
 * 
 * Usage:
 *   pnpm tsx scripts/report-programme-coverage.ts
 * 
 * Environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY - Supabase anon key (or SUPABASE_SERVICE_ROLE_KEY)
 * 
 * Exit codes:
 *   0 - All onboarding institutions have complete data
 *   1 - One or more onboarding institutions lack data
 */

import { loadInstitutions } from '@/lib/loadInstitutions';
import { getInstitutionBrinCode } from '@/lib/duo/erkenningen';
import { getProgrammeCountsByInstitution } from '@/lib/programmes/repo';
import type { Institution } from '@/types/institution';
import type { DegreeLevel } from '@/types/programme';
import { readFileSync } from 'fs';
import { join } from 'path';

function getMissingDegreeLevels(counts: {
  bachelor: number;
  premaster: number;
  master: number;
}): DegreeLevel[] {
  const missingLevels: DegreeLevel[] = [];
  if (counts.bachelor === 0) missingLevels.push('bachelor');
  if (counts.master === 0) missingLevels.push('master');
  if (counts.premaster === 0 && counts.master === 0 && counts.bachelor > 0) {
    missingLevels.push('premaster');
  }
  return missingLevels;
}

function loadCoverageWhitelist(): Map<string, Set<DegreeLevel>> {
  try {
    const whitelistPath = join(process.cwd(), 'config', 'programme-coverage-whitelist.json');
    const whitelistData = JSON.parse(readFileSync(whitelistPath, 'utf-8'));
    const whitelistMap = new Map<string, Set<DegreeLevel>>();
    if (whitelistData.institutions) {
      for (const [institutionId, config] of Object.entries(whitelistData.institutions) as [string, { allowedMissingLevels?: DegreeLevel[] }][]) {
        if (config.allowedMissingLevels?.length) {
          whitelistMap.set(institutionId, new Set(config.allowedMissingLevels));
        }
      }
    }
    return whitelistMap;
  } catch {
    return new Map();
  }
}

interface InstitutionCoverage {
  id: string;
  label: string;
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
}

/**
 * Main report function
 */
async function main(): Promise<void> {
  console.log('📊 Generating programme coverage report...');
  console.log('');
  
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL must be set');
    }
    
    // Load onboarding institutions
    const institutions = loadInstitutions();
    const allInstitutions = [...institutions.wo, ...institutions.wo_special, ...institutions.hbo];
    const whitelist = loadCoverageWhitelist();

    // Get programme counts from database
    console.log('🔍 Querying programmes table...');
    const countsByInstitution = await getProgrammeCountsByInstitution(true);
    
    const coverage: InstitutionCoverage[] = [];
    let completeCount = 0;
    let incompleteCount = 0;
    let missingCount = 0;
    let totalProgrammes = 0;
    
    // Check each onboarding institution
    for (const institution of allInstitutions) {
      const brinCode = getInstitutionBrinCode(institution.id);
      const counts = countsByInstitution[institution.id] || { bachelor: 0, premaster: 0, master: 0 };
      
      const missingLevels = getMissingDegreeLevels(counts);
      const allowedMissing = whitelist.get(institution.id);
      const actualMissingLevels = allowedMissing
        ? missingLevels.filter(level => !allowedMissing.has(level))
        : missingLevels;

      const total = counts.bachelor + counts.premaster + counts.master;
      const status = !brinCode ? 'missing' : total === 0 ? 'missing' : actualMissingLevels.length === 0 ? 'complete' : 'incomplete';
      
      coverage.push({
        id: institution.id,
        label: institution.label,
        slug: institution.id,
        brin: brinCode || null,
        hasBrin: !!brinCode,
        programmes: counts,
        missingLevels: actualMissingLevels,
        status
      });
      
      if (status === 'complete') completeCount++;
      else if (status === 'incomplete') incompleteCount++;
      else missingCount++;
      
      totalProgrammes += total;
    }
    
    // Print report
    console.log('📋 Coverage Report');
    console.log('═'.repeat(80));
    console.log('');
    
    // Summary
    console.log('Summary:');
    console.log(`   Total onboarding institutions: ${allInstitutions.length}`);
    console.log(`   Complete: ${completeCount}`);
    console.log(`   Incomplete: ${incompleteCount}`);
    console.log(`   Missing: ${missingCount}`);
    console.log(`   Total programmes: ${totalProgrammes.toLocaleString()}`);
    console.log('');
    
    // Detailed breakdown
    console.log('Institution Details:');
    console.log('');
    
    for (const inst of coverage) {
      const statusIcon = inst.status === 'complete' ? '✅' : inst.status === 'incomplete' ? '⚠️' : '❌';
      console.log(`${statusIcon} ${inst.label} (${inst.id})`);
      
      if (!inst.hasBrin) {
        console.log(`   ❌ No BRIN code mapped`);
      } else {
        console.log(`   BRIN: ${inst.brin}`);
        console.log(`   Programmes: B:${inst.programmes.bachelor} PM:${inst.programmes.premaster} M:${inst.programmes.master}`);
        
        if (inst.missingLevels.length > 0) {
          console.log(`   ⚠️  Missing levels: ${inst.missingLevels.join(', ')}`);
        }
      }
      console.log('');
    }
    
    // Failures section
    const failures = coverage.filter(c => c.status !== 'complete');
    if (failures.length > 0) {
      console.log('⚠️  Institutions with incomplete data:');
      failures.forEach(f => {
        console.log(`   - ${f.label} (${f.id}): ${f.missingLevels.length > 0 ? `Missing ${f.missingLevels.join(', ')}` : 'No BRIN or no programmes'}`);
      });
      console.log('');
    }
    
    // Exit with error code if there are failures
    if (failures.length > 0) {
      console.error(`❌ Coverage check failed: ${failures.length} institution(s) lack complete programme data`);
      process.exit(1);
    } else {
      console.log('✅ All onboarding institutions have complete programme data');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('');
    console.error('❌ Report generation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as reportProgrammeCoverage };








