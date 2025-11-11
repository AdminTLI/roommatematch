#!/usr/bin/env tsx

// Load environment variables from .env.local
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUniversitiesCities() {
  console.log('🔍 Checking universities and cities in database...\n')
  
  // Check if city column exists by trying to select it
  console.log('1. Checking if city column exists...')
  const { data: sample, error: sampleError } = await supabase
    .from('universities')
    .select('id, name, slug, city, is_active')
    .limit(5)
  
  if (sampleError) {
    console.error('❌ Error fetching universities:', sampleError)
    if (sampleError.message?.includes('column') && sampleError.message?.includes('city')) {
      console.error('   ⚠️  The city column does not exist in the universities table!')
      console.error('   💡 You need to run the migration: db/migrations/049_add_city_to_universities.sql')
    }
    return
  }
  
  console.log(`✅ Successfully fetched ${sample?.length || 0} universities`)
  if (sample && sample.length > 0) {
    console.log('   Sample universities:')
    sample.forEach(uni => {
      console.log(`   - ${uni.name} (${uni.slug}): city = ${uni.city || 'NULL'}, active = ${uni.is_active}`)
    })
  }
  
  // Check total count
  console.log('\n2. Checking total universities...')
  const { count, error: countError } = await supabase
    .from('universities')
    .select('*', { count: 'exact', head: true })
  
  if (countError) {
    console.error('❌ Error counting universities:', countError)
  } else {
    console.log(`✅ Total universities in database: ${count}`)
  }
  
  // Check universities with cities
  console.log('\n3. Checking universities with cities...')
  const { data: withCities, error: citiesError } = await supabase
    .from('universities')
    .select('city')
    .eq('is_active', true)
    .not('city', 'is', null)
  
  if (citiesError) {
    console.error('❌ Error fetching universities with cities:', citiesError)
  } else {
    const uniqueCities = Array.from(new Set(withCities?.map(u => u.city).filter(Boolean) || [])).sort()
    console.log(`✅ Universities with cities: ${withCities?.length || 0}`)
    console.log(`✅ Unique cities: ${uniqueCities.length}`)
    if (uniqueCities.length > 0) {
      console.log('   Cities found:')
      uniqueCities.forEach(city => {
        const count = withCities?.filter(u => u.city === city).length || 0
        console.log(`   - ${city}: ${count} university/ies`)
      })
    } else {
      console.log('   ⚠️  No cities found! You need to run the mapping script.')
      console.log('   💡 Run: npm run map:universities')
    }
  }
  
  // Check active universities without cities
  console.log('\n4. Checking active universities without cities...')
  const { data: withoutCities, error: withoutError } = await supabase
    .from('universities')
    .select('name, slug, city')
    .eq('is_active', true)
    .is('city', null)
    .limit(10)
  
  if (withoutError) {
    console.error('❌ Error fetching universities without cities:', withoutError)
  } else {
    console.log(`✅ Active universities without cities: ${withoutCities?.length || 0}`)
    if (withoutCities && withoutCities.length > 0) {
      console.log('   Universities needing cities:')
      withoutCities.forEach(uni => {
        console.log(`   - ${uni.name} (${uni.slug})`)
      })
      if (withoutCities.length >= 10) {
        console.log('   ... (showing first 10)')
      }
    }
  }
  
  // Test the API query (simulating what the API does)
  console.log('\n5. Testing API query (simulating /api/universities)...')
  const { data: apiTest, error: apiError } = await supabase
    .from('universities')
    .select('city')
    .eq('is_active', true)
    .not('city', 'is', null)
  
  if (apiError) {
    console.error('❌ API query failed:', apiError)
    console.error('   This is the query the API uses to fetch cities')
  } else {
    const uniqueCitiesFromApi = Array.from(
      new Set(apiTest?.map(u => u.city).filter(Boolean) || [])
    ).sort()
    console.log(`✅ API query successful: ${uniqueCitiesFromApi.length} unique cities`)
    if (uniqueCitiesFromApi.length > 0) {
      console.log('   Cities that would be returned by API:')
      uniqueCitiesFromApi.slice(0, 10).forEach(city => {
        console.log(`   - ${city}`)
      })
      if (uniqueCitiesFromApi.length > 10) {
        console.log(`   ... and ${uniqueCitiesFromApi.length - 10} more`)
      }
    } else {
      console.log('   ⚠️  No cities would be returned by the API!')
      console.log('   💡 This means the dropdown will be empty.')
    }
  }
}

async function main() {
  try {
    await checkUniversitiesCities()
  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

main()

