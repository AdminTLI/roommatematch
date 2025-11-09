#!/usr/bin/env tsx

/**
 * Programme Enrichment Script
 * 
 * Enriches programmes table with Studiekeuzedatabase data (croho_code, language_codes, faculty, active).
 * Matches existing DUO-synced programmes and backfills enrichment fields.
 * 
 * Usage:
 *   pnpm tsx scripts/enrich-programmes.ts
 * 
 * Environment variables:
 *   SKDB_API_BASE - Studiekeuzedatabase API base URL
 *   SKDB_API_KEY - Studiekeuzedatabase API key
 *   SKDB_DUMP_PATH - Path to CSV/XLSX dump file (alternative to API)
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (required)
 * 
 * Output:
 *   - Enriches programmes in database
 *   - /data/programmes/.enrichment-report.json - Enrichment report
 */

import { readFileSync, existsSync } from 'fs'
import { parse } from 'csv-parse/sync'
import * as XLSX from 'xlsx'
import { z } from 'zod'
import fs from 'node:fs/promises'
import path from 'node:path'
import { loadInstitutions } from '@/lib/loadInstitutions'
import { createServiceClient } from '@/lib/supabase/service'
import { 
  enrichProgramme, 
  getProgrammeByCrohoCode,
  findProgrammesByNameAndInstitution,
  getUnenrichedProgrammes
} from '@/lib/programmes/repo'
import type { DegreeLevel } from '@/types/programme'

// Load .env.local if it exists
try {
  const envPath = path.join(process.cwd(), '.env.local')
  if (existsSync(envPath)) {
    const envFile = readFileSync(envPath, 'utf-8')
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
          if (!process.env[key]) {
            process.env[key] = value
          }
        }
      }
    }
  }
} catch (error) {
  // .env.local doesn't exist or can't be read - that's okay
}

// Environment configuration
const SKDB_API_BASE = process.env.SKDB_API_BASE
const SKDB_API_KEY = process.env.SKDB_API_KEY
const SKDB_DUMP_PATH = process.env.SKDB_DUMP_PATH

// Supabase client with service role
const supabase = createServiceClient()

// Institution synonym mapping (reused from import_programs.ts)
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
}

// Schemas for data validation
const ProgramSchema = z.object({
  institution: z.string(),
  name: z.string(),
  nameEn: z.string().optional(),
  crohoCode: z.string().optional(),
  degreeLevel: z.enum(['bachelor', 'master', 'premaster']),
  languageCodes: z.array(z.string()).default([]),
  faculty: z.string().optional(),
  active: z.boolean().default(true)
})

type SkdbProgram = z.infer<typeof ProgramSchema>

interface EnrichmentReport {
  enrichedAt: string
  source: string
  summary: {
    totalProgrammes: number
    matched: number
    enriched: number
    notFound: number
    failed: number
  }
  unmatched: Array<{
    skdbName: string
    skdbInstitution: string
    skdbCrohoCode?: string
    skdbLevel: string
    reason: string
  }>
  byInstitution: Record<string, {
    enriched: number
    notFound: number
    failed: number
  }>
}

/**
 * Load universities and create slug mapping
 */
async function loadUniversitySlugMap(): Promise<Map<string, string>> {
  const { data: universities, error } = await supabase
    .from('universities')
    .select('id, slug, official_name, common_name')
  
  if (error) {
    throw new Error(`Failed to load universities: ${error.message}`)
  }
  
  const slugMap = new Map<string, string>()
  for (const uni of universities || []) {
    // Map by slug
    slugMap.set(uni.slug, uni.slug)
    // Map by official name
    slugMap.set(uni.official_name.toLowerCase(), uni.slug)
    // Map by common name
    slugMap.set(uni.common_name.toLowerCase(), uni.slug)
  }
  
  return slugMap
}

/**
 * Map institution name to institution slug
 */
function mapInstitutionToSlug(institutionName: string, slugMap: Map<string, string>): string | null {
  const normalized = institutionName.toLowerCase().trim()
  
  // Direct synonym mapping
  const slug = INSTITUTION_SYNONYMS[institutionName]
  if (slug) {
    return slugMap.get(slug) || slug
  }
  
  // Try normalized name matching
  for (const [key, slug] of slugMap.entries()) {
    if (key.toLowerCase().includes(normalized) || normalized.includes(key.toLowerCase())) {
      return slug
    }
  }
  
  return null
}

/**
 * Normalize programme name for fuzzy matching
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special chars
    .replace(/\s+/g, ' ') // Normalize whitespace
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

/**
 * Determine degree level from programme data
 */
function determineDegreeLevel(programmeData: any): 'bachelor' | 'master' | 'premaster' {
  const name = programmeData.name?.toLowerCase() || ''
  const description = programmeData.description?.toLowerCase() || ''
  const level = programmeData.level?.toLowerCase() || ''
  
  // Check for pre-master/schakelprogramma indicators
  if (name.includes('pre-master') || name.includes('schakelprogramma') || 
      name.includes('premaster') || name.includes('bridge')) {
    return 'premaster'
  }
  
  // Check explicit level indicators
  if (level.includes('master') || name.includes('master') || 
      description.includes('master')) {
    return 'master'
  }
  
  if (level.includes('bachelor') || name.includes('bachelor') || 
      description.includes('bachelor')) {
    return 'bachelor'
  }
  
  // Default fallback based on name patterns
  if (name.includes('master') || name.includes('msc') || name.includes('ma')) {
    return 'master'
  }
  
  return 'bachelor' // Default assumption
}

/**
 * Fetch programmes via OData API
 */
async function fetchProgrammesFromAPI(): Promise<SkdbProgram[]> {
  if (!SKDB_API_BASE || !SKDB_API_KEY) {
    throw new Error('SKDB_API_BASE and SKDB_API_KEY must be set for API mode')
  }
  
  console.log('📡 Fetching programmes from Studiekeuzedatabase API...')
  
  try {
    const response = await fetch(`${SKDB_API_BASE}/Institutions?$expand=Programmes`, {
      headers: {
        'Authorization': `Bearer ${SKDB_API_KEY}`,
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    const programmes: SkdbProgram[] = []
    
    for (const institution of data.value || []) {
      for (const programme of institution.programmes || []) {
        try {
          const program = ProgramSchema.parse({
            institution: institution.name,
            name: programme.name,
            nameEn: programme.nameEn,
            crohoCode: programme.crohoCode,
            degreeLevel: determineDegreeLevel(programme),
            languageCodes: programme.languageCodes || [],
            faculty: programme.faculty,
            active: programme.status !== 'ended'
          })
          
          programmes.push(program)
        } catch (error) {
          console.warn(`⚠️  Skipping invalid programme: ${programme.name}`, error)
        }
      }
    }
    
    console.log(`✅ Fetched ${programmes.length} programmes from API`)
    return programmes
    
  } catch (error) {
    throw new Error(`Failed to fetch from API: ${error}`)
  }
}

/**
 * Parse programmes from CSV dump
 */
async function parseProgrammesFromCSV(): Promise<SkdbProgram[]> {
  if (!SKDB_DUMP_PATH || !existsSync(SKDB_DUMP_PATH)) {
    throw new Error(`CSV dump file not found: ${SKDB_DUMP_PATH}`)
  }
  
  console.log('📄 Parsing programmes from CSV dump...')
  
  const fileContent = readFileSync(SKDB_DUMP_PATH, 'utf-8')
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  })
  
  const programmes: SkdbProgram[] = []
  
  for (const record of records) {
    try {
      const program = ProgramSchema.parse({
        institution: record.institution || record.university,
        name: record.name || record.programme_name,
        nameEn: record.nameEn || record.programme_name_en,
        crohoCode: record.crohoCode || record.croho_code,
        degreeLevel: determineDegreeLevel(record),
        languageCodes: (record.languageCodes || record.languages || '').split(',').filter(Boolean),
        faculty: record.faculty,
        active: record.status !== 'ended' && record.active !== 'false'
      })
      
      programmes.push(program)
    } catch (error) {
      console.warn(`⚠️  Skipping invalid programme: ${record.name || record.programme_name}`, error)
    }
  }
  
  console.log(`✅ Parsed ${programmes.length} programmes from CSV`)
  return programmes
}

/**
 * Parse programmes from XLSX dump
 */
async function parseProgrammesFromXLSX(): Promise<SkdbProgram[]> {
  if (!SKDB_DUMP_PATH || !existsSync(SKDB_DUMP_PATH)) {
    throw new Error(`XLSX dump file not found: ${SKDB_DUMP_PATH}`)
  }
  
  console.log('📊 Parsing programmes from XLSX dump...')
  
  const workbook = XLSX.readFile(SKDB_DUMP_PATH)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const records = XLSX.utils.sheet_to_json(worksheet)
  
  const programmes: SkdbProgram[] = []
  
  for (const record of records as any[]) {
    try {
      const program = ProgramSchema.parse({
        institution: record.institution || record.university,
        name: record.name || record.programme_name,
        nameEn: record.nameEn || record.programme_name_en,
        crohoCode: record.crohoCode || record.croho_code,
        degreeLevel: determineDegreeLevel(record),
        languageCodes: (record.languageCodes || record.languages || '').split(',').filter(Boolean),
        faculty: record.faculty,
        active: record.status !== 'ended' && record.active !== 'false'
      })
      
      programmes.push(program)
    } catch (error) {
      console.warn(`⚠️  Skipping invalid programme: ${record.name || record.programme_name}`, error)
    }
  }
  
  console.log(`✅ Parsed ${programmes.length} programmes from XLSX`)
  return programmes
}

/**
 * Match SKDB programme to existing programme in database
 */
async function findMatchingProgramme(
  skdbProgram: SkdbProgram,
  institutionSlug: string
): Promise<{ rioCode: string; matchType: 'croho' | 'name' } | null> {
  // Strategy 1: Match by CROHO code (if available)
  if (skdbProgram.crohoCode) {
    const existing = await getProgrammeByCrohoCode(skdbProgram.crohoCode, true)
    if (existing) {
      return { rioCode: existing.externalRefs?.rioCode || existing.id, matchType: 'croho' }
    }
  }
  
  // Strategy 2: Match by name + institution + level (fuzzy)
  const candidates = await findProgrammesByNameAndInstitution(
    skdbProgram.name,
    institutionSlug,
    skdbProgram.degreeLevel,
    true
  )
  
  if (candidates.length === 0) {
    return null
  }
  
  // Normalize SKDB name for comparison
  const normalizedSkdb = normalizeName(skdbProgram.name)
  
  // Find best match by Levenshtein distance
  let bestMatch: { rioCode: string; distance: number } | null = null
  
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeName(candidate.name)
    const distance = levenshteinDistance(normalizedSkdb, normalizedCandidate)
    
    // Accept matches with distance <= 3 (allowing for minor variations)
    if (distance <= 3) {
      if (!bestMatch || distance < bestMatch.distance) {
        bestMatch = {
          rioCode: candidate.externalRefs?.rioCode || candidate.id,
          distance
        }
      }
    }
  }
  
  return bestMatch ? { rioCode: bestMatch.rioCode, matchType: 'name' } : null
}

/**
 * Write enrichment report
 */
async function writeEnrichmentReport(report: EnrichmentReport): Promise<void> {
  const outputDir = path.join(process.cwd(), 'data', 'programmes')
  await fs.mkdir(outputDir, { recursive: true })
  
  const reportPath = path.join(outputDir, '.enrichment-report.json')
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8')
}

/**
 * Main enrichment function
 */
async function main(): Promise<void> {
  console.log('🚀 Starting programme enrichment...')
  console.log('')
  
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
    }
    
    // Load university slug mapping
    console.log('🔍 Loading university mappings...')
    const slugMap = await loadUniversitySlugMap()
    console.log(`✅ Loaded ${slugMap.size} university mappings`)
    console.log('')
    
    // Fetch Studiekeuzedatabase programmes
    let skdbProgrammes: SkdbProgram[] = []
    let source = 'unknown'
    
    if (SKDB_API_BASE && SKDB_API_KEY) {
      skdbProgrammes = await fetchProgrammesFromAPI()
      source = `Studiekeuzedatabase API (${SKDB_API_BASE})`
    } else if (SKDB_DUMP_PATH) {
      const ext = SKDB_DUMP_PATH.toLowerCase().split('.').pop()
      if (ext === 'csv') {
        skdbProgrammes = await parseProgrammesFromCSV()
        source = `CSV dump (${SKDB_DUMP_PATH})`
      } else if (ext === 'xlsx' || ext === 'xls') {
        skdbProgrammes = await parseProgrammesFromXLSX()
        source = `XLSX dump (${SKDB_DUMP_PATH})`
      } else {
        throw new Error(`Unsupported file format: ${ext}`)
      }
    } else {
      throw new Error('Either SKDB_API_BASE+SKDB_API_KEY or SKDB_DUMP_PATH must be set')
    }
    
    if (skdbProgrammes.length === 0) {
      console.log('⚠️  No programmes found to enrich')
      return
    }
    
    console.log('')
    console.log('🔗 Matching and enriching programmes...')
    console.log('')
    
    const report: EnrichmentReport = {
      enrichedAt: new Date().toISOString(),
      source,
      summary: {
        totalProgrammes: skdbProgrammes.length,
        matched: 0,
        enriched: 0,
        notFound: 0,
        failed: 0
      },
      unmatched: [],
      byInstitution: {}
    }
    
    // Process each SKDB programme
    for (const skdbProgram of skdbProgrammes) {
      const institutionSlug = mapInstitutionToSlug(skdbProgram.institution, slugMap)
      
      if (!institutionSlug) {
        report.unmatched.push({
          skdbName: skdbProgram.name,
          skdbInstitution: skdbProgram.institution,
          skdbCrohoCode: skdbProgram.crohoCode,
          skdbLevel: skdbProgram.degreeLevel,
          reason: 'institution_not_found'
        })
        report.summary.notFound++
        continue
      }
      
      // Initialize institution stats
      if (!report.byInstitution[institutionSlug]) {
        report.byInstitution[institutionSlug] = { enriched: 0, notFound: 0, failed: 0 }
      }
      
      // Find matching programme
      const match = await findMatchingProgramme(skdbProgram, institutionSlug)
      
      if (!match) {
        report.unmatched.push({
          skdbName: skdbProgram.name,
          skdbInstitution: skdbProgram.institution,
          skdbCrohoCode: skdbProgram.crohoCode,
          skdbLevel: skdbProgram.degreeLevel,
          reason: 'no_match_found'
        })
        report.summary.notFound++
        report.byInstitution[institutionSlug].notFound++
        continue
      }
      
      // Enrich the programme
      try {
        const enriched = await enrichProgramme(match.rioCode, {
          crohoCode: skdbProgram.crohoCode,
          languageCodes: skdbProgram.languageCodes,
          faculty: skdbProgram.faculty,
          active: skdbProgram.active
        })
        
        if (enriched) {
          report.summary.matched++
          report.summary.enriched++
          report.byInstitution[institutionSlug].enriched++
          console.log(`✅ Enriched: ${skdbProgram.name} (${institutionSlug}) [${match.matchType}]`)
        } else {
          report.summary.matched++
          report.summary.failed++
          report.byInstitution[institutionSlug].failed++
          console.log(`❌ Failed to enrich: ${skdbProgram.name} (${institutionSlug})`)
        }
      } catch (error) {
        console.error(`❌ Error enriching ${skdbProgram.name}:`, error)
        report.summary.matched++
        report.summary.failed++
        report.byInstitution[institutionSlug].failed++
      }
    }
    
    // Write enrichment report
    await writeEnrichmentReport(report)
    
    // Print summary
    console.log('')
    console.log('📊 Enrichment Summary:')
    console.log(`   Total SKDB programmes: ${report.summary.totalProgrammes.toLocaleString()}`)
    console.log(`   Matched: ${report.summary.matched.toLocaleString()}`)
    console.log(`   Enriched: ${report.summary.enriched.toLocaleString()}`)
    console.log(`   Not found: ${report.summary.notFound.toLocaleString()}`)
    console.log(`   Failed: ${report.summary.failed.toLocaleString()}`)
    console.log('')
    console.log('📋 By Institution:')
    for (const [slug, stats] of Object.entries(report.byInstitution)) {
      console.log(`   ${slug}: enriched=${stats.enriched}, notFound=${stats.notFound}, failed=${stats.failed}`)
    }
    console.log('')
    
    if (report.summary.notFound > 0) {
      console.log(`⚠️  ${report.summary.notFound} programmes could not be matched. Check .enrichment-report.json for details.`)
    }
    
    const successRate = report.summary.totalProgrammes > 0 
      ? (report.summary.enriched / report.summary.totalProgrammes * 100).toFixed(1)
      : '0'
    console.log(`✅ Enrichment completed! Success rate: ${successRate}%`)
    console.log('')
    
    // Exit with error if success rate is too low
    if (report.summary.enriched / report.summary.totalProgrammes < 0.8) {
      console.error('❌ Enrichment success rate below 80% threshold')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('')
    console.error('❌ Enrichment failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { main as enrichProgrammes }

