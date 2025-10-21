#!/usr/bin/env tsx

/**
 * BRIN Code Inference Script
 * 
 * Reads the DUO "Overzicht Erkenningen ho" CSV and proposes a mapping of 
 * INSTELLINGSCODE (BRIN) -> canonical institution id from nl-institutions.v1.json
 * 
 * Usage: 
 *   pnpm tsx scripts/infer-brin-map.ts > /tmp/brin-candidates.json
 *   # Review the output, then copy verified matches into /data/institution-code-map.json
 * 
 * This script helps build the BRIN code mapping by:
 * 1. Fetching the current DUO CSV via CKAN
 * 2. Extracting unique institution codes and names
 * 3. Matching them against our known institutions using fuzzy name matching
 * 4. Outputting candidates for manual review
 */

import { parse } from 'csv-parse/sync';
import { resolveDuoErkenningenCsv } from '@/lib/duo/ckan';
import institutions from '@/data/nl-institutions.v1.json';

type DuoInstitutionRow = { 
  INSTELLINGSCODE: string; 
  INSTELLINGSNAAM: string; 
};

interface BrinCandidate {
  instCode: string;
  duoName: string;
  match: {
    id: string;
    label: string;
    kind: string;
    confidence: 'exact' | 'high' | 'medium' | 'low';
  } | null;
}

/**
 * Normalize institution names for fuzzy matching
 */
function normalizeName(name: string): string {
  return name.toLowerCase()
    // Remove common prefixes/suffixes
    .replace(/\b(universiteit|university|hogeschool|univ\.?|uas|de\s|der\s|den\s|the\s)\b/gi, '')
    // Remove special characters and normalize whitespace
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, '');
}

/**
 * Calculate match confidence based on similarity
 */
function calculateConfidence(normalizedDuo: string, normalizedKnown: string): 'exact' | 'high' | 'medium' | 'low' {
  if (normalizedDuo === normalizedKnown) return 'exact';
  
  // Check if one contains the other (high confidence)
  if (normalizedDuo.includes(normalizedKnown) || normalizedKnown.includes(normalizedDuo)) {
    return 'high';
  }
  
  // Check for significant overlap (medium confidence)
  const minLength = Math.min(normalizedDuo.length, normalizedKnown.length);
  const maxLength = Math.max(normalizedDuo.length, normalizedKnown.length);
  const overlap = Math.min(normalizedDuo.length, normalizedKnown.length);
  
  if (overlap / maxLength > 0.7) return 'medium';
  if (overlap / maxLength > 0.5) return 'low';
  
  return 'low';
}

/**
 * Find best matching institution from our known institutions
 */
function findBestMatch(duoName: string, normalizedDuo: string): BrinCandidate['match'] {
  const allInstitutions = [
    ...institutions.wo.map(inst => ({ ...inst, kind: 'wo' })),
    ...institutions.wo_special.map(inst => ({ ...inst, kind: 'wo_special' })),
    ...institutions.hbo.map(inst => ({ ...inst, kind: 'hbo' }))
  ];
  
  let bestMatch: BrinCandidate['match'] = null;
  let bestConfidence: 'exact' | 'high' | 'medium' | 'low' = 'low';
  
  for (const inst of allInstitutions) {
    const normalizedKnown = normalizeName(inst.label);
    const confidence = calculateConfidence(normalizedDuo, normalizedKnown);
    
    // Only consider matches with at least medium confidence
    if (confidence === 'low') continue;
    
    // Prefer higher confidence matches
    const confidenceOrder = { exact: 4, high: 3, medium: 2, low: 1 };
    if (confidenceOrder[confidence] > confidenceOrder[bestConfidence]) {
      bestMatch = {
        id: inst.id,
        label: inst.label,
        kind: inst.kind,
        confidence
      };
      bestConfidence = confidence;
    }
  }
  
  return bestMatch;
}

/**
 * Main inference function
 */
async function main(): Promise<void> {
  console.error('🔍 Inferring BRIN code mappings from DUO data...');
  
  try {
    // 1. Fetch current DUO CSV via CKAN
    console.error('📡 Fetching DUO CSV...');
    const url = await resolveDuoErkenningenCsv();
    const response = await fetch(url);
    const csvText = await response.text();
    
    // 2. Parse CSV to extract unique institutions
    console.error('📄 Parsing CSV data...');
    const rows = parse(csvText, { 
      columns: true, 
      skip_empty_lines: true 
    }) as DuoInstitutionRow[];
    
    // 3. Collect unique institutions from DUO
    const byCode = new Map<string, string>();
    for (const row of rows) {
      if (!row.INSTELLINGSCODE || !row.INSTELLINGSNAAM) continue;
      if (!byCode.has(row.INSTELLINGSCODE)) {
        byCode.set(row.INSTELLINGSCODE, row.INSTELLINGSNAAM);
      }
    }
    
    console.error(`✅ Found ${byCode.size} unique institutions in DUO data`);
    
    // 4. Match against our known institutions
    console.error('🔍 Matching against known institutions...');
    const candidates: BrinCandidate[] = [];
    
    for (const [code, duoName] of byCode.entries()) {
      const normalizedDuo = normalizeName(duoName);
      const match = findBestMatch(duoName, normalizedDuo);
      
      candidates.push({
        instCode: code,
        duoName,
        match
      });
    }
    
    // 5. Sort by confidence and output
    candidates.sort((a, b) => {
      const confidenceOrder = { exact: 4, high: 3, medium: 2, low: 1 };
      if (a.match && b.match) {
        return confidenceOrder[b.match.confidence] - confidenceOrder[a.match.confidence];
      }
      return a.match ? -1 : 1;
    });
    
    // Output summary to stderr
    const exact = candidates.filter(c => c.match?.confidence === 'exact').length;
    const high = candidates.filter(c => c.match?.confidence === 'high').length;
    const medium = candidates.filter(c => c.match?.confidence === 'medium').length;
    const noMatch = candidates.filter(c => !c.match).length;
    
    console.error('📊 Match Summary:');
    console.error(`   Exact matches: ${exact}`);
    console.error(`   High confidence: ${high}`);
    console.error(`   Medium confidence: ${medium}`);
    console.error(`   No matches: ${noMatch}`);
    console.error('');
    console.error('📝 Outputting candidates for review...');
    
    // Output only JSON to stdout
    console.log(JSON.stringify(candidates, null, 2));
    
  } catch (error) {
    console.error('❌ Inference failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
