#!/usr/bin/env tsx

/**
 * Program Importer for Domu Match
 * 
 * Imports WO programmes from Studiekeuzedatabase via OData API or CSV/XLSX dump
 * Maps programmes to our 14 UNL universities and creates program records
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { parse } from 'csv-parse/sync'
import * as XLSX from 'xlsx'
import { z } from 'zod'

// Environment configuration
const SKDB_API_BASE = process.env.SKDB_API_BASE
const SKDB_API_KEY = process.env.SKDB_API_KEY
const SKDB_DUMP_PATH = process.env.SKDB_DUMP_PATH
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Institution synonym mapping for dataset variants
const INSTITUTION_SYNONYMS: Record<string, string> = {
  // TU Delft variants
  'Technische Universiteit Delft': 'tud',
  'TU Delft': 'tud',
  'Delft University of Technology': 'tud',
  
  // TU/e variants
  'Technische Universiteit Eindhoven': 'tue',
  'TU/e': 'tue',
  'Eindhoven University of Technology': 'tue',
  
  // Erasmus variants
  'Erasmus Universiteit Rotterdam': 'eur',
  'Erasmus University Rotterdam': 'eur',
  'EUR': 'eur',
  
  // Leiden variants
  'Universiteit Leiden': 'lei',
  'Leiden University': 'lei',
  
  // Maastricht variants
  'Universiteit Maastricht': 'um',
  'Maastricht University': 'um',
  
  // Open University variants
  'Open Universiteit': 'ou',
  'Open University': 'ou',
  
  // Radboud variants
  'Radboud Universiteit': 'ru',
  'Radboud University': 'ru',
  
  // Tilburg variants
  'Universiteit van Tilburg': 'tiu',
  'Tilburg University': 'tiu',
  
  // UvA variants
  'Universiteit van Amsterdam': 'uva',
  'University of Amsterdam': 'uva',
  'UvA': 'uva',
  
  // RUG variants
  'Rijksuniversiteit Groningen': 'rug',
  'University of Groningen': 'rug',
  'RUG': 'rug',
  
  // Twente variants
  'Universiteit Twente': 'ut',
  'University of Twente': 'ut',
  'UT': 'ut',
  
  // Utrecht variants
  'Universiteit Utrecht': 'uu',
  'Utrecht University': 'uu',
  'UU': 'uu',
  
  // VU variants
  'Vrije Universiteit Amsterdam': 'vu',
  'VU Amsterdam': 'vu',
  'VU': 'vu',
  
  // WUR variants
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

type Program = z.infer<typeof ProgramSchema>

interface InstitutionData {
  id: string
  name: string
  programmes: any[]
}

/**
 * Load UNL universities from database
 */
async function loadUniversities(): Promise<Map<string, string>> {
  const { data: universities, error } = await supabase
    .from('universities')
    .select('id, slug, official_name, common_name')
  
  if (error) {
    throw new Error(`Failed to load universities: ${error.message}`)
  }
  
  const universityMap = new Map<string, string>()
  for (const uni of universities || []) {
    universityMap.set(uni.slug, uni.id)
    // Also map by official and common names
    universityMap.set(uni.official_name.toLowerCase(), uni.id)
    universityMap.set(uni.common_name.toLowerCase(), uni.id)
  }
  
  return universityMap
}

/**
 * Map institution name to our university ID
 */
function mapInstitutionToUniversity(institutionName: string, universityMap: Map<string, string>): string | null {
  const normalized = institutionName.toLowerCase().trim()
  
  // Direct synonym mapping
  const slug = INSTITUTION_SYNONYMS[institutionName]
  if (slug) {
    return universityMap.get(slug) || null
  }
  
  // Try normalized name matching
  for (const [key, id] of universityMap.entries()) {
    if (key.toLowerCase().includes(normalized) || normalized.includes(key.toLowerCase())) {
      return id
    }
  }
  
  return null
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
async function fetchProgrammesFromAPI(): Promise<Program[]> {
  if (!SKDB_API_BASE || !SKDB_API_KEY) {
    throw new Error('SKDB_API_BASE and SKDB_API_KEY must be set for API mode')
  }
  
  console.log('📡 Fetching programmes from OData API...')
  
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
    const programmes: Program[] = []
    
    for (const institution of data.value || []) {
      const universityId = mapInstitutionToUniversity(institution.name, await loadUniversities())
      if (!universityId) {
        console.log(`⚠️  Skipping non-WO institution: ${institution.name}`)
        continue
      }
      
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
async function parseProgrammesFromCSV(): Promise<Program[]> {
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
  
  const programmes: Program[] = []
  const universityMap = await loadUniversities()
  
  for (const record of records) {
    const universityId = mapInstitutionToUniversity(record.institution || record.university, universityMap)
    if (!universityId) {
      console.log(`⚠️  Skipping non-WO institution: ${record.institution || record.university}`)
      continue
    }
    
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
async function parseProgrammesFromXLSX(): Promise<Program[]> {
  if (!SKDB_DUMP_PATH || !existsSync(SKDB_DUMP_PATH)) {
    throw new Error(`XLSX dump file not found: ${SKDB_DUMP_PATH}`)
  }
  
  console.log('📊 Parsing programmes from XLSX dump...')
  
  const workbook = XLSX.readFile(SKDB_DUMP_PATH)
  const sheetName = workbook.SheetNames[0] // Use first sheet
  const worksheet = workbook.Sheets[sheetName]
  const records = XLSX.utils.sheet_to_json(worksheet)
  
  const programmes: Program[] = []
  const universityMap = await loadUniversities()
  
  for (const record of records as any[]) {
    const universityId = mapInstitutionToUniversity(record.institution || record.university, universityMap)
    if (!universityId) {
      console.log(`⚠️  Skipping non-WO institution: ${record.institution || record.university}`)
      continue
    }
    
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
 * Upsert programmes to database
 */
async function upsertProgrammes(programmes: Program[]): Promise<void> {
  console.log('💾 Upserting programmes to database...')
  
  const universityMap = await loadUniversities()
  const stats = new Map<string, { bachelor: number, master: number, premaster: number }>()
  
  for (const programme of programmes) {
    const universityId = mapInstitutionToUniversity(programme.institution, universityMap)
    if (!universityId) continue
    
    // Initialize stats for this university
    if (!stats.has(universityId)) {
      stats.set(universityId, { bachelor: 0, master: 0, premaster: 0 })
    }
    
    // Upsert programme
    const { error } = await supabase
      .from('programs')
      .upsert({
        university_id: universityId,
        croho_code: programme.crohoCode,
        name: programme.name,
        name_en: programme.nameEn,
        degree_level: programme.degreeLevel,
        language_codes: programme.languageCodes,
        faculty: programme.faculty,
        active: programme.active
      }, {
        onConflict: 'university_id,name,degree_level',
        ignoreDuplicates: false
      })
    
    if (error) {
      console.error(`❌ Failed to upsert programme ${programme.name}:`, error)
      continue
    }
    
    // Update stats
    const uniStats = stats.get(universityId)!
    uniStats[programme.degreeLevel]++
  }
  
  // Log statistics
  console.log('\n📊 Import Statistics:')
  for (const [universityId, uniStats] of stats.entries()) {
    const { data: uni } = await supabase
      .from('universities')
      .select('common_name')
      .eq('id', universityId)
      .single()
    
    console.log(`  ${uni?.common_name || universityId}:`)
    console.log(`    Bachelor: ${uniStats.bachelor}`)
    console.log(`    Master: ${uniStats.master}`)
    console.log(`    Pre-Master: ${uniStats.premaster}`)
  }
}

/**
 * Main import function
 */
async function main(): Promise<void> {
  console.log('🚀 Starting programme import...')
  
  try {
    let programmes: Program[] = []
    
    // Determine import mode
    if (SKDB_API_BASE && SKDB_API_KEY) {
      programmes = await fetchProgrammesFromAPI()
    } else if (SKDB_DUMP_PATH) {
      const ext = SKDB_DUMP_PATH.toLowerCase().split('.').pop()
      if (ext === 'csv') {
        programmes = await parseProgrammesFromCSV()
      } else if (ext === 'xlsx' || ext === 'xls') {
        programmes = await parseProgrammesFromXLSX()
      } else {
        throw new Error(`Unsupported file format: ${ext}`)
      }
    } else {
      throw new Error('Either SKDB_API_BASE+SKDB_API_KEY or SKDB_DUMP_PATH must be set')
    }
    
    if (programmes.length === 0) {
      console.log('⚠️  No programmes found to import')
      return
    }
    
    await upsertProgrammes(programmes)
    console.log('✅ Programme import completed successfully!')
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { main as importProgrammes }
