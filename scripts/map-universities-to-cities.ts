#!/usr/bin/env tsx

// Load environment variables from .env.local
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface Institution {
  id: string
  label: string
  kind: string
}

interface InstitutionData {
  wo: Institution[]
  wo_special: Institution[]
  hbo: Institution[]
}

// Comprehensive city mapping for Dutch universities
const cityMapping: Record<string, string> = {
  // WO universities
  'uva': 'Amsterdam',
  'vu': 'Amsterdam',
  'uu': 'Utrecht',
  'leiden': 'Leiden',
  'rug': 'Groningen',
  'eur': 'Rotterdam',
  'tud': 'Delft',
  'tudelft': 'Delft', // Alternative slug for TU Delft
  'tue': 'Eindhoven',
  'utwente': 'Enschede',
  'wur': 'Wageningen',
  'ru': 'Nijmegen',
  'um': 'Maastricht',
  'tilburg': 'Tilburg',
  'ou': 'Heerlen', // Open Universiteit is based in Heerlen
  
  // WO special
  'uvh': 'Utrecht',
  'pthu': 'Amsterdam', // Main campus in Amsterdam
  'tua': 'Apeldoorn',
  'tuu': 'Utrecht',
  
  // HBO universities
  'aeres': 'Wageningen', // Main location
  'ahk': 'Amsterdam',
  'artez': 'Arnhem', // Main location, also has Zwolle and Enschede
  'avans': 'Breda', // Main location, also has 's-Hertogenbosch and Tilburg
  'buas': 'Breda',
  'che': 'Ede',
  'codarts': 'Rotterdam',
  'hhs': 'Den Haag',
  'dekempel': 'Helmond',
  'dae': 'Eindhoven',
  'driestar': 'Gouda',
  'fontys': 'Eindhoven', // Main location, multiple campuses
  'gerritrietveld': 'Amsterdam',
  'han': 'Nijmegen', // Main location, also has Arnhem
  'hanze': 'Groningen',
  'has': "'s-Hertogenbosch",
  'hdk-denhaag': 'Den Haag',
  'inholland': 'Amsterdam', // Main location, multiple campuses
  'ipabo': 'Amsterdam',
  'kpz': 'Zwolle',
  'hsleiden': 'Leiden',
  'hr': 'Rotterdam',
  'hu': 'Utrecht',
  'hva': 'Amsterdam',
  'viaa': 'Zwolle',
  'hku': 'Utrecht',
  'hotelschool': 'Den Haag',
  'hz': 'Vlissingen',
  'iselinge': 'Doetinchem',
  'marnix': 'Utrecht',
  'nhlstenden': 'Leeuwarden', // Main location
  'saxion': 'Enschede', // Main location, also has Deventer and Apeldoorn
  'thomasmore': 'Rotterdam',
  'vhl': 'Leeuwarden', // Main location, also has Velp
  'windesheim': 'Zwolle',
  'zuyd': 'Maastricht' // Main location, also has Heerlen and Sittard
}

async function mapUniversitiesToCities() {
  console.log('🌱 Starting university to city mapping...')
  
  // Read the institutions data file
  const institutionsPath = path.join(process.cwd(), 'data', 'nl-institutions.v1.json')
  const institutionsData: InstitutionData = JSON.parse(fs.readFileSync(institutionsPath, 'utf8'))
  
  // Combine all institutions
  const allInstitutions = [
    ...institutionsData.wo,
    ...institutionsData.wo_special,
    ...institutionsData.hbo
  ]
  
  console.log(`📝 Processing ${allInstitutions.length} institutions...`)
  
  // Get all existing universities from database
  const { data: existingUniversities, error: fetchError } = await supabase
    .from('universities')
    .select('id, slug, name, city')
  
  if (fetchError) {
    console.error('❌ Error fetching universities:', fetchError)
    process.exit(1)
  }
  
  console.log(`📊 Found ${existingUniversities?.length || 0} universities in database`)
  
  // Prepare updates
  const updates: Array<{ slug: string; city: string; name: string }> = []
  const notFound: string[] = []
  
  for (const inst of allInstitutions) {
    const city = cityMapping[inst.id]
    if (!city) {
      console.warn(`⚠️  No city mapping found for: ${inst.id} (${inst.label})`)
      notFound.push(inst.id)
      continue
    }
    
    const existing = existingUniversities?.find(u => u.slug === inst.id)
    if (existing) {
      // Only update if city is different or null
      if (existing.city !== city || !existing.city) {
        updates.push({ slug: inst.id, city, name: inst.label })
      }
    } else {
      console.warn(`⚠️  University not found in database: ${inst.id} (${inst.label})`)
    }
  }
  
  // Also check for universities in database that aren't in the JSON file but have a city mapping
  for (const uni of existingUniversities || []) {
    // Skip if already processed
    if (allInstitutions.find(inst => inst.id === uni.slug)) {
      continue
    }
    
    // Check if we have a mapping for this slug
    const city = cityMapping[uni.slug]
    if (city && (uni.city !== city || !uni.city)) {
      updates.push({ slug: uni.slug, city, name: uni.name })
    }
  }
  
  console.log(`\n🔄 Found ${updates.length} universities to update`)
  if (notFound.length > 0) {
    console.log(`⚠️  ${notFound.length} institutions without city mapping:`, notFound.join(', '))
  }
  
  // Check if we can update by testing with the first university
  // If we get the trigger error, we'll provide clear instructions
  console.log('🔧 Testing database connection and trigger function...')
  
  if (updates.length === 0) {
    console.log('✅ No universities need updating. All cities are already set.')
    return
  }
  
  // Test update with the first university to check for trigger issues
  const testUpdate = updates[0]
  const { error: testError } = await supabase
    .from('universities')
    .update({ city: testUpdate.city })
    .eq('slug', testUpdate.slug)
    .select('id')
    .single()
  
  if (testError && (testError.message?.includes('public.now()') || testError.code === '42883')) {
    console.error('\n❌ ERROR: Trigger function issue detected!')
    console.error('   The database trigger is trying to use "public.now()" which doesn\'t exist.')
    console.error('\n📋 SOLUTION:')
    console.error('   1. Go to your Supabase dashboard → SQL Editor')
    console.error('   2. Run the SQL from: scripts/fix-trigger-function.sql')
    console.error('      OR apply migration: db/migrations/049_add_city_to_universities.sql')
    console.error('   3. Then run this script again: npm run map:universities')
    console.error('\n   The fix updates the trigger function to use clock_timestamp() instead of NOW()\n')
    process.exit(1)
  }
  
  if (testError && !testError.message?.includes('public.now()')) {
    console.error(`❌ Error testing update: ${testError.message}`)
    console.error('   Please check your database connection and permissions.')
    process.exit(1)
  }
  
  console.log('✅ Trigger function is working correctly. Proceeding with updates...\n')
  
  let updated = 1 // Count the test update
  console.log(`✅ Updated ${testUpdate.name} -> ${testUpdate.city} (test)`)
  
  let failed = 0
  
  // Update remaining universities (skip the first one as we already updated it)
  for (let i = 1; i < updates.length; i++) {
    const update = updates[i]
    try {
      // Attempt direct update - this will work if the migration has been applied
      const { error } = await supabase
        .from('universities')
        .update({ city: update.city })
        .eq('slug', update.slug)
        .select('id')
        .single()
      
      if (error) {
        console.error(`❌ Error updating ${update.slug}:`, error.message)
        failed++
      } else {
        updated++
        if (updated % 10 === 0 || updated === updates.length) {
          console.log(`   Progress: ${updated}/${updates.length} updated...`)
        }
      }
    } catch (err: any) {
      console.error(`❌ Exception updating ${update.slug}:`, err.message)
      failed++
    }
  }
  
  if (failed > 0) {
    console.log(`\n⚠️  ${failed} universities failed to update.`)
  }
  
  console.log(`\n🎉 Successfully updated ${updated} universities!`)
  
  // Verify the updates
  const { data: verification } = await supabase
    .from('universities')
    .select('slug, name, city')
    .order('city')
  
  // Group by city
  const byCity: Record<string, string[]> = {}
  verification?.forEach(uni => {
    if (uni.city) {
      if (!byCity[uni.city]) {
        byCity[uni.city] = []
      }
      byCity[uni.city].push(uni.name)
    }
  })
  
  console.log('\n📋 Universities by city:')
  Object.entries(byCity)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([city, unis]) => {
      console.log(`  ${city}: ${unis.length} university/ies`)
    })
  
  // Show universities without city
  const withoutCity = verification?.filter(uni => !uni.city)
  if (withoutCity && withoutCity.length > 0) {
    console.log(`\n⚠️  ${withoutCity.length} universities without city:`)
    withoutCity.forEach(uni => {
      console.log(`  - ${uni.name} (${uni.slug})`)
    })
  }
}

async function main() {
  try {
    await mapUniversitiesToCities()
  } catch (error) {
    console.error('Mapping failed:', error)
    process.exit(1)
  }
}

main()
