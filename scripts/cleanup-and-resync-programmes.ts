#!/usr/bin/env tsx

/**
 * Comprehensive Programme Cleanup and Re-sync Script
 * 
 * This script:
 * 1. Removes ALL programmes from the database (clean slate)
 * 2. Re-syncs ALL programmes from SKDB
 * 3. Verifies the results
 * 
 * Usage:
 *   pnpm tsx scripts/cleanup-and-resync-programmes.ts
 * 
 * WARNING: This will delete ALL existing programmes and re-sync from SKDB!
 */

import { createAdminClient } from '@/lib/supabase/server';
import { syncSkdbProgrammes } from './sync-skdb-programmes';
import path from 'path';
import { readFileSync, existsSync } from 'fs';

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

const supabase = createAdminClient();

/**
 * Get current programme statistics
 */
async function getCurrentStats() {
  // Get count first
  const { count: totalCount, error: countError } = await supabase
    .from('programmes')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    throw new Error(`Failed to count programmes: ${countError.message}`);
  }
  
  const total = totalCount || 0;
  
  // Get all programmes (with pagination if needed)
  let allProgrammes: any[] = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const { data: programmes, error } = await supabase
      .from('programmes')
      .select('id, institution_slug, level, sources, skdb_only, rio_code, croho_code')
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (error) {
      throw new Error(`Failed to fetch programmes: ${error.message}`);
    }
    
    if (programmes && programmes.length > 0) {
      allProgrammes = [...allProgrammes, ...programmes];
      hasMore = programmes.length === pageSize;
      page++;
    } else {
      hasMore = false;
    }
  }
  
  const withDuo = allProgrammes.filter(p => p.sources?.duo === true || p.sources?.duo === 'true').length;
  const withSkdb = allProgrammes.filter(p => p.sources?.skdb === true || p.sources?.skdb === 'true').length;
  const skdbOnly = allProgrammes.filter(p => p.skdb_only === true).length;
  const withRioCode = allProgrammes.filter(p => p.rio_code !== null).length;
  const withCrohoCode = allProgrammes.filter(p => p.croho_code !== null).length;
  
  return {
    total,
    withDuo,
    withSkdb,
    skdbOnly,
    withRioCode,
    withCrohoCode,
    programmes: allProgrammes
  };
}

/**
 * Delete ALL programmes from database
 */
async function deleteAllProgrammes() {
  console.log('🗑️  Deleting ALL programmes from database...');
  
  // Fetch all programme IDs first
  const { data: allIds, error: fetchError } = await supabase
    .from('programmes')
    .select('id');
  
  if (fetchError) {
    throw new Error(`Failed to fetch programme IDs: ${fetchError.message}`);
  }
  
  if (!allIds || allIds.length === 0) {
    console.log('   No programmes to delete');
    return;
  }
  
  console.log(`   Found ${allIds.length} programmes to delete`);
  
  // Delete in smaller batches to avoid issues
  const batchSize = 100;
  let deleted = 0;
  
  for (let i = 0; i < allIds.length; i += batchSize) {
    const batch = allIds.slice(i, i + batchSize);
    const ids = batch.map(p => p.id);
    
    // Delete one by one if batch delete fails
    let batchDeleted = 0;
    const { error: batchError } = await supabase
      .from('programmes')
      .delete()
      .in('id', ids);
    
    if (batchError) {
      // If batch delete fails, try individual deletes
      console.log(`   Batch delete failed, trying individual deletes for batch ${Math.floor(i/batchSize) + 1}...`);
      for (const id of ids) {
        const { error: singleError } = await supabase
          .from('programmes')
          .delete()
          .eq('id', id);
        
        if (singleError) {
          console.warn(`   Warning: Failed to delete programme ${id}: ${singleError.message}`);
        } else {
          batchDeleted++;
        }
      }
    } else {
      batchDeleted = batch.length;
    }
    
    deleted += batchDeleted;
    if ((i + batchSize) % 500 === 0 || i + batchSize >= allIds.length) {
      console.log(`   Deleted ${deleted}/${allIds.length} programmes...`);
    }
  }
  
  console.log(`✅ Deleted ${deleted} programmes`);
}

/**
 * Verify SKDB sync results
 */
async function verifyResults() {
  console.log('');
  console.log('🔍 Verifying sync results...');
  
  const stats = await getCurrentStats();
  
  console.log('');
  console.log('📊 Final Statistics:');
  console.log(`   Total programmes: ${stats.total.toLocaleString()}`);
  console.log(`   With SKDB source: ${stats.withSkdb.toLocaleString()}`);
  console.log(`   SKDB-only flag: ${stats.skdbOnly.toLocaleString()}`);
  console.log(`   With CROHO code: ${stats.withCrohoCode.toLocaleString()}`);
  console.log(`   With RIO code: ${stats.withRioCode.toLocaleString()}`);
  console.log(`   With DUO source: ${stats.withDuo.toLocaleString()} (should be 0)`);
  console.log('');
  
  // Check for any remaining DUO data
  if (stats.withDuo > 0) {
    console.error('❌ WARNING: Found programmes with DUO source!');
    const duoProgrammes = stats.programmes.filter(p => p.sources?.duo === true || p.sources?.duo === 'true');
    console.error(`   Found ${duoProgrammes.length} programmes with DUO source`);
    console.error('   Sample programmes:', duoProgrammes.slice(0, 5).map(p => ({
      id: p.id,
      institution: p.institution_slug,
      level: p.level,
      sources: p.sources
    })));
  }
  
  // Check by institution
  const byInstitution = new Map<string, number>();
  for (const prog of stats.programmes) {
    const count = byInstitution.get(prog.institution_slug) || 0;
    byInstitution.set(prog.institution_slug, count + 1);
  }
  
  console.log('📚 Programmes by Institution (top 20):');
  const sorted = Array.from(byInstitution.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  
  for (const [institution, count] of sorted) {
    console.log(`   ${institution}: ${count.toLocaleString()}`);
  }
  
  console.log('');
  
  // Verify all programmes are SKDB-only
  if (stats.total > 0 && stats.withSkdb === stats.total && stats.skdbOnly === stats.total && stats.withDuo === 0) {
    console.log('✅ Verification PASSED: All programmes are SKDB-only');
    return true;
  } else {
    console.error('❌ Verification FAILED: Not all programmes are SKDB-only');
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting comprehensive programme cleanup and re-sync...');
  console.log('');
  
  try {
    // Step 1: Check current state
    console.log('📊 Step 1: Checking current database state...');
    const beforeStats = await getCurrentStats();
    console.log(`   Current programmes: ${beforeStats.total.toLocaleString()}`);
    console.log(`   With DUO source: ${beforeStats.withDuo.toLocaleString()}`);
    console.log(`   With SKDB source: ${beforeStats.withSkdb.toLocaleString()}`);
    console.log('');
    
    // Step 2: Delete all programmes
    console.log('🗑️  Step 2: Deleting all existing programmes...');
    await deleteAllProgrammes();
    console.log('');
    
    // Step 3: Verify deletion
    const afterDeleteStats = await getCurrentStats();
    if (afterDeleteStats.total > 0) {
      console.log(`⚠️  Warning: ${afterDeleteStats.total} programmes still remain after deletion.`);
      console.log('   This might be due to foreign key constraints or RLS policies.');
      console.log('   Attempting to delete remaining programmes...');
      
      // Try to delete remaining programmes
      const remainingIds = afterDeleteStats.programmes.map(p => p.id);
      for (const id of remainingIds) {
        const { error } = await supabase
          .from('programmes')
          .delete()
          .eq('id', id);
        if (error) {
          console.warn(`   Could not delete programme ${id}: ${error.message}`);
        }
      }
      
      // Check again
      const finalStats = await getCurrentStats();
      if (finalStats.total > 0) {
        console.log(`⚠️  ${finalStats.total} programmes could not be deleted.`);
        console.log('   These may have foreign key constraints. Proceeding with sync anyway...');
        console.log('   The sync will update existing programmes and add new ones.');
      } else {
        console.log('✅ All remaining programmes deleted');
      }
    } else {
      console.log('✅ All programmes deleted successfully');
    }
    console.log('');
    
    // Step 4: Run SKDB sync
    console.log('🔄 Step 3: Running SKDB sync...');
    console.log('');
    await syncSkdbProgrammes();
    console.log('');
    
    // Step 5: Verify results
    console.log('✅ Step 4: Verifying results...');
    const success = await verifyResults();
    
    if (success) {
      console.log('');
      console.log('🎉 Cleanup and re-sync completed successfully!');
      console.log('');
      console.log('All programmes are now sourced exclusively from SKDB.');
    } else {
      console.error('');
      console.error('⚠️  Cleanup completed but verification found issues.');
      console.error('Please review the statistics above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('');
    console.error('❌ Cleanup and re-sync failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as cleanupAndResyncProgrammes };

