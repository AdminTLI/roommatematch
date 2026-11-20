import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { requireAdmin } from '@/lib/auth/admin'
import { createNotificationsForUsers, createNotification } from '@/lib/notifications/create'
import { calculateGroupCompatibility } from '@/lib/group-compatibility/calculator'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { getMaxGroupMembers, getPlatformSettings } from '@/lib/platform-settings'
import { ensurePairwiseAmongActiveMembers } from '@/lib/chat/ensure-group-pairwise'
import { sendGroupInviteDirectMessages } from '@/lib/chat/send-group-invite-dms'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const platformSettings = await getPlatformSettings()
    const maxGroupMembers = getMaxGroupMembers(platformSettings)
    const maxOtherMembers = maxGroupMembers - 1

    const { member_ids, name, description, group_intent, context_message } = await request.json()

    const groupDescription =
      typeof description === 'string' ? description.trim().slice(0, 500) || null : null
    
    if (!member_ids || !Array.isArray(member_ids) || member_ids.length < 2) {
      return NextResponse.json({ error: 'At least 2 members required for group chat' }, { status: 400 })
    }

    if (member_ids.length > maxOtherMembers) {
      return NextResponse.json(
        { error: `Maximum ${maxOtherMembers} other members allowed in a group (${maxGroupMembers} total including you)` },
        { status: 400 }
      )
    }

    // Ensure current user is not in member_ids and calculate total
    const uniqueMemberIds = Array.from(new Set(member_ids.filter(id => id !== user.id)))
    const allMemberIds = [user.id, ...uniqueMemberIds]
    
    if (allMemberIds.length > maxGroupMembers) {
      return NextResponse.json(
        { error: `Maximum ${maxGroupMembers} members allowed in a group` },
        { status: 400 }
      )
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
    
    // Verify creator has a relationship with each invitee: pair suggestion (not declined),
    // locked match, or an existing 1:1 chat (covers pending matches you already message).
    for (const inviteeId of uniqueMemberIds) {
      const { data: pairSuggestions } = await admin
        .from('match_suggestions')
        .select('id, status, member_ids')
        .eq('kind', 'pair')
        .neq('status', 'declined')
        .contains('member_ids', [user.id, inviteeId])

      const hasPairSuggestion = (pairSuggestions || []).some((row) => {
        const members = (row.member_ids || []) as string[]
        return members.includes(user.id) && members.includes(inviteeId)
      })

      const { data: lockedMatch } = await admin
        .from('match_records')
        .select('id')
        .eq('locked', true)
        .contains('user_ids', [user.id, inviteeId])
        .maybeSingle()

      let hasSharedDm = false
      if (!hasPairSuggestion && !lockedMatch) {
        const { data: myChats } = await admin
          .from('chat_members')
          .select('chat_id')
          .eq('user_id', user.id)
          .eq('status', 'active')

        const myChatIds = (myChats || []).map((c) => c.chat_id)
        if (myChatIds.length > 0) {
          const { data: shared } = await admin
            .from('chat_members')
            .select('chat_id, chats!inner(id, is_group)')
            .eq('user_id', inviteeId)
            .in('chat_id', myChatIds)
            .eq('chats.is_group', false)
            .limit(1)
          hasSharedDm = Boolean(shared && shared.length > 0)
        }
      }

      if (!hasPairSuggestion && !lockedMatch && !hasSharedDm && !isAdmin) {
        return NextResponse.json(
          { error: `You must be matched with all group members. You are not matched with one of the selected members.` },
          { status: 403 }
        )
      }
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
        description: groupDescription,
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

    // Consent-first: do NOT insert invitees into chat_members until they accept.
    // Invitations alone track pending consent; RLS requires active membership for messages.

    // Calculate initial compatibility score
    try {
      await calculateGroupCompatibility(chatId, allMemberIds, group_intent || 'general')
    } catch (compatError) {
      safeLogger.warn('Failed to calculate initial compatibility', { error: compatError })
      // Don't fail - compatibility can be calculated later
    }

    // Seed pairwise rows for invitee pairs that are not already matched.
    // As invitees accept, ensurePairwiseAmongActiveMembers adds any missing
    // pairs among currently-active members so matching can start early.
    try {
      await ensurePairwiseAmongActiveMembers(admin, chatId, uniqueMemberIds)
    } catch (pairwiseErr) {
      safeLogger.warn('Failed to seed pairwise matches', { error: pairwiseErr })
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

    // Count mutual matches among invitees — names stay private until the group unlocks
    const { data: allMatches } = await admin
      .from('match_suggestions')
      .select('member_ids')
      .eq('status', 'confirmed')
      .contains('member_ids', [user.id])

    const mutualCountMap = new Map<string, number>()

    for (const inviteeId of uniqueMemberIds) {
      let mutualCount = 0
      for (const otherInviteeId of uniqueMemberIds) {
        if (otherInviteeId === inviteeId) continue
        const hasMatch = allMatches?.some((m) => {
          const memberIds = m.member_ids as string[]
          return memberIds.includes(inviteeId) && memberIds.includes(otherInviteeId)
        })
        if (hasMatch) mutualCount += 1
      }
      mutualCountMap.set(inviteeId, mutualCount)
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
        const mutualCount = mutualCountMap.get(inviteeId) || 0
        const mutualText =
          mutualCount > 0
            ? ` You're also matched with ${mutualCount} other invited student${mutualCount === 1 ? '' : 's'}.`
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
            mutual_connection_count: mutualCount,
            compatibility: compatibility
              ? {
                  overall: compatibility.overall_score,
                  personality: compatibility.personality_score,
                  schedule: compatibility.schedule_score,
                  lifestyle: compatibility.lifestyle_score,
                  social: compatibility.social_score,
                  academic: compatibility.academic_score,
                }
              : undefined,
            member_count: allMemberIds.length,
          },
        })
      } catch (notificationError) {
        safeLogger.error('Failed to send invitation notification', {
          error: notificationError,
          chatId,
          inviteeId,
        })
      }
    }

    // Post interactive invite cards into each invitee's private chat with the creator
    try {
      await sendGroupInviteDirectMessages(admin, user.id, {
        groupChatId: chatId,
        groupName: name || null,
        groupDescription: groupDescription,
        groupIntent: (group_intent || 'general') as 'housing' | 'study' | 'social' | 'general',
        contextMessage: context_message || null,
        memberCount: uniqueMemberIds.length,
        invitations: (createdInvitations || []).map((inv) => ({
          id: inv.id,
          invitee_id: inv.invitee_id,
        })),
      })
    } catch (dmError) {
      safeLogger.warn('Failed to send group invite DMs', { error: dmError, chatId })
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

