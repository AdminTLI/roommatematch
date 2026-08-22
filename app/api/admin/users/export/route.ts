import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/admin/audit'
import { safeLogger } from '@/lib/utils/logger'

function escapeCsv(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request, false)
  if (!adminCheck.ok || !adminCheck.user) {
    return NextResponse.json(
      { error: adminCheck.error || 'Admin access required' },
      { status: adminCheck.status }
    )
  }

  try {
    const supabase = await createAdminClient()
    const { searchParams } = new URL(request.url)
    const universityIds = searchParams.get('university_ids')?.split(',').filter(Boolean) ?? []

    let query = supabase
      .from('profiles')
      .select(`
        user_id,
        first_name,
        last_name,
        verification_status,
        created_at,
        users!inner(id, email, is_active, created_at)
      `)
      .order('created_at', { ascending: false })
      .limit(5000)

    const { data: profiles, error } = await query

    if (error) {
      safeLogger.error('[Admin Users Export] Query failed', error)
      return NextResponse.json({ error: 'Failed to export users' }, { status: 500 })
    }

    const { data: academicRows } = await supabase
      .from('user_academic')
      .select('user_id, university_id, universities(name)')

    const uniByUser = new Map<string, string>()
    academicRows?.forEach((row) => {
      const uni = row.universities as { name?: string } | { name?: string }[] | null
      const name = Array.isArray(uni) ? uni[0]?.name : uni?.name
      uniByUser.set(row.user_id as string, name ?? '')
    })

    let rows = profiles ?? []
    if (universityIds.length > 0) {
      const allowed = new Set(
        (academicRows ?? [])
          .filter((r) => universityIds.includes(String(r.university_id ?? '')))
          .map((r) => r.user_id as string)
      )
      rows = rows.filter((p: { user_id: string }) => allowed.has(p.user_id))
    }

    const header = [
      'user_id',
      'email',
      'first_name',
      'last_name',
      'verification_status',
      'is_active',
      'university',
      'created_at',
    ]

    const lines = [
      header.join(','),
      ...rows.map((p: {
        user_id: string
        first_name: string | null
        last_name: string | null
        verification_status: string | null
        created_at: string
        users: { email?: string; is_active?: boolean; created_at?: string } | { email?: string; is_active?: boolean; created_at?: string }[]
      }) => {
        const userRow = Array.isArray(p.users) ? p.users[0] : p.users
        return [
          escapeCsv(p.user_id),
          escapeCsv(userRow?.email),
          escapeCsv(p.first_name),
          escapeCsv(p.last_name),
          escapeCsv(p.verification_status),
          escapeCsv(userRow?.is_active ?? true),
          escapeCsv(uniByUser.get(p.user_id) ?? ''),
          escapeCsv(p.created_at),
        ].join(',')
      }),
    ]

    await logAdminAction(adminCheck.user.id, 'export_users_csv', 'users', null, {
      row_count: rows.length,
      university_filter: universityIds,
    })

    return new NextResponse(lines.join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (error) {
    safeLogger.error('[Admin Users Export] Error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
