import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/admin/universities-list
 * Returns the list of universities for admin dropdowns (institution selector
 * in Role Management, etc.). Includes inactive ones with a flag so super
 * admins can see the full picture.
 */
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request, false)
  if (!adminCheck.ok) {
    return NextResponse.json(
      { error: adminCheck.error || 'Admin access required' },
      { status: adminCheck.status }
    )
  }

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('universities')
      .select('id, name, city, is_active')
      .order('name', { ascending: true })

    if (error) {
      safeLogger.error('[Admin] Failed to fetch universities list', { error })
      return NextResponse.json({ error: 'Failed to load universities' }, { status: 500 })
    }

    return NextResponse.json({ universities: data || [] })
  } catch (err) {
    safeLogger.error('[Admin] Unexpected error in /api/admin/universities-list', { error: err })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
