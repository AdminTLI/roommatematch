/**
 * Quick script to verify programme count in database
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔍 Verifying programme count...\n');

  // Total count
  const { count: total, error: totalError } = await supabase
    .from('programmes')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('❌ Error counting programmes:', totalError);
    process.exit(1);
  }

  // Count by level
  const { data: levelData, error: levelError } = await supabase
    .from('programmes')
    .select('level')
    .limit(10000);

  if (levelError) {
    console.error('❌ Error fetching levels:', levelError);
    process.exit(1);
  }

  const bachelor = levelData?.filter(p => p.level === 'bachelor').length || 0;
  const master = levelData?.filter(p => p.level === 'master').length || 0;
  const premaster = levelData?.filter(p => p.level === 'premaster').length || 0;

  // Count SKDB-only
  const { data: skdbData, error: skdbError } = await supabase
    .from('programmes')
    .select('skdb_only')
    .eq('skdb_only', true)
    .limit(10000);

  const skdbOnly = skdbData?.length || 0;

  // Count with CROHO codes
  const { data: crohoData, error: crohoError } = await supabase
    .from('programmes')
    .select('croho_code')
    .not('croho_code', 'is', null)
    .limit(10000);

  const withCroho = crohoData?.length || 0;

  console.log('📊 Database Programme Count:');
  console.log(`   Total: ${total?.toLocaleString()}`);
  console.log(`   Bachelor: ${bachelor.toLocaleString()}`);
  console.log(`   Master: ${master.toLocaleString()}`);
  console.log(`   Premaster: ${premaster.toLocaleString()}`);
  console.log(`   SKDB-only: ${skdbOnly.toLocaleString()}`);
  console.log(`   With CROHO code: ${withCroho.toLocaleString()}`);
  console.log('');

  // Expected: 2,892 (from sync report)
  const expected = 2892;
  const difference = (total || 0) - expected;

  if (difference === 0) {
    console.log('✅ Programme count matches expected (2,892)!');
  } else if (difference > 0) {
    console.log(`⚠️  Database has ${difference.toLocaleString()} more programmes than expected`);
  } else {
    console.log(`⚠️  Database has ${Math.abs(difference).toLocaleString()} fewer programmes than expected`);
  }
}

main().catch(console.error);

