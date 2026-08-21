import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { isValidBugReportCategory } from '@/lib/bugs/categories'
import { safeLogger } from '@/lib/utils/logger'

const MIN_DESCRIPTION = 20
const MAX_DESCRIPTION = 4000
const MAX_DIAGNOSTICS_CHARS = 100_000

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rateLimitKey = getUserRateLimitKey('bug_report', user.id)
    const rateLimitResult = await checkRateLimit('bug_report', rateLimitKey)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many bug reports. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        { status: 429 },
      )
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const category = typeof body.category === 'string' ? body.category : ''
    if (!isValidBugReportCategory(category)) {
      return NextResponse.json({ error: 'Invalid or missing category' }, { status: 400 })
    }

    const description =
      typeof body.description === 'string' ? body.description.trim() : ''
    if (description.length < MIN_DESCRIPTION) {
      return NextResponse.json(
        { error: `Description must be at least ${MIN_DESCRIPTION} characters` },
        { status: 400 },
      )
    }
    if (description.length > MAX_DESCRIPTION) {
      return NextResponse.json(
        { error: `Description must be at most ${MAX_DESCRIPTION} characters` },
        { status: 400 },
      )
    }

    if (body.consent !== true) {
      return NextResponse.json(
        { error: 'Consent is required to submit a bug report' },
        { status: 400 },
      )
    }

    let diagnostics: Record<string, unknown> = {}
    if (body.diagnostics && typeof body.diagnostics === 'object' && !Array.isArray(body.diagnostics)) {
      const serialized = JSON.stringify(body.diagnostics)
      if (serialized.length > MAX_DIAGNOSTICS_CHARS) {
        return NextResponse.json(
          { error: 'Diagnostics payload is too large' },
          { status: 400 },
        )
      }
      diagnostics = body.diagnostics as Record<string, unknown>
    }

    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || null
    const ua = request.headers.get('user-agent')

    diagnostics = {
      ...diagnostics,
      server: {
        ...(typeof diagnostics.server === 'object' && diagnostics.server !== null
          ? (diagnostics.server as Record<string, unknown>)
          : {}),
        receivedAt: new Date().toISOString(),
        ipTruncated: ip ? truncateIp(ip) : null,
        userAgent: ua ? ua.slice(0, 400) : null,
      },
    }

    const { data, error } = await supabase
      .from('bug_reports')
      .insert({
        user_id: user.id,
        category,
        description,
        diagnostics,
        consent_at: new Date().toISOString(),
        status: 'open',
      })
      .select('id, created_at')
      .single()

    if (error) {
      safeLogger.error('[BugReports] Insert failed', { error, userId: user.id })
      return NextResponse.json({ error: 'Failed to save bug report' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: data.id, created_at: data.created_at })
  } catch (error) {
    safeLogger.error('[BugReports] POST error', { error })
    return NextResponse.json({ error: 'Failed to submit bug report' }, { status: 500 })
  }
}

/** Store a truncated IP for abuse signals without keeping a full address longer than needed. */
function truncateIp(ip: string): string {
  if (ip.includes(':')) {
    // IPv6 — keep first 4 hextets
    const parts = ip.split(':')
    return `${parts.slice(0, 4).join(':')}::`
  }
  const parts = ip.split('.')
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`
  }
  return ip.slice(0, 32)
}
