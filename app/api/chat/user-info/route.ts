import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

// GET /api/chat/user-info?chatId=xxx
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Fetch academic data with joins for university and program info
    const { data: academicData, error: academicError } = await admin
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
    let studyYear: number | null = null
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
    const universityName = academicData?.universities?.name || academicData?.universities?.common_name || null
    const programName = academicData?.programs?.name_en || academicData?.programs?.name || null
    const degreeLevel = academicData?.degree_level || null

    // Return user info
    return NextResponse.json({
      first_name: profile.first_name || null,
      last_name: profile.last_name || null,
      bio: profile.bio || null,
      interests: (profile.interests && Array.isArray(profile.interests)) ? profile.interests : [],
      housing_status: (profile.housing_status && Array.isArray(profile.housing_status)) ? profile.housing_status : [],
      university_name: universityName,
      programme_name: programName,
      degree_level: degreeLevel,
      study_year: studyYear
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
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



