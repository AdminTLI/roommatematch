import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireVerifiedStudent } from '@/lib/lab/auth'
import { requireDomuLabEnabled } from '@/lib/lab/guard'
import { rankSimilarWishes } from '@/lib/lab/similar'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  const disabled = requireDomuLabEnabled()
  if (disabled) return disabled

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const verified = await requireVerifiedStudent(supabase, user.id)
    if (!verified.ok) {
      return NextResponse.json(
        { error: verified.error },
        { status: verified.status }
      )
    }

    const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''
    if (q.length < 3) {
      return NextResponse.json({ similar: [] })
    }

    const { data: wishes, error } = await createAdminClient()
      .from('lab_wishes')
      .select('id, title, vote_count')
      .is('merged_into_id', null)
      .in('status', ['open', 'looking'])
      .limit(200)

    if (error) {
      safeLogger.error('[DomuLab] Similar wishes query failed', { error })
      return NextResponse.json(
        { error: 'Failed to find similar wishes' },
        { status: 500 }
      )
    }

    const similar = rankSimilarWishes(q, wishes ?? [])
    return NextResponse.json({ similar })
  } catch (error) {
    safeLogger.error('[DomuLab] Similar wishes error', { error })
    return NextResponse.json(
      { error: 'Failed to find similar wishes' },
      { status: 500 }
    )
  }
}
