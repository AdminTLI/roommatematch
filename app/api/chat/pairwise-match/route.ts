import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { createNotification } from '@/lib/notifications/create'

// POST /api/chat/pairwise-match - Accept or reject a pairwise match in a group
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chat_id, other_user_id, action } = await request.json()
    
    if (!chat_id || !other_user_id || !action) {
      return NextResponse.json(
        { error: 'chat_id, other_user_id, and action are required' },
        { status: 400 }
      )
    }

    if (action !== 'accept' && action !== 'reject') {
      return NextResponse.json(
        { error: 'action must be "accept" or "reject"' },
        { status: 400 }
      )
    }

    const admin = await createAdminClient()

    // Verify user is a member of the chat
    const { data: membership } = await admin
      .from('chat_members')
      .select('user_id, status')
      .eq('chat_id', chat_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this chat' },
        { status: 403 }
      )
    }

    // Verify other user is also a member
    const { data: otherMembership } = await admin
      .from('chat_members')
      .select('user_id')
      .eq('chat_id', chat_id)
      .eq('user_id', other_user_id)
      .maybeSingle()

    if (!otherMembership) {
      return NextResponse.json(
        { error: 'Other user is not a member of this chat' },
        { status: 403 }
      )
    }

    // Find the pairwise match record (ensure consistent ordering)
    const userAId = user.id < other_user_id ? user.id : other_user_id
    const userBId = user.id < other_user_id ? other_user_id : user.id

    const { data: pairwiseMatch, error: matchError } = await admin
      .from('group_pairwise_matches')
      .select('*')
      .eq('chat_id', chat_id)
      .eq('user_a_id', userAId)
      .eq('user_b_id', userBId)
      .maybeSingle()

    if (matchError || !pairwiseMatch) {
      return NextResponse.json(
        { error: 'Pairwise match not found' },
        { status: 404 }
      )
    }

    // Allow reversing rejections (changing from rejected to accepted)
    if (pairwiseMatch.status === 'accepted' && action === 'accept') {
      return NextResponse.json(
        { error: 'This match has already been accepted' },
        { status: 400 }
      )
    }
    
    // If rejecting an already rejected match, no-op
    if (pairwiseMatch.status === 'rejected' && action === 'reject') {
      return NextResponse.json(
        { error: 'This match has already been rejected' },
        { status: 400 }
      )
    }

    // Verify the user is part of this pair
    if (pairwiseMatch.user_a_id !== user.id && pairwiseMatch.user_b_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to decide this match' },
        { status: 403 }
      )
    }

    // Update the pairwise match
    const { error: updateError } = await admin
      .from('group_pairwise_matches')
      .update({
        status: action === 'accept' ? 'accepted' : 'rejected',
        accepted_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', pairwiseMatch.id)

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update match: ${updateError.message}` },
        { status: 500 }
      )
    }

    // If accepted, create a confirmed match in match_suggestions
    if (action === 'accept') {
      // Check if match already exists
      const { data: existingMatch } = await admin
        .from('match_suggestions')
        .select('id')
        .eq('status', 'confirmed')
        .contains('member_ids', [userAId, userBId])
        .maybeSingle()

      if (!existingMatch) {
        // Create confirmed match suggestion
        const { error: matchCreateError } = await admin
          .from('match_suggestions')
          .insert({
            run_id: `group_chat_${chat_id}_${Date.now()}`,
            kind: 'pair',
            member_ids: [userAId, userBId],
            fit_score: 0.5, // Default score, can be calculated later
            fit_index: 50,
            status: 'confirmed',
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
            accepted_by: [userAId, userBId]
          })

        if (matchCreateError) {
          safeLogger.warn('Failed to create match suggestion', { error: matchCreateError })
          // Don't fail - the pairwise match is still updated
        }
      }

      // Send notification to the other user
      try {
        const { data: userProfile } = await admin
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', user.id)
          .maybeSingle()

        const userName = userProfile
          ? [userProfile.first_name, userProfile.last_name].filter(Boolean).join(' ') || 'Someone'
          : 'Someone'

        await createNotification({
          user_id: other_user_id,
          type: 'match_accepted',
          title: 'Match Accepted in Group',
          message: `${userName} accepted to match with you in the group chat.`,
          metadata: {
            chat_id: chat_id,
            matched_user_id: user.id
          }
        })
      } catch (notificationError) {
        safeLogger.warn('Failed to send acceptance notification', { error: notificationError })
      }
    }

    // Check if group can unlock now
    const { data: progress } = await admin.rpc('get_pairwise_match_progress', {
      p_chat_id: chat_id
    })

    const progressData = progress?.[0]
    const canUnlock = progressData?.pending_pairs === 0 && progressData?.rejected_pairs === 0

    // Get chat info for notifications
    const { data: chat } = await admin
      .from('chats')
      .select('id, name, created_by, is_locked')
      .eq('id', chat_id)
      .single()

    // Send progress update to creator (if not the current user)
    if (chat?.created_by && chat.created_by !== user.id) {
      try {
        const progressText = progressData 
          ? `${progressData.accepted_pairs}/${progressData.total_pairs} matches accepted`
          : 'Progress updated'
        
        await createNotification({
          user_id: chat.created_by,
          type: 'system_announcement',
          title: 'Group Matching Progress',
          message: `${progressText} in "${chat.name || 'the group chat'}".`,
          metadata: {
            chat_id: chat_id,
            progress: progressData
          }
        })
      } catch (notifError) {
        safeLogger.warn('Failed to send progress notification to creator', { error: notifError })
      }
    }

    // If group unlocked, notify all members
    if (canUnlock && chat?.is_locked) {
      const { data: allMembers } = await admin
        .from('chat_members')
        .select('user_id')
        .eq('chat_id', chat_id)
        .eq('status', 'active')

      const memberIds = allMembers?.map(m => m.user_id) || []
      
      for (const memberId of memberIds) {
        try {
          await createNotification({
            user_id: memberId,
            type: 'match_confirmed',
            title: 'Group Chat Unlocked!',
            message: `All members have accepted to match with each other. The group chat is now active!`,
            metadata: {
              chat_id: chat_id,
              group_name: chat.name
            }
          })
        } catch (notifError) {
          safeLogger.warn('Failed to send unlock notification', { error: notifError })
        }
      }
    }

    return NextResponse.json({
      success: true,
      action,
      progress: progressData,
      can_unlock: canUnlock
    })
  } catch (error) {
    safeLogger.error('Error processing pairwise match', error)
    return NextResponse.json(
      { error: 'Failed to process pairwise match' },
      { status: 500 }
    )
  }
}

// GET /api/chat/pairwise-match - Get pairwise match status for a chat
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

    // Verify user is a member
    const { data: membership } = await supabase
      .from('chat_members')
      .select('user_id')
      .eq('chat_id', chatId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this chat' },
        { status: 403 }
      )
    }

    // Get all pairwise matches for this chat
    const { data: pairwiseMatches, error } = await supabase
      .from('group_pairwise_matches')
      .select('*')
      .eq('chat_id', chatId)

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch pairwise matches: ${error.message}` },
        { status: 500 }
      )
    }

    // Get progress
    const admin = await createAdminClient()
    const { data: progress } = await admin.rpc('get_pairwise_match_progress', {
      p_chat_id: chatId
    })

    return NextResponse.json({
      pairwise_matches: pairwiseMatches || [],
      progress: progress?.[0] || null
    })
  } catch (error) {
    safeLogger.error('Error fetching pairwise matches', error)
    return NextResponse.json(
      { error: 'Failed to fetch pairwise matches' },
      { status: 500 }
    )
  }
}

