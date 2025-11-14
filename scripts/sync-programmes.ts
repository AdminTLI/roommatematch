#!/usr/bin/env tsx

/**
 * Programme Sync Orchestrator
 * 
 * Orchestrates the complete programme sync process:
 * 1. Sync DUO programmes (baseline)
 * 2. Sync SKDB programmes (enrichment)
 * 3. Generate combined coverage report
 * 
 * Usage:
 *   pnpm tsx scripts/sync-programmes.ts [--skip-duo] [--skip-skdb] [--export-json]
 * 
 * Environment variables:
 *   See sync-duo-programmes.ts and sync-skdb-programmes.ts for required variables
 */

import { syncDuoProgrammes } from './sync-duo-programmes';
import { syncSkdbProgrammes } from './sync-skdb-programmes';
import fs from 'node:fs/promises';
import path from 'node:path';
import { readFileSync, existsSync } from 'fs';

// Parse command line arguments
const skipDuo = process.argv.includes('--skip-duo');
const skipSkdb = process.argv.includes('--skip-skdb');
const exportJson = process.argv.includes('--export-json');

/**
 * Load and merge coverage reports
 */
async function loadCoverageReports(): Promise<{
  duo?: any;
  skdb?: any;
}> {
  const reportsDir = path.join(process.cwd(), 'data', 'programmes');
  const duoReportPath = path.join(reportsDir, '.coverage-report.json');
  const skdbReportPath = path.join(reportsDir, '.skdb-sync-report.json');
  
  const reports: { duo?: any; skdb?: any } = {};
  
  if (existsSync(duoReportPath)) {
    try {
      const content = readFileSync(duoReportPath, 'utf-8');
      reports.duo = JSON.parse(content);
    } catch (error) {
      console.warn('⚠️  Failed to load DUO coverage report:', error);
    }
  }
  
  if (existsSync(skdbReportPath)) {
    try {
      const content = readFileSync(skdbReportPath, 'utf-8');
      reports.skdb = JSON.parse(content);
    } catch (error) {
      console.warn('⚠️  Failed to load SKDB sync report:', error);
    }
  }
  
  return reports;
}

/**
 * Generate combined coverage report
 */
async function generateCombinedReport(): Promise<void> {
  console.log('');
  console.log('📊 Generating combined coverage report...');
  
  const reports = await loadCoverageReports();
  const reportsDir = path.join(process.cwd(), 'data', 'programmes');
  await fs.mkdir(reportsDir, { recursive: true });
  
  // Combine reports
  const combined = {
    generatedAt: new Date().toISOString(),
    duo: reports.duo || null,
    skdb: reports.skdb || null,
    summary: {
      totalInstitutions: reports.duo?.summary?.totalInstitutions || 0,
      completeInstitutions: reports.duo?.summary?.completeInstitutions || 0,
      incompleteInstitutions: reports.duo?.summary?.incompleteInstitutions || 0,
      totalDuoProgrammes: reports.duo?.summary?.totalProgrammes || 0,
      totalSkdbProgrammes: reports.skdb?.summary?.totalSkdbProgrammes || 0,
      enrichedProgrammes: reports.skdb?.summary?.enriched || 0,
      skdbOnlyProgrammes: reports.skdb?.summary?.skdbOnly || 0,
      discrepancies: reports.skdb?.discrepancies?.length || 0
    }
  };
  
  const reportPath = path.join(reportsDir, '.combined-coverage-report.json');
  await fs.writeFile(reportPath, JSON.stringify(combined, null, 2), 'utf8');
  
  console.log('✅ Combined coverage report written to .combined-coverage-report.json');
  console.log('');
  console.log('📊 Combined Summary:');
  console.log(`   Total institutions: ${combined.summary.totalInstitutions}`);
  console.log(`   Complete institutions: ${combined.summary.completeInstitutions}`);
  console.log(`   Incomplete institutions: ${combined.summary.incompleteInstitutions}`);
  console.log(`   DUO programmes: ${combined.summary.totalDuoProgrammes.toLocaleString()}`);
  console.log(`   SKDB programmes: ${combined.summary.totalSkdbProgrammes.toLocaleString()}`);
  console.log(`   Enriched programmes: ${combined.summary.enrichedProgrammes.toLocaleString()}`);
  console.log(`   SKDB-only programmes: ${combined.summary.skdbOnlyProgrammes.toLocaleString()}`);
  console.log(`   Discrepancies: ${combined.summary.discrepancies}`);
  console.log('');
}

/**
 * Main orchestrator function
 */
async function main(): Promise<void> {
  console.log('🚀 Starting programme sync orchestrator...');
  console.log('');
  
  try {
    // Step 1: Sync DUO programmes (baseline)
    if (!skipDuo) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Step 1: Syncing DUO programmes (baseline)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      
      await syncDuoProgrammes();
      
      console.log('');
      console.log('✅ DUO sync completed');
      console.log('');
    } else {
      console.log('⏭️  Skipping DUO sync (--skip-duo flag)');
      console.log('');
    }
    
    // Step 2: Sync SKDB programmes (enrichment)
    if (!skipSkdb) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Step 2: Syncing SKDB programmes (enrichment)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      
      await syncSkdbProgrammes();
      
      console.log('');
      console.log('✅ SKDB sync completed');
      console.log('');
    } else {
      console.log('⏭️  Skipping SKDB sync (--skip-skdb flag)');
      console.log('');
    }
    
    // Step 3: Generate combined coverage report
    await generateCombinedReport();
    
    console.log('✅ Programme sync orchestrator completed successfully!');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ Programme sync orchestrator failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as syncProgrammes };

