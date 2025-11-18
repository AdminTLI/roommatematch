import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { requireAdmin } from '@/lib/auth/admin'
import { createNotificationsForUsers, createNotification } from '@/lib/notifications/create'
import { calculateGroupCompatibility } from '@/lib/group-compatibility/calculator'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { member_ids, name, group_intent, context_message } = await request.json()
    
    if (!member_ids || !Array.isArray(member_ids) || member_ids.length < 2) {
      return NextResponse.json({ error: 'At least 2 members required for group chat' }, { status: 400 })
    }

    if (member_ids.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 other members allowed in a group (6 total including you)' }, { status: 400 })
    }

    // Ensure current user is not in member_ids and calculate total
    const uniqueMemberIds = Array.from(new Set(member_ids.filter(id => id !== user.id)))
    const allMemberIds = [user.id, ...uniqueMemberIds]
    
    if (allMemberIds.length > 6) {
      return NextResponse.json({ error: 'Maximum 6 members allowed in a group' }, { status: 400 })
    }

    // Rate limiting: 3 group chats per day
    const rateLimitKey = getUserRateLimitKey('group_creation', user.id)
    const rateLimitResult = await checkRateLimit('group_creation', rateLimitKey)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'You can only create 3 group chats per day. Please try again tomorrow.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    // Allow admin override for testing/debugging
    const adminCheck = await requireAdmin(request)
    const isAdmin = adminCheck.ok

    const admin = await createAdminClient()
    
    // Verify creator is matched with each invitee (required)
    for (const inviteeId of uniqueMemberIds) {
      // Check for confirmed match suggestion
      const { data: confirmedSuggestion } = await admin
        .from('match_suggestions')
        .select('id')
        .eq('status', 'confirmed')
        .contains('member_ids', [user.id, inviteeId])
        .maybeSingle()
      
      // Check for locked match record
      const { data: lockedMatch } = await admin
        .from('match_records')
        .select('id')
        .eq('locked', true)
        .contains('user_ids', [user.id, inviteeId])
        .maybeSingle()
    
      // If no confirmed match found and not admin, reject
      if (!confirmedSuggestion && !lockedMatch && !isAdmin) {
        return NextResponse.json(
          { error: `You must be matched with all group members. You are not matched with one of the selected members.` },
          { status: 403 }
        )
      }
    }

    // Verify all invitees are verified users
    const { data: inviteeProfiles } = await admin
      .from('profiles')
      .select('user_id, verification_status')
      .in('user_id', uniqueMemberIds)

    const unverifiedUsers = inviteeProfiles?.filter(
      p => p.verification_status !== 'verified'
    ) || []

    if (unverifiedUsers.length > 0 && !isAdmin) {
      return NextResponse.json(
        { error: 'All group members must be verified users' },
        { status: 403 }
      )
    }

    // Set lock expiration (72 hours from now)
    const lockExpiresAt = new Date()
    lockExpiresAt.setHours(lockExpiresAt.getHours() + 72)

    // Create group chat in 'inviting' status with lock
    const { data: createdChat, error: chatErr } = await admin
      .from('chats')
      .insert({ 
        is_group: true, 
        created_by: user.id,
        name: name || null,
        group_intent: group_intent || 'general',
        invitation_status: 'inviting',
        is_locked: true,
        lock_expires_at: lockExpiresAt.toISOString()
      })
      .select('id')
      .single()

    if (chatErr || !createdChat) {
      return NextResponse.json(
        { error: `Failed to create group chat: ${chatErr?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    const chatId = createdChat.id

    // Add creator as active member immediately
    const { error: creatorMemberErr } = await admin
      .from('chat_members')
      .insert({
        chat_id: chatId,
        user_id: user.id,
        status: 'active'
      })

    if (creatorMemberErr) {
      return NextResponse.json(
        { error: `Failed to add creator as member: ${creatorMemberErr.message}` },
        { status: 500 }
      )
    }

    // Create invitations for each invitee
    const invitations = uniqueMemberIds.map(inviteeId => ({
      chat_id: chatId,
      inviter_id: user.id,
      invitee_id: inviteeId,
      status: 'pending',
      context_message: context_message || null
    }))

    const { data: createdInvitations, error: invitationsErr } = await admin
      .from('group_invitations')
      .insert(invitations)
      .select('id, invitee_id')

    if (invitationsErr) {
      return NextResponse.json(
        { error: `Failed to create invitations: ${invitationsErr.message}` },
        { status: 500 }
      )
    }

    // Add invitees as 'invited' members (they'll become 'active' when they accept)
    const invitedMembers = uniqueMemberIds.map((inviteeId, index) => ({
      chat_id: chatId,
      user_id: inviteeId,
      status: 'invited',
      invitation_id: createdInvitations?.[index]?.id || null
    }))

    const { error: invitedMembersErr } = await admin
      .from('chat_members')
      .insert(invitedMembers)

    if (invitedMembersErr) {
      safeLogger.warn('Failed to add invited members', { error: invitedMembersErr })
      // Don't fail - invitations are more important
    }

    // Calculate initial compatibility score
    try {
      await calculateGroupCompatibility(chatId, allMemberIds, group_intent || 'general')
    } catch (compatError) {
      safeLogger.warn('Failed to calculate initial compatibility', { error: compatError })
      // Don't fail - compatibility can be calculated later
    }

    // Check for existing matches between invitees and create pairwise match records
    // Only create records for pairs that don't already have confirmed matches
    const pairwiseMatches: Array<{ user_a_id: string; user_b_id: string }> = []
    
    // Generate all pairs (excluding creator since they're already matched with everyone)
    for (let i = 0; i < uniqueMemberIds.length; i++) {
      for (let j = i + 1; j < uniqueMemberIds.length; j++) {
        const userA = uniqueMemberIds[i]
        const userB = uniqueMemberIds[j]
        
        // Ensure consistent ordering (smaller ID first)
        const userAId = userA < userB ? userA : userB
        const userBId = userA < userB ? userB : userA
        
        // Check if they already have a confirmed match
        const { data: existingMatch } = await admin
          .from('match_suggestions')
          .select('id')
          .eq('status', 'confirmed')
          .contains('member_ids', [userAId, userBId])
          .maybeSingle()
        
        const { data: existingLockedMatch } = await admin
          .from('match_records')
          .select('id')
          .eq('locked', true)
          .contains('user_ids', [userAId, userBId])
          .maybeSingle()
        
        // If no existing match, create a pending pairwise match record
        if (!existingMatch && !existingLockedMatch) {
          pairwiseMatches.push({ user_a_id: userAId, user_b_id: userBId })
        }
      }
    }

    // Create pairwise match records for pairs that need matching
    if (pairwiseMatches.length > 0) {
      const pairwiseRecords = pairwiseMatches.map(pair => ({
        chat_id: chatId,
        user_a_id: pair.user_a_id,
        user_b_id: pair.user_b_id,
        status: 'pending'
      }))

      const { error: pairwiseErr } = await admin
        .from('group_pairwise_matches')
        .insert(pairwiseRecords)

      if (pairwiseErr) {
        safeLogger.warn('Failed to create pairwise matches', { error: pairwiseErr })
        // Don't fail - this is not critical
      }
    }

    // Get creator's name and find mutual connections
    const { data: creatorProfile } = await admin
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .maybeSingle()

    const creatorName = creatorProfile 
      ? [creatorProfile.first_name, creatorProfile.last_name].filter(Boolean).join(' ') || 'Someone'
      : 'Someone'

    // Get mutual connections for each invitee
    const { data: allMatches } = await admin
      .from('match_suggestions')
      .select('member_ids')
      .eq('status', 'confirmed')
      .contains('member_ids', [user.id])

    const mutualConnectionsMap = new Map<string, string[]>()
    
    for (const inviteeId of uniqueMemberIds) {
      const mutual: string[] = []
      // Find other invitees that this invitee is also matched with
      for (const otherInviteeId of uniqueMemberIds) {
        if (otherInviteeId === inviteeId) continue
        
        const hasMatch = allMatches?.some(m => {
          const memberIds = m.member_ids as string[]
          return memberIds.includes(inviteeId) && memberIds.includes(otherInviteeId)
        })
        
        if (hasMatch) {
          // Get the other invitee's name
          const { data: otherProfile } = await admin
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', otherInviteeId)
            .maybeSingle()
          
          if (otherProfile) {
            const otherName = [otherProfile.first_name, otherProfile.last_name].filter(Boolean).join(' ') || 'Someone'
            mutual.push(otherName)
          }
        }
      }
      mutualConnectionsMap.set(inviteeId, mutual)
    }

    // Get compatibility scores for invitation metadata
    const { data: compatibility } = await admin
      .from('group_compatibility_scores')
      .select('overall_score, personality_score, schedule_score, lifestyle_score, social_score, academic_score')
      .eq('chat_id', chatId)
      .maybeSingle()

    // Send invitation notifications to each invitee
    for (const inviteeId of uniqueMemberIds) {
      try {
        const mutual = mutualConnectionsMap.get(inviteeId) || []
        const mutualText = mutual.length > 0 
          ? ` You're also matched with ${mutual.length === 1 ? mutual[0] : mutual.slice(0, -1).join(', ') + (mutual.length > 1 ? ' and ' + mutual[mutual.length - 1] : '')}.`
          : ''
        
        const groupNameText = name ? ` "${name}"` : ''
        const intentText = group_intent ? ` (${group_intent})` : ''
        const contextText = context_message ? `\n\n"${context_message}"` : ''
        
        await createNotification({
          user_id: inviteeId,
          type: 'group_invitation',
          title: 'Group Chat Invitation',
          message: `${creatorName} invited you to join a group chat${groupNameText}${intentText}.${mutualText}${contextText}`,
          metadata: {
            chat_id: chatId,
            inviter_id: user.id,
            inviter_name: creatorName,
            group_name: name || undefined,
            group_intent: group_intent || 'general',
            context_message: context_message || undefined,
            mutual_connections: mutual,
            compatibility: compatibility ? {
              overall: compatibility.overall_score,
              personality: compatibility.personality_score,
              schedule: compatibility.schedule_score,
              lifestyle: compatibility.lifestyle_score,
              social: compatibility.social_score,
              academic: compatibility.academic_score
            } : undefined,
            member_count: allMemberIds.length
          }
        })
      } catch (notificationError) {
        safeLogger.error('Failed to send invitation notification', {
          error: notificationError,
          chatId,
          inviteeId
        })
      }
    }

    return NextResponse.json({ 
      chat_id: chatId,
      invitation_status: 'inviting',
      invitations_created: createdInvitations?.length || 0
    })
  } catch (error) {
    safeLogger.error('Error creating group chat', error)
    return NextResponse.json(
      { error: 'Failed to create group chat' },
      { status: 500 }
    )
  }
}

