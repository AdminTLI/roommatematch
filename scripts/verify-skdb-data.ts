#!/usr/bin/env tsx

/**
 * Verify SKDB Data Quality
 * 
 * Quick script to check SKDB enrichment coverage and data quality
 */

import { createAdminClient } from '@/lib/supabase/server';

async function main() {
  const supabase = createAdminClient();
  
  console.log('🔍 Verifying SKDB data quality...\n');
  
  // Check overall statistics
  const { data: allProgrammes, error: allError } = await supabase
    .from('programmes')
    .select('institution_slug, sources, skdb_only, ects_credits, duration_years, croho_code, language_codes');
  
  if (allError) {
    console.error('❌ Error fetching programmes:', allError);
    process.exit(1);
  }
  
  const total = allProgrammes?.length || 0;
  const withSkdb = allProgrammes?.filter(p => p.sources?.skdb === true).length || 0;
  const skdbOnly = allProgrammes?.filter(p => p.skdb_only === true).length || 0;
  const withEcts = allProgrammes?.filter(p => p.ects_credits !== null).length || 0;
  const withDuration = allProgrammes?.filter(p => p.duration_years !== null).length || 0;
  const withCroho = allProgrammes?.filter(p => p.croho_code !== null).length || 0;
  const withLanguages = allProgrammes?.filter(p => p.language_codes && p.language_codes.length > 0).length || 0;
  
  console.log('📊 Overall Statistics:');
  console.log(`   Total programmes: ${total.toLocaleString()}`);
  console.log(`   With SKDB data: ${withSkdb.toLocaleString()} (${((withSkdb / total) * 100).toFixed(1)}%)`);
  console.log(`   SKDB-only: ${skdbOnly.toLocaleString()}`);
  console.log(`   With ECTS: ${withEcts.toLocaleString()} (${((withEcts / total) * 100).toFixed(1)}%)`);
  console.log(`   With duration: ${withDuration.toLocaleString()} (${((withDuration / total) * 100).toFixed(1)}%)`);
  console.log(`   With CROHO code: ${withCroho.toLocaleString()} (${((withCroho / total) * 100).toFixed(1)}%)`);
  console.log(`   With languages: ${withLanguages.toLocaleString()} (${((withLanguages / total) * 100).toFixed(1)}%)`);
  console.log('');
  
  // Check by institution
  const { data: byInst, error: instError } = await supabase
    .from('programmes')
    .select('institution_slug, sources, skdb_only, ects_credits')
    .order('institution_slug');
  
  if (!instError && byInst) {
    const instStats = new Map<string, { total: number; withSkdb: number; withEcts: number }>();
    
    for (const prog of byInst) {
      const slug = prog.institution_slug;
      if (!instStats.has(slug)) {
        instStats.set(slug, { total: 0, withSkdb: 0, withEcts: 0 });
      }
      const stats = instStats.get(slug)!;
      stats.total++;
      if (prog.sources?.skdb === true) stats.withSkdb++;
      if (prog.ects_credits !== null) stats.withEcts++;
    }
    
    console.log('📋 Top Institutions by SKDB Coverage:');
    const sorted = Array.from(instStats.entries())
      .sort((a, b) => (b[1].withSkdb / b[1].total) - (a[1].withSkdb / a[1].total))
      .slice(0, 10);
    
    for (const [slug, stats] of sorted) {
      const coverage = ((stats.withSkdb / stats.total) * 100).toFixed(1);
      console.log(`   ${slug}: ${stats.withSkdb}/${stats.total} (${coverage}%)`);
    }
    console.log('');
  }
  
  // Check for issues
  const issues: string[] = [];
  
  if (withSkdb / total < 0.5) {
    issues.push(`⚠️  Low SKDB coverage: Only ${((withSkdb / total) * 100).toFixed(1)}% of programmes have SKDB data`);
  }
  
  if (withEcts / total < 0.3) {
    issues.push(`⚠️  Low ECTS coverage: Only ${((withEcts / total) * 100).toFixed(1)}% of programmes have ECTS credits`);
  }
  
  if (issues.length > 0) {
    console.log('⚠️  Issues Found:');
    issues.forEach(issue => console.log(`   ${issue}`));
    console.log('');
  } else {
    console.log('✅ Data quality looks good!');
  }
  
  console.log('');
}

main().catch(console.error);

