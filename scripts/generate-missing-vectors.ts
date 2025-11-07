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
  // Verify service role key is working by testing connection
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  // Test connection with a simple query
  const { error: testError } = await supabase
    .from('users')
    .select('id')
    .limit(1)
  
  if (testError) {
    console.error('❌ Service role key test failed:', testError.message)
    console.error('   Error code:', testError.code)
    console.error('   This may indicate:')
    console.error('   1. SUPABASE_SERVICE_ROLE_KEY is incorrect or missing')
    console.error('   2. RLS policies are blocking service role access (unexpected)')
    console.error('   3. Database connection issue')
    console.error('   4. Invalid Supabase URL')
    if (testError.code === '42501') {
      console.error('\n   ⚠️  RLS violation detected - service role should bypass RLS')
      console.error('   Check that SUPABASE_SERVICE_ROLE_KEY is the service_role key, not anon key')
    }
    process.exit(1)
  }
  
  // Verify RPC function exists
  console.log('🔍 Verifying RPC function exists...')
  const { error: rpcTestError } = await supabase
    .rpc('compute_user_vector_and_store', { p_user_id: '00000000-0000-0000-0000-000000000000' })
  
  if (rpcTestError) {
    if (rpcTestError.code === '42883') {
      console.error('❌ RPC function compute_user_vector_and_store does not exist')
      console.error('   Run database migrations to create this function')
      process.exit(1)
    } else if (rpcTestError.code === '42501') {
      console.error('❌ RLS policy violation on RPC function')
      console.error('   The RPC function may need SECURITY DEFINER or proper permissions')
      process.exit(1)
    } else if (rpcTestError.code === 'P0001') {
      // Expected error for invalid user ID - function exists
      console.log('✅ RPC function exists (test call failed as expected)')
    } else {
      console.warn('⚠️  Unexpected RPC test error (may be expected):', rpcTestError.message)
      console.log('✅ Continuing - RPC function appears to exist')
    }
  } else {
    console.log('✅ RPC function verified')
  }
  
  console.log('🔍 Finding users without vectors...')
  
  // Find users with responses but no vector
  // We need to check all users and see which ones don't have vectors
  const { data: allUsers, error: usersError } = await supabase
    .from('users')
    .select('id, email')
    .limit(1000) // Reasonable limit
  
  if (usersError) {
    console.error('❌ Error fetching users:', usersError.message)
    if (usersError.code === '42501') {
      console.error('   RLS policy violation - service role should bypass RLS')
    }
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
    console.log(`🔄 Generating vector for user ${user.id.substring(0, 8)}...`)
    
    try {
      // Call the database function to generate and store vector
      const { error: vectorError } = await supabase
        .rpc('compute_user_vector_and_store', { p_user_id: user.id })
      
      if (vectorError) {
        console.error(`  ❌ Failed: ${vectorError.message}`)
        console.error(`     Error code: ${vectorError.code || 'unknown'}`)
        
        if (vectorError.code === '42501') {
          console.error(`     RLS policy violation - RPC function may need SECURITY DEFINER`)
          console.error(`     This should not happen with service-role key - check key validity`)
        } else if (vectorError.code === 'P0001') {
          console.error(`     Database function raised an exception: ${vectorError.message}`)
          console.error(`     Check function implementation and user data`)
        } else if (vectorError.code === '42883') {
          console.error(`     Function does not exist - run migrations`)
          console.error(`     This should have been caught earlier - script may be in inconsistent state`)
        } else if (vectorError.code === '23503') {
          console.error(`     Foreign key violation - user may not exist in users table`)
        } else {
          console.error(`     Unexpected error - check database logs`)
        }
        failCount++
      } else {
        console.log(`  ✅ Vector generated successfully`)
        successCount++
      }
    } catch (err) {
      console.error(`  ❌ Unexpected exception:`, err instanceof Error ? err.message : String(err))
      failCount++
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
