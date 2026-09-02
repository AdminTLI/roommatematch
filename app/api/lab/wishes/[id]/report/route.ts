import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { requireVerifiedStudent } from '@/lib/lab/auth'
import { requireDomuLabEnabled } from '@/lib/lab/guard'
import { formatLabReportReason } from '@/lib/lab/reports'
import { isValidLabReportCategory } from '@/lib/lab/validation'
import { safeLogger } from '@/lib/utils/logger'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  const disabled = requireDomuLabEnabled()
  if (disabled) return disabled

  try {
    const { id: wishId } = await context.params
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

    const rateLimitKey = getUserRateLimitKey('lab_reports', user.id)
    const rateLimitResult = await checkRateLimit('lab_reports', rateLimitKey)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many reports. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => null)
    const category = typeof body?.category === 'string' ? body.category : ''
    if (!isValidLabReportCategory(category)) {
      return NextResponse.json(
        { error: 'Please select a report reason' },
        { status: 400 }
      )
    }

    const details = typeof body?.details === 'string' ? body.details.trim() : ''
    if (details.length > 500) {
      return NextResponse.json(
        { error: 'Additional details must be 500 characters or fewer' },
        { status: 400 }
      )
    }

    const reason = formatLabReportReason(category, details)

    const { error } = await supabase.from('lab_wish_reports').insert({
      wish_id: wishId,
      reporter_id: user.id,
      reason,
    })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'You already reported this wish' },
          { status: 409 }
        )
      }
      safeLogger.error('[DomuLab] Report insert failed', { error })
      return NextResponse.json(
        { error: 'Failed to submit report' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    safeLogger.error('[DomuLab] Report error', { error })
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    )
  }
}
