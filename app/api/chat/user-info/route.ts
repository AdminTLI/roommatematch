import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkRateLimit, getUserRateLimitKey, buildRateLimitHeaders } from '@/lib/rate-limit'
import { safeLogger } from '@/lib/utils/logger'
import { canViewCohortProfile } from '@/lib/auth/cohort-visibility'

const CHAT_PROFILES_LIMIT = 60 // 60 profile fetches per minute per user

type UserType = 'student' | 'professional' | null

// GET /api/chat/user-info?chatId=xxx
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting: 60 profile fetches per minute per user (prevents script scraping)
    const rateLimitKey = getUserRateLimitKey('chat_profiles', user.id)
    const rateLimitResult = await checkRateLimit('chat_profiles', rateLimitKey)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: buildRateLimitHeaders(CHAT_PROFILES_LIMIT, rateLimitResult)
        }
      )
    }

    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')

    if (!chatId) {
      return NextResponse.json(
        { error: 'chatId is required' },
        { status: 400 }
      )
    }

    const admin = await createAdminClient()
    
    // Verify user is a member of the chat
    const { data: chatMembers, error: membersError } = await admin
      .from('chat_members')
      .select('user_id, chat_id')
      .eq('chat_id', chatId)

    if (membersError) {
      safeLogger.error('Failed to fetch chat members', { error: membersError, chatId })
      return NextResponse.json(
        { error: 'Failed to fetch chat members', details: membersError.message },
        { status: 500 }
      )
    }

    if (!chatMembers || chatMembers.length === 0) {
      return NextResponse.json(
        { error: 'No members found in chat' },
        { status: 404 }
      )
    }

    // Check if chat is a group chat
    const { data: chatData, error: chatError } = await admin
      .from('chats')
      .select('is_group')
      .eq('id', chatId)
      .maybeSingle()

    if (chatError) {
      safeLogger.error('Failed to fetch chat data', { error: chatError, chatId })
      return NextResponse.json(
        { error: 'Failed to fetch chat data' },
        { status: 500 }
      )
    }

    if (chatData?.is_group) {
      return NextResponse.json(
        { error: 'User info is only available for individual chats' },
        { status: 400 }
      )
    }

    // Find the other user (not the current user)
    const otherMember = chatMembers.find(m => m.user_id !== user.id)
    if (!otherMember) {
      safeLogger.warn('Other user not found in chat', { chatId, chatMembers, currentUserId: user.id })
      return NextResponse.json(
        { error: 'Other user not found in chat' },
        { status: 404 }
      )
    }

    const targetUserId = otherMember.user_id

    // Privacy: If either participant is a ghost (Make Profile Visible OFF),
    // disable access to detailed profile info.
    const { data: privacyProfiles, error: privacyError } = await admin
      .from('profiles')
      .select('user_id, is_visible')
      .in('user_id', [user.id, targetUserId])

    if (privacyError) {
      safeLogger.error('Failed to fetch privacy state for user-info', { error: privacyError, chatId, targetUserId })
      return NextResponse.json({ error: 'Failed to fetch privacy state' }, { status: 500 })
    }

    const viewerGhost = (privacyProfiles || []).some(p => p.user_id === user.id && p.is_visible === false)
    const targetGhost = (privacyProfiles || []).some(p => p.user_id === targetUserId && p.is_visible === false)

    if (viewerGhost || targetGhost) {
      safeLogger.info('[chat/user-info] Privacy disabled (ghost mode)', { chatId, viewerGhost, targetGhost })
      return NextResponse.json(
        { error: 'This feature is disabled by privacy settings.', reason: 'privacy_disabled' },
        { status: 403 }
      )
    }

    // Verify match relationship
    // Check match_suggestions table first
    // Query for matches where the user is involved, then filter in memory for the target user
    // This is more reliable than .contains() which may not work correctly for array contains checks
    const { data: allSuggestions, error: suggestionError } = await admin
      .from('match_suggestions')
      .select('id, status, member_ids')
      .contains('member_ids', [user.id])
      .in('status', ['confirmed', 'accepted'])
    
    if (suggestionError) {
      safeLogger.warn('Error checking match suggestions', { error: suggestionError, userId: user.id, targetUserId })
    }
    
    // Filter in memory to find matches with both users
    const matchSuggestion = allSuggestions?.find((s: any) => {
      const memberIds = s.member_ids as string[]
      return Array.isArray(memberIds) && 
             memberIds.includes(user.id) && 
             memberIds.includes(targetUserId)
    })

    // Also check matches table as fallback
    let hasMatch = false
    if (matchSuggestion) {
      hasMatch = true
    } else {
      const { data: match, error: matchError } = await admin
        .from('matches')
        .select('id, status')
        .or(`and(a_user.eq.${user.id},b_user.eq.${targetUserId}),and(a_user.eq.${targetUserId},b_user.eq.${user.id})`)
        .eq('status', 'accepted')
        .maybeSingle()

      if (match) {
        hasMatch = true
      }
    }

    if (!hasMatch) {
      safeLogger.warn('No match found for user info access', { 
        userId: user.id, 
        targetUserId, 
        chatId,
        suggestionsChecked: allSuggestions?.length || 0
      })
      return NextResponse.json(
        { error: 'You can only view info for matched users' },
        { status: 403 }
      )
    }

    // Profile/settings data is only visible to users of the same role (student vs professional)
    const allowed = await canViewCohortProfile(user.id, targetUserId)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Profile information is only visible to users in the same cohort' },
        { status: 403 }
      )
    }

    // Determine target user's cohort (student vs professional) so UI can render correct context.
    // We don't rely solely on academic table presence because professionals store lifecycle context in onboarding answers.
    let targetUserType: UserType = null
    const { data: targetProfilesRow } = await admin
      .from('profiles')
      .select('user_type')
      .eq('user_id', targetUserId)
      .maybeSingle()

    if (targetProfilesRow?.user_type === 'student' || targetProfilesRow?.user_type === 'professional') {
      targetUserType = targetProfilesRow.user_type
    } else {
      const { data: targetUsersRow } = await admin
        .from('users')
        .select('user_type')
        .eq('id', targetUserId)
        .maybeSingle()
      if (targetUsersRow?.user_type === 'student' || targetUsersRow?.user_type === 'professional') {
        targetUserType = targetUsersRow.user_type
      }
    }

    // Fetch profile data
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('first_name, last_name, bio, interests, housing_status')
      .eq('user_id', targetUserId)
      .maybeSingle()

    if (profileError) {
      safeLogger.error('Failed to fetch profile', { error: profileError, targetUserId })
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Fetch questionnaire budget (min/max rent) from responses
    let budgetMin: number | null = null
    let budgetMax: number | null = null
    const { data: budgetResponses } = await admin
      .from('responses')
      .select('question_key, value')
      .eq('user_id', targetUserId)
      .in('question_key', ['budget_min', 'budget_max'])
    if (budgetResponses?.length) {
      const toNum = (v: unknown): number | null => {
        if (typeof v === 'number' && Number.isFinite(v)) return v
        if (typeof v === 'string') { const n = Number(v); return Number.isFinite(n) ? n : null }
        return null
      }
      for (const r of budgetResponses) {
        const num = toNum(r.value)
        if (num == null) continue
        if (r.question_key === 'budget_min') budgetMin = num
        if (r.question_key === 'budget_max') budgetMax = num
      }
    }

    // Fetch preferred cities from user_housing_preferences (post-onboarding / housing preferences)
    let preferredCities: string[] = []
    const { data: housingPrefs } = await admin
      .from('user_housing_preferences')
      .select('preferred_cities')
      .eq('user_id', targetUserId)
      .maybeSingle()
    if (housingPrefs?.preferred_cities && Array.isArray(housingPrefs.preferred_cities)) {
      preferredCities = housingPrefs.preferred_cities.filter((c): c is string => typeof c === 'string')
    }

    // Fetch academic data with joins for university and program info
    // Student fields (academic context). For professionals, these should be null.
    let universityName: string | null = null
    let programName: string | null = null
    let degreeLevel: string | null = null
    let studyYear: number | null = null

    if (targetUserType === 'student') {
      const { data: academicData } = await admin
        .from('user_academic')
        .select(`
          university_id,
          degree_level,
          program_id,
          study_start_year,
          universities!user_academic_university_id_fkey (
            name,
            common_name
          ),
          programs!user_academic_program_id_fkey (
            name,
            name_en
          )
        `)
        .eq('user_id', targetUserId)
        .maybeSingle()

      // Fetch study year from view
      if (academicData) {
        const { data: studyYearData, error: studyYearError } = await admin
          .from('user_study_year_v')
          .select('study_year')
          .eq('user_id', targetUserId)
          .maybeSingle()

        if (!studyYearError && studyYearData) {
          studyYear = studyYearData.study_year
        } else if (academicData.study_start_year) {
          // Fallback: calculate from study_start_year
          const currentYear = new Date().getFullYear()
          studyYear = currentYear - academicData.study_start_year
        }
      }

      // Extract university and program names
      universityName = academicData?.universities?.name || academicData?.universities?.common_name || null
      programName = academicData?.programs?.name_en || academicData?.programs?.name || null
      degreeLevel = academicData?.degree_level || null
    }

    // Professional fields (lifestyle context).
    // We source this from `resolve_user_preferences()` so we can read values stored in onboarding answers.
    let wfhStatus: string | null = null
    let age: number | null = null
    let workSchedule: string | null = null

    if (targetUserType === 'professional') {
      try {
        const resolvedPrefsResult = await admin.rpc('resolve_user_preferences', {
          p_user_id: targetUserId
        })

        const prefs = resolvedPrefsResult?.data as Record<string, any> | null

        const rawAge = prefs?.age
        if (typeof rawAge === 'number' && Number.isFinite(rawAge)) {
          age = rawAge
        } else if (typeof rawAge === 'string' && rawAge.trim() !== '') {
          const parsed = Number(rawAge)
          if (Number.isFinite(parsed)) age = parsed
        }

        const rawWfh = prefs?.wfh_status
        if (typeof rawWfh === 'string' && rawWfh.trim() !== '') {
          wfhStatus = rawWfh
        }

        // Derive a "general schedule" string from sleep/circadian preferences.
        const deriveWorkSchedule = (): string | null => {
          const direct = prefs?.work_schedule
          if (typeof direct === 'string' && direct.trim() !== '') return direct

          // Prefer explicit timeRange window: M2_Q2 (weeknights) typically stores { start, end }.
          const weeknight = prefs?.M2_Q2
          if (weeknight && typeof weeknight === 'object') {
            const start = typeof (weeknight as any).start === 'string' ? (weeknight as any).start : null
            const end = typeof (weeknight as any).end === 'string' ? (weeknight as any).end : null
            if (start && end) return `${start}–${end}`
          }

          // Quiet-hours start/end (MCQ time values)
          const quietStart = prefs?.M2_Q13
          const quietEnd = prefs?.M2_Q14
          if (typeof quietStart === 'string' && typeof quietEnd === 'string' && quietStart && quietEnd) {
            return `${quietStart}–${quietEnd}`
          }

          const weekendQuietEnd = prefs?.M2_Q15
          if (typeof quietStart === 'string' && typeof weekendQuietEnd === 'string' && quietStart && weekendQuietEnd) {
            return `${quietStart}–${weekendQuietEnd}`
          }

          return null
        }

        workSchedule = deriveWorkSchedule()
      } catch (e) {
        safeLogger.warn('[chat/user-info] Failed to resolve professional context', {
          targetUserId,
          error: e instanceof Error ? e.message : String(e)
        })
      }
    }

    // Return user info
    const headers: Record<string, string> = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...buildRateLimitHeaders(CHAT_PROFILES_LIMIT, rateLimitResult)
    }

    return NextResponse.json({
      first_name: profile.first_name || null,
      last_name: profile.last_name || null,
      bio: profile.bio || null,
      interests: (profile.interests && Array.isArray(profile.interests)) ? profile.interests : [],
      housing_status: (profile.housing_status && Array.isArray(profile.housing_status)) ? profile.housing_status : [],
      budget_min: budgetMin,
      budget_max: budgetMax,
      preferred_cities: preferredCities,
      user_type: targetUserType,
      wfh_status: wfhStatus,
      work_schedule: workSchedule,
      age,
      university_name: universityName,
      programme_name: programName,
      degree_level: degreeLevel,
      study_year: studyYear
    }, { headers })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    
    safeLogger.error('Error in user-info API', { 
      error,
      errorMessage,
      errorStack,
      chatId: request.nextUrl.searchParams.get('chatId')
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch user information',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}



