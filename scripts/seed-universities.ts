#!/usr/bin/env tsx

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

async function seedUniversities() {
  console.log('🌱 Starting universities seeding...')
  
  // Read the institutions data file
  const institutionsPath = path.join(process.cwd(), 'data', 'nl-institutions.v1.json')
  const institutionsData: InstitutionData = JSON.parse(fs.readFileSync(institutionsPath, 'utf8'))
  
  console.log(`📚 Loaded institutions data:`)
  console.log(`  - WO: ${institutionsData.wo.length}`)
  console.log(`  - WO Special: ${institutionsData.wo_special.length}`)
  console.log(`  - HBO: ${institutionsData.hbo.length}`)
  
  // Combine all institutions
  const allInstitutions = [
    ...institutionsData.wo,
    ...institutionsData.wo_special,
    ...institutionsData.hbo
  ]
  
  console.log(`\n📝 Processing ${allInstitutions.length} institutions...`)
  
  // Check existing universities
  const { data: existing } = await supabase
    .from('universities')
    .select('slug')
  
  const existingSlugs = new Set(existing?.map(u => u.slug) || [])
  console.log(`📊 Found ${existingSlugs.size} existing universities in database`)
  
  // Prepare universities for insertion
  const universitiesToInsert = allInstitutions
    .filter(inst => !existingSlugs.has(inst.id))
    .map(inst => ({
      id: generateUUID(), // Generate new UUID
      name: inst.label,
      slug: inst.id,
      branding: {
        logo_url: `/logos/${inst.id}.png`,
        primary_color: "#4F46E5", // Default brand color
        welcome_message: `Find your perfect roommate at ${inst.label}!`
      },
      eligibility_domains: [], // Empty for now
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
  
  console.log(`\n➕ Inserting ${universitiesToInsert.length} new universities...`)
  
  if (universitiesToInsert.length === 0) {
    console.log('✅ All universities already exist in database')
    return
  }
  
  // Insert in batches to avoid payload size limits
  const batchSize = 50
  let inserted = 0
  
  for (let i = 0; i < universitiesToInsert.length; i += batchSize) {
    const batch = universitiesToInsert.slice(i, i + batchSize)
    
    const { error } = await supabase
      .from('universities')
      .insert(batch)
    
    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error)
      continue
    }
    
    inserted += batch.length
    console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} universities`)
  }
  
  console.log(`\n🎉 Successfully inserted ${inserted} universities!`)
  
  // Verify the insertion
  const { data: finalCount } = await supabase
    .from('universities')
    .select('id', { count: 'exact', head: true })
  
  console.log(`📊 Total universities in database: ${finalCount}`)
  
  // Show some examples
  const { data: examples } = await supabase
    .from('universities')
    .select('name, slug')
    .limit(5)
  
  console.log('\n📋 Sample universities:')
  examples?.forEach(uni => {
    console.log(`  - ${uni.name} (${uni.slug})`)
  })
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

async function main() {
  try {
    await seedUniversities()
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

main()
