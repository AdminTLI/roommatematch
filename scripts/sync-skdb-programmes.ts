#!/usr/bin/env tsx

/**
 * SKDB Programme Sync Script
 * 
 * Syncs programme data from Studiekeuzedatabase (SKDB) and merges with existing DUO data.
 * Enriches DUO programmes with SKDB fields (ECTS, duration, admission requirements) and
 * creates SKDB-only programmes when no DUO match is found.
 * 
 * Usage:
 *   pnpm tsx scripts/sync-skdb-programmes.ts [--export-json]
 * 
 * Environment variables:
 *   SKDB_API_BASE - Studiekeuzedatabase API base URL (default: https://api.skdb.nl)
 *   SKDB_API_KEY - Studiekeuzedatabase API key (required for API mode)
 *   SKDB_DUMP_PATH - Path to CSV/XLSX dump file (alternative to API)
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (required)
 * 
 * Output:
 *   - Upserts to programmes table in Supabase
 *   - /data/programmes/.skdb-sync-report.json - Sync report
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { readFileSync, existsSync } from 'fs';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { loadInstitutions } from '@/lib/loadInstitutions';
import { getInstitutionBrinCode } from '@/lib/duo/erkenningen';
import { createAdminClient } from '@/lib/supabase/server';
import type { DegreeLevel, Programme } from '@/types/programme';

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

// Environment configuration
const SKDB_API_BASE = process.env.SKDB_API_BASE || 'https://api.skdb.nl';
const SKDB_API_KEY = process.env.SKDB_API_KEY;
const SKDB_DUMP_PATH = process.env.SKDB_DUMP_PATH;

// Parse command line arguments
const exportJson = process.argv.includes('--export-json');

// Supabase client with admin role
const supabase = createAdminClient();

// Institution synonym mapping
const INSTITUTION_SYNONYMS: Record<string, string> = {
  'Technische Universiteit Delft': 'tud',
  'TU Delft': 'tud',
  'Delft University of Technology': 'tud',
  'Technische Universiteit Eindhoven': 'tue',
  'TU/e': 'tue',
  'Eindhoven University of Technology': 'tue',
  'Erasmus Universiteit Rotterdam': 'eur',
  'Erasmus University Rotterdam': 'eur',
  'EUR': 'eur',
  'Universiteit Leiden': 'leiden',
  'Leiden University': 'leiden',
  'Universiteit Maastricht': 'um',
  'Maastricht University': 'um',
  'Open Universiteit': 'ou',
  'Open University': 'ou',
  'Radboud Universiteit': 'ru',
  'Radboud University': 'ru',
  'Universiteit van Tilburg': 'tilburg',
  'Tilburg University': 'tilburg',
  'Universiteit van Amsterdam': 'uva',
  'University of Amsterdam': 'uva',
  'UvA': 'uva',
  'Rijksuniversiteit Groningen': 'rug',
  'University of Groningen': 'rug',
  'RUG': 'rug',
  'Universiteit Twente': 'utwente',
  'University of Twente': 'utwente',
  'UT': 'utwente',
  'Universiteit Utrecht': 'uu',
  'Utrecht University': 'uu',
  'UU': 'uu',
  'Vrije Universiteit Amsterdam': 'vu',
  'VU Amsterdam': 'vu',
  'VU': 'vu',
  'Wageningen University & Research': 'wur',
  'Wageningen University and Research Centre': 'wur',
  'Wageningen University': 'wur',
  'WUR': 'wur'
};

// Extended SKDB programme schema with all fields
const SkdbProgramSchema = z.object({
  institution: z.string(),
  name: z.string(),
  nameEn: z.string().optional(),
  crohoCode: z.string().optional(),
  rioCode: z.string().optional(), // If SKDB provides RIO code
  degreeLevel: z.enum(['bachelor', 'master', 'premaster']),
  languageCodes: z.array(z.string()).default([]),
  faculty: z.string().optional(),
  active: z.boolean().default(true),
  ectsCredits: z.number().optional(),
  durationYears: z.number().optional(),
  durationMonths: z.number().optional(),
  admissionRequirements: z.string().optional()
});

type SkdbProgram = z.infer<typeof SkdbProgramSchema>;

interface SkdbSyncReport {
  syncedAt: string;
  source: string;
  summary: {
    totalSkdbProgrammes: number;
    matched: number;
    enriched: number;
    skdbOnly: number;
    failed: number;
    notFound: number;
  };
  byInstitution: Record<string, {
    matched: number;
    enriched: number;
    skdbOnly: number;
    failed: number;
  }>;
  unmatched: Array<{
    skdbName: string;
    skdbInstitution: string;
    skdbCrohoCode?: string;
    skdbLevel: string;
    reason: string;
  }>;
  discrepancies: Array<{
    type: 'skdb_only' | 'name_conflict';
    skdbName: string;
    skdbInstitution: string;
    duoName?: string;
    rioCode?: string;
    crohoCode?: string;
  }>;
}

/**
 * Load university slug mapping
 */
async function loadUniversitySlugMap(): Promise<Map<string, string>> {
  const { data: universities, error } = await supabase
    .from('universities')
    .select('id, slug, name');
  
  if (error) {
    throw new Error(`Failed to load universities: ${error.message}`);
  }
  
  const slugMap = new Map<string, string>();
  for (const uni of universities || []) {
    slugMap.set(uni.slug, uni.slug);
    slugMap.set(uni.name.toLowerCase(), uni.slug);
    // Also try without common prefixes
    const nameWithoutPrefix = uni.name
      .replace(/^(university|universiteit|hogeschool|university of|university &|university and)\s+/i, '')
      .toLowerCase();
    if (nameWithoutPrefix !== uni.name.toLowerCase()) {
      slugMap.set(nameWithoutPrefix, uni.slug);
    }
  }
  
  return slugMap;
}

/**
 * Map institution name to institution slug
 */
function mapInstitutionToSlug(institutionName: string, slugMap: Map<string, string>): string | null {
  const normalized = institutionName.toLowerCase().trim();
  
  // Direct synonym mapping
  const slug = INSTITUTION_SYNONYMS[institutionName];
  if (slug) {
    return slugMap.get(slug) || slug;
  }
  
  // Try normalized name matching
  for (const [key, slug] of slugMap.entries()) {
    if (key.toLowerCase().includes(normalized) || normalized.includes(key.toLowerCase())) {
      return slug;
    }
  }
  
  return null;
}

/**
 * Normalize programme name for fuzzy matching
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Determine degree level from programme data
 */
function determineDegreeLevel(programmeData: any): 'bachelor' | 'master' | 'premaster' {
  const name = programmeData.name?.toLowerCase() || '';
  const description = programmeData.description?.toLowerCase() || '';
  const level = programmeData.level?.toLowerCase() || '';
  
  if (name.includes('pre-master') || name.includes('schakelprogramma') || 
      name.includes('premaster') || name.includes('bridge')) {
    return 'premaster';
  }
  
  if (level.includes('master') || name.includes('master') || 
      description.includes('master')) {
    return 'master';
  }
  
  if (level.includes('bachelor') || name.includes('bachelor') || 
      description.includes('bachelor')) {
    return 'bachelor';
  }
  
  if (name.includes('master') || name.includes('msc') || name.includes('ma')) {
    return 'master';
  }
  
  return 'bachelor';
}

/**
 * Fetch programmes via OData API
 */
async function fetchProgrammesFromAPI(): Promise<SkdbProgram[]> {
  if (!SKDB_API_KEY) {
    throw new Error('SKDB_API_KEY must be set for API mode');
  }
  
  console.log(`📡 Fetching programmes from Studiekeuzedatabase API (${SKDB_API_BASE})...`);
  
  try {
    // Try the expand pattern first
    let response = await fetch(`${SKDB_API_BASE}/Institutions?$expand=Programmes`, {
      headers: {
        'Authorization': `Bearer ${SKDB_API_KEY}`,
        'Accept': 'application/json'
      }
    });
    
    // If that fails, try alternative endpoint patterns
    if (!response.ok && response.status === 404) {
      console.log('   Trying alternative endpoint: /Programmes');
      response = await fetch(`${SKDB_API_BASE}/Programmes`, {
        headers: {
          'Authorization': `Bearer ${SKDB_API_KEY}`,
          'Accept': 'application/json'
        }
      });
    }
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const programmes: SkdbProgram[] = [];
    
    // Handle both expand pattern and direct programmes endpoint
    const institutions = data.value || data.institutions || [];
    const directProgrammes = data.programmes || [];
    
    if (institutions.length > 0) {
      // Expand pattern: institutions with nested programmes
      for (const institution of institutions) {
        for (const programme of institution.programmes || []) {
          try {
            const program = SkdbProgramSchema.parse({
              institution: institution.name,
              name: programme.name,
              nameEn: programme.nameEn || programme.name_en,
              crohoCode: programme.crohoCode || programme.croho_code,
              rioCode: programme.rioCode || programme.rio_code,
              degreeLevel: determineDegreeLevel(programme),
              languageCodes: programme.languageCodes || programme.language_codes || [],
              faculty: programme.faculty,
              active: programme.status !== 'ended' && programme.active !== false,
              ectsCredits: programme.ectsCredits || programme.ects_credits || programme.ects,
              durationYears: programme.durationYears || programme.duration_years,
              durationMonths: programme.durationMonths || programme.duration_months,
              admissionRequirements: programme.admissionRequirements || programme.admission_requirements
            });
            
            programmes.push(program);
          } catch (error) {
            console.warn(`⚠️  Skipping invalid programme: ${programme.name}`, error);
          }
        }
      }
    } else if (directProgrammes.length > 0) {
      // Direct programmes endpoint
      for (const programme of directProgrammes) {
        try {
          const program = SkdbProgramSchema.parse({
            institution: programme.institution || programme.institutionName,
            name: programme.name,
            nameEn: programme.nameEn || programme.name_en,
            crohoCode: programme.crohoCode || programme.croho_code,
            rioCode: programme.rioCode || programme.rio_code,
            degreeLevel: determineDegreeLevel(programme),
            languageCodes: programme.languageCodes || programme.language_codes || [],
            faculty: programme.faculty,
            active: programme.status !== 'ended' && programme.active !== false,
            ectsCredits: programme.ectsCredits || programme.ects_credits || programme.ects,
            durationYears: programme.durationYears || programme.duration_years,
            durationMonths: programme.durationMonths || programme.duration_months,
            admissionRequirements: programme.admissionRequirements || programme.admission_requirements
          });
          
          programmes.push(program);
        } catch (error) {
          console.warn(`⚠️  Skipping invalid programme: ${programme.name}`, error);
        }
      }
    }
    
    console.log(`✅ Fetched ${programmes.length} programmes from API`);
    return programmes;
    
  } catch (error) {
    throw new Error(`Failed to fetch from API: ${error}`);
  }
}

/**
 * Load institution mapping from instellingen.csv (if available)
 */
async function loadInstitutionMapping(): Promise<Map<number, string>> {
  const instellingenPath = path.join(path.dirname(SKDB_DUMP_PATH || ''), 'skdb-instellingen.csv');
  const mapping = new Map<number, string>();
  
  if (existsSync(instellingenPath)) {
    try {
      const fileContent = readFileSync(instellingenPath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      
      for (const record of records) {
        const id = parseInt(record.Instelling_SK123ID || record.instelling_sk123id || '0');
        const name = record.Instelling || record.instelling;
        if (id && name) {
          mapping.set(id, name);
        }
      }
      
      console.log(`   Loaded ${mapping.size} institution mappings`);
    } catch (error) {
      console.warn(`   ⚠️  Could not load institution mapping: ${error}`);
    }
  }
  
  return mapping;
}

/**
 * Parse programmes from CSV dump
 */
async function parseProgrammesFromCSV(): Promise<SkdbProgram[]> {
  if (!SKDB_DUMP_PATH || !existsSync(SKDB_DUMP_PATH)) {
    throw new Error(`CSV dump file not found: ${SKDB_DUMP_PATH}`);
  }
  
  console.log('📄 Parsing programmes from CSV dump...');
  
  // Load institution mapping if available
  const institutionMapping = await loadInstitutionMapping();
  
  const fileContent = readFileSync(SKDB_DUMP_PATH, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
  
  const programmes: SkdbProgram[] = [];
  
  for (const record of records) {
    try {
      // Handle SKDB CSV format (opleidingen.csv)
      // Map SKDB column names to our schema
      let institutionName = record.institution || record.university || record.Instelling_Naam || record.naam_instelling;
      
      // If we have institution ID, try to map it
      if (!institutionName && record.Instelling_SK123ID) {
        const instId = parseInt(record.Instelling_SK123ID);
        institutionName = institutionMapping.get(instId);
      }
      
      const programmeName = record.name || record.programme_name || record.NaamOpleiding || record.naam;
      const programmeNameEn = record.nameEn || record.programme_name_en || record.NaamOpleidingEngels || record.naamEn;
      const crohoCode = record.crohoCode || record.croho_code || record.CrohoCode || record.Opleidingscode?.toString();
      const rioCode = record.rioCode || record.rio_code;
      const studielast = record.Studielast || record.studielast || record.ectsCredits || record.ects_credits || record.ects;
      const niveau = record.niveau || record.level || record.Niveau;
      const sector = record.Sector || record.sector;
      const toelatingsEisen = record.ToelatingsEisenMbo || record.toelatingsEisen || record.admissionRequirements || record.admission_requirements;
      
      // Skip if essential fields are missing
      if (!institutionName || !programmeName) {
        continue;
      }
      
      const program = SkdbProgramSchema.parse({
        institution: institutionName,
        name: programmeName,
        nameEn: programmeNameEn,
        crohoCode: crohoCode,
        rioCode: rioCode,
        degreeLevel: determineDegreeLevel({ ...record, niveau, sector }),
        languageCodes: (record.languageCodes || record.languages || record.Talen || '').split(',').filter(Boolean),
        faculty: record.faculty || record.Faculteit,
        active: record.status !== 'ended' && record.active !== false && record.Actief !== false,
        ectsCredits: studielast ? parseInt(studielast.toString()) : undefined,
        durationYears: record.durationYears ? parseFloat(record.durationYears.toString()) : record.duration_years ? parseFloat(record.duration_years.toString()) : undefined,
        durationMonths: record.durationMonths ? parseInt(record.durationMonths.toString()) : record.duration_months ? parseInt(record.duration_months.toString()) : undefined,
        admissionRequirements: toelatingsEisen
      });
      
      programmes.push(program);
    } catch (error) {
      // Only warn if it's not a missing field issue (which we skip silently)
      if (record.name || record.NaamOpleiding || record.programme_name) {
        console.warn(`⚠️  Skipping invalid programme: ${record.name || record.NaamOpleiding || record.programme_name}`, error);
      }
    }
  }
  
  console.log(`✅ Parsed ${programmes.length} programmes from CSV`);
  return programmes;
}

/**
 * Parse programmes from XLSX/ODS dump
 */
async function parseProgrammesFromXLSX(): Promise<SkdbProgram[]> {
  const dumpPath = SKDB_DUMP_PATH || '';
  if (!dumpPath || !existsSync(dumpPath)) {
    throw new Error(`XLSX/ODS dump file not found: ${dumpPath}`);
  }
  
  const ext = dumpPath.toLowerCase().split('.').pop();
  console.log(`📊 Parsing programmes from ${ext.toUpperCase()} dump...`);
  
  const workbook = XLSX.readFile(dumpPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const records = XLSX.utils.sheet_to_json(worksheet);
  
  const programmes: SkdbProgram[] = [];
  
  for (const record of records as any[]) {
    try {
      // Handle SKDB CSV format (opleidingen.csv)
      // Map SKDB column names to our schema
      const institutionName = record.institution || record.university || record.Instelling_Naam || record.naam_instelling;
      const programmeName = record.name || record.programme_name || record.NaamOpleiding || record.naam;
      const programmeNameEn = record.nameEn || record.programme_name_en || record.NaamOpleidingEngels || record.naamEn;
      const crohoCode = record.crohoCode || record.croho_code || record.CrohoCode || record.Opleidingscode?.toString();
      const rioCode = record.rioCode || record.rio_code;
      const studielast = record.Studielast || record.studielast || record.ectsCredits || record.ects_credits || record.ects;
      const niveau = record.niveau || record.level || record.Niveau;
      const sector = record.Sector || record.sector;
      const toelatingsEisen = record.ToelatingsEisenMbo || record.toelatingsEisen || record.admissionRequirements || record.admission_requirements;
      
      // Skip if essential fields are missing
      if (!institutionName || !programmeName) {
        continue;
      }
      
      const program = SkdbProgramSchema.parse({
        institution: institutionName,
        name: programmeName,
        nameEn: programmeNameEn,
        crohoCode: crohoCode,
        rioCode: rioCode,
        degreeLevel: determineDegreeLevel({ ...record, niveau, sector }),
        languageCodes: (record.languageCodes || record.languages || record.Talen || '').split(',').filter(Boolean),
        faculty: record.faculty || record.Faculteit,
        active: record.status !== 'ended' && record.active !== false && record.Actief !== false,
        ectsCredits: studielast ? parseInt(studielast.toString()) : undefined,
        durationYears: record.durationYears ? parseFloat(record.durationYears.toString()) : record.duration_years ? parseFloat(record.duration_years.toString()) : undefined,
        durationMonths: record.durationMonths ? parseInt(record.durationMonths.toString()) : record.duration_months ? parseInt(record.duration_months.toString()) : undefined,
        admissionRequirements: toelatingsEisen
      });
      
      programmes.push(program);
    } catch (error) {
      // Only warn if it's not a missing field issue (which we skip silently)
      if (record.name || record.NaamOpleiding || record.programme_name) {
        console.warn(`⚠️  Skipping invalid programme: ${record.name || record.NaamOpleiding || record.programme_name}`, error);
      }
    }
  }
  
  const fileExt = dumpPath.toLowerCase().split('.').pop();
  console.log(`✅ Parsed ${programmes.length} programmes from ${fileExt?.toUpperCase() || 'XLSX'}`);
  return programmes;
}

/**
 * Find matching DUO programme for SKDB programme
 */
async function findMatchingDuoProgramme(
  skdbProgram: SkdbProgram,
  institutionSlug: string
): Promise<{ rioCode: string; matchType: 'croho' | 'rio' | 'name'; existingProgramme: any } | null> {
  // Strategy 1: Match by CROHO code
  if (skdbProgram.crohoCode) {
    const { data, error } = await supabase
      .from('programmes')
      .select('*')
      .eq('croho_code', skdbProgram.crohoCode)
      .maybeSingle();
    
    if (!error && data) {
      return { rioCode: data.rio_code || data.id, matchType: 'croho', existingProgramme: data };
    }
  }
  
  // Strategy 2: Match by RIO code (if SKDB provides it)
  if (skdbProgram.rioCode) {
    const { data, error } = await supabase
      .from('programmes')
      .select('*')
      .eq('rio_code', skdbProgram.rioCode)
      .maybeSingle();
    
    if (!error && data) {
      return { rioCode: data.rio_code || data.id, matchType: 'rio', existingProgramme: data };
    }
  }
  
  // Strategy 3: Match by name + institution + level (fuzzy)
  const normalizedSkdbName = normalizeName(skdbProgram.name);
  
  const { data: candidates, error } = await supabase
    .from('programmes')
    .select('*')
    .eq('institution_slug', institutionSlug)
    .eq('level', skdbProgram.degreeLevel)
    .or(`name.ilike.%${normalizedSkdbName}%,name_en.ilike.%${normalizedSkdbName}%`)
    .limit(10);
  
  if (error || !candidates || candidates.length === 0) {
    return null;
  }
  
  // Find best match by Levenshtein distance
  let bestMatch: { rioCode: string; distance: number; existingProgramme: any } | null = null;
  
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeName(candidate.name);
    const distance = levenshteinDistance(normalizedSkdbName, normalizedCandidate);
    
    // Accept matches with distance <= 3
    if (distance <= 3) {
      if (!bestMatch || distance < bestMatch.distance) {
        bestMatch = {
          rioCode: candidate.rio_code || candidate.id,
          distance,
          existingProgramme: candidate
        };
      }
    }
  }
  
  return bestMatch ? { rioCode: bestMatch.rioCode, matchType: 'name', existingProgramme: bestMatch.existingProgramme } : null;
}

/**
 * Upsert SKDB programme data (merge with existing or create new)
 */
async function upsertSkdbProgramme(
  skdbProgram: SkdbProgram,
  institutionSlug: string,
  match: { rioCode: string; matchType: string; existingProgramme: any } | null,
  report: SkdbSyncReport
): Promise<void> {
  // Use ISO timestamp - let database handle conversion
  const now = new Date().toISOString();
  const brinCode = getInstitutionBrinCode(institutionSlug);
  
  // Determine sector from institution
  const institutions = loadInstitutions();
  const allInstitutions = [...institutions.wo, ...institutions.wo_special, ...institutions.hbo];
  const institution = allInstitutions.find(inst => inst.id === institutionSlug);
  const sector = institution?.sector || 'wo';
  
  if (match) {
    // Merge with existing DUO programme
    const existing = match.existingProgramme;
    const metadata = existing.metadata || {};
    
    // Store SKDB name variant if it differs from DUO name
    if (skdbProgram.name !== existing.name && skdbProgram.name !== existing.name_en) {
      metadata.skdb_name = skdbProgram.name;
    }
    
    // Update sources: mark both DUO and SKDB
    const sources = existing.sources || {};
    sources.duo = true;
    sources.skdb = true;
    
    const updateData: any = {
      croho_code: skdbProgram.crohoCode || existing.croho_code,
      language_codes: skdbProgram.languageCodes.length > 0 ? skdbProgram.languageCodes : existing.language_codes,
      faculty: skdbProgram.faculty || existing.faculty,
      active: skdbProgram.active !== undefined ? skdbProgram.active : existing.active,
      ects_credits: skdbProgram.ectsCredits || existing.ects_credits,
      duration_years: skdbProgram.durationYears || existing.duration_years,
      duration_months: skdbProgram.durationMonths || existing.duration_months,
      admission_requirements: skdbProgram.admissionRequirements || existing.admission_requirements,
      skdb_only: false, // Has DUO match
      sources,
      metadata,
      enrichment_status: 'enriched'
      // Let database defaults handle skdb_updated_at and enriched_at via triggers
      // Note: We don't set these explicitly to avoid trigger conflicts
    };
    
    const { error } = await supabase
      .from('programmes')
      .update(updateData)
      .eq('rio_code', match.rioCode);
    
    if (error) {
      console.error(`❌ Failed to update programme ${match.rioCode}:`, error);
      report.summary.failed++;
      if (report.byInstitution[institutionSlug]) {
        report.byInstitution[institutionSlug].failed++;
      }
    } else {
      report.summary.enriched++;
      if (report.byInstitution[institutionSlug]) {
        report.byInstitution[institutionSlug].enriched++;
      }
      console.log(`✅ Enriched: ${skdbProgram.name} (${institutionSlug}) [${match.matchType}]`);
    }
  } else {
    // Create SKDB-only programme
    const metadata: any = {};
    if (skdbProgram.nameEn) {
      metadata.skdb_name = skdbProgram.name;
    }
    
    const sources = { duo: false, skdb: true };
    
    // Generate synthetic ID or use CROHO code
    const syntheticId = skdbProgram.crohoCode || `skdb-${institutionSlug}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const insertData: any = {
      institution_slug: institutionSlug,
      brin_code: brinCode || null,
      rio_code: null, // No DUO match
      name: skdbProgram.name,
      name_en: skdbProgram.nameEn || null,
      level: skdbProgram.degreeLevel,
      sector,
      modes: [],
      is_variant: false,
      croho_code: skdbProgram.crohoCode || null,
      language_codes: skdbProgram.languageCodes,
      faculty: skdbProgram.faculty || null,
      active: skdbProgram.active,
      ects_credits: skdbProgram.ectsCredits || null,
      duration_years: skdbProgram.durationYears || null,
      duration_months: skdbProgram.durationMonths || null,
      admission_requirements: skdbProgram.admissionRequirements || null,
      skdb_only: true,
      sources,
      metadata,
      enrichment_status: 'enriched'
      // Let database defaults handle skdb_updated_at and enriched_at via triggers
    };
    
    // Try to insert, handling conflicts
    const { error } = await supabase
      .from('programmes')
      .insert(insertData);
    
    if (error) {
      // If conflict, try to update by croho_code or composite key
      if (error.code === '23505') { // Unique violation
        const conflictData = { ...insertData };
        delete conflictData.rio_code; // Remove rio_code for update
        
        const { error: updateError } = await supabase
          .from('programmes')
          .update(conflictData)
          .eq('institution_slug', institutionSlug)
          .eq('name', skdbProgram.name)
          .eq('level', skdbProgram.degreeLevel);
        
        if (updateError) {
          console.error(`❌ Failed to upsert SKDB-only programme ${skdbProgram.name}:`, updateError);
          report.summary.failed++;
          if (report.byInstitution[institutionSlug]) {
            report.byInstitution[institutionSlug].failed++;
          }
        } else {
          report.summary.skdbOnly++;
          if (report.byInstitution[institutionSlug]) {
            report.byInstitution[institutionSlug].skdbOnly++;
          }
          console.log(`✅ Created SKDB-only: ${skdbProgram.name} (${institutionSlug})`);
        }
      } else {
        console.error(`❌ Failed to create SKDB-only programme ${skdbProgram.name}:`, error);
        report.summary.failed++;
        if (report.byInstitution[institutionSlug]) {
          report.byInstitution[institutionSlug].failed++;
        }
      }
    } else {
      report.summary.skdbOnly++;
      if (report.byInstitution[institutionSlug]) {
        report.byInstitution[institutionSlug].skdbOnly++;
      }
      console.log(`✅ Created SKDB-only: ${skdbProgram.name} (${institutionSlug})`);
    }
  }
}

/**
 * Write sync report
 */
async function writeSyncReport(report: SkdbSyncReport): Promise<void> {
  const outputDir = path.join(process.cwd(), 'data', 'programmes');
  await fs.mkdir(outputDir, { recursive: true });
  
  const reportPath = path.join(outputDir, '.skdb-sync-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
}

/**
 * Main sync function
 */
async function main(): Promise<void> {
  console.log('🚀 Starting SKDB programme sync...');
  console.log('');
  
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    }
    
    // Load university slug mapping
    console.log('🔍 Loading university mappings...');
    const slugMap = await loadUniversitySlugMap();
    console.log(`✅ Loaded ${slugMap.size} university mappings`);
    console.log('');
    
    // Fetch SKDB programmes
    let skdbProgrammes: SkdbProgram[] = [];
    let source = 'unknown';
    
    // Prefer dump file if both are set (dump is more reliable)
    if (SKDB_DUMP_PATH && existsSync(SKDB_DUMP_PATH)) {
      const ext = SKDB_DUMP_PATH.toLowerCase().split('.').pop();
      if (ext === 'csv') {
        skdbProgrammes = await parseProgrammesFromCSV();
        source = `CSV dump (${SKDB_DUMP_PATH})`;
      } else if (ext === 'xlsx' || ext === 'xls' || ext === 'ods') {
        skdbProgrammes = await parseProgrammesFromXLSX();
        source = `${ext.toUpperCase()} dump (${SKDB_DUMP_PATH})`;
      } else {
        throw new Error(`Unsupported file format: ${ext}`);
      }
    } else if (SKDB_API_KEY) {
      skdbProgrammes = await fetchProgrammesFromAPI();
      source = `Studiekeuzedatabase API (${SKDB_API_BASE})`;
    } else {
      throw new Error('Either SKDB_API_KEY or SKDB_DUMP_PATH must be set');
    }
    
    if (skdbProgrammes.length === 0) {
      console.log('⚠️  No programmes found to sync');
      return;
    }
    
    console.log('');
    console.log('🔗 Matching and syncing programmes...');
    console.log('');
    
    const report: SkdbSyncReport = {
      syncedAt: new Date().toISOString(),
      source,
      summary: {
        totalSkdbProgrammes: skdbProgrammes.length,
        matched: 0,
        enriched: 0,
        skdbOnly: 0,
        failed: 0,
        notFound: 0
      },
      byInstitution: {},
      unmatched: [],
      discrepancies: []
    };
    
    // Process each SKDB programme
    for (const skdbProgram of skdbProgrammes) {
      const institutionSlug = mapInstitutionToSlug(skdbProgram.institution, slugMap);
      
      if (!institutionSlug) {
        report.unmatched.push({
          skdbName: skdbProgram.name,
          skdbInstitution: skdbProgram.institution,
          skdbCrohoCode: skdbProgram.crohoCode,
          skdbLevel: skdbProgram.degreeLevel,
          reason: 'institution_not_found'
        });
        report.summary.notFound++;
        continue;
      }
      
      // Initialize institution stats
      if (!report.byInstitution[institutionSlug]) {
        report.byInstitution[institutionSlug] = { matched: 0, enriched: 0, skdbOnly: 0, failed: 0 };
      }
      
      // Find matching DUO programme
      const match = await findMatchingDuoProgramme(skdbProgram, institutionSlug);
      
      if (match) {
        report.summary.matched++;
        report.byInstitution[institutionSlug].matched++;
        
        // Check for name conflicts
        if (match.existingProgramme.name !== skdbProgram.name && 
            match.existingProgramme.name_en !== skdbProgram.name) {
          report.discrepancies.push({
            type: 'name_conflict',
            skdbName: skdbProgram.name,
            skdbInstitution: skdbProgram.institution,
            duoName: match.existingProgramme.name,
            rioCode: match.rioCode,
            crohoCode: skdbProgram.crohoCode
          });
        }
      } else {
        // SKDB-only programme
        report.discrepancies.push({
          type: 'skdb_only',
          skdbName: skdbProgram.name,
          skdbInstitution: skdbProgram.institution,
          crohoCode: skdbProgram.crohoCode
        });
      }
      
      // Upsert programme
      await upsertSkdbProgramme(skdbProgram, institutionSlug, match, report);
    }
    
    // Write sync report
    await writeSyncReport(report);
    
    // Print summary
    console.log('');
    console.log('📊 SKDB Sync Summary:');
    console.log(`   Total SKDB programmes: ${report.summary.totalSkdbProgrammes.toLocaleString()}`);
    console.log(`   Matched: ${report.summary.matched.toLocaleString()}`);
    console.log(`   Enriched: ${report.summary.enriched.toLocaleString()}`);
    console.log(`   SKDB-only: ${report.summary.skdbOnly.toLocaleString()}`);
    console.log(`   Failed: ${report.summary.failed.toLocaleString()}`);
    console.log(`   Not found: ${report.summary.notFound.toLocaleString()}`);
    console.log('');
    console.log('📋 By Institution:');
    for (const [slug, stats] of Object.entries(report.byInstitution)) {
      console.log(`   ${slug}: matched=${stats.matched}, enriched=${stats.enriched}, skdbOnly=${stats.skdbOnly}, failed=${stats.failed}`);
    }
    console.log('');
    
    if (report.discrepancies.length > 0) {
      console.log(`⚠️  ${report.discrepancies.length} discrepancies found (SKDB-only or name conflicts). Check .skdb-sync-report.json for details.`);
    }
    
    console.log(`✅ SKDB sync completed!`);
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ SKDB sync failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as syncSkdbProgrammes };

