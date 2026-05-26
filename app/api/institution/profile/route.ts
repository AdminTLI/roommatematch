import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import {
  requireInstitutionAdmin,
  isInstitutionProfileComplete,
} from '@/lib/auth/institution'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * POST /api/institution/profile
 * Upsert the institution admin's contact profile (onboarding + settings).
 */
export async function POST(request: NextRequest) {
  const auth = await requireInstitutionAdmin(request)
  if (!auth.ok || !auth.user || !auth.institutionId) {
    return NextResponse.json(
      { error: auth.error || 'Institution admin access required' },
      { status: auth.status }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const firstName = String(body.first_name || '').trim()
  const lastName = String(body.last_name || '').trim()
  const jobTitle = String(body.job_title || body.department_title || '').trim()
  const workEmail = String(body.work_email || auth.user.email || '').trim()
  const phone = body.phone ? String(body.phone).trim() : null
  const department = body.department ? String(body.department).trim() : null
  const notesForSupport = body.notes_for_support
    ? String(body.notes_for_support).trim()
    : null
  const topics = Array.isArray(body.topics)
    ? body.topics.map((t) => String(t).trim()).filter(Boolean)
    : []
  const contactConsent = body.contact_consent === true
  const privacyAccepted = body.privacy_notice_accepted === true
  const termsAccepted = body.terms_accepted === true

  if (!firstName || !lastName) {
    return NextResponse.json({ error: 'First and last name are required' }, { status: 400 })
  }
  if (!jobTitle) {
    return NextResponse.json({ error: 'Job title is required' }, { status: 400 })
  }
  if (!workEmail || !isValidEmail(workEmail)) {
    return NextResponse.json({ error: 'A valid work email is required' }, { status: 400 })
  }
  if (!privacyAccepted) {
    return NextResponse.json(
      { error: 'You must accept the privacy notice to continue' },
      { status: 400 }
    )
  }

  const now = new Date().toISOString()
  const row = {
    user_id: auth.user.id,
    institution_id: auth.institutionId,
    first_name: firstName,
    last_name: lastName,
    job_title: jobTitle,
    work_email: workEmail,
    phone,
    department,
    topics,
    notes_for_support: notesForSupport,
    contact_consent: contactConsent,
    contact_consent_at: contactConsent ? now : null,
    privacy_notice_accepted_at: now,
    terms_accepted_at: termsAccepted ? now : auth.adminProfile?.terms_accepted_at || null,
    onboarding_completed_at: now,
    updated_at: now,
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('institution_admin_profiles')
    .upsert(row, { onConflict: 'user_id' })
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    profile: data,
    profile_complete: isInstitutionProfileComplete(data as any),
  })
}

/**
 * PATCH /api/institution/profile
 * Partial update from settings page (does not require re-onboarding).
 */
export async function PATCH(request: NextRequest) {
  const auth = await requireInstitutionAdmin(request)
  if (!auth.ok || !auth.user) {
    return NextResponse.json(
      { error: auth.error || 'Institution admin access required' },
      { status: auth.status }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (body.first_name !== undefined) updates.first_name = String(body.first_name).trim()
  if (body.last_name !== undefined) updates.last_name = String(body.last_name).trim()
  if (body.job_title !== undefined) updates.job_title = String(body.job_title).trim()
  if (body.work_email !== undefined) {
    const email = String(body.work_email).trim()
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid work email' }, { status: 400 })
    }
    updates.work_email = email
  }
  if (body.phone !== undefined) updates.phone = body.phone ? String(body.phone).trim() : null
  if (body.department !== undefined)
    updates.department = body.department ? String(body.department).trim() : null
  if (body.notes_for_support !== undefined)
    updates.notes_for_support = body.notes_for_support
      ? String(body.notes_for_support).trim()
      : null
  if (body.topics !== undefined && Array.isArray(body.topics)) {
    updates.topics = body.topics.map((t) => String(t).trim()).filter(Boolean)
  }
  if (body.contact_consent !== undefined) {
    updates.contact_consent = body.contact_consent === true
    updates.contact_consent_at = body.contact_consent === true ? new Date().toISOString() : null
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  updates.updated_at = new Date().toISOString()

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('institution_admin_profiles')
    .update(updates)
    .eq('user_id', auth.user.id)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    profile: data,
    profile_complete: isInstitutionProfileComplete(data as any),
  })
}
