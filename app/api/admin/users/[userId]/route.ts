import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> | { userId: string } }
) {
  const adminCheck = await requireAdmin(request)
  if (!adminCheck.ok) {
    return NextResponse.json(
      { error: adminCheck.error || 'Admin access required' },
      { status: adminCheck.status }
    )
  }

  try {
    const resolvedParams = await Promise.resolve(params)
    const { userId } = resolvedParams
    const admin = await createAdminClient()

    // Get user data from auth.users
    const { data: authUser, error: authError } = await admin.auth.admin.getUserById(userId)
    
    if (authError || !authUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get profile data
    const { data: profile } = await admin
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    // Get academic data (university from questionnaire)
    const { data: academic } = await admin
      .from('user_academic')
      .select(`
        *,
        universities(name, slug),
        programs(name, name_en, degree_level)
      `)
      .eq('user_id', userId)
      .maybeSingle()

    // Get user record from users table
    const { data: userRecord } = await admin
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    // Get active matches count - only count unique, non-expired pairs where both users accepted
    const now = new Date().toISOString()
    const { data: matchesData, error: matchesError } = await admin
      .from('match_suggestions')
      .select('id, member_ids, accepted_by, status, kind, expires_at')
      .contains('member_ids', [userId])
      .in('status', ['confirmed', 'accepted'])
      .gte('expires_at', now) // Only non-expired matches
      .eq('kind', 'pair') // Only count pair matches

    if (matchesError) {
      safeLogger.error('[Admin Users] Error fetching matches', matchesError)
    }

    // Deduplicate by member_ids to count unique pairs only
    const uniquePairs = new Set<string>()
    let matchCount = 0
    
    if (matchesData) {
      matchesData.forEach(match => {
        // Check if both users accepted
        let isAccepted = false
        if (match.status === 'confirmed') {
          isAccepted = true
        } else if (match.status === 'accepted' && match.accepted_by && match.member_ids) {
          const acceptedSet = new Set(match.accepted_by)
          isAccepted = match.member_ids.every((id: string) => acceptedSet.has(id))
        }

        if (isAccepted && match.member_ids && Array.isArray(match.member_ids)) {
          // Create a unique key for this pair (sorted to handle A-B and B-A as same pair)
          const sortedIds = [...match.member_ids].sort().join('-')
          if (!uniquePairs.has(sortedIds)) {
            uniquePairs.add(sortedIds)
            matchCount++
          }
        }
      })
    }

    // Get chat count
    const { count: chatCount } = await admin
      .from('chat_members')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    return NextResponse.json({
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        email_confirmed_at: authUser.user.email_confirmed_at,
        created_at: authUser.user.created_at,
        last_sign_in_at: authUser.user.last_sign_in_at,
        is_active: userRecord?.is_active !== false
      },
      profile: profile || null,
      academic: academic || null,
      stats: {
        matches: matchCount || 0,
        chats: chatCount || 0
      }
    })
  } catch (error) {
    safeLogger.error('[Admin Users] Error fetching user details', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

