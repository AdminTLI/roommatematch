import type { SupabaseClient } from '@supabase/supabase-js'

export const UNIVERSITY_EMAIL_IN_USE_MESSAGE =
  'This university email is already linked to another Domu Match account. If this is yours, sign in to that account or contact support.'

export type UniversityEmailHolder = {
  userId: string
  loginEmail: string | null
  universityEmail: string | null
  firstName: string | null
  lastName: string | null
  isVerifiedStudent: boolean | null
}

export type UniversityEmailOccupancy =
  | { allow: true; createClaim: boolean }
  | { allow: false; holderIds: string[] }

export function normalizeUniversityEmail(email: string): string {
  return email.trim().toLowerCase()
}

function uniqueIds(ids: Array<string | null | undefined>): string[] {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))]
}

export function occupantIdsExcluding(
  occupantIds: string[],
  currentUserId: string
): string[] {
  return uniqueIds(occupantIds.filter((id) => id !== currentUserId))
}

/**
 * Forward-only occupancy: existing duplicate holders keep their rows.
 * Re-verifying an email you already have is allowed even if other
 * grandfathered holders still have the same address. Attaching an email
 * you do not already have is blocked whenever anyone else holds it.
 */
export function evaluateUniversityEmailOccupancy(args: {
  currentUserId: string
  currentUniversityEmail: string | null | undefined
  emailNormalized: string
  occupantIds: string[]
}): UniversityEmailOccupancy {
  const { currentUserId, currentUniversityEmail, emailNormalized, occupantIds } = args
  const ownsAlready =
    Boolean(currentUniversityEmail) &&
    normalizeUniversityEmail(currentUniversityEmail as string) === emailNormalized

  if (ownsAlready) {
    const others = occupantIdsExcluding(occupantIds, currentUserId)
    return { allow: true, createClaim: others.length === 0 }
  }

  const others = occupantIdsExcluding(occupantIds, currentUserId)
  if (others.length > 0) {
    return { allow: false, holderIds: others }
  }

  return { allow: true, createClaim: true }
}

export async function findUniversityEmailOccupantIds(
  client: SupabaseClient,
  emailNormalized: string
): Promise<string[]> {
  const { data, error } = await client.rpc('find_university_email_holder_ids', {
    p_email: emailNormalized,
  })

  if (error) throw error

  const rows = Array.isArray(data) ? data : []
  return uniqueIds(
    rows.map((row) => {
      if (typeof row === 'string') return row
      if (row && typeof row === 'object' && 'find_university_email_holder_ids' in row) {
        return (row as { find_university_email_holder_ids: string }).find_university_email_holder_ids
      }
      return null
    })
  )
}

export async function loadUniversityEmailHolders(
  client: SupabaseClient,
  userIds: string[]
): Promise<UniversityEmailHolder[]> {
  const ids = uniqueIds(userIds)
  if (ids.length === 0) return []

  const [{ data: users, error: usersError }, { data: profiles, error: profilesError }] =
    await Promise.all([
      client
        .from('users')
        .select('id, email, university_email, is_verified_student')
        .in('id', ids),
      client
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', ids),
    ])

  if (usersError) throw usersError
  if (profilesError) throw profilesError

  const profileByUser = new Map(
    (profiles ?? []).map((profile: { user_id: string; first_name: string | null; last_name: string | null }) => [
      profile.user_id,
      profile,
    ])
  )

  return (users ?? []).map(
    (user: {
      id: string
      email: string | null
      university_email: string | null
      is_verified_student: boolean | null
    }) => {
      const profile = profileByUser.get(user.id)
      return {
        userId: user.id,
        loginEmail: user.email ?? null,
        universityEmail: user.university_email ?? null,
        firstName: profile?.first_name ?? null,
        lastName: profile?.last_name ?? null,
        isVerifiedStudent: user.is_verified_student ?? null,
      }
    }
  )
}

export async function recordUniversityEmailReuseFlag(
  client: SupabaseClient,
  args: {
    emailNormalized: string
    attemptingUserId: string
    holderUserIds: string[]
  }
): Promise<void> {
  const { data: existing, error: existingError } = await client
    .from('university_email_reuse_flags')
    .select('id')
    .eq('email_normalized', args.emailNormalized)
    .eq('attempting_user_id', args.attemptingUserId)
    .eq('status', 'open')
    .limit(1)
    .maybeSingle()

  if (existingError) throw existingError
  if (existing?.id) return

  const { error } = await client.from('university_email_reuse_flags').insert({
    email_normalized: args.emailNormalized,
    attempting_user_id: args.attemptingUserId,
    holder_user_ids: uniqueIds(args.holderUserIds),
    status: 'open',
  })

  if (error) throw error
}

async function insertActiveClaim(
  client: SupabaseClient,
  userId: string,
  emailNormalized: string
): Promise<{ conflictUserId: string | null }> {
  const { error } = await client.from('university_email_claims').insert({
    user_id: userId,
    email_normalized: emailNormalized,
  })

  if (!error) return { conflictUserId: null }

  const isUniqueViolation =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23505'

  if (!isUniqueViolation) throw error

  const { data: existing } = await client
    .from('university_email_claims')
    .select('user_id')
    .eq('email_normalized', emailNormalized)
    .is('released_at', null)
    .maybeSingle()

  if (existing?.user_id === userId) return { conflictUserId: null }
  if (existing?.user_id) return { conflictUserId: existing.user_id }

  throw error
}

export async function attachVerifiedUniversityEmail(
  client: SupabaseClient,
  args: {
    userId: string
    email: string
  }
): Promise<{ ok: true } | { ok: false; status: 409 | 500; error: string }> {
  const emailNormalized = normalizeUniversityEmail(args.email)

  const { data: currentUser, error: currentUserError } = await client
    .from('users')
    .select('university_email, is_verified_student')
    .eq('id', args.userId)
    .maybeSingle()

  if (currentUserError) {
    return { ok: false, status: 500, error: 'Failed to update your student status. Please try again.' }
  }

  const { data: currentProfile } = await client
    .from('profiles')
    .select('university_email, is_verified_student, user_type')
    .eq('user_id', args.userId)
    .maybeSingle()

  let occupantIds: string[]
  try {
    occupantIds = await findUniversityEmailOccupantIds(client, emailNormalized)
  } catch {
    return { ok: false, status: 500, error: 'Failed to update your student status. Please try again.' }
  }

  const occupancy = evaluateUniversityEmailOccupancy({
    currentUserId: args.userId,
    currentUniversityEmail: currentUser?.university_email ?? null,
    emailNormalized,
    occupantIds,
  })

  if (!occupancy.allow) {
    try {
      await recordUniversityEmailReuseFlag(client, {
        emailNormalized,
        attemptingUserId: args.userId,
        holderUserIds: occupancy.holderIds,
      })
    } catch {
      // Queue write must not change the user-facing block.
    }
    return { ok: false, status: 409, error: UNIVERSITY_EMAIL_IN_USE_MESSAGE }
  }

  const { error: userUpdateError } = await client
    .from('users')
    .update({
      is_verified_student: true,
      university_email: args.email.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', args.userId)

  if (userUpdateError) {
    return { ok: false, status: 500, error: 'Failed to update your student status. Please try again.' }
  }

  await client
    .from('profiles')
    .update({
      is_verified_student: true,
      university_email: args.email.trim(),
      user_type: 'student',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', args.userId)

  if (!occupancy.createClaim) {
    return { ok: true }
  }

  const revertAttachment = async () => {
    await client
      .from('users')
      .update({
        university_email: currentUser?.university_email ?? null,
        is_verified_student: currentUser?.is_verified_student ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', args.userId)

    if (currentProfile) {
      await client
        .from('profiles')
        .update({
          university_email: currentProfile.university_email ?? null,
          is_verified_student: currentProfile.is_verified_student ?? false,
          user_type: currentProfile.user_type,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', args.userId)
    }
  }

  try {
    const claim = await insertActiveClaim(client, args.userId, emailNormalized)
    if (!claim.conflictUserId) {
      await client
        .from('university_email_claims')
        .update({
          released_at: new Date().toISOString(),
          release_reason: 'replaced_by_new_verification',
        })
        .eq('user_id', args.userId)
        .is('released_at', null)
        .neq('email_normalized', emailNormalized)
      return { ok: true }
    }
  } catch {
    await revertAttachment()
    return { ok: false, status: 500, error: 'Failed to update your student status. Please try again.' }
  }

  await revertAttachment()

  const racedHolders = occupantIdsExcluding(
    [...occupantIds, ...(await findUniversityEmailOccupantIds(client, emailNormalized))],
    args.userId
  )

  try {
    await recordUniversityEmailReuseFlag(client, {
      emailNormalized,
      attemptingUserId: args.userId,
      holderUserIds: racedHolders,
    })
  } catch {
    // Ignore flag write failures after the user-facing block.
  }

  return { ok: false, status: 409, error: UNIVERSITY_EMAIL_IN_USE_MESSAGE }
}

export async function releaseUniversityEmailFromHolder(
  client: SupabaseClient,
  args: {
    holderUserId: string
    emailNormalized: string
    releasedBy: string
    reason?: string | null
    flagId?: string | null
  }
): Promise<{ ok: true } | { ok: false; status: 400 | 404 | 500; error: string }> {
  const emailNormalized = normalizeUniversityEmail(args.emailNormalized)
  const now = new Date().toISOString()

  const { data: holder, error: holderError } = await client
    .from('users')
    .select('id, university_email')
    .eq('id', args.holderUserId)
    .maybeSingle()

  if (holderError) {
    return { ok: false, status: 500, error: 'Failed to release university email' }
  }
  if (!holder) {
    return { ok: false, status: 404, error: 'Holder account not found' }
  }

  const holdsOnUsers =
    Boolean(holder.university_email) &&
    normalizeUniversityEmail(holder.university_email) === emailNormalized

  const { data: activeClaim } = await client
    .from('university_email_claims')
    .select('id')
    .eq('user_id', args.holderUserId)
    .eq('email_normalized', emailNormalized)
    .is('released_at', null)
    .maybeSingle()

  if (!holdsOnUsers && !activeClaim) {
    return {
      ok: false,
      status: 400,
      error: 'This account is not currently holding that university email',
    }
  }

  if (holdsOnUsers) {
    const { error: userUpdateError } = await client
      .from('users')
      .update({
        university_email: null,
        is_verified_student: false,
        updated_at: now,
      })
      .eq('id', args.holderUserId)

    if (userUpdateError) {
      return { ok: false, status: 500, error: 'Failed to release university email' }
    }

    await client
      .from('profiles')
      .update({
        university_email: null,
        is_verified_student: false,
        updated_at: now,
      })
      .eq('user_id', args.holderUserId)
  }

  if (activeClaim) {
    const { error: claimError } = await client
      .from('university_email_claims')
      .update({
        released_at: now,
        released_by: args.releasedBy,
        release_reason: args.reason?.trim() || 'admin_release',
      })
      .eq('id', activeClaim.id)

    if (claimError) {
      return { ok: false, status: 500, error: 'Failed to release university email claim' }
    }
  }

  if (args.flagId) {
    await client
      .from('university_email_reuse_flags')
      .update({
        status: 'released',
        reviewed_at: now,
        reviewed_by: args.releasedBy,
        review_notes: args.reason?.trim() || null,
      })
      .eq('id', args.flagId)
  }

  return { ok: true }
}
