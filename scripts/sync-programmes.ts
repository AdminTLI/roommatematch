#!/usr/bin/env tsx

/**
 * Programme Sync Orchestrator
 * 
 * Syncs programme data from Studiekeuzedatabase (SKDB) as the primary and only source.
 * 
 * Usage:
 *   pnpm tsx scripts/sync-programmes.ts [--export-json]
 * 
 * Environment variables:
 *   See sync-skdb-programmes.ts for required variables
 * 
 * Note: DUO sync has been removed. All programmes are now sourced exclusively from SKDB.
 */

import { syncSkdbProgrammes } from './sync-skdb-programmes';
import fs from 'node:fs/promises';
import path from 'node:path';
import { readFileSync, existsSync } from 'fs';

// Parse command line arguments
const exportJson = process.argv.includes('--export-json');

/**
 * Load SKDB sync report
 */
async function loadSkdbReport(): Promise<any> {
  const reportsDir = path.join(process.cwd(), 'data', 'programmes');
  const skdbReportPath = path.join(reportsDir, '.skdb-sync-report.json');
  
  if (existsSync(skdbReportPath)) {
    try {
      const content = readFileSync(skdbReportPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn('⚠️  Failed to load SKDB sync report:', error);
    }
  }
  
  return null;
}

/**
 * Generate SKDB sync report summary
 */
async function generateReportSummary(): Promise<void> {
  console.log('');
  console.log('📊 Generating sync report summary...');
  
  const report = await loadSkdbReport();
  const reportsDir = path.join(process.cwd(), 'data', 'programmes');
  await fs.mkdir(reportsDir, { recursive: true });
  
  if (report) {
    console.log('✅ SKDB sync report summary:');
    console.log(`   Total SKDB programmes: ${report.summary?.totalSkdbProgrammes?.toLocaleString() || 0}`);
    console.log(`   Matched: ${report.summary?.matched?.toLocaleString() || 0}`);
    console.log(`   Updated: ${report.summary?.enriched?.toLocaleString() || 0}`);
    console.log(`   Created: ${report.summary?.skdbOnly?.toLocaleString() || 0}`);
    console.log(`   Failed: ${report.summary?.failed?.toLocaleString() || 0}`);
    console.log(`   Not found: ${report.summary?.notFound?.toLocaleString() || 0}`);
    console.log('');
  } else {
    console.log('⚠️  No SKDB sync report found');
    console.log('');
  }
}

/**
 * Main sync function
 */
async function main(): Promise<void> {
  console.log('🚀 Starting SKDB programme sync...');
  console.log('');
  
  try {
    // Sync SKDB programmes (primary and only source)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Syncing programmes from Studiekeuzedatabase');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    
    await syncSkdbProgrammes();
    
    console.log('');
    console.log('✅ SKDB sync completed');
    console.log('');
    
    // Generate report summary
    await generateReportSummary();
    
    console.log('✅ Programme sync completed successfully!');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ Programme sync failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as syncProgrammes };

