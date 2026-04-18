import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'

/**
 * Lists universities for the admin metrics tenant picker.
 * Does not require requested_university_id (used before a tenant is selected).
 */
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)
    if (!adminCheck.ok || !adminCheck.adminRecord) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const role = adminCheck.adminRecord.role
    const adminsRole = adminCheck.adminRecord.admins_table_role
    const isSuper = role === 'super_admin' || adminsRole === 'super_admin'
    const admin = createAdminClient()

    if (isSuper) {
      const { data, error } = await admin.from('universities').select('id, name').order('name', { ascending: true })

      if (error) {
        return NextResponse.json({ error: 'Failed to load universities' }, { status: 500 })
      }
      return NextResponse.json({ universities: data || [] })
    }

    const uid = adminCheck.adminRecord.university_id
    if (!uid) {
      return NextResponse.json({ universities: [] })
    }

    const { data, error } = await admin.from('universities').select('id, name').eq('id', uid).maybeSingle()

    if (error) {
      return NextResponse.json({ error: 'Failed to load university' }, { status: 500 })
    }

    return NextResponse.json({ universities: data ? [data] : [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
