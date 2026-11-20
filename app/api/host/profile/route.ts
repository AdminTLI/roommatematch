import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { getHostProfileForUser } from '@/lib/host/auth'
import { defaultVerificationDeadline } from '@/lib/host/verification'
import { syncHostListingsIdentity } from '@/lib/host/sync-listing-identity'
import { evaluateHostNameFields, normalizeHostNameKey } from '@/lib/host/name-policy'
import { safeLogger } from '@/lib/utils/logger'

const upsertSchema = z.object({
  host_type: z.enum(['private_landlord', 'agency']),
  display_name: z.string().min(2).max(120),
  company_name: z.string().max(160).optional().nullable(),
  kvk_number: z.string().max(40).optional().nullable(),
  agency_license: z.string().max(80).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  onboarding_completed: z.boolean().optional(),
})

async function loadProtectedOrgs(admin: Awaited<ReturnType<typeof createAdminClient>>) {
  const { data } = await admin
    .from('host_protected_org_names')
    .select('name, normalized_name')
    .eq('active', true)
    .limit(500)
  return data || []
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const host = await getHostProfileForUser(user.id)
  // Keep email_verified in sync with auth
  if (host && Boolean(user.email_confirmed_at) !== host.email_verified) {
    const admin = await createAdminClient()
    const { data: updated } = await admin
      .from('host_profiles')
      .update({
        email_verified: Boolean(user.email_confirmed_at),
        updated_at: new Date().toISOString(),
      })
      .eq('id', host.id)
      .select('*')
      .single()
    return NextResponse.json({ host: updated || host })
  }
  return NextResponse.json({ host })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = upsertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  if (parsed.data.host_type === 'agency') {
    const kvk = (parsed.data.kvk_number || '').trim()
    if (!kvk) {
      return NextResponse.json(
        { error: 'KvK number is required for agencies' },
        { status: 400 }
      )
    }
  }

  if (parsed.data.host_type === 'private_landlord') {
    const kvk = (parsed.data.kvk_number || '').trim()
    if (!kvk) {
      return NextResponse.json(
        {
          error:
            'KvK / registration number helps students trust your listing — please add it',
        },
        { status: 400 }
      )
    }
  }

  const existing = await getHostProfileForUser(user.id)
  const emailVerified = Boolean(user.email_confirmed_at)
  const admin = await createAdminClient()
  const protectedOrgs = await loadProtectedOrgs(admin)

  const nameDecision = evaluateHostNameFields({
    displayName: parsed.data.display_name,
    companyName: parsed.data.company_name,
    userId: user.id,
    protectedOrgs,
  })

  if (!nameDecision.ok) {
    return NextResponse.json({ error: nameDecision.message, code: 'brand_blocked' }, { status: 400 })
  }

  const payload: Record<string, unknown> = {
    user_id: user.id,
    ...parsed.data,
    email_verified: emailVerified,
    updated_at: new Date().toISOString(),
  }

  // Start 24h verification nudge on first onboarding completion
  if (parsed.data.onboarding_completed && !existing?.verification_deadline_at) {
    payload.verification_deadline_at = defaultVerificationDeadline()
  }

  if (nameDecision.kind === 'needs_review') {
    const displayClaimed = parsed.data.display_name.trim()
    const companyClaimed = (parsed.data.company_name || '').trim() || null
    const previousDisplay = (existing?.display_name || '').trim()
    const previousCompany = (existing?.company_name || '').trim() || null

    // Hold claimed org names for admin review; keep a safe live name meanwhile.
    payload.identity_review_status = 'pending'
    payload.identity_review_display_name = displayClaimed
    payload.identity_review_company_name = companyClaimed
    payload.identity_review_matched_org = nameDecision.matchedOrg
    payload.identity_review_message = nameDecision.message
    payload.identity_reviewed_at = null
    payload.identity_review_notes = null

    const displayNeedsReview =
      normalizeHostNameKey(displayClaimed) ===
        normalizeHostNameKey(nameDecision.matchedOrg) ||
      normalizeHostNameKey(displayClaimed).includes(
        normalizeHostNameKey(nameDecision.matchedOrg)
      ) ||
      namesLikelyOrgClaim(displayClaimed, nameDecision.matchedOrg)

    if (displayNeedsReview) {
      if (previousDisplay && previousDisplay !== displayClaimed) {
        payload.display_name = previousDisplay
      } else {
        return NextResponse.json(
          {
            error:
              `${nameDecision.message} Please use a personal contact name for now (for example your first name). After approval, your organisation name can go live.`,
            code: 'org_name_needs_review',
            matched_org: nameDecision.matchedOrg,
          },
          { status: 400 }
        )
      }
    }

    const companyNeedsReview =
      companyClaimed &&
      (normalizeHostNameKey(companyClaimed).includes(
        normalizeHostNameKey(nameDecision.matchedOrg)
      ) ||
        namesLikelyOrgClaim(companyClaimed, nameDecision.matchedOrg))

    if (companyNeedsReview) {
      payload.company_name = previousCompany
    }
  } else if (existing?.identity_review_status === 'pending') {
    // Clear pending only when they submit a clean name set
    payload.identity_review_status = 'none'
    payload.identity_review_display_name = null
    payload.identity_review_company_name = null
    payload.identity_review_matched_org = null
    payload.identity_review_message = null
  }

  const { data, error } = await admin
    .from('host_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Keep denormalized listing host fields aligned with Host Settings.
  if (data?.id) {
    try {
      await syncHostListingsIdentity(admin, data, {
        previousDisplayName: existing?.display_name,
        previousCompanyName: existing?.company_name,
        previousPhone: existing?.phone,
      })
    } catch (syncError) {
      safeLogger.warn('Failed to sync host identity onto listings', {
        hostId: data.id,
        error: syncError,
      })
    }
  }

  return NextResponse.json({
    host: data,
    identity_review:
      nameDecision.kind === 'needs_review'
        ? {
            status: 'pending',
            matched_org: nameDecision.matchedOrg,
            message: nameDecision.message,
          }
        : { status: data.identity_review_status || 'none' },
  })
}

function namesLikelyOrgClaim(value: string, matchedOrg: string): boolean {
  const a = normalizeHostNameKey(value)
  const b = normalizeHostNameKey(matchedOrg)
  if (!a || !b) return false
  return a === b || a.includes(b) || b.includes(a)
}
