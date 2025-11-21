#!/usr/bin/env tsx

/**
 * Programme Data Verification Script
 * 
 * Verifies that all programmes are SKDB-only and checks for any remaining DUO data
 */

import { createAdminClient } from '@/lib/supabase/server';
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

async function main() {
  console.log('🔍 Verifying programme data...');
  console.log('');
  
  // Get total count
  const { count: total, error: countError } = await supabase
    .from('programmes')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    throw new Error(`Failed to count programmes: ${countError.message}`);
  }
  
  console.log(`📊 Total programmes in database: ${total?.toLocaleString() || 0}`);
  console.log('');
  
  // Check for DUO data
  const { data: duoProgrammes, error: duoError } = await supabase
    .from('programmes')
    .select('id, name, institution_slug, sources, rio_code')
    .or('sources->>duo.eq.true,rio_code.not.is.null');
  
  if (duoError) {
    console.warn('⚠️  Could not check for DUO data:', duoError.message);
  } else {
    const duoCount = duoProgrammes?.length || 0;
    if (duoCount > 0) {
      console.error(`❌ Found ${duoCount} programmes with DUO data:`);
      duoProgrammes?.slice(0, 10).forEach(p => {
        console.error(`   - ${p.name} (${p.institution_slug}): sources=${JSON.stringify(p.sources)}, rio_code=${p.rio_code}`);
      });
      if (duoCount > 10) {
        console.error(`   ... and ${duoCount - 10} more`);
      }
    } else {
      console.log('✅ No DUO data found - all programmes are SKDB-only');
    }
  }
  
  console.log('');
  
  // Check SKDB data
  const { data: skdbProgrammes, error: skdbError } = await supabase
    .from('programmes')
    .select('id, sources, skdb_only')
    .limit(1000);
  
  if (skdbError) {
    console.warn('⚠️  Could not check SKDB data:', skdbError.message);
  } else {
    const withSkdb = skdbProgrammes?.filter(p => p.sources?.skdb === true || p.sources?.skdb === 'true').length || 0;
    const skdbOnly = skdbProgrammes?.filter(p => p.skdb_only === true).length || 0;
    console.log(`📊 Sample check (first 1000):`);
    console.log(`   With SKDB source: ${withSkdb}`);
    console.log(`   SKDB-only flag: ${skdbOnly}`);
  }
  
  console.log('');
  
  // Check by institution
  const { data: byInstitution, error: instError } = await supabase
    .from('programmes')
    .select('institution_slug, level')
    .limit(10000);
  
  if (!instError && byInstitution) {
    const counts = new Map<string, { bachelor: number; master: number; premaster: number }>();
    
    for (const prog of byInstitution) {
      const key = prog.institution_slug;
      if (!counts.has(key)) {
        counts.set(key, { bachelor: 0, master: 0, premaster: 0 });
      }
      const inst = counts.get(key)!;
      inst[prog.level as 'bachelor' | 'master' | 'premaster']++;
    }
    
    console.log('📚 Programmes by Institution:');
    const sorted = Array.from(counts.entries())
      .sort((a, b) => {
        const totalA = a[1].bachelor + a[1].master + a[1].premaster;
        const totalB = b[1].bachelor + b[1].master + b[1].premaster;
        return totalB - totalA;
      })
      .slice(0, 30);
    
    for (const [institution, counts] of sorted) {
      const total = counts.bachelor + counts.master + counts.premaster;
      console.log(`   ${institution}: ${total} (B:${counts.bachelor} M:${counts.master} PM:${counts.premaster})`);
    }
  }
  
  console.log('');
  console.log('✅ Verification complete');
}

if (require.main === module) {
  main().catch(console.error);
}

