#!/usr/bin/env tsx

/**
 * Pre-master QA Script
 * 
 * Lists all programmes classified as 'premaster' per institution for manual review.
 * This helps validate that our pre-master classification heuristics are working correctly.
 * 
 * Usage: 
 *   pnpm tsx scripts/qa-premasters.ts | less
 * 
 * Expected output:
 * - Shows all pre-master programmes by institution
 * - Helps identify false positives or missed pre-masters
 * - Can be used to refine classification rules
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { loadInstitutions } from '@/lib/loadInstitutions';

interface ProgrammeData {
  id: string;
  name: string;
  nameEn?: string;
  level: string;
  sector: string;
  modes?: string[];
  isVariant?: boolean;
  discipline?: string;
  subDiscipline?: string;
  city?: string;
}

interface ProgrammesByLevel {
  bachelor: ProgrammeData[];
  premaster: ProgrammeData[];
  master: ProgrammeData[];
}

/**
 * Format programme info for display
 */
function formatProgramme(programme: ProgrammeData): string {
  const parts = [programme.name];
  
  if (programme.nameEn && programme.nameEn !== programme.name) {
    parts.push(`(${programme.nameEn})`);
  }
  
  if (programme.modes && programme.modes.length > 0) {
    parts.push(`[${programme.modes.join(', ')}]`);
  }
  
  if (programme.discipline) {
    parts.push(`- ${programme.discipline}`);
  }
  
  if (programme.city) {
    parts.push(`@ ${programme.city}`);
  }
  
  return parts.join(' ');
}

/**
 * Main QA function
 */
async function main(): Promise<void> {
  console.log('🔍 Pre-master QA Review');
  console.log('=======================');
  console.log('');
  
  try {
    const { wo, wo_special, hbo } = loadInstitutions();
    const allInstitutions = [...wo, ...wo_special, ...hbo];
    
    let totalPreMasters = 0;
    let institutionsWithPreMasters = 0;
    
    for (const institution of allInstitutions) {
      const programmeFilePath = path.join(process.cwd(), 'data', 'programmes', `${institution.id}.json`);
      
      try {
        const fileContent = await fs.readFile(programmeFilePath, 'utf8');
        const programmeData: ProgrammesByLevel = JSON.parse(fileContent);
        const preMasters = programmeData?.premaster ?? [];
        
        if (preMasters.length > 0) {
          console.log(`\n🏛️  ${institution.label} (${institution.id}) — ${institution.kind.toUpperCase()}`);
          console.log(`   ${preMasters.length} pre-master programme(s):`);
          
          for (const pm of preMasters) {
            console.log(`   • ${formatProgramme(pm)}`);
          }
          
          totalPreMasters += preMasters.length;
          institutionsWithPreMasters++;
        }
        
      } catch (error) {
        // File doesn't exist or is invalid - skip silently
        continue;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   Total pre-masters: ${totalPreMasters}`);
    console.log(`   Institutions with pre-masters: ${institutionsWithPreMasters}/${allInstitutions.length}`);
    console.log('');
    
    if (totalPreMasters === 0) {
      console.log('⚠️  No pre-masters found. This could indicate:');
      console.log('   - Classification heuristics need adjustment');
      console.log('   - No programme data has been synced yet');
      console.log('   - Pre-masters are being filtered out incorrectly');
    } else {
      console.log('✅ Pre-master classification appears to be working.');
      console.log('   Review the output above to validate classifications.');
    }
    
    console.log('');
    console.log('💡 To refine classification rules, edit:');
    console.log('   /lib/duo/erkenningen.ts → toLevel() function');
    
  } catch (error) {
    console.error('❌ QA failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
