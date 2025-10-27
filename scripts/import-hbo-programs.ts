#!/usr/bin/env tsx

/**
 * HBO Program Importer for Roommate Match
 * 
 * Imports HBO programmes from JSON files in /data/programmes/
 * Maps programmes to universities in the database and creates program records
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { z } from 'zod'

// Environment configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  console.error('')
  console.error('Please set these environment variables and run the script again:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co')
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
  console.error('')
  console.error('You can also run it with:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/import-hbo-programs.ts')
  process.exit(1)
}

// Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Schemas for data validation
const ProgramSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.enum(['bachelor', 'master', 'premaster']),
  sector: z.string().optional(),
  city: z.string().optional(),
  discipline: z.string().optional(),
  modes: z.array(z.string()).optional(),
  isVariant: z.boolean().optional(),
  externalRefs: z.object({
    rioCode: z.string().optional(),
    isat: z.string().optional(),
    instCode: z.string().optional()
  }).optional()
})

const InstitutionProgramsSchema = z.object({
  bachelor: z.array(ProgramSchema).optional(),
  master: z.array(ProgramSchema).optional(),
  premaster: z.array(ProgramSchema).optional()
})

type Program = z.infer<typeof ProgramSchema>
type InstitutionPrograms = z.infer<typeof InstitutionProgramsSchema>

interface ImportStats {
  institution: string
  bachelor: number
  master: number
  premaster: number
  errors: number
}

/**
 * Load universities from database
 */
async function loadUniversities(): Promise<Map<string, string>> {
  console.log('📚 Loading universities from database...')
  
  const { data: universities, error } = await supabase
    .from('universities')
    .select('id, slug, name')
  
  if (error) {
    throw new Error(`Failed to load universities: ${error.message}`)
  }
  
  const universityMap = new Map<string, string>()
  for (const uni of universities || []) {
    universityMap.set(uni.slug, uni.id)
    console.log(`   ✓ ${uni.name} (${uni.slug})`)
  }
  
  console.log(`📚 Loaded ${universityMap.size} universities\n`)
  return universityMap
}

/**
 * Read and parse institution programs from JSON file
 */
function readInstitutionPrograms(filePath: string): InstitutionPrograms | null {
  try {
    const fileContent = readFileSync(filePath, 'utf-8')
    const rawData = JSON.parse(fileContent)
    
    // Validate the structure
    return InstitutionProgramsSchema.parse(rawData)
  } catch (error) {
    console.error(`❌ Failed to parse ${filePath}:`, error)
    return null
  }
}

/**
 * Transform program data for database insertion
 */
function transformProgram(
  program: Program, 
  universityId: string, 
  degreeLevel: 'bachelor' | 'master' | 'premaster'
): any {
  return {
    university_id: universityId,
    croho_code: program.id,
    name: program.name,
    name_en: null, // HBO programs typically don't have English names
    degree_level: degreeLevel,
    language_codes: [], // Not consistently available in HBO data
    faculty: program.discipline || null,
    active: true
  }
}

/**
 * Import programs for a single institution
 */
async function importInstitutionPrograms(
  institutionSlug: string,
  programs: InstitutionPrograms,
  universityId: string
): Promise<ImportStats> {
  const stats: ImportStats = {
    institution: institutionSlug,
    bachelor: 0,
    master: 0,
    premaster: 0,
    errors: 0
  }
  
  const programsToInsert: any[] = []
  const seenCrohoCodes = new Set<string>()
  
  // Process bachelor programs
  if (programs.bachelor) {
    for (const program of programs.bachelor) {
      if (seenCrohoCodes.has(program.id)) {
        console.log(`   ⚠️  Skipping duplicate CROHO code: ${program.id}`)
        continue
      }
      
      try {
        const transformedProgram = transformProgram(program, universityId, 'bachelor')
        programsToInsert.push(transformedProgram)
        seenCrohoCodes.add(program.id)
        stats.bachelor++
      } catch (error) {
        console.error(`   ❌ Error transforming bachelor program ${program.name}:`, error)
        stats.errors++
      }
    }
  }
  
  // Process master programs
  if (programs.master) {
    for (const program of programs.master) {
      if (seenCrohoCodes.has(program.id)) {
        console.log(`   ⚠️  Skipping duplicate CROHO code: ${program.id}`)
        continue
      }
      
      try {
        const transformedProgram = transformProgram(program, universityId, 'master')
        programsToInsert.push(transformedProgram)
        seenCrohoCodes.add(program.id)
        stats.master++
      } catch (error) {
        console.error(`   ❌ Error transforming master program ${program.name}:`, error)
        stats.errors++
      }
    }
  }
  
  // Process premaster programs
  if (programs.premaster) {
    for (const program of programs.premaster) {
      if (seenCrohoCodes.has(program.id)) {
        console.log(`   ⚠️  Skipping duplicate CROHO code: ${program.id}`)
        continue
      }
      
      try {
        const transformedProgram = transformProgram(program, universityId, 'premaster')
        programsToInsert.push(transformedProgram)
        seenCrohoCodes.add(program.id)
        stats.premaster++
      } catch (error) {
        console.error(`   ❌ Error transforming premaster program ${program.name}:`, error)
        stats.errors++
      }
    }
  }
  
  // Insert programs into database
  if (programsToInsert.length > 0) {
    const { error } = await supabase
      .from('programs')
      .upsert(programsToInsert, {
        onConflict: 'croho_code',
        ignoreDuplicates: false
      })
    
    if (error) {
      console.error(`   ❌ Failed to insert programs for ${institutionSlug}:`, error)
      stats.errors += programsToInsert.length
    } else {
      console.log(`   ✓ Inserted ${programsToInsert.length} programs`)
    }
  }
  
  return stats
}

/**
 * Main import function
 */
async function main(): Promise<void> {
  console.log('🚀 Starting HBO program import...\n')
  
  try {
    // Load universities
    const universityMap = await loadUniversities()
    
    // Get list of JSON files in programmes directory
    const programmesDir = join(process.cwd(), 'data', 'programmes')
    if (!existsSync(programmesDir)) {
      throw new Error(`Programmes directory not found: ${programmesDir}`)
    }
    
    const jsonFiles = readdirSync(programmesDir)
      .filter(file => file.endsWith('.json'))
      .sort()
    
    console.log(`📁 Found ${jsonFiles.length} institution files\n`)
    
    const allStats: ImportStats[] = []
    let totalPrograms = 0
    let totalErrors = 0
    
    // Process each institution file
    for (const fileName of jsonFiles) {
      const institutionSlug = fileName.replace('.json', '')
      const filePath = join(programmesDir, fileName)
      
      console.log(`🏫 Processing ${institutionSlug}...`)
      
      // Check if university exists in database
      const universityId = universityMap.get(institutionSlug)
      if (!universityId) {
        console.log(`   ⚠️  University not found in database: ${institutionSlug}`)
        continue
      }
      
      // Read and parse programs
      const programs = readInstitutionPrograms(filePath)
      if (!programs) {
        console.log(`   ❌ Failed to parse programs for ${institutionSlug}`)
        continue
      }
      
      // Import programs
      const stats = await importInstitutionPrograms(institutionSlug, programs, universityId)
      allStats.push(stats)
      
      totalPrograms += stats.bachelor + stats.master + stats.premaster
      totalErrors += stats.errors
      
      console.log(`   📊 ${stats.bachelor} bachelor, ${stats.master} master, ${stats.premaster} premaster, ${stats.errors} errors\n`)
    }
    
    // Print summary
    console.log('📊 Import Summary:')
    console.log('==================')
    
    for (const stats of allStats) {
      const total = stats.bachelor + stats.master + stats.premaster
      console.log(`${stats.institution.padEnd(20)} | ${total.toString().padStart(4)} programs | ${stats.bachelor}B ${stats.master}M ${stats.premaster}P | ${stats.errors} errors`)
    }
    
    console.log('==================')
    console.log(`Total: ${totalPrograms} programs imported, ${totalErrors} errors`)
    
    if (totalErrors === 0) {
      console.log('✅ HBO program import completed successfully!')
    } else {
      console.log(`⚠️  HBO program import completed with ${totalErrors} errors`)
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}
