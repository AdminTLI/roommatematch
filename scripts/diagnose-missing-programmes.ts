/**
 * Diagnostic script to identify why matched programmes aren't being saved
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔍 Diagnosing missing programmes...\n');

  // Load sync report
  const reportPath = join(process.cwd(), 'data/programmes/.skdb-sync-report.json');
  let report: any;
  try {
    report = JSON.parse(readFileSync(reportPath, 'utf-8'));
  } catch (error) {
    console.error('❌ Could not load sync report:', error);
    process.exit(1);
  }

  console.log('📊 Sync Report Summary:');
  console.log(`   Total processed: ${report.summary.totalSkdbProgrammes}`);
  console.log(`   Matched: ${report.summary.matched}`);
  console.log(`   Enriched: ${report.summary.enriched}`);
  console.log(`   SKDB-only: ${report.summary.skdbOnly}`);
  console.log(`   Not found: ${report.summary.notFound}`);
  console.log(`   Expected saved: ${report.summary.matched + report.summary.skdbOnly}`);
  console.log('');

  // Check actual database count
  const { count: dbCount, error: countError } = await supabase
    .from('programmes')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error counting programmes:', countError);
    process.exit(1);
  }

  console.log(`📊 Database Count: ${dbCount}`);
  console.log(`   Missing: ${(report.summary.matched + report.summary.skdbOnly) - (dbCount || 0)}`);
  console.log('');

  // Check programmes by source
  const { data: sourceData, error: sourceError } = await supabase
    .from('programmes')
    .select('sources, skdb_only')
    .limit(10000);

  if (sourceError) {
    console.error('❌ Error fetching programmes:', sourceError);
    process.exit(1);
  }

  const skdbOnlyCount = sourceData?.filter(p => p.skdb_only === true).length || 0;
  const skdbSourceCount = sourceData?.filter(p => p.sources?.skdb === true).length || 0;
  const duoSourceCount = sourceData?.filter(p => p.sources?.duo === true).length || 0;

  console.log('📊 Programme Sources:');
  console.log(`   SKDB-only flag: ${skdbOnlyCount}`);
  console.log(`   SKDB source: ${skdbSourceCount}`);
  console.log(`   DUO source: ${duoSourceCount}`);
  console.log('');

  // Check programmes by level
  const { data: levelData, error: levelError } = await supabase
    .from('programmes')
    .select('level')
    .limit(10000);

  if (levelError) {
    console.error('❌ Error fetching programme levels:', levelError);
    process.exit(1);
  }

  const bachelorCount = levelData?.filter(p => p.level === 'bachelor').length || 0;
  const masterCount = levelData?.filter(p => p.level === 'master').length || 0;
  const premasterCount = levelData?.filter(p => p.level === 'premaster').length || 0;

  console.log('📊 Programme Levels:');
  console.log(`   Bachelor: ${bachelorCount}`);
  console.log(`   Master: ${masterCount}`);
  console.log(`   Premaster: ${premasterCount}`);
  console.log('');

  // Check programmes with CROHO codes
  const { data: crohoData, error: crohoError } = await supabase
    .from('programmes')
    .select('croho_code')
    .not('croho_code', 'is', null)
    .limit(10000);

  if (crohoError) {
    console.error('❌ Error fetching CROHO codes:', crohoError);
    process.exit(1);
  }

  console.log(`📊 Programmes with CROHO codes: ${crohoData?.length || 0}`);
  console.log('');

  // Sample some matched programmes from the report to see if they exist
  console.log('🔍 Checking sample matched programmes...');
  const matchedSamples = report.unmatched?.slice(0, 5) || [];
  
  for (const sample of matchedSamples) {
    if (sample.skdbCrohoCode) {
      const { data, error } = await supabase
        .from('programmes')
        .select('id, name, croho_code, institution_slug')
        .eq('croho_code', sample.skdbCrohoCode)
        .maybeSingle();

      if (error) {
        console.log(`   ⚠️  Error checking ${sample.skdbName}: ${error.message}`);
      } else if (data) {
        console.log(`   ✅ Found: ${sample.skdbName} (${sample.skdbCrohoCode})`);
      } else {
        console.log(`   ❌ Missing: ${sample.skdbName} (${sample.skdbCrohoCode})`);
      }
    }
  }

  console.log('');
  console.log('✅ Diagnosis complete!');
}

main().catch(console.error);


