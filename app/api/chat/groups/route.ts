import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { recalculateGroupCompatibility } from '@/lib/group-compatibility/calculator'
import type { GroupCompatibilityScore } from '@/lib/group-compatibility/types'
import { ensurePairwiseAmongActiveMembers } from '@/lib/chat/ensure-group-pairwise'
import { GATE_LABELS, HARD_GATE_IDS } from '@/lib/matching/item-weights.v2'
import { programmaticAvatarUrl } from '@/lib/avatars/programmatic'
import { signedProfilePictureUrl } from '@/lib/avatars/resolve-user-avatar'

function meanOrNull(values: number[]): number | null {
  const nums = values.filter((n) => typeof n === 'number' && Number.isFinite(n))
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function gateLabels(ids: string[]): string[] {
  return ids.map((id) => GATE_LABELS[id as (typeof HARD_GATE_IDS)[number]] ?? id)
}

function buildCompatibilityPayload(compatibility: {
  overall_score?: number | null
  personality_score?: number | null
  schedule_score?: number | null
  lifestyle_score?: number | null
  social_score?: number | null
  academic_score?: number | null
  member_deviations?: unknown
  explanation?: unknown
  pair_scores?: unknown
  module_scores?: unknown
  hard_gate_conflicts?: unknown
}) {
  if (compatibility.overall_score == null) return null

  const memberDevs = compatibility.member_deviations as
    | { explanation?: Record<string, string> }
    | null
    | undefined
  const explanation =
    memberDevs?.explanation ||
    (compatibility.explanation as Record<string, string> | null) ||
    null
  const pairScores = Array.isArray(compatibility.pair_scores)
    ? compatibility.pair_scores
    : []
  const harmonyValues = pairScores
    .map((p: { harmony?: number }) => p?.harmony)
    .filter((n: unknown): n is number => typeof n === 'number' && Number.isFinite(n))
  const contextValues = pairScores
    .map((p: { context?: number }) => p?.context)
    .filter((n: unknown): n is number => typeof n === 'number' && Number.isFinite(n))
  const hardGates = Array.isArray(compatibility.hard_gate_conflicts)
    ? (compatibility.hard_gate_conflicts as string[])
    : []
  const moduleScores =
    compatibility.module_scores && typeof compatibility.module_scores === 'object'
      ? (compatibility.module_scores as Record<string, number>)
      : null
  const moduleHarmonyFallback = moduleScores
    ? meanOrNull(
        [
          moduleScores['cleanliness-operations'],
          moduleScores['environment-rhythms'],
          moduleScores['communication-resolution'],
          moduleScores['social-spaces'],
        ].filter((n): n is number => typeof n === 'number' && Number.isFinite(n)),
      )
    : null

  return {
    overall_score: Number(compatibility.overall_score) || 0,
    personality_score: Number(compatibility.personality_score) || 0,
    schedule_score: Number(compatibility.schedule_score) || 0,
    lifestyle_score: Number(compatibility.lifestyle_score) || 0,
    social_score: Number(compatibility.social_score) || 0,
    academic_score: Number(compatibility.academic_score) || 0,
    harmony_score: meanOrNull(harmonyValues) ?? moduleHarmonyFallback,
    context_score:
      meanOrNull(contextValues) ??
      (typeof moduleScores?.['logistics-context'] === 'number'
        ? Number(moduleScores['logistics-context'])
        : null) ??
      (typeof compatibility.academic_score === 'number'
        ? Number(compatibility.academic_score)
        : null),
    module_scores: moduleScores,
    hard_gate_conflicts: hardGates,
    hard_gate_labels: gateLabels(hardGates),
    explanation: explanation
      ? {
          top_strength: explanation.top_strength || undefined,
          watch_outs: explanation.watch_outs || undefined,
          why_works: explanation.why_works || undefined,
          why_doesnt_work: explanation.why_doesnt_work || undefined,
          suggestions: explanation.suggestions || undefined,
        }
      : null,
  }
}

function compatibilityFromComputed(score: GroupCompatibilityScore) {
  return buildCompatibilityPayload({
    overall_score: score.overall_score,
    personality_score: score.personality_score,
    schedule_score: score.schedule_score,
    lifestyle_score: score.lifestyle_score,
    social_score: score.social_score,
    academic_score: score.academic_score,
    member_deviations: {
      deviations: score.member_deviations,
      explanation: score.explanation ?? {},
    },
    pair_scores: [],
    module_scores: null,
    hard_gate_conflicts: [],
  })
}

// GET /api/chat/groups/:chatId/compatibility - Get compatibility scores
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')
    const action = searchParams.get('action')

    if (!chatId) {
      return NextResponse.json(
        { error: 'chatId is required' },
        { status: 400 }
      )
    }

    // Verify user is a member (active participant or pending invitee — both may preview)
    const { data: membership } = await supabase
      .from('chat_members')
      .select('user_id')
      .eq('chat_id', chatId)
      .eq('user_id', user.id)
      .in('status', ['active', 'invited'])
      .maybeSingle()

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this chat' },
        { status: 403 }
      )
    }

    // Default to compatibility if no action specified
    const effectiveAction = action || 'compatibility'

    if (effectiveAction === 'compatibility') {
      // Get compatibility scores
      const { data: compatibility, error } = await supabase
        .from('group_compatibility_scores')
        .select('*')
        .eq('chat_id', chatId)
        .maybeSingle()

      if (error) {
        return NextResponse.json(
          { error: `Failed to fetch compatibility: ${error.message}` },
          { status: 500 }
        )
      }

      // Extract explanation from member_deviations if present
      const explanation = compatibility?.member_deviations?.explanation || null
      const compatibilityWithExplanation = compatibility ? {
        ...compatibility,
        explanation,
        member_deviations: compatibility.member_deviations?.deviations || compatibility.member_deviations
      } : null

      return NextResponse.json({ compatibility: compatibilityWithExplanation })
    } else if (effectiveAction === 'members-preview') {
      // Get member previews (for invitation acceptance)
      const { data: members, error } = await supabase
        .from('chat_members')
        .select(`
          id,
          user_id,
          status,
          invitation_id,
          profiles!chat_members_user_id_fkey (
            first_name,
            last_name,
            program,
            universities!profiles_university_id_fkey (
              name
            )
          )
        `)
        .eq('chat_id', chatId)
        .in('status', ['active', 'invited'])

      if (error) {
        return NextResponse.json(
          { error: `Failed to fetch members: ${error.message}` },
          { status: 500 }
        )
      }

      // Get pairwise compatibility scores (server-side only; never expose peer user_id)
      const admin = await createAdminClient()
      const membersOthers = (members || []).filter((m: { user_id: string }) => m.user_id !== user.id)
      const memberIds = membersOthers.map((m: { user_id: string }) => m.user_id)
      const pairwiseScoresByUserId: Record<string, unknown> = {}

      if (memberIds.length > 0) {
        try {
          const { data: batchRows, error: batchError } = await admin.rpc(
            'compute_compatibility_scores_batch',
            {
              user_a_id: user.id,
              user_b_ids: memberIds,
            }
          )
          if (batchError) {
            safeLogger.warn('Batch pairwise score failed', { error: batchError })
          } else if (Array.isArray(batchRows)) {
            for (const row of batchRows) {
              const peerId = (row as { user_b_id?: string }).user_b_id
              if (peerId) {
                pairwiseScoresByUserId[peerId] = row
              }
            }
          }
        } catch (err) {
          safeLogger.warn('Failed to compute pairwise scores batch', { error: err })
        }
      }

      const invitationStatusById = new Map<string, string>()
      const invitationIds = membersOthers
        .map((m: { invitation_id?: string | null }) => m.invitation_id)
        .filter((id): id is string => Boolean(id))
      if (invitationIds.length > 0) {
        const { data: invRows } = await admin
          .from('group_invitations')
          .select('id, status')
          .in('id', invitationIds)
        invRows?.forEach((row: { id: string; status: string }) => {
          invitationStatusById.set(row.id, row.status)
        })
      }

      return NextResponse.json({
        members: membersOthers.map((m: { id: string; user_id: string; status: string; invitation_id?: string | null; profiles?: any }) => ({
          chat_member_id: m.id,
          membership_status: m.status,
          group_invitation_status: m.invitation_id ? invitationStatusById.get(m.invitation_id) || null : null,
          name: [m.profiles?.first_name, m.profiles?.last_name].filter(Boolean).join(' ') || 'User',
          program: m.profiles?.program || 'Program',
          university: m.profiles?.universities?.name || 'University',
          compatibility: pairwiseScoresByUserId[m.user_id] || null
        }))
      })
    }

    if (effectiveAction === 'locked-overview') {
      const admin = await createAdminClient()

      const { data: chat } = await admin
        .from('chats')
        .select('is_locked, lock_reason, lock_expires_at, name, description, group_intent, created_by')
        .eq('id', chatId)
        .single()

      const { data: activeMembers } = await admin
        .from('chat_members')
        .select('id, user_id, status')
        .eq('chat_id', chatId)
        .eq('status', 'active')

      const activeIds = (activeMembers || []).map((m) => m.user_id as string)
      try {
        await ensurePairwiseAmongActiveMembers(admin, chatId, activeIds)
      } catch (err) {
        safeLogger.warn('Failed to ensure pairwise in locked-overview', { error: err, chatId })
      }

      const viewerMembership = (activeMembers || []).find((m) => m.user_id === user.id)
      const otherActive = (activeMembers || []).filter((m) => m.user_id !== user.id)

      const { data: pairwiseMatches } = await admin
        .from('group_pairwise_matches')
        .select('*')
        .eq('chat_id', chatId)

      const { data: progressRows } = await admin.rpc('get_pairwise_match_progress', {
        p_chat_id: chatId,
      })
      const progress = progressRows?.[0] || {
        total_pairs: 0,
        accepted_pairs: 0,
        pending_pairs: 0,
        rejected_pairs: 0,
      }

      // Privacy: never expose pending invitee identities until the group unlocks.
      const { count: pendingInviteCount, error: pendingCountErr } = await admin
        .from('group_invitations')
        .select('id', { count: 'exact', head: true })
        .eq('chat_id', chatId)
        .eq('status', 'pending')

      if (pendingCountErr) {
        safeLogger.warn('Failed to count pending invites in locked-overview', {
          error: pendingCountErr,
        })
      }

      // Full roster including the viewer so the UI can show "You" + everyone else.
      // Scores stay hidden while locked — only pairwise accept/reject state is needed.
      const members = [
        ...(viewerMembership
          ? [
              {
                chat_member_id: viewerMembership.id as string,
                user_id: user.id,
                membership_status: 'active' as const,
                name: 'You',
                is_you: true,
                program: '',
                university: '',
                compatibility: null,
              },
            ]
          : []),
        ...otherActive.map((m, index) => ({
          chat_member_id: m.id as string,
          user_id: m.user_id as string,
          membership_status: 'active' as const,
          name: `Member ${index + 2}`,
          is_you: false,
          program: '',
          university: '',
          compatibility: null,
        })),
      ]

      return NextResponse.json({
        chat: {
          name: chat?.name || null,
          description: chat?.description || null,
          group_intent: chat?.group_intent || null,
          is_locked: chat?.is_locked ?? true,
          lock_reason: chat?.lock_reason || null,
          lock_expires_at: chat?.lock_expires_at || null,
          created_by: chat?.created_by || null,
        },
        members,
        pending_invite_count: pendingInviteCount || 0,
        pairwise_matches: pairwiseMatches || [],
        progress: {
          total: progress.total_pairs || 0,
          accepted: progress.accepted_pairs || 0,
          pending: progress.pending_pairs || 0,
          rejected: progress.rejected_pairs || 0,
        },
        // Group fit stays private until every invite is accepted and the chat unlocks.
        compatibility: null,
        joined_count: activeIds.length,
      })
    }

    if (effectiveAction === 'panel') {
      const admin = await createAdminClient()

      const { data: chat } = await admin
        .from('chats')
        .select('name, description, group_intent, is_locked, created_by')
        .eq('id', chatId)
        .single()

      const isLocked = chat?.is_locked !== false

      const { data: activeMembers } = await admin
        .from('chat_members')
        .select('id, user_id, status, muted, share_picture')
        .eq('chat_id', chatId)
        .eq('status', 'active')

      const activeIds = (activeMembers || []).map((m) => m.user_id as string)
      const viewerMembership = (activeMembers || []).find((m) => m.user_id === user.id)
      try {
        await ensurePairwiseAmongActiveMembers(admin, chatId, activeIds)
      } catch (err) {
        safeLogger.warn('Failed to ensure pairwise in group panel', { error: err, chatId })
      }

      const { count: pendingInviteCount } = await admin
        .from('group_invitations')
        .select('id', { count: 'exact', head: true })
        .eq('chat_id', chatId)
        .eq('status', 'pending')

      const otherActive = (activeMembers || []).filter((m) => m.user_id !== user.id)
      const otherIds = otherActive.map((m) => m.user_id as string)
      const sharePictureByUserId = new Map(
        (activeMembers || []).map((m) => [m.user_id as string, Boolean(m.share_picture)]),
      )

      const pairwiseScoresByUserId: Record<string, number | null> = {}
      // Pairwise % only after unlock — while locked, scores would leak group-fit info early.
      if (!isLocked && otherIds.length > 0) {
        try {
          const { data: batchRows } = await admin.rpc('compute_compatibility_scores_batch', {
            user_a_id: user.id,
            user_b_ids: otherIds,
          })
          if (Array.isArray(batchRows)) {
            for (const row of batchRows) {
              const peerId = (row as { user_b_id?: string; compatibility_score?: number }).user_b_id
              if (peerId) {
                const score = (row as { compatibility_score?: number }).compatibility_score
                pairwiseScoresByUserId[peerId] =
                  typeof score === 'number' && Number.isFinite(score) ? score : null
              }
            }
          }
        } catch (err) {
          safeLogger.warn('Failed batch scores in group panel', { error: err })
        }
      }

      const profileById = new Map<
        string,
        {
          first_name: string | null
          last_name: string | null
          program: string | null
          university: string | null
          bio: string | null
          interests: string[]
          housing_status: string[] | null
          degree_level: string | null
          study_year: number | null
          budget_min: number | null
          budget_max: number | null
          budget_unknown: boolean
          preferred_cities: string[]
          avatar_id: string | null
          profile_picture_url: string | null
        }
      >()

      if (!isLocked && otherIds.length > 0) {
        // profiles has no study_year — use user_academic for year / resolved programme
        const { data: profiles, error: profilesErr } = await admin
          .from('profiles')
          .select(
            'user_id, first_name, last_name, program, bio, interests, housing_status, degree_level, budget_min, budget_max, budget_unknown, preferred_cities, avatar_id, profile_picture_url, universities!profiles_university_id_fkey(name)'
          )
          .in('user_id', otherIds)

        if (profilesErr) {
          safeLogger.warn('Failed to load group member profiles', { error: profilesErr, chatId })
        }

        const { data: academicRows } = await admin
          .from('user_academic')
          .select(
            'user_id, degree_level, study_start_year, universities!user_academic_university_id_fkey(name), programs!user_academic_program_id_fkey(name, name_en)'
          )
          .in('user_id', otherIds)

        const academicById = new Map<
          string,
          {
            degree_level: string | null
            study_year: number | null
            university: string | null
            program: string | null
          }
        >()
        for (const row of academicRows || []) {
          const uni = Array.isArray((row as any).universities)
            ? (row as any).universities[0]
            : (row as any).universities
          const prog = Array.isArray((row as any).programs)
            ? (row as any).programs[0]
            : (row as any).programs
          const year =
            typeof row.study_start_year === 'number' && Number.isFinite(row.study_start_year)
              ? row.study_start_year
              : null
          academicById.set(row.user_id as string, {
            degree_level: (row.degree_level as string | null) || null,
            study_year: year,
            university: uni?.name || null,
            program: prog?.name_en || prog?.name || null,
          })
        }

        for (const p of profiles || []) {
          const uni = Array.isArray((p as any).universities)
            ? (p as any).universities[0]
            : (p as any).universities
          const academic = academicById.get(p.user_id as string)
          const interests = Array.isArray(p.interests)
            ? (p.interests as unknown[]).filter((x): x is string => typeof x === 'string')
            : []
          const housing = Array.isArray(p.housing_status)
            ? (p.housing_status as unknown[]).filter((x): x is string => typeof x === 'string')
            : null
          const profileProgram =
            typeof p.program === 'string' && p.program.trim() ? p.program.trim() : null
          const cities = Array.isArray(p.preferred_cities)
            ? (p.preferred_cities as unknown[]).filter((x): x is string => typeof x === 'string')
            : []
          profileById.set(p.user_id as string, {
            first_name: (p.first_name as string | null) || null,
            last_name: (p.last_name as string | null) || null,
            program: academic?.program || profileProgram,
            university: academic?.university || uni?.name || null,
            bio: (p.bio as string | null) || null,
            interests,
            housing_status: housing,
            degree_level: academic?.degree_level || (p.degree_level as string | null) || null,
            study_year: academic?.study_year ?? null,
            budget_min:
              typeof p.budget_min === 'number' && Number.isFinite(p.budget_min)
                ? p.budget_min
                : null,
            budget_max:
              typeof p.budget_max === 'number' && Number.isFinite(p.budget_max)
                ? p.budget_max
                : null,
            budget_unknown: Boolean(p.budget_unknown),
            preferred_cities: cities,
            avatar_id: (p.avatar_id as string | null) || null,
            profile_picture_url: (p.profile_picture_url as string | null) || null,
          })
        }
      }

      const avatarUrlByUserId = new Map<string, string | null>()
      if (!isLocked) {
        await Promise.all(
          otherActive.map(async (m) => {
            const userId = m.user_id as string
            const profile = profileById.get(userId)
            const iconUrl = programmaticAvatarUrl(profile?.avatar_id, userId)
            const sharesPhoto = sharePictureByUserId.get(userId) === true
            const photoPath = profile?.profile_picture_url?.trim()
            if (sharesPhoto && photoPath) {
              const signed = await signedProfilePictureUrl(photoPath)
              avatarUrlByUserId.set(userId, signed || iconUrl)
              return
            }
            avatarUrlByUserId.set(userId, iconUrl)
          }),
        )
      }

      const activeMemberCount = (viewerMembership ? 1 : 0) + otherActive.length

      const members = [
        ...(viewerMembership
          ? [
              {
                member_key: viewerMembership.id as string,
                user_id: user.id,
                membership_status: 'active' as const,
                display_name: 'You',
                is_you: true,
                identity_revealed: true,
                avatar_url: null as string | null,
                shares_picture: Boolean(viewerMembership.share_picture),
                program: null as string | null,
                university: null as string | null,
                bio: null as string | null,
                interests: [] as string[],
                housing_status: null as string[] | null,
                degree_level: null as string | null,
                study_year: null as number | null,
                budget_min: null as number | null,
                budget_max: null as number | null,
                budget_unknown: false,
                preferred_cities: [] as string[],
                pairwise_score: null as number | null,
              },
            ]
          : []),
        ...otherActive.map((m, index) => {
          const profile = profileById.get(m.user_id as string)
          const realName = profile
            ? [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim()
            : ''
          const anonymousLabel = `Member ${index + 2}`
          return {
            member_key: m.id as string,
            user_id: m.user_id as string,
            membership_status: 'active' as const,
            display_name: isLocked ? anonymousLabel : realName || anonymousLabel,
            is_you: false,
            identity_revealed: !isLocked,
            avatar_url: isLocked ? null : avatarUrlByUserId.get(m.user_id as string) || null,
            shares_picture: !isLocked && sharePictureByUserId.get(m.user_id as string) === true,
            program: isLocked ? null : profile?.program || null,
            university: isLocked ? null : profile?.university || null,
            bio: isLocked ? null : profile?.bio || null,
            interests: isLocked ? [] : profile?.interests || [],
            housing_status: isLocked ? null : profile?.housing_status || null,
            degree_level: isLocked ? null : profile?.degree_level || null,
            study_year: isLocked ? null : profile?.study_year ?? null,
            budget_min: isLocked ? null : profile?.budget_min ?? null,
            budget_max: isLocked ? null : profile?.budget_max ?? null,
            budget_unknown: isLocked ? false : Boolean(profile?.budget_unknown),
            preferred_cities: isLocked ? [] : profile?.preferred_cities || [],
            pairwise_score: isLocked
              ? null
              : pairwiseScoresByUserId[m.user_id as string] ?? null,
          }
        }),
        ...Array.from({ length: pendingInviteCount || 0 }, (_, i) => ({
          member_key: `pending-${i}`,
          user_id: null as string | null,
          membership_status: 'invited' as const,
          display_name: `Member ${activeMemberCount + i + 1}`,
          is_you: false,
          identity_revealed: false,
          avatar_url: null as string | null,
          shares_picture: false,
          program: null,
          university: null,
          bio: null,
          interests: [] as string[],
          housing_status: null,
          degree_level: null,
          study_year: null,
          budget_min: null,
          budget_max: null,
          budget_unknown: false,
          preferred_cities: [] as string[],
          pairwise_score: null,
        })),
      ]

      let compatibilityPayload = null
      // Group fit / harmony / context stay locked until everyone has accepted.
      if (!isLocked) {
        let { data: compatibility } = await admin
          .from('group_compatibility_scores')
          .select('*')
          .eq('chat_id', chatId)
          .maybeSingle()

        let computedFallback: GroupCompatibilityScore | null = null
        const pairScoresMissing =
          !compatibility ||
          !Array.isArray(compatibility.pair_scores) ||
          compatibility.pair_scores.length === 0
        // Scores are often missing until someone leaves — compute on read when possible
        if (
          ((!compatibility || compatibility.overall_score == null) || pairScoresMissing) &&
          activeIds.length >= 2
        ) {
          try {
            computedFallback = await recalculateGroupCompatibility(chatId)
            const { data: refreshed } = await admin
              .from('group_compatibility_scores')
              .select('*')
              .eq('chat_id', chatId)
              .maybeSingle()
            compatibility = refreshed
          } catch (recalcErr) {
            safeLogger.warn('Failed to recalculate group compatibility for panel', {
              error: recalcErr,
              chatId,
            })
          }
        }

        compatibilityPayload =
          buildCompatibilityPayload(compatibility || {}) ||
          (computedFallback ? compatibilityFromComputed(computedFallback) : null)
      }

      return NextResponse.json({
        chat: {
          name: chat?.name || null,
          is_locked: isLocked,
          group_intent: chat?.group_intent || null,
          description: chat?.description || null,
        },
        compatibility: compatibilityPayload,
        members,
        joined_count: activeIds.length,
        pending_invite_count: pendingInviteCount || 0,
        viewer_settings: {
          muted: Boolean(viewerMembership?.muted),
          share_picture: Boolean(viewerMembership?.share_picture),
        },
      })
    }

    // If action is provided but invalid, return error
    if (
      action &&
      action !== 'compatibility' &&
      action !== 'members-preview' &&
      action !== 'locked-overview' &&
      action !== 'panel'
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid action. Must be "compatibility", "members-preview", "locked-overview", or "panel"',
        },
        { status: 400 }
      )
    }

    // This should not be reached, but provide fallback
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    safeLogger.error('Error in group API', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// POST /api/chat/groups/:chatId/leave - Leave group with feedback
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chat_id, feedback_type, reason, category_issues } = await request.json()
    
    if (!chat_id || !feedback_type) {
      return NextResponse.json(
        { error: 'chat_id and feedback_type are required' },
        { status: 400 }
      )
    }

    if (!['left', 'reassigned', 'discomfort'].includes(feedback_type)) {
      return NextResponse.json(
        { error: 'Invalid feedback_type' },
        { status: 400 }
      )
    }

    const admin = await createAdminClient()

    // Verify user is a member
    const { data: membership } = await admin
      .from('chat_members')
      .select('*')
      .eq('chat_id', chat_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this chat' },
        { status: 403 }
      )
    }

    // Update member status to left
    const { error: updateError } = await admin
      .from('chat_members')
      .update({
        status: 'left',
        left_at: new Date().toISOString()
      })
      .eq('chat_id', chat_id)
      .eq('user_id', user.id)

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to leave group: ${updateError.message}` },
        { status: 500 }
      )
    }

    // Save feedback
    const { error: feedbackError } = await admin
      .from('group_feedback')
      .upsert({
        chat_id,
        user_id: user.id,
        feedback_type,
        reason: reason || null,
        category_issues: category_issues || null
      }, {
        onConflict: 'chat_id,user_id,feedback_type'
      })

    if (feedbackError) {
      safeLogger.warn('Failed to save feedback', { error: feedbackError })
    }

    // Recalculate compatibility without this member
    try {
      await recalculateGroupCompatibility(chat_id)
    } catch (compatError) {
      safeLogger.warn('Failed to recalculate compatibility', { error: compatError })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Left group successfully'
    })
  } catch (error) {
    safeLogger.error('Error leaving group', error)
    return NextResponse.json(
      { error: 'Failed to leave group' },
      { status: 500 }
    )
  }
}

