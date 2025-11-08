import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { user } = adminCheck
    const supabase = await createClient()

    // Get admin's university_id for filtering
    const { data: adminRecord } = await supabase
      .from('admins')
      .select('university_id')
      .eq('user_id', user!.id)
      .single()

    // Use the existing analytics RPC function
    const { data: analyticsData, error: analyticsError } = await supabase.rpc('get_admin_analytics', {
      p_admin_university_id: adminRecord?.university_id || null
    })

    if (analyticsError) {
      safeLogger.error('[Admin] Analytics RPC error', analyticsError)
      // Return basic metrics from direct queries
      return getBasicMetrics(supabase, adminRecord?.university_id)
    }

    const analytics = analyticsData?.[0] || {}

    // Calculate additional metrics
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Get signups
    let signupsQuery = supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo)

    if (adminRecord?.university_id) {
      signupsQuery = signupsQuery.eq('profiles.university_id', adminRecord.university_id)
    }

    const { count: signupsLast7Days } = await signupsQuery

    const { count: signupsLast30Days } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo)

    // Get match activity (matches created in last 7 days)
    const { count: matchActivity } = await supabase
      .from('match_suggestions')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo)

    return NextResponse.json({
      totalUsers: analytics.total_users || 0,
      verifiedUsers: analytics.verified_users || 0,
      activeChats: analytics.active_chats || 0,
      totalMatches: analytics.total_matches || 0,
      reportsPending: analytics.reports_pending || 0,
      signupsLast7Days: signupsLast7Days || 0,
      signupsLast30Days: signupsLast30Days || 0,
      verificationRate: analytics.total_users > 0 
        ? ((analytics.verified_users || 0) / analytics.total_users) * 100 
        : 0,
      matchActivity: matchActivity || 0
    })
  } catch (error) {
    safeLogger.error('[Admin] Analytics error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getBasicMetrics(supabase: any, universityId?: string) {
  const { count: totalUsers } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)

  const { count: verifiedUsers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('verification_status', 'verified')

  const { count: activeChats } = await supabase
    .from('chats')
    .select('id', { count: 'exact', head: true })

  const { count: totalMatches } = await supabase
    .from('match_suggestions')
    .select('id', { count: 'exact', head: true })

  const { count: reportsPending } = await supabase
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'open')

  return NextResponse.json({
    totalUsers: totalUsers || 0,
    verifiedUsers: verifiedUsers || 0,
    activeChats: activeChats || 0,
    totalMatches: totalMatches || 0,
    reportsPending: reportsPending || 0,
    signupsLast7Days: 0,
    signupsLast30Days: 0,
    verificationRate: 0,
    matchActivity: 0
  })
}

