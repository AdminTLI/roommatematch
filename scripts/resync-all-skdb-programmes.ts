#!/usr/bin/env tsx

/**
 * Full SKDB programme resync for all onboarding institutions.
 * Runs fix-programme-levels, complete-programme-sync, and coverage report.
 *
 * Usage:
 *   SKDB_DUMP_PATH=./data/skdb-opleidingen.csv pnpm tsx scripts/resync-all-skdb-programmes.ts
 */

import { execSync } from 'child_process';
import path from 'path';

const SKDB_DUMP = process.env.SKDB_DUMP_PATH || './data/skdb-opleidingen.csv';
const root = process.cwd();

function run(label: string, command: string): void {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`▶ ${label}`);
  console.log(`${'═'.repeat(60)}\n`);
  execSync(command, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, SKDB_DUMP_PATH: SKDB_DUMP },
  });
}

async function main(): Promise<void> {
  console.log('🚀 Full SKDB programme resync\n');
  console.log(`   Dump: ${SKDB_DUMP}\n`);

  run('Step 1/3: Complete programme sync from SKDB CSV', `pnpm tsx scripts/complete-programme-sync.ts`);
  run('Step 2/3: Correct degree levels from SKDB', `pnpm tsx scripts/fix-programme-levels-from-skdb.ts`);
  run('Step 3/3: Coverage report', `pnpm tsx scripts/report-programme-coverage.ts`);

  console.log('\n✅ Full resync pipeline finished\n');
}

main().catch((error) => {
  console.error('❌ Resync failed:', error);
  process.exit(1);
});
