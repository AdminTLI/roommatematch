/**
 * Diagnostic script to test compatibility score calculations
 * Run with: npx tsx scripts/test-compatibility-scores.ts
 */

import { createAdminClient } from '../lib/supabase/server'

async function testCompatibilityScores() {
  const admin = await createAdminClient()
  
  // Get a few user IDs to test
  const { data: users, error: usersError } = await admin
    .from('users')
    .select('id')
    .limit(5)
  
  if (usersError || !users || users.length < 2) {
    console.error('Failed to fetch users:', usersError)
    return
  }
  
  console.log(`Testing compatibility scores for ${users.length} users...\n`)
  
  // Test all pairs
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const userA = users[i].id
      const userB = users[j].id
      
      try {
        const { data, error } = await admin.rpc('compute_compatibility_score', {
          user_a_id: userA,
          user_b_id: userB
        })
        
        if (error) {
          console.error(`Error calculating score for ${userA} vs ${userB}:`, error)
          continue
        }
        
        const score = data?.[0]
        if (score) {
          console.log(`Pair: ${userA.substring(0, 8)}... vs ${userB.substring(0, 8)}...`)
          console.log(`  Compatibility: ${(Number(score.compatibility_score) * 100).toFixed(1)}%`)
          console.log(`  Harmony: ${(Number(score.harmony_score) * 100).toFixed(1)}%`)
          console.log(`  Context: ${(Number(score.context_score) * 100).toFixed(1)}%`)
          console.log(`  Dimension scores:`, score.dimension_scores_json)
          console.log('')
        } else {
          console.warn(`No score returned for ${userA} vs ${userB}`)
        }
      } catch (err) {
        console.error(`Exception calculating score for ${userA} vs ${userB}:`, err)
      }
    }
  }
}

testCompatibilityScores().catch(console.error)










