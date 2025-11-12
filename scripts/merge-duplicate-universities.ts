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

/**
 * Merge duplicate TU Delft universities
 * 
 * This script finds duplicate TU Delft universities and merges them:
 * - "Delft University of Technology" (slug: tudelft)
 * - "Technische Universiteit Delft (TU Delft)" (slug: tud)
 * 
 * It will:
 * 1. Find both universities
 * 2. Determine which one to keep (prefer the one with slug 'tud')
 * 3. Update all profiles referencing the duplicate to reference the kept one
 * 4. Update all admins referencing the duplicate
 * 5. Delete the duplicate university
 */

async function mergeDuplicateUniversities() {
  try {
    console.log('🔍 Searching for duplicate TU Delft universities...\n')

    // Find universities in Delft
    const { data: delftUniversities, error: searchError } = await supabase
      .from('universities')
      .select('id, name, slug, city, is_active')
      .eq('city', 'Delft')
      .order('name')

    if (searchError) {
      console.error('❌ Error searching for universities:', searchError)
      process.exit(1)
    }

    if (!delftUniversities || delftUniversities.length === 0) {
      console.log('ℹ️  No universities found in Delft')
      return
    }

    console.log(`Found ${delftUniversities.length} universities in Delft:`)
    delftUniversities.forEach(uni => {
      console.log(`  - ${uni.name} (slug: ${uni.slug}, id: ${uni.id})`)
    })

    // Find TU Delft duplicates (check by name patterns and city)
    const tuDelftNames = [
      'Delft University of Technology',
      'Technische Universiteit Delft',
      'TU Delft'
    ]

    const duplicates = delftUniversities.filter(uni => 
      tuDelftNames.some(name => 
        uni.name.toLowerCase().includes(name.toLowerCase()) ||
        uni.name.toLowerCase().includes('delft') && uni.name.toLowerCase().includes('techn')
      )
    )

    if (duplicates.length < 2) {
      console.log('\n✅ No duplicate TU Delft universities found')
      return
    }

    console.log(`\n📋 Found ${duplicates.length} potential duplicates:`)
    duplicates.forEach(dup => {
      console.log(`  - ${dup.name} (slug: ${dup.slug}, id: ${dup.id})`)
    })

    // Determine which one to keep
    // Prefer 'tud' slug, then 'tudelft', then the one with more users
    let keepUniversity = duplicates.find(uni => uni.slug === 'tud')
    if (!keepUniversity) {
      keepUniversity = duplicates.find(uni => uni.slug === 'tudelft')
    }
    if (!keepUniversity) {
      // If neither has the expected slug, keep the first one
      keepUniversity = duplicates[0]
    }

    const duplicateUniversities = duplicates.filter(uni => uni.id !== keepUniversity!.id)

    console.log(`\n✅ Keeping: ${keepUniversity.name} (slug: ${keepUniversity.slug}, id: ${keepUniversity.id})`)
    console.log(`🗑️  Merging ${duplicateUniversities.length} duplicate(s):`)
    duplicateUniversities.forEach(dup => {
      console.log(`  - ${dup.name} (slug: ${dup.slug}, id: ${dup.id})`)
    })

    // Update the kept university to have the correct name and city
    const preferredName = "Technische Universiteit Delft (TU Delft)"
    if (keepUniversity.name !== preferredName) {
      console.log(`\n📝 Updating kept university name to: ${preferredName}`)
      const { error: updateError } = await supabase
        .from('universities')
        .update({ 
          name: preferredName,
          city: 'Delft',
          is_active: true
        })
        .eq('id', keepUniversity.id)

      if (updateError) {
        console.error('❌ Error updating kept university:', updateError)
        process.exit(1)
      }
    }

    // For each duplicate, update all references
    for (const duplicate of duplicateUniversities) {
      console.log(`\n🔄 Processing duplicate: ${duplicate.name} (${duplicate.id})`)

      // Count profiles using this university
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('university_id', duplicate.id)

      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError)
        continue
      }

      const profileCount = profiles?.length || 0
      console.log(`  📊 Found ${profileCount} profiles using this university`)

      // Update profiles
      if (profileCount > 0) {
        const { error: updateProfilesError } = await supabase
          .from('profiles')
          .update({ university_id: keepUniversity.id })
          .eq('university_id', duplicate.id)

        if (updateProfilesError) {
          console.error('❌ Error updating profiles:', updateProfilesError)
          continue
        }
        console.log(`  ✅ Updated ${profileCount} profiles`)
      }

      // Count admins using this university
      const { data: admins, error: adminsError } = await supabase
        .from('admins')
        .select('id, user_id')
        .eq('university_id', duplicate.id)

      if (adminsError) {
        console.error('❌ Error fetching admins:', adminsError)
        continue
      }

      const adminCount = admins?.length || 0
      console.log(`  📊 Found ${adminCount} admins using this university`)

      // Update admins
      if (adminCount > 0) {
        const { error: updateAdminsError } = await supabase
          .from('admins')
          .update({ university_id: keepUniversity.id })
          .eq('university_id', duplicate.id)

        if (updateAdminsError) {
          console.error('❌ Error updating admins:', updateAdminsError)
          continue
        }
        console.log(`  ✅ Updated ${adminCount} admins`)
      }

      // Count housing_listings using this university
      const { data: listings, error: listingsError } = await supabase
        .from('housing_listings')
        .select('id')
        .eq('university_id', duplicate.id)

      if (listingsError) {
        console.error('❌ Error fetching housing_listings:', listingsError)
        continue
      }

      const listingCount = listings?.length || 0
      console.log(`  📊 Found ${listingCount} housing listings using this university`)

      // Update housing_listings
      if (listingCount > 0) {
        const { error: updateListingsError } = await supabase
          .from('housing_listings')
          .update({ university_id: keepUniversity.id })
          .eq('university_id', duplicate.id)

        if (updateListingsError) {
          console.error('❌ Error updating housing_listings:', updateListingsError)
          continue
        }
        console.log(`  ✅ Updated ${listingCount} housing listings`)
      }

      // Delete the duplicate university
      console.log(`  🗑️  Deleting duplicate university: ${duplicate.name}`)
      const { error: deleteError } = await supabase
        .from('universities')
        .delete()
        .eq('id', duplicate.id)

      if (deleteError) {
        console.error('❌ Error deleting duplicate university:', deleteError)
        console.error('   Error details:', deleteError.message)
        console.error('   This might be due to other foreign key references. Please check the database manually.')
        continue
      }
      console.log(`  ✅ Deleted duplicate university: ${duplicate.name}`)
    }

    console.log('\n✅ Merge complete!')
    console.log(`\n📊 Final state:`)
    console.log(`  - Kept: ${keepUniversity.name} (slug: ${keepUniversity.slug})`)
    console.log(`  - Merged: ${duplicateUniversities.length} duplicate(s)`)

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Run the merge
mergeDuplicateUniversities()
  .then(() => {
    console.log('\n✨ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })

