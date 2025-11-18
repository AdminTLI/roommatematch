import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdminResponse, requireAdmin } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/admin/audit'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  const authError = await requireAdminResponse(request, false)
  if (authError) return authError

  try {
    const admin = await createAdminClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const provider = searchParams.get('provider')
    const search = searchParams.get('search') || ''

    // First, fetch ALL verifications to calculate accurate statistics
    const { data: allVerifications, error: statsError } = await admin
      .from('verifications')
      .select('status')
      .limit(10000) // Get all for accurate stats

    if (statsError) {
      safeLogger.error('[Admin Verifications] Failed to fetch for stats', statsError)
    }

    // Calculate statistics from ALL verifications
    const stats = {
      total: allVerifications?.length || 0,
      pending: allVerifications?.filter((v: any) => v.status === 'pending').length || 0,
      approved: allVerifications?.filter((v: any) => v.status === 'approved').length || 0,
      rejected: allVerifications?.filter((v: any) => v.status === 'rejected').length || 0,
      expired: allVerifications?.filter((v: any) => v.status === 'expired').length || 0
    }

    // Build query with filters for the actual data
    let query = admin
      .from('verifications')
      .select(`
        id,
        user_id,
        provider,
        provider_session_id,
        status,
        review_reason,
        provider_data,
        created_at,
        updated_at
      `)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (provider && provider !== 'all') {
      query = query.eq('provider', provider)
    }

    const { data: verifications, error } = await query
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) {
      safeLogger.error('[Admin Verifications] Failed to fetch', error)
      return NextResponse.json({ error: 'Failed to fetch verifications' }, { status: 500 })
    }

    // Fetch profile and user data separately
    const userIds = verifications?.map((v: any) => v.user_id).filter(Boolean) || []
    const profilesMap = new Map()
    const usersMap = new Map()
    
    if (userIds.length > 0) {
      // Fetch profiles
      const { data: profiles } = await admin
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .in('user_id', userIds)
      
      profiles?.forEach((profile: any) => {
        profilesMap.set(profile.user_id, profile)
      })

      // Fetch users for emails (fallback)
      const { data: users } = await admin
        .from('users')
        .select('id, email')
        .in('id', userIds)
      
      users?.forEach((user: any) => {
        usersMap.set(user.id, user)
      })

      // Fetch university names for profiles
      const profileUserIds = profiles?.map((p: any) => p.user_id) || []
      if (profileUserIds.length > 0) {
        const { data: academicData } = await admin
          .from('user_academic')
          .select('user_id, university_id')
          .in('user_id', profileUserIds)
        
        const universityIds = academicData?.map((a: any) => a.university_id).filter(Boolean) || []
        const universitiesMap = new Map()
        
        if (universityIds.length > 0) {
          const { data: universities } = await admin
            .from('universities')
            .select('id, name')
            .in('id', universityIds)
          
          universities?.forEach((uni: any) => {
            universitiesMap.set(uni.id, uni.name)
          })
        }

        // Add university names to profiles
        academicData?.forEach((academic: any) => {
          const profile = profilesMap.get(academic.user_id)
          if (profile) {
            profile.university_name = universitiesMap.get(academic.university_id)
          }
        })
      }
    }

    // Enrich verifications with profile and user data
    let enrichedVerifications = verifications?.map((v: any) => ({
      ...v,
      profile: profilesMap.get(v.user_id) || null,
      user: usersMap.get(v.user_id) || null
    })) || []

    // Apply search filter (by user name or email)
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim()
      enrichedVerifications = enrichedVerifications.filter((v: any) => {
        const name = v.profile 
          ? `${v.profile.first_name || ''} ${v.profile.last_name || ''}`.trim().toLowerCase()
          : ''
        const email = (v.profile?.email || v.user?.email || '').toLowerCase()
        return name.includes(searchLower) || email.includes(searchLower)
      })
    }

    return NextResponse.json({ 
      verifications: enrichedVerifications,
      stats
    })
  } catch (error) {
    safeLogger.error('[Admin Verifications] Error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request, false)
  if (!adminCheck.ok) {
    return NextResponse.json(
      { error: adminCheck.error || 'Admin access required' },
      { status: adminCheck.status }
    )
  }

  try {
    const { user } = adminCheck
    const body = await request.json()
    const { action, verificationId, userId, status: newStatus } = body

    if (action === 'override' && verificationId && newStatus) {
      const admin = await createAdminClient()
      
      // Validate status
      if (newStatus !== 'approved' && newStatus !== 'rejected') {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }

      // Update verification
      const { error: updateError } = await admin
        .from('verifications')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString(),
          review_reason: `Manually ${newStatus} by admin`
        })
        .eq('id', verificationId)

      if (updateError) {
        safeLogger.error('[Admin Verifications] Failed to update verification', updateError)
        return NextResponse.json({ error: 'Failed to update verification' }, { status: 500 })
      }

      // Update profile verification status
      if (userId) {
        const profileStatus = newStatus === 'approved' ? 'verified' : 'failed'
        const { error: profileError } = await admin
          .from('profiles')
          .update({ 
            verification_status: profileStatus,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        if (profileError) {
          safeLogger.warn('[Admin Verifications] Failed to update profile status', profileError)
          // Don't fail the request - verification was updated successfully
        }
      }

      await logAdminAction(user!.id, 'override_verification', 'verification', verificationId, { 
        newStatus,
        userId 
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    safeLogger.error('[Admin Verifications] Error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
