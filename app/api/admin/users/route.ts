import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdminResponse } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/admin/audit'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  const authError = await requireAdminResponse(request, false)
  if (authError) return authError

  try {
    const supabase = await createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const verificationStatus = searchParams.get('verification_status')
    const universityId = searchParams.get('university_id')
    const isActive = searchParams.get('is_active')

    // Build query
    let query = supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        first_name,
        last_name,
        verification_status,
        university_id,
        created_at,
        users!inner(email, is_active, created_at),
        universities(name)
      `)

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,users.email.ilike.%${search}%`)
    }

    if (verificationStatus) {
      query = query.eq('verification_status', verificationStatus)
    }

    if (universityId) {
      query = query.eq('university_id', universityId)
    }

    if (isActive !== null) {
      query = query.eq('users.is_active', isActive === 'true')
    }

    const { data: profiles, error } = await query.order('created_at', { ascending: false }).limit(100)

    if (error) {
      safeLogger.error('[Admin Users] Failed to fetch users', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json({ users: profiles || [] })
  } catch (error) {
    safeLogger.error('[Admin Users] Error', error)
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
    const { action, userIds } = body

    if (!action || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const admin = await createAdminClient()

    switch (action) {
      case 'suspend':
        await admin.from('users').update({ is_active: false }).in('id', userIds)
        await logAdminAction(user.id, 'suspend_users', 'user', null, { userIds })
        break
      case 'activate':
        await admin.from('users').update({ is_active: true }).in('id', userIds)
        await logAdminAction(user.id, 'activate_users', 'user', null, { userIds })
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    safeLogger.error('[Admin Users] Error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

