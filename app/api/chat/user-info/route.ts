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
    const { data: matchSuggestion, error: suggestionError } = await admin
      .from('match_suggestions')
      .select('id, status, member_ids')
      .contains('member_ids', [user.id, targetUserId])
      .in('status', ['confirmed', 'accepted'])
      .maybeSingle()

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
      return NextResponse.json(
        { error: 'You can only view info for matched users' },
        { status: 403 }
      )
    }

    // Fetch profile data
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('first_name, last_name, bio, interests')
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

    // Return user info
    return NextResponse.json({
      first_name: profile.first_name || null,
      last_name: profile.last_name || null,
      bio: profile.bio || null,
      interests: (profile.interests && Array.isArray(profile.interests)) ? profile.interests : []
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

