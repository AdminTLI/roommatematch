import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { generatePersonalizedExplanation } from '@/lib/matching/personalized-explanation'
import { toStudent } from '@/lib/matching/answer-map'
import type { StudentProfile } from '@/lib/matching/answer-map'

// GET /api/chat/compatibility?chatId=xxx or ?otherUserId=xxx
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')
    const otherUserId = searchParams.get('otherUserId')

    if (!chatId && !otherUserId) {
      return NextResponse.json(
        { error: 'chatId or otherUserId is required' },
        { status: 400 }
      )
    }

    const admin = await createAdminClient()
    let targetUserId: string | null = null

    // If chatId provided, find the other user in the chat
    if (chatId) {
      safeLogger.debug('Fetching compatibility for chatId', { chatId, currentUserId: user.id })
      
      safeLogger.debug('[API Compatibility] === START REQUEST ===', {
        chatId,
        currentUserId: user.id,
        timestamp: new Date().toISOString()
      })
      
      const { data: chatMembers, error: membersError } = await admin
        .from('chat_members')
        .select('user_id, chat_id')
        .eq('chat_id', chatId)

      safeLogger.debug('[API Compatibility] Query result:', {
        chatId,
        hasError: !!membersError,
        error: membersError,
        membersCount: chatMembers?.length || 0,
        members: chatMembers?.map(m => m.user_id)
      })

      if (membersError) {
        safeLogger.error('Failed to fetch chat members', { error: membersError, chatId })
        console.error('[API Compatibility] ERROR fetching chat members:', membersError)
        return NextResponse.json(
          { error: 'Failed to fetch chat members', details: membersError.message },
          { status: 500 }
        )
      }

      if (!chatMembers || chatMembers.length === 0) {
        console.warn('[API Compatibility] No members found for chat:', chatId)
        return NextResponse.json(
          { error: 'No members found in chat' },
          { status: 404 }
        )
      }

      safeLogger.debug('Chat members found', { 
        chatId, 
        members: chatMembers?.map(m => m.user_id),
        currentUserId: user.id 
      })

      // Find the other user (not the current user)
      const otherMember = chatMembers?.find(m => m.user_id !== user.id)
      if (!otherMember) {
        console.warn('[API Compatibility] Other user not found:', {
          chatId,
          allMembers: chatMembers?.map(m => m.user_id),
          currentUserId: user.id
        })
        safeLogger.warn('Other user not found in chat', { chatId, chatMembers, currentUserId: user.id })
        return NextResponse.json(
          { error: 'Other user not found in chat', details: `Chat has ${chatMembers.length} member(s) but none match target` },
          { status: 404 }
        )
      }

      targetUserId = otherMember.user_id
      
      safeLogger.debug('[API Compatibility] Target user determined:', {
        chatId,
        currentUserId: user.id,
        targetUserId,
        allMembers: chatMembers?.map(m => ({ user_id: m.user_id, isCurrentUser: m.user_id === user.id }))
      })
      
      safeLogger.debug('Target user determined', { 
        chatId, 
        targetUserId, 
        currentUserId: user.id,
        allMembers: chatMembers?.map(m => ({ user_id: m.user_id, isCurrentUser: m.user_id === user.id }))
      })
    } else if (otherUserId) {
      targetUserId = otherUserId
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Could not determine target user' },
        { status: 400 }
      )
    }

    // Check if both users have vectors (required for compatibility calculation)
    const { data: userAVector } = await admin
      .from('user_vectors')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()
    
    const { data: userBVector } = await admin
      .from('user_vectors')
      .select('user_id')
      .eq('user_id', targetUserId)
      .maybeSingle()

    if (!userAVector || !userBVector) {
      safeLogger.warn('Users missing vectors for compatibility calculation', {
        user_a_has_vector: !!userAVector,
        user_b_has_vector: !!userBVector,
        user_a_id: user.id,
        user_b_id: targetUserId
      })
      return NextResponse.json(
        { 
          error: 'Compatibility data not available',
          details: 'One or both users have not completed their questionnaire. Please ensure both users have completed their profiles.'
        },
        { status: 404 }
      )
    }

    // Compute compatibility score using RPC
    let compatibilityScore: any[] | null = null
    let scoreError: any = null
    
    try {
      safeLogger.debug('Calling compute_compatibility_score RPC', {
        user_a_id: user.id,
        user_b_id: targetUserId,
        chatId
      })
      
      const result = await admin.rpc(
        'compute_compatibility_score',
        {
          user_a_id: user.id,
          user_b_id: targetUserId
        }
      )
      
      // Supabase RPC returns { data, error } directly
      compatibilityScore = result.data
      scoreError = result.error
      
      const scoreData = compatibilityScore?.[0]
      safeLogger.debug('RPC result', {
        chatId,
        user_a_id: user.id,
        user_b_id: targetUserId,
        hasData: !!compatibilityScore,
        dataLength: Array.isArray(compatibilityScore) ? compatibilityScore.length : 'not array',
        hasError: !!scoreError,
        errorMessage: scoreError?.message,
        compatibilityScore: scoreData?.compatibility_score,
        harmonyScore: scoreData?.harmony_score,
        contextScore: scoreData?.context_score
      })
      
      // Log to console for easier debugging
      safeLogger.debug('[API Compatibility] RPC result:', {
        chatId,
        user_a_id: user.id,
        user_b_id: targetUserId,
        compatibility_score: scoreData?.compatibility_score,
        harmony_score: scoreData?.harmony_score,
        context_score: scoreData?.context_score
      })
    } catch (rpcError) {
      safeLogger.error('RPC call threw exception', { 
        error: rpcError,
        user_a_id: user.id,
        user_b_id: targetUserId,
        message: rpcError instanceof Error ? rpcError.message : 'Unknown error',
        stack: rpcError instanceof Error ? rpcError.stack : undefined
      })
      return NextResponse.json(
        { 
          error: 'Failed to compute compatibility score',
          details: rpcError instanceof Error ? rpcError.message : 'RPC call failed. Please check server logs for details.'
        },
        { status: 500 }
      )
    }

    if (scoreError) {
      safeLogger.error('Failed to compute compatibility score', { 
        error: scoreError,
        errorMessage: scoreError?.message,
        errorCode: scoreError?.code,
        errorDetails: scoreError?.details,
        user_a_id: user.id,
        user_b_id: targetUserId
      })
      return NextResponse.json(
        { 
          error: 'Failed to compute compatibility score', 
          details: scoreError?.message || scoreError?.details || 'Unknown database error'
        },
        { status: 500 }
      )
    }

    if (!compatibilityScore || compatibilityScore.length === 0) {
      safeLogger.warn('Compatibility score returned empty', { 
        user_a_id: user.id,
        user_b_id: targetUserId,
        resultType: typeof compatibilityScore,
        isArray: Array.isArray(compatibilityScore)
      })
      return NextResponse.json(
        { error: 'No compatibility data available. Users may not have completed their profiles yet.' },
        { status: 404 }
      )
    }

    const score = compatibilityScore[0]

    // Fetch both users' data to generate personalized explanation
    // This is optional - if it fails, we still return the compatibility scores
    let personalizedExplanation = ''
    try {
      const [userAProfile, userBProfile] = await Promise.all([
        fetchUserProfileForExplanation(admin, user.id),
        fetchUserProfileForExplanation(admin, targetUserId)
      ])

      // Generate personalized explanation if we have both profiles
      if (userAProfile && userBProfile) {
        try {
          const sectionScores = {
            personality: Number(score.personality_score) || 0,
            schedule: Number(score.schedule_score) || 0,
            lifestyle: Number(score.lifestyle_score) || 0,
            social: Number(score.social_score) || 0,
            academic: Number(score.academic_bonus) || 0
          }

          const matchId = `${user.id}-${targetUserId}`
          personalizedExplanation = generatePersonalizedExplanation({
            studentA: userAProfile,
            studentB: userBProfile,
            sectionScores,
            matchId
          })
        } catch (explanationError) {
          safeLogger.warn('Failed to generate personalized explanation', { 
            error: explanationError,
            message: explanationError instanceof Error ? explanationError.message : 'Unknown error'
          })
          // Continue without personalized explanation
        }
      } else {
        safeLogger.debug('Skipping personalized explanation - missing user profiles', {
          hasUserA: !!userAProfile,
          hasUserB: !!userBProfile
        })
      }
    } catch (profileError) {
      safeLogger.warn('Failed to fetch user profiles for explanation', { 
        error: profileError,
        message: profileError instanceof Error ? profileError.message : 'Unknown error'
      })
      // Continue without personalized explanation - scores are still returned
    }

    const responseData = {
      // Existing fields
      compatibility_score: Number(score.compatibility_score) || 0,
      personality_score: Number(score.personality_score) || 0,
      schedule_score: Number(score.schedule_score) || 0,
      lifestyle_score: Number(score.lifestyle_score) || 0,
      social_score: Number(score.social_score) || 0,
      academic_bonus: Number(score.academic_bonus) || 0,
      penalty: Number(score.penalty) || 0,
      top_alignment: score.top_alignment || null,
      watch_out: score.watch_out || null,
      house_rules_suggestion: score.house_rules_suggestion || null,
      academic_details: score.academic_details || null,
      personalized_explanation: personalizedExplanation,
      
      // New fields from compatibility algorithm v1.0
      harmony_score: Number(score.harmony_score) || null,
      context_score: Number(score.context_score) || null,
      dimension_scores_json: score.dimension_scores_json || null,
      is_valid_match: score.is_valid_match !== false, // Default to true if null/undefined
      algorithm_version: score.algorithm_version || 'v1.0',
      
      // Debug fields (remove in production)
      _debug: {
        chatId,
        currentUserId: user.id,
        targetUserId
      }
    }
    
    safeLogger.debug('[API Compatibility] Returning response:', {
      chatId,
      targetUserId,
      compatibility_score: responseData.compatibility_score,
      harmony_score: responseData.harmony_score,
      context_score: responseData.context_score
    })
    
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : { error: String(error) }
    
    safeLogger.error('Error in compatibility API', { 
      error,
      errorMessage,
      errorStack,
      errorDetails,
      chatId,
      currentUserId: user?.id,
      targetUserId
    })
    
    console.error('[API Compatibility] Full error:', {
      error,
      errorMessage,
      errorStack,
      errorDetails,
      chatId,
      currentUserId: user?.id,
      targetUserId
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch compatibility data',
        details: errorMessage,
        _debug: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * Fetch user profile and answers to create StudentProfile for explanation generation
 */
async function fetchUserProfileForExplanation(
  admin: any,
  userId: string
): Promise<StudentProfile | null> {
  try {
    // Fetch user data similar to getCandidateByUserId
    // Use left joins to handle cases where users might not have profiles/academic yet
    const { data, error } = await admin
      .from('users')
      .select(`
        id,
        profiles(
          first_name,
          university_id,
          degree_level,
          campus
        ),
        user_academic(
          university_id,
          degree_level,
          program_id,
          undecided_program
        ),
        responses(
          question_key,
          value
        )
      `)
      .eq('id', userId)
      .single()

    if (error) {
      safeLogger.warn('Failed to fetch user profile for explanation', { 
        userId, 
        error,
        errorMessage: error.message,
        errorCode: error.code
      })
      return null
    }

    if (!data) {
      safeLogger.warn('No user data found for explanation', { userId })
      return null
    }

    // Build answers object from responses
    const answers = data.responses?.reduce((acc: Record<string, any>, r: any) => {
      acc[r.question_key] = r.value
      return acc
    }, {}) || {}

    // Get profile and academic data
    const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
    const academic = Array.isArray(data.user_academic) ? data.user_academic[0] : data.user_academic

    // Convert to StudentProfile format
    return toStudent({
      id: userId,
      answers,
      campusCity: profile?.campus || undefined,
      universityId: profile?.university_id || academic?.university_id || undefined,
      degreeLevel: profile?.degree_level || academic?.degree_level || undefined,
      programmeId: academic?.program_id || undefined,
      graduationYear: undefined // Not needed for explanation
    })
  } catch (error) {
    safeLogger.warn('Error fetching user profile for explanation', { userId, error })
    return null
  }
}

