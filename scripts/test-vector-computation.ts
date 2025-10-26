#!/usr/bin/env tsx

/**
 * Test script to validate vector computation after onboarding fixes
 * Run with: npx tsx scripts/test-vector-computation.ts
 */

import { createClient } from '@/lib/supabase/server'

async function testVectorComputation() {
  console.log('🧪 Testing vector computation...')
  
  const supabase = await createClient()
  
  try {
    // Check if we have any users with responses
    const { data: usersWithResponses, error: usersError } = await supabase
      .from('responses')
      .select('user_id')
      .limit(1)
    
    if (usersError) {
      console.error('❌ Error fetching users with responses:', usersError)
      return
    }
    
    if (!usersWithResponses || usersWithResponses.length === 0) {
      console.log('⚠️  No users with responses found. Complete onboarding first.')
      return
    }
    
    const testUserId = usersWithResponses[0].user_id
    console.log(`📊 Testing with user: ${testUserId}`)
    
    // Check responses
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('question_key, value')
      .eq('user_id', testUserId)
    
    if (responsesError) {
      console.error('❌ Error fetching responses:', responsesError)
      return
    }
    
    console.log(`📝 Found ${responses?.length || 0} responses:`)
    responses?.forEach(r => {
      console.log(`  - ${r.question_key}: ${r.value}`)
    })
    
    // Test vector computation
    console.log('🔄 Computing user vector...')
    const { error: vectorError } = await supabase
      .rpc('compute_user_vector_and_store', { p_user_id: testUserId })
    
    if (vectorError) {
      console.error('❌ Error computing vector:', vectorError)
      return
    }
    
    // Check if vector was created
    const { data: vector, error: vectorFetchError } = await supabase
      .from('user_vectors')
      .select('vector')
      .eq('user_id', testUserId)
      .single()
    
    if (vectorFetchError) {
      console.error('❌ Error fetching vector:', vectorFetchError)
      return
    }
    
    if (!vector) {
      console.error('❌ No vector found after computation')
      return
    }
    
    // Analyze vector
    const vectorArray = vector.vector as number[]
    const nonZeroCount = vectorArray.filter(v => v !== 0).length
    const maxValue = Math.max(...vectorArray)
    const minValue = Math.min(...vectorArray)
    
    console.log('✅ Vector computation successful!')
    console.log(`📊 Vector stats:`)
    console.log(`  - Length: ${vectorArray.length}`)
    console.log(`  - Non-zero values: ${nonZeroCount}`)
    console.log(`  - Range: ${minValue.toFixed(3)} to ${maxValue.toFixed(3)}`)
    console.log(`  - Sample values: [${vectorArray.slice(0, 10).map(v => v.toFixed(3)).join(', ')}...]`)
    
    if (nonZeroCount === 0) {
      console.log('⚠️  Warning: Vector contains only zeros - check question mappings')
    } else if (nonZeroCount < 5) {
      console.log('⚠️  Warning: Very few non-zero values - check response data')
    } else {
      console.log('✅ Vector looks healthy!')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testVectorComputation()
  .then(() => {
    console.log('🏁 Test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test crashed:', error)
    process.exit(1)
  })
