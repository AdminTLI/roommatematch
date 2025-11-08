import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdminResponse } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/admin/audit'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  const authError = await requireAdminResponse(request, false)
  if (authError) return authError

  try {
    const admin = await createAdminClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = admin
      .from('verifications')
      .select(`
        id,
        user_id,
        provider,
        provider_session_id,
        status,
        review_reason,
        created_at,
        updated_at,
        profiles!inner(first_name, last_name, email:users(email))
      `)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: verifications, error } = await query.order('created_at', { ascending: false }).limit(100)

    if (error) {
      safeLogger.error('[Admin Verifications] Failed to fetch', error)
      return NextResponse.json({ error: 'Failed to fetch verifications' }, { status: 500 })
    }

    return NextResponse.json({ verifications: verifications || [] })
  } catch (error) {
    safeLogger.error('[Admin Verifications] Error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminResponse(request, false)
  if (authError) return authError

  try {
    const supabase = await createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, verificationId, userId, status: newStatus } = body

    if (action === 'override' && verificationId && newStatus) {
      const admin = await createAdminClient()
      
      // Update verification
      const { error: updateError } = await admin
        .from('verifications')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', verificationId)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update verification' }, { status: 500 })
      }

      // Update profile status
      if (userId) {
        const profileStatus = newStatus === 'approved' ? 'verified' : 'failed'
        await admin
          .from('profiles')
          .update({ verification_status: profileStatus })
          .eq('user_id', userId)
      }

      await logAdminAction(user.id, 'override_verification', 'verification', verificationId, { newStatus })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    safeLogger.error('[Admin Verifications] Error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

