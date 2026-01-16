/**
 * Diagnostic script to check why a match is showing on the dashboard
 * but not in suggested/pending tabs.
 * 
 * Usage: npx tsx scripts/diagnose-dashboard-match.ts <userId>
 */

// Load environment variables from .env.local or .env
import dotenv from 'dotenv'
import { resolve } from 'path'

// Try to load .env.local first, then .env
dotenv.config({ path: resolve(process.cwd(), '.env.local') })
dotenv.config({ path: resolve(process.cwd(), '.env') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function diagnoseDashboardMatch(userId: string) {
  console.log(`\n=== Diagnosing Dashboard Match Issue for User: ${userId} ===\n`)

  const now = new Date().toISOString()
  
  // 1. Check all match_suggestions for this user
  console.log('1. All match_suggestions for this user:')
  const { data: allSuggestions, error: allError } = await supabase
    .from('match_suggestions')
    .select('id, member_ids, status, expires_at, accepted_by, created_at, kind')
    .contains('member_ids', [userId])
    .order('created_at', { ascending: false })

  if (allError) {
    console.error('Error fetching suggestions:', allError)
    return
  }

  console.log(`   Total suggestions: ${allSuggestions?.length || 0}\n`)

  if (allSuggestions && allSuggestions.length > 0) {
    allSuggestions.forEach((s, idx) => {
      const memberIds = s.member_ids as string[]
      const otherUserId = memberIds.find(id => id !== userId)
      const acceptedBy = s.accepted_by || []
      const isExpired = new Date(s.expires_at) < new Date(now)
      const userHasAccepted = acceptedBy.includes(userId)
      const allAccepted = memberIds.length === acceptedBy.length

      console.log(`   [${idx + 1}] ID: ${s.id}`)
      console.log(`       Other user: ${otherUserId}`)
      console.log(`       Status: ${s.status}`)
      console.log(`       Kind: ${s.kind}`)
      console.log(`       Created: ${s.created_at}`)
      console.log(`       Expires: ${s.expires_at} ${isExpired ? '(EXPIRED)' : '(ACTIVE)'}`)
      console.log(`       Accepted by: [${acceptedBy.join(', ')}]`)
      console.log(`       User accepted: ${userHasAccepted ? 'YES' : 'NO'}`)
      console.log(`       All accepted: ${allAccepted ? 'YES' : 'NO'}`)
      
      // Categorize
      const categories: string[] = []
      if (s.status === 'pending' && !userHasAccepted && !isExpired) {
        categories.push('SHOULD BE IN SUGGESTED')
      }
      if (s.status === 'accepted' && userHasAccepted && !allAccepted) {
        categories.push('SHOULD BE IN PENDING')
      }
      if (s.status === 'confirmed' || (s.status === 'accepted' && allAccepted)) {
        categories.push('SHOULD BE IN CONFIRMED')
      }
      if (s.status === 'declined' || (s.status === 'confirmed' && userHasAccepted)) {
        categories.push('SHOULD BE IN HISTORY')
      }
      if (s.status === 'pending' && userHasAccepted) {
        categories.push('⚠️  ISSUE: Pending but user accepted!')
      }
      if (s.status === 'pending' && isExpired) {
        categories.push('⚠️  EXPIRED (should not show)')
      }
      console.log(`       Categories: ${categories.join(', ') || 'UNCATEGORIZED'}`)
      console.log('')
    })
  }

  // 2. Check what dashboard query would return
  console.log('\n2. Dashboard query results (status=pending, non-expired, user NOT in accepted_by):')
  const { data: dashboardMatches, error: dashboardError } = await supabase
    .from('match_suggestions')
    .select('id, member_ids, status, expires_at, accepted_by, created_at')
    .eq('kind', 'pair')
    .contains('member_ids', [userId])
    .eq('status', 'pending')
    .gte('expires_at', now)

  if (dashboardError) {
    console.error('Error fetching dashboard matches:', dashboardError)
  } else {
    console.log(`   Found: ${dashboardMatches?.length || 0} matches\n`)
    
    if (dashboardMatches && dashboardMatches.length > 0) {
      dashboardMatches.forEach((s, idx) => {
        const memberIds = s.member_ids as string[]
        const otherUserId = memberIds.find(id => id !== userId)
        const acceptedBy = s.accepted_by || []
        const userHasAccepted = acceptedBy.includes(userId)

        console.log(`   [${idx + 1}] ID: ${s.id}`)
        console.log(`       Other user: ${otherUserId}`)
        console.log(`       User in accepted_by: ${userHasAccepted ? 'YES ⚠️' : 'NO ✓'}`)
        
        if (userHasAccepted) {
          console.log(`       ⚠️  ISSUE: This should be filtered out by dashboard code!`)
          console.log(`       This match SHOULD appear in PENDING tab, not suggested or dashboard`)
        }
        console.log('')
      })
    }
  }

  // 3. Check what suggested tab would show (pending, user NOT in accepted_by)
  console.log('\n3. Suggested tab query (status=pending, user NOT in accepted_by):')
  const { data: suggestedMatches, error: suggestedError } = await supabase
    .from('match_suggestions')
    .select('id, member_ids, status, expires_at, accepted_by, created_at')
    .eq('kind', 'pair')
    .contains('member_ids', [userId])
    .eq('status', 'pending')
    .gte('expires_at', now)

  if (suggestedError) {
    console.error('Error fetching suggested matches:', suggestedError)
  } else {
    // Filter out where user is in accepted_by (client-side filter)
    const filtered = suggestedMatches?.filter(s => {
      const acceptedBy = s.accepted_by || []
      return !acceptedBy.includes(userId)
    }) || []

    console.log(`   Found: ${filtered.length} matches (after filtering user from accepted_by)\n`)
    
    if (filtered.length > 0) {
      filtered.forEach((s, idx) => {
        const memberIds = s.member_ids as string[]
        const otherUserId = memberIds.find(id => id !== userId)
        console.log(`   [${idx + 1}] ID: ${s.id}, Other user: ${otherUserId}`)
      })
    }
  }

  // 4. Check confirmed matches
  console.log('\n4. Confirmed matches (status=confirmed OR status=accepted with all members):')
  const { data: confirmedMatches, error: confirmedError } = await supabase
    .from('match_suggestions')
    .select('id, member_ids, status, expires_at, accepted_by, created_at')
    .eq('kind', 'pair')
    .contains('member_ids', [userId])
    .in('status', ['confirmed', 'accepted'])

  if (confirmedError) {
    console.error('Error fetching confirmed matches:', confirmedError)
  } else {
    const filtered = confirmedMatches?.filter(s => {
      const memberIds = s.member_ids as string[]
      const acceptedBy = s.accepted_by || []
      const allAccepted = acceptedBy.length === memberIds.length
      const userHasAccepted = acceptedBy.includes(userId)
      
      if (s.status === 'confirmed' && userHasAccepted && allAccepted) return true
      if (s.status === 'accepted' && userHasAccepted && allAccepted) return true
      return false
    }) || []

    console.log(`   Found: ${filtered.length} confirmed matches\n`)
  }

  // 5. Check history matches (declined or confirmed)
  console.log('\n5. History matches (status=declined OR status=confirmed):')
  const { data: historyMatches, error: historyError } = await supabase
    .from('match_suggestions')
    .select('id, member_ids, status, expires_at, accepted_by, created_at')
    .eq('kind', 'pair')
    .contains('member_ids', [userId])
    .in('status', ['declined', 'confirmed'])

  if (historyError) {
    console.error('Error fetching history matches:', historyError)
  } else {
    const filtered = historyMatches?.filter(s => {
      if (s.status === 'declined') return true
      if (s.status === 'confirmed') {
        const acceptedBy = s.accepted_by || []
        return acceptedBy.includes(userId)
      }
      return false
    }) || []

    console.log(`   Found: ${filtered.length} history matches\n`)
  }

  console.log('\n=== Summary ===')
  console.log('Check the categories above for any matches marked with ⚠️  ISSUE')
  console.log('These indicate data inconsistencies that could explain the dashboard mismatch.')
}

// Get userId from command line arguments
const userId = process.argv[2]

if (!userId) {
  console.error('Usage: npx tsx scripts/diagnose-dashboard-match.ts <userId>')
  process.exit(1)
}

diagnoseDashboardMatch(userId)
  .then(() => {
    console.log('\nDiagnosis complete.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
