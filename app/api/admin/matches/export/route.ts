import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const minScore = searchParams.get('minScore')
    const maxScore = searchParams.get('maxScore')

    const admin = await createAdminClient()

    // Build query
    let query = admin
      .from('match_suggestions')
      .select(`
        id,
        run_id,
        kind,
        member_ids,
        fit_score,
        fit_index,
        status,
        accepted_by,
        expires_at,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (minScore) {
      query = query.gte('fit_score', parseFloat(minScore))
    }

    if (maxScore) {
      query = query.lte('fit_score', parseFloat(maxScore))
    }

    const { data: suggestions, error } = await query

    if (error) {
      safeLogger.error('[Admin] Failed to export matches', error)
      return NextResponse.json(
        { error: 'Failed to export matches' },
        { status: 500 }
      )
    }

    // Fetch user profiles for member IDs
    const allMemberIds = new Set<string>()
    suggestions?.forEach(s => {
      s.member_ids?.forEach(id => allMemberIds.add(id))
    })

    const { data: profiles } = await admin
      .from('profiles')
      .select('user_id, first_name, last_name, email')
      .in('user_id', Array.from(allMemberIds))

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])

    // Format as CSV
    const csvRows = [
      ['Match ID', 'Run ID', 'Kind', 'Status', 'Fit Score', 'Fit Index', 'Members', 'Accepted By', 'Created', 'Expires'].join(',')
    ]

    suggestions?.forEach(match => {
      const memberNames = match.member_ids?.map(id => {
        const profile = profileMap.get(id)
        return profile 
          ? `${profile.first_name} ${profile.last_name || ''}`.trim() || profile.email
          : 'Unknown'
      }).join('; ') || ''
      
      const acceptedNames = match.accepted_by?.map(id => {
        const profile = profileMap.get(id)
        return profile 
          ? `${profile.first_name} ${profile.last_name || ''}`.trim() || profile.email
          : 'Unknown'
      }).join('; ') || ''

      csvRows.push([
        match.id,
        match.run_id,
        match.kind,
        match.status,
        (match.fit_score * 100).toFixed(1) + '%',
        match.fit_index.toString(),
        `"${memberNames}"`,
        `"${acceptedNames}"`,
        new Date(match.created_at).toISOString(),
        new Date(match.expires_at).toISOString()
      ].join(','))
    })

    const csv = csvRows.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="matches-export-${Date.now()}.csv"`
      }
    })
  } catch (error) {
    safeLogger.error('[Admin] Match export error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

