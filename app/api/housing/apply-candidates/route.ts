import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { programmaticAvatarUrl } from '@/lib/avatars/programmatic'
import { signedProfilePictureUrl } from '@/lib/avatars/resolve-user-avatar'
import { APPLICATION_STATUSES_NOT_COUNTING_TOWARD_CAP } from '@/lib/housing/application-limits'
import { safeLogger } from '@/lib/utils/logger'

/**
 * Candidates for "Apply as a group" on a listing.
 * Returns people the viewer already knows (matches / DMs) and housing groups
 * that fit the listing's seeking_people capacity.
 */
export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get('listing_id')
  if (!listingId) {
    return NextResponse.json({ error: 'listing_id is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()

  const { data: listing, error: listingErr } = await admin
    .from('housing_listings')
    .select('id, seeking_people, available_rooms, title')
    .eq('id', listingId)
    .maybeSingle()

  if (listingErr || !listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  const seekingPeople = Math.max(
    1,
    Number(listing.seeking_people || listing.available_rooms || 1)
  )
  const allowGroups = seekingPeople >= 3
  const maxPartySize = seekingPeople
  const minPartySize = Math.min(2, seekingPeople)
  // Spots the viewer still needs to fill (excluding themselves)
  const maxAdditional = Math.max(0, maxPartySize - 1)
  const minAdditional = Math.max(0, minPartySize - 1)

  // People / groups the viewer already has an active application with on this listing
  const alreadyAppliedUserIds = new Set<string>()
  const alreadyAppliedChatIds = new Set<string>()
  try {
    const { data: appsOnListing } = await admin
      .from('housing_applications')
      .select('user_id, group_members, chat_id, status')
      .eq('listing_id', listingId)

    for (const app of appsOnListing || []) {
      if (
        APPLICATION_STATUSES_NOT_COUNTING_TOWARD_CAP.includes(
          app.status as (typeof APPLICATION_STATUSES_NOT_COUNTING_TOWARD_CAP)[number]
        )
      ) {
        continue
      }
      const members = [
        ...new Set([
          app.user_id as string,
          ...((app.group_members as string[] | null) || []),
        ]),
      ].filter(Boolean)
      if (!members.includes(user.id)) continue
      for (const mid of members) {
        if (mid !== user.id) alreadyAppliedUserIds.add(mid)
      }
      if (typeof app.chat_id === 'string' && app.chat_id) {
        alreadyAppliedChatIds.add(app.chat_id)
      }
    }
  } catch (e) {
    safeLogger.warn('apply-candidates prior apps failed', { e })
  }

  // --- Individuals: confirmed matches + DM partners ---
  const matchedUserIds = new Set<string>()
  const scoreByUser = new Map<string, number>()
  const dmChatIdByPartner = new Map<string, string>()

  try {
    const { data: matchRows } = await admin
      .from('match_suggestions')
      .select('member_ids, fit_score, status')
      .eq('kind', 'pair')
      .contains('member_ids', [user.id])
      .limit(200)

    for (const row of matchRows || []) {
      if ((row as { status?: string }).status === 'declined') continue
      const memberIds = (row.member_ids as string[] | null) || []
      if (memberIds.length !== 2) continue
      const otherId = memberIds[0] === user.id ? memberIds[1] : memberIds[0]
      if (!otherId || otherId === user.id) continue
      matchedUserIds.add(otherId)
      const score = typeof row.fit_score === 'number' ? row.fit_score : Number(row.fit_score) || 0
      const prev = scoreByUser.get(otherId)
      if (prev === undefined || score > prev) scoreByUser.set(otherId, score)
    }
  } catch (e) {
    safeLogger.warn('apply-candidates matches load failed', { e })
  }

  try {
    const { data: lockedMatches } = await admin
      .from('match_records')
      .select('user_ids')
      .eq('locked', true)
      .contains('user_ids', [user.id])
      .limit(100)

    for (const m of lockedMatches || []) {
      for (const uid of (m.user_ids as string[] | null) || []) {
        if (uid !== user.id) {
          matchedUserIds.add(uid)
          if (!scoreByUser.has(uid)) scoreByUser.set(uid, 0)
        }
      }
    }
  } catch {
    // optional table
  }

  try {
    const { data: myMemberships } = await admin
      .from('chat_members')
      .select('chat_id')
      .eq('user_id', user.id)
      .eq('status', 'active')

    const chatIds = (myMemberships || []).map((m) => m.chat_id).filter(Boolean)
    if (chatIds.length > 0) {
      const { data: dmChats } = await admin
        .from('chats')
        .select('id')
        .in('id', chatIds)
        .eq('is_group', false)
        .is('housing_application_id', null)

      const dmIds = (dmChats || []).map((c) => c.id)
      if (dmIds.length > 0) {
        const { data: peers } = await admin
          .from('chat_members')
          .select('chat_id, user_id')
          .in('chat_id', dmIds)
          .neq('user_id', user.id)

        for (const p of peers || []) {
          if (!p.user_id || p.user_id === user.id) continue
          dmChatIdByPartner.set(p.user_id as string, p.chat_id as string)
          matchedUserIds.add(p.user_id as string)
          if (!scoreByUser.has(p.user_id as string)) scoreByUser.set(p.user_id as string, 0)
        }
      }
    }
  } catch (e) {
    safeLogger.warn('apply-candidates DM peers failed', { e })
  }

  // Batch pairwise scores for anyone still at 0
  const needScores = [...matchedUserIds].filter((id) => !scoreByUser.get(id))
  if (needScores.length > 0) {
    try {
      const { data: batchRows } = await admin.rpc('compute_compatibility_scores_batch', {
        user_a_id: user.id,
        user_b_ids: needScores,
      })
      if (Array.isArray(batchRows)) {
        for (const row of batchRows) {
          const peerId = (row as { user_b_id?: string }).user_b_id
          const score = (row as { compatibility_score?: number }).compatibility_score
          if (peerId && typeof score === 'number' && Number.isFinite(score)) {
            scoreByUser.set(peerId, score)
          }
        }
      }
    } catch (e) {
      safeLogger.warn('apply-candidates batch scores failed', { e })
    }
  }

  type Person = {
    user_id: string
    name: string
    program: string | null
    university: string | null
    degree_level: string | null
    budget_min: number | null
    budget_max: number | null
    preferred_cities: string[]
    housing_status: string[] | null
    avatar_url: string
    compatibility_score: number
    has_dm: boolean
    already_applied: boolean
  }

  const people: Person[] = []

  if (matchedUserIds.size > 0) {
    const ids = [...matchedUserIds]
    const { data: profiles } = await admin
      .from('profiles')
      .select(
        `user_id, first_name, last_name, program, degree_level, budget_min, budget_max,
         preferred_cities, housing_status, avatar_id, profile_picture_url, is_visible,
         universities!profiles_university_id_fkey(name)`
      )
      .in('user_id', ids)

    const { data: academicRows } = await admin
      .from('user_academic')
      .select(
        `user_id, degree_level,
         universities!user_academic_university_id_fkey(name),
         programs!user_academic_program_id_fkey(name, name_en)`
      )
      .in('user_id', ids)

    const academicById = new Map<
      string,
      { degree_level: string | null; university: string | null; program: string | null }
    >()
    for (const row of academicRows || []) {
      const uni = Array.isArray((row as any).universities)
        ? (row as any).universities[0]
        : (row as any).universities
      const prog = Array.isArray((row as any).programs)
        ? (row as any).programs[0]
        : (row as any).programs
      academicById.set(row.user_id as string, {
        degree_level: (row.degree_level as string | null) || null,
        university: uni?.name || null,
        program: prog?.name_en || prog?.name || null,
      })
    }

    for (const p of profiles || []) {
      if (p.is_visible === false) continue
      const first = ((p.first_name as string) || '').trim().toLowerCase()
      const last = ((p.last_name as string) || '').trim().toLowerCase()
      if (first === 'deleted' && (last === 'user' || last === '')) continue

      const academic = academicById.get(p.user_id as string)
      const uni = Array.isArray((p as any).universities)
        ? (p as any).universities[0]
        : (p as any).universities
      const name =
        [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'User'
      const iconUrl = programmaticAvatarUrl(p.avatar_id as string | null, p.user_id as string)
      let avatarUrl = iconUrl
      const photoPath = (p.profile_picture_url as string | null)?.trim()
      if (photoPath) {
        try {
          const signed = await signedProfilePictureUrl(photoPath)
          if (signed) avatarUrl = signed
        } catch {
          // keep icon
        }
      }

      const cities = Array.isArray(p.preferred_cities)
        ? (p.preferred_cities as unknown[]).filter((x): x is string => typeof x === 'string')
        : []
      const housing = Array.isArray(p.housing_status)
        ? (p.housing_status as unknown[]).filter((x): x is string => typeof x === 'string')
        : null

      people.push({
        user_id: p.user_id as string,
        name,
        program: academic?.program || (p.program as string | null) || null,
        university: academic?.university || uni?.name || null,
        degree_level: academic?.degree_level || (p.degree_level as string | null) || null,
        budget_min:
          typeof p.budget_min === 'number' && Number.isFinite(p.budget_min) ? p.budget_min : null,
        budget_max:
          typeof p.budget_max === 'number' && Number.isFinite(p.budget_max) ? p.budget_max : null,
        preferred_cities: cities,
        housing_status: housing,
        avatar_url: avatarUrl,
        compatibility_score: scoreByUser.get(p.user_id as string) || 0,
        has_dm: dmChatIdByPartner.has(p.user_id as string),
        already_applied: alreadyAppliedUserIds.has(p.user_id as string),
      })
    }

    people.sort((a, b) => {
      if (a.already_applied !== b.already_applied) return a.already_applied ? 1 : -1
      return b.compatibility_score - a.compatibility_score
    })
  }

  // --- Groups (only when seeking ≥ 3) ---
  type GroupMemberPreview = {
    user_id: string
    name: string
    avatar_url: string | null
    program: string | null
  }

  type GroupCandidate = {
    chat_id: string
    name: string
    group_intent: string | null
    member_count: number
    cohesion_score: number | null
    members: GroupMemberPreview[]
    fits: boolean
    already_applied: boolean
  }

  const groups: GroupCandidate[] = []

  if (allowGroups) {
    try {
      const { data: myMemberships } = await admin
        .from('chat_members')
        .select('chat_id')
        .eq('user_id', user.id)
        .eq('status', 'active')

      const chatIds = (myMemberships || []).map((m) => m.chat_id).filter(Boolean)
      if (chatIds.length > 0) {
        const { data: groupChats } = await admin
          .from('chats')
          .select('id, name, group_intent, is_locked')
          .in('id', chatIds)
          .eq('is_group', true)

        const housingGroups = (groupChats || []).filter(
          (g) =>
            !g.group_intent ||
            g.group_intent === 'housing' ||
            g.group_intent === 'general'
        )

        for (const chat of housingGroups) {
          const { data: members } = await admin
            .from('chat_members')
            .select('user_id, share_picture')
            .eq('chat_id', chat.id)
            .eq('status', 'active')

          const memberIds = (members || []).map((m) => m.user_id as string)
          const memberCount = memberIds.length
          // Eligible if party size is within [2, seeking] and includes the viewer
          const fits =
            memberIds.includes(user.id) &&
            memberCount >= minPartySize &&
            memberCount <= maxPartySize

          if (!fits) continue

          const { data: profiles } = await admin
            .from('profiles')
            .select(
              'user_id, first_name, last_name, program, avatar_id, profile_picture_url'
            )
            .in('user_id', memberIds)

          const shareByUser = new Map(
            (members || []).map((m) => [m.user_id as string, Boolean(m.share_picture)])
          )

          const memberPreviews: GroupMemberPreview[] = []
          for (const mid of memberIds) {
            const profile = (profiles || []).find((p) => p.user_id === mid)
            const name =
              [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() ||
              'Member'
            const iconUrl = programmaticAvatarUrl(
              profile?.avatar_id as string | null,
              mid
            )
            let avatarUrl: string | null = iconUrl
            if (shareByUser.get(mid) && profile?.profile_picture_url) {
              try {
                const signed = await signedProfilePictureUrl(
                  String(profile.profile_picture_url).trim()
                )
                if (signed) avatarUrl = signed
              } catch {
                // keep icon
              }
            }
            memberPreviews.push({
              user_id: mid,
              name: mid === user.id ? `${name} (you)` : name,
              avatar_url: avatarUrl,
              program: (profile?.program as string | null) || null,
            })
          }

          let cohesion: number | null = null
          const { data: compat } = await admin
            .from('group_compatibility_scores')
            .select('overall_score')
            .eq('chat_id', chat.id)
            .maybeSingle()
          if (compat?.overall_score != null) {
            cohesion = Number(compat.overall_score)
          }

          groups.push({
            chat_id: chat.id as string,
            name: (chat.name as string) || 'Housing group',
            group_intent: (chat.group_intent as string | null) || null,
            member_count: memberCount,
            cohesion_score: cohesion,
            members: memberPreviews,
            fits: true,
            already_applied: (() => {
              if (alreadyAppliedChatIds.has(chat.id as string)) return true
              const others = memberIds.filter((id) => id !== user.id)
              return others.length > 0 && others.every((id) => alreadyAppliedUserIds.has(id))
            })(),
          })
        }

        groups.sort((a, b) => {
          if (a.already_applied !== b.already_applied) return a.already_applied ? 1 : -1
          const ca = a.cohesion_score ?? -1
          const cb = b.cohesion_score ?? -1
          return cb - ca
        })
      }
    } catch (e) {
      safeLogger.warn('apply-candidates groups failed', { e })
    }
  }

  return NextResponse.json({
    listing_id: listingId,
    listing_title: listing.title,
    seeking_people: seekingPeople,
    allow_groups: allowGroups,
    min_party_size: minPartySize,
    max_party_size: maxPartySize,
    min_additional: minAdditional,
    max_additional: maxAdditional,
    people,
    groups,
  })
}
