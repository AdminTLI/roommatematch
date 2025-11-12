#!/usr/bin/env tsx

/**
 * Regenerate Programme Coverage Report
 * 
 * Regenerates the coverage report using the coverage monitor (which respects the whitelist).
 * This script reads from the database and writes an updated coverage report.
 * 
 * Usage:
 *   pnpm tsx scripts/regenerate-coverage-report.ts
 * 
 * Environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (required for DB reads)
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';
import { loadInstitutions } from '@/lib/loadInstitutions';
import { getInstitutionBrinCode } from '@/lib/duo/erkenningen';
import { readFileSync } from 'fs';
import type { DegreeLevel } from '@/types/programme';

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
  failures: string[];
}

/**
 * Load programme coverage whitelist from config file
 */
function loadCoverageWhitelist(): Map<string, Set<DegreeLevel>> {
  try {
    const whitelistPath = join(process.cwd(), 'config', 'programme-coverage-whitelist.json');
    const whitelistData = JSON.parse(readFileSync(whitelistPath, 'utf-8'));
    const whitelistMap = new Map<string, Set<DegreeLevel>>();
    
    if (whitelistData.institutions) {
      for (const [institutionId, config] of Object.entries(whitelistData.institutions) as [string, any][]) {
        if (config.allowedMissingLevels && Array.isArray(config.allowedMissingLevels)) {
          whitelistMap.set(institutionId, new Set(config.allowedMissingLevels));
        }
      }
    }
    
    return whitelistMap;
  } catch (error) {
    console.warn('⚠️  Failed to load coverage whitelist, continuing without whitelist:', error);
    return new Map();
  }
}

async function getProgrammeCountsByInstitution(): Promise<Record<string, { bachelor: number; premaster: number; master: number }>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('programs')
    .select('university_id, degree_level')
    .eq('active', true);

  if (error) {
    throw new Error(`Failed to fetch programme counts: ${error.message}`);
  }

  const counts: Record<string, { bachelor: number; premaster: number; master: number }> = {};

  for (const row of data || []) {
    const universityId = row.university_id;
    const level = row.degree_level as 'bachelor' | 'premaster' | 'master';

    if (!counts[universityId]) {
      counts[universityId] = { bachelor: 0, premaster: 0, master: 0 };
    }

    if (level === 'bachelor' || level === 'premaster' || level === 'master') {
      counts[universityId][level]++;
    }
  }

  return counts;
}

async function main(): Promise<void> {
  console.log('🔄 Regenerating programme coverage report...');
  console.log('');

  try {
    // Load institutions and whitelist
    const institutions = loadInstitutions();
    const allInstitutions = [...institutions.wo, ...institutions.wo_special, ...institutions.hbo];
    const whitelist = loadCoverageWhitelist();
    
    // Get programme counts from database
    const countsByInstitution = await getProgrammeCountsByInstitution();
    
    const coverageInstitutions: Array<{
      id: string;
      slug: string;
      brin: string | null;
      hasBrin: boolean;
      programmes: { bachelor: number; premaster: number; master: number };
      missingLevels: DegreeLevel[];
      status: 'complete' | 'incomplete' | 'missing';
    }> = [];
    
    let completeCount = 0;
    let incompleteCount = 0;
    let missingCount = 0;
    let totalProgrammes = 0;

    // Check each onboarding institution
    for (const institution of allInstitutions) {
      const brinCode = getInstitutionBrinCode(institution.id);
      const counts = countsByInstitution[institution.id] || { bachelor: 0, premaster: 0, master: 0 };

      const missingLevels: DegreeLevel[] = [];
      if (counts.bachelor === 0) missingLevels.push('bachelor');
      if (counts.premaster === 0) missingLevels.push('premaster');
      if (counts.master === 0) missingLevels.push('master');

      // Check whitelist: remove missing levels that are allowed for this institution
      const allowedMissing = whitelist.get(institution.id);
      const actualMissingLevels = allowedMissing
        ? missingLevels.filter(level => !allowedMissing.has(level))
        : missingLevels;

      const total = counts.bachelor + counts.premaster + counts.master;
      // Status calculation: if all missing levels are whitelisted, treat as complete
      const status = !brinCode ? 'missing' : total === 0 ? 'missing' : actualMissingLevels.length === 0 ? 'complete' : 'incomplete';

      coverageInstitutions.push({
        id: institution.id,
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
    
    // Create coverage report
    const report = {
      totalInstitutions: allInstitutions.length,
      completeInstitutions: completeCount,
      incompleteInstitutions: incompleteCount,
      missingInstitutions: missingCount,
      totalProgrammes,
      institutions: coverageInstitutions,
      generatedAt: new Date().toISOString()
    };
    
    // Convert to the format expected by the coverage report file
    const coverageReport: CoverageReport = {
      syncedAt: report.generatedAt,
      sourceUrl: 'database',
      institutions: report.institutions.map(inst => ({
        id: inst.id,
        slug: inst.slug,
        brin: inst.brin,
        hasBrin: inst.hasBrin,
        programmes: inst.programmes,
        missingLevels: inst.missingLevels,
        status: inst.status
      })),
      summary: {
        totalInstitutions: report.totalInstitutions,
        onboardingInstitutions: report.totalInstitutions,
        completeInstitutions: report.completeInstitutions,
        incompleteInstitutions: report.incompleteInstitutions,
        totalProgrammes: report.totalProgrammes
      },
      failures: report.institutions
        .filter(inst => inst.status === 'incomplete' || inst.status === 'missing')
        .map(inst => inst.id)
    };

    // Write coverage report
    const outputDir = join(process.cwd(), 'data', 'programmes');
    const reportPath = join(outputDir, '.coverage-report.json');
    writeFileSync(reportPath, JSON.stringify(coverageReport, null, 2), 'utf8');

    console.log('✅ Coverage report regenerated');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Total institutions: ${coverageReport.summary.totalInstitutions}`);
    console.log(`   Complete: ${coverageReport.summary.completeInstitutions}`);
    console.log(`   Incomplete: ${coverageReport.summary.incompleteInstitutions}`);
    console.log(`   Missing: ${coverageReport.summary.totalInstitutions - coverageReport.summary.completeInstitutions - coverageReport.summary.incompleteInstitutions}`);
    console.log(`   Total programmes: ${coverageReport.summary.totalProgrammes.toLocaleString()}`);
    console.log(`   Failures: ${coverageReport.failures.length}`);
    
    if (coverageReport.failures.length > 0) {
      console.log('');
      console.log('⚠️  Incomplete/Missing institutions:');
      coverageReport.failures.forEach(id => {
        const inst = coverageReport.institutions.find(i => i.id === id);
        if (inst) {
          console.log(`   - ${id}: ${inst.missingLevels.join(', ')}`);
        }
      });
    }
    
    console.log('');
    console.log(`📄 Report saved to: ${reportPath}`);
  } catch (error) {
    console.error('❌ Failed to regenerate coverage report:', error);
    process.exit(1);
  }
}

main();

