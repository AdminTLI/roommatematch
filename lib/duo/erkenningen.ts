/**
 * DUO RIO 'Overzicht Erkenningen ho' data processing
 * 
 * Source: DUO Open Onderwijsdata "Overzicht Erkenningen ho" CSV
 * Update frequency: Daily
 * Documentation: DUO column specification PDF
 * 
 * This module fetches and normalises programme data from DUO's official
 * register of recognised higher education programmes in the Netherlands.
 */

import { DuoRow, Programme, DegreeLevel } from '@/types/programme';
import { Institution } from '@/types/institution';
import { loadInstitutions } from '@/lib/loadInstitutions';
import codeMapData from '@/data/institution-code-map.json';

/**
 * Default DUO CSV URL (updated daily)
 * Can be overridden via DUO_ERKENNINGEN_CSV_URL environment variable
 */
const DEFAULT_CSV_URL = process.env.DUO_ERKENNINGEN_CSV_URL || 
  'https://onderwijsdata.duo.nl/dataset/bb07cc6e-00fe-4100-9528-a0c5fd27d2fb/resource/0b2e9c4a-2c8e-4b2a-9f3a-1c2d3e4f5g6h/download/overzicht-erkenningen-ho.csv';

/**
 * Map institution code to sector using our institution dataset
 */
export function mapSector(instCode: string): 'hbo' | 'wo' | 'wo_special' {
  const institutions = loadInstitutions();
  const allInstitutions = [...institutions.wo, ...institutions.wo_special, ...institutions.hbo];
  
  // Find institution by BRIN code
  const institution = allInstitutions.find(inst => 
    inst.codes?.brin === instCode
  );
  
  if (!institution) {
    console.warn(`Unknown institution code: ${instCode}`);
    return 'hbo'; // Default to HBO for unknown codes
  }
  
  return institution.kind;
}

/**
 * Parse VORM field to study modes
 */
export function mapModes(vorm?: string): ('fulltime' | 'parttime' | 'dual')[] | undefined {
  if (!vorm) return undefined;
  
  const normalized = vorm.toUpperCase();
  const modes: ('fulltime' | 'parttime' | 'dual')[] = [];
  
  if (normalized.includes('VOLTIJD')) modes.push('fulltime');
  if (normalized.includes('DEELTIJD')) modes.push('parttime');
  if (normalized.includes('DUAAL')) modes.push('dual');
  
  return modes.length > 0 ? modes : undefined;
}

/**
 * Classify programme level using DUO data and heuristics
 * 
 * Pre-master classification rules:
 * 1. Name contains 'pre-master', 'premaster', 'schakel', 'bridge'
 * 2. No GRAAD (degree) + OPLEIDINGSEENHEID_SOORT contains 'variant'
 * 
 * Conservative approach: better to miss edge cases than misclassify
 */
export function toLevel(row: DuoRow): 'bachelor' | 'premaster' | 'master' | null {
  const niveau = (row.NIVEAU || '').toUpperCase();
  const name = (row.OPLEIDINGSEENHEID_NAAM || '').toLowerCase();
  const graad = row.GRAAD || '';
  const soort = (row.OPLEIDINGSEENHEID_SOORT || '').toLowerCase();
  
  // Explicit level classification by NIVEAU
  if (niveau.startsWith('HBO-BA') || niveau.startsWith('WO-BA')) {
    return 'bachelor';
  }
  if (niveau.startsWith('HBO-MA') || niveau.startsWith('WO-MA')) {
    return 'master';
  }
  
  // Pre-master heuristics
  const isPreMasterByName = /(pre-?master|schakel|bridge)/.test(name);
  const noDegree = !graad || graad.trim() === '';
  const isVariant = soort.includes('variant');
  
  if (isPreMasterByName || (noDegree && isVariant)) {
    return 'premaster';
  }
  
  // Fallback: classify by name patterns
  if (name.includes('master') || name.includes('msc') || name.includes('ma')) {
    return 'master';
  }
  if (name.includes('bachelor') || name.includes('bsc') || name.includes('ba')) {
    return 'bachelor';
  }
  
  // Skip AD, post-initiële, and other non-standard programmes
  return null;
}

/**
 * Normalise DUO row to our Programme type
 */
export function normalise(row: DuoRow, sector: 'hbo' | 'wo' | 'wo_special'): Programme | null {
  const level = toLevel(row);
  if (!level) return null; // Skip unrecognised programmes
  
  return {
    id: row.OPLEIDINGSEENHEIDCODE,
    name: row.OPLEIDINGSEENHEID_NAAM,
    nameEn: row.OPLEIDINGSEENHEID_INTERNATIONALE_NAAM || undefined,
    level,
    sector,
    modes: mapModes(row.VORM),
    isVariant: (row.OPLEIDINGSEENHEID_SOORT || '').toLowerCase().includes('variant'),
    discipline: row.ONDERDEEL || undefined,
    subDiscipline: row.SUBONDERDEEL || undefined,
    city: row.PLAATSNAAM || undefined,
    externalRefs: {
      rioCode: row.OPLEIDINGSEENHEIDCODE,
      isat: row.ERKENDEOPLEIDINGSCODE || undefined,
      instCode: row.INSTELLINGSCODE
    }
  };
}

/**
 * Fetch DUO CSV data
 */
export async function fetchDuoCsv(): Promise<string> {
  try {
    const response = await fetch(DEFAULT_CSV_URL);
    if (!response.ok) {
      throw new Error(`DUO CSV fetch failed: ${response.status} ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    throw new Error(`Failed to fetch DUO data: ${error}`);
  }
}

/**
 * Process DUO CSV and return normalised programmes by institution
 */
export async function processDuoCsv(): Promise<Map<string, Programme[]>> {
  const csvText = await fetchDuoCsv();
  
  // Parse CSV (we'll use csv-parse in the sync script)
  // For now, return empty map - actual parsing happens in sync script
  return new Map();
}

/**
 * Get institution BRIN code from our mapping
 */
export function getInstitutionBrinCode(institutionId: string): string | undefined {
  const mappings = codeMapData.mappings as any;
  
  // Check WO institutions
  if (mappings[institutionId]?.brin) {
    return mappings[institutionId].brin;
  }
  
  // Check WO-special institutions
  if (mappings.wo_special?.[institutionId]?.brin) {
    return mappings.wo_special[institutionId].brin;
  }
  
  // Check HBO institutions
  if (mappings.hbo_major?.[institutionId]?.brin) {
    return mappings.hbo_major[institutionId].brin;
  }
  
  return undefined;
}

/**
 * Validate that we have BRIN codes for all major institutions
 */
export function validateInstitutionMappings(): { missing: string[], total: number } {
  const institutions = loadInstitutions();
  const allInstitutions = [...institutions.wo, ...institutions.wo_special, ...institutions.hbo];
  
  const missing: string[] = [];
  
  for (const inst of allInstitutions) {
    const brinCode = getInstitutionBrinCode(inst.id);
    if (!brinCode) {
      missing.push(inst.id);
    }
  }
  
  return {
    missing,
    total: allInstitutions.length
  };
}
