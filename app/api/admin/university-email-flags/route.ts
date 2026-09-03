import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/auth/admin'
import { safeLogger } from '@/lib/utils/logger'
import {
  findUniversityEmailOccupantIds,
  loadUniversityEmailHolders,
  normalizeUniversityEmail,
  type UniversityEmailHolder,
} from '@/lib/university-email/claims'
import { UNIVERSITY_EMAIL_RECOVERY_TAG } from '@/lib/university-email/constants'

type FlagStatus = 'open' | 'dismissed' | 'released'

function holderUserIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((id): id is string => typeof id === 'string')
}

function displayName(holder: Pick<UniversityEmailHolder, 'firstName' | 'lastName' | 'loginEmail'>) {
  const name = [holder.firstName, holder.lastName].filter(Boolean).join(' ').trim()
  return name || holder.loginEmail || 'Unknown'
}

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireSuperAdmin(request, false)
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Super admin access required' },
        { status: adminCheck.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status') || 'open'
    const emailParam = searchParams.get('email')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10) || 100, 200)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0)
    const emailNormalized = emailParam ? normalizeUniversityEmail(emailParam) : null

    const admin = createAdminClient()

    let query = admin
      .from('university_email_reuse_flags')
      .select(
        'id, email_normalized, attempting_user_id, holder_user_ids, status, created_at, reviewed_at, reviewed_by, review_notes',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (statusParam !== 'all') {
      const status = statusParam as FlagStatus
      if (!['open', 'dismissed', 'released'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      query = query.eq('status', status)
    }

    if (emailNormalized) {
      query = query.eq('email_normalized', emailNormalized)
    }

    const { data: flags, error, count } = await query
    if (error) {
      safeLogger.error('[Admin] University email flags list failed', { error })
      return NextResponse.json(
        { error: 'Failed to load university email flags' },
        { status: 500 }
      )
    }

    let recoveryQuery = admin
      .from('support_tickets')
      .select(
        'id, ticket_number, subject, description, status, priority, created_at, user_id, tags, metadata'
      )
      .contains('tags', [UNIVERSITY_EMAIL_RECOVERY_TAG])
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(200)

    if (emailNormalized) {
      recoveryQuery = recoveryQuery.ilike('description', `%${emailNormalized}%`)
    }

    const { data: recoveryTickets } = await recoveryQuery

    const userIds = new Set<string>()
    for (const flag of flags ?? []) {
      userIds.add(flag.attempting_user_id)
      for (const holderId of holderUserIds(flag.holder_user_ids)) {
        userIds.add(holderId)
      }
    }
    for (const ticket of recoveryTickets ?? []) {
      if (ticket.user_id) userIds.add(ticket.user_id)
    }

    let lookupHolders: UniversityEmailHolder[] = []
    if (emailNormalized) {
      const occupantIds = await findUniversityEmailOccupantIds(admin, emailNormalized)
      for (const id of occupantIds) userIds.add(id)
      lookupHolders = await loadUniversityEmailHolders(admin, occupantIds)
    }

    const people = await loadUniversityEmailHolders(admin, [...userIds])
    const peopleById = new Map(people.map((person) => [person.userId, person]))

    const rows = (flags ?? []).map((flag) => {
      const attempting = peopleById.get(flag.attempting_user_id)
      const holders = holderUserIds(flag.holder_user_ids)
        .map((id) => peopleById.get(id))
        .filter((holder): holder is UniversityEmailHolder => Boolean(holder))

      return {
        id: flag.id,
        emailNormalized: flag.email_normalized,
        status: flag.status,
        createdAt: flag.created_at,
        reviewedAt: flag.reviewed_at,
        reviewedBy: flag.reviewed_by,
        reviewNotes: flag.review_notes,
        attemptingUser: attempting
          ? {
              userId: attempting.userId,
              name: displayName(attempting),
              loginEmail: attempting.loginEmail,
            }
          : {
              userId: flag.attempting_user_id,
              name: 'Unknown',
              loginEmail: null,
            },
        holders: holders.map((holder) => ({
          userId: holder.userId,
          name: displayName(holder),
          loginEmail: holder.loginEmail,
          universityEmail: holder.universityEmail,
          isVerifiedStudent: holder.isVerifiedStudent,
        })),
      }
    })

    return NextResponse.json({
      flags: rows,
      total: count ?? rows.length,
      recoveryTickets: (recoveryTickets ?? []).map((ticket) => {
        const requester = peopleById.get(ticket.user_id)
        const metadata = (ticket.metadata ?? {}) as {
          university_email?: string
          reply_email?: string
          requester_name?: string
        }
        return {
          id: ticket.id,
          ticketNumber: ticket.ticket_number,
          subject: ticket.subject,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          createdAt: ticket.created_at,
          universityEmail:
            metadata.university_email ||
            (typeof ticket.description === 'string'
              ? ticket.description.match(/University email:\s*(.+)/i)?.[1]?.trim() ?? null
              : null),
          replyEmail: metadata.reply_email || requester?.loginEmail || null,
          requesterName:
            metadata.requester_name ||
            (requester ? displayName(requester) : 'Unknown'),
          requesterLoginEmail: requester?.loginEmail ?? null,
        }
      }),
      lookup: emailNormalized
        ? {
            emailNormalized,
            holders: lookupHolders.map((holder) => ({
              userId: holder.userId,
              name: displayName(holder),
              loginEmail: holder.loginEmail,
              universityEmail: holder.universityEmail,
              isVerifiedStudent: holder.isVerifiedStudent,
            })),
          }
        : null,
    })
  } catch (error) {
    safeLogger.error('[Admin] University email flags GET error', { error })
    return NextResponse.json(
      { error: 'Failed to load university email flags' },
      { status: 500 }
    )
  }
}
