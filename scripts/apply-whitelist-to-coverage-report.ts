#!/usr/bin/env tsx

/**
 * Apply Whitelist to Existing Coverage Report
 * 
 * Reads the existing coverage report and applies the whitelist logic,
 * then writes it back. This doesn't require database access.
 * 
 * Usage:
 *   pnpm tsx scripts/apply-whitelist-to-coverage-report.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
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

function main(): void {
  console.log('🔄 Applying whitelist to coverage report...');
  console.log('');

  try {
    // Load whitelist
    const whitelist = loadCoverageWhitelist();
    console.log(`✅ Loaded whitelist for ${whitelist.size} institutions`);
    
    // Read existing coverage report
    const reportPath = join(process.cwd(), 'data', 'programmes', '.coverage-report.json');
    const report: CoverageReport = JSON.parse(readFileSync(reportPath, 'utf-8'));
    
    console.log(`📄 Read coverage report with ${report.institutions.length} institutions`);
    console.log(`   Before: ${report.summary.completeInstitutions} complete, ${report.summary.incompleteInstitutions} incomplete`);
    
    // Apply whitelist to each institution
    let completeCount = 0;
    let incompleteCount = 0;
    let missingCount = 0;
    const failures: string[] = [];
    
    for (const inst of report.institutions) {
      // Apply whitelist: remove missing levels that are allowed for this institution
      const allowedMissing = whitelist.get(inst.id);
      const actualMissingLevels = allowedMissing
        ? inst.missingLevels.filter(level => !allowedMissing.has(level))
        : inst.missingLevels;
      
      // Update missing levels
      inst.missingLevels = actualMissingLevels;
      
      // Recalculate status: if all missing levels are whitelisted, treat as complete
      const total = inst.programmes.bachelor + inst.programmes.premaster + inst.programmes.master;
      const newStatus = !inst.hasBrin ? 'missing' : total === 0 ? 'missing' : actualMissingLevels.length === 0 ? 'complete' : 'incomplete';
      
      // Only update status if it changed
      if (inst.status !== newStatus) {
        console.log(`   📝 ${inst.id}: ${inst.status} → ${newStatus} (whitelisted: ${inst.missingLevels.length !== actualMissingLevels.length ? 'yes' : 'no'})`);
        inst.status = newStatus;
      }
      
      // Update counts
      if (inst.status === 'complete') completeCount++;
      else if (inst.status === 'incomplete') incompleteCount++;
      else missingCount++;
      
      // Update failures list
      if (inst.status === 'incomplete' || inst.status === 'missing') {
        failures.push(inst.id);
      }
    }
    
    // Update summary
    report.summary.completeInstitutions = completeCount;
    report.summary.incompleteInstitutions = incompleteCount;
    report.failures = failures;
    
    // Write updated report
    writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    
    console.log('');
    console.log('✅ Coverage report updated');
    console.log(`   After: ${completeCount} complete, ${incompleteCount} incomplete, ${missingCount} missing`);
    console.log(`   Failures: ${failures.length}`);
    console.log(`📄 Report saved to: ${reportPath}`);
    
    if (failures.length > 0) {
      console.log('');
      console.log('⚠️  Remaining incomplete/missing institutions:');
      failures.slice(0, 10).forEach(id => {
        const inst = report.institutions.find(i => i.id === id);
        if (inst) {
          console.log(`   - ${id}: ${inst.missingLevels.join(', ') || 'no programmes'}`);
        }
      });
      if (failures.length > 10) {
        console.log(`   ... and ${failures.length - 10} more`);
      }
    }
  } catch (error) {
    console.error('❌ Failed to apply whitelist:', error);
    process.exit(1);
  }
}

main();

