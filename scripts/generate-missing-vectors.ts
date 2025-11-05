#!/usr/bin/env tsx

/**
 * Generate missing user vectors for users who have responses but no vector
 * Run with: npx tsx scripts/generate-missing-vectors.ts
 */

import { createClient } from '@supabase/supabase-js'

// Load environment variables (should be set in .env.local or shell)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

async function generateMissingVectors() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  console.log('🔍 Finding users without vectors...')
  
  // Find users with responses but no vector
  // We need to check all users and see which ones don't have vectors
  const { data: allUsers, error: usersError } = await supabase
    .from('users')
    .select('id, email')
    .limit(1000) // Reasonable limit
  
  if (usersError) {
    console.error('❌ Error fetching users:', usersError)
    return
  }
  
  if (!allUsers || allUsers.length === 0) {
    console.log('⚠️  No users found')
    return
  }
  
  console.log(`📊 Checking ${allUsers.length} users...`)
  
  // Get all users who have vectors
  const { data: usersWithVectors, error: vectorsError } = await supabase
    .from('user_vectors')
    .select('user_id')
  
  if (vectorsError) {
    console.error('❌ Error fetching user vectors:', vectorsError)
    return
  }
  
  const vectorUserIds = new Set((usersWithVectors || []).map(v => v.user_id))
  
  // Find users without vectors who have responses
  const usersWithoutVectors = []
  
  for (const user of allUsers) {
    if (!vectorUserIds.has(user.id)) {
      // Check if user has responses
      const { data: responses, error: respError } = await supabase
        .from('responses')
        .select('question_key')
        .eq('user_id', user.id)
        .limit(1)
      
      if (respError) {
        console.error(`⚠️  Error checking responses for ${user.email}:`, respError.message)
        continue
      }
      
      if (responses && responses.length > 0) {
        usersWithoutVectors.push(user)
      }
    }
  }
  
  console.log(`\n📋 Found ${usersWithoutVectors.length} users without vectors who have responses\n`)
  
  if (usersWithoutVectors.length === 0) {
    console.log('✨ All users with responses already have vectors!')
    return
  }
  
  // Generate vectors for each user
  let successCount = 0
  let failCount = 0
  
  for (const user of usersWithoutVectors) {
    console.log(`🔄 Generating vector for ${user.email} (${user.id})...`)
    
    // Call the database function to generate and store vector
    const { error: vectorError } = await supabase
      .rpc('compute_user_vector_and_store', { p_user_id: user.id })
    
    if (vectorError) {
      console.error(`  ❌ Failed: ${vectorError.message}`)
      failCount++
    } else {
      console.log(`  ✅ Vector generated successfully`)
      successCount++
    }
  }
  
  console.log(`\n✨ Vector generation complete!`)
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
}

generateMissingVectors()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('💥 Fatal error:', err)
    process.exit(1)
  })
