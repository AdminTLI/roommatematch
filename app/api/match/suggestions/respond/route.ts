import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getMatchRepo } from '@/lib/matching/repo.factory'
import type { MatchRecord } from '@/lib/matching/repo'
import { createMatchNotification, createGroupMatchNotification } from '@/lib/notifications/create'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { suggestionId, action } = await request.json()
    
    if (!suggestionId || !action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request. Missing suggestionId or action.' },
        { status: 400 }
      )
    }

    const repo = await getMatchRepo()
    const suggestion = await repo.getSuggestionById(suggestionId)
    
    if (!suggestion) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 })
    }
    
    // Check if user is part of this suggestion
    if (!suggestion.memberIds.includes(user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // Check if suggestion is expired
    if (suggestion.status === 'expired' || new Date(suggestion.expiresAt).getTime() < Date.now()) {
      suggestion.status = 'expired'
      await repo.updateSuggestion(suggestion)
      return NextResponse.json({ error: 'Suggestion has expired' }, { status: 410 })
    }
    
    if (action === 'decline') {
      suggestion.status = 'declined'
      await repo.updateSuggestion(suggestion)
      
      // Add to blocklist
      const otherIds = suggestion.memberIds.filter(id => id !== user.id)
      for (const otherId of otherIds) {
        await repo.addToBlocklist(user.id, otherId)
      }
      
      return NextResponse.json({ ok: true, suggestion })
    }
    
    // Accept action with pair-wide merge
    const otherIds = suggestion.memberIds.filter(id => id !== user.id)
    const otherId = otherIds[0]

    // Prevent self-matching
    if (!otherId || otherId === user.id) {
      return NextResponse.json({ error: 'Invalid suggestion: cannot match with yourself' }, { status: 400 })
    }

    // Ensure memberIds doesn't contain duplicates
    const uniqueMemberIds = Array.from(new Set(suggestion.memberIds))
    if (uniqueMemberIds.length !== suggestion.memberIds.length) {
      return NextResponse.json({ error: 'Invalid suggestion: duplicate members' }, { status: 400 })
    }

    // Fetch all suggestions for this pair (across runs) and merge acceptance
    const pairSugs = await repo.getSuggestionsForPair(user.id, otherId, false)
    let unionAccepted = new Set<string>()
    for (const s of pairSugs) {
      (s.acceptedBy || []).forEach(a => unionAccepted.add(a))
    }
    unionAccepted.add(user.id)

    const allAccepted = suggestion.memberIds.every(id => unionAccepted.has(id))
    
    if (allAccepted) {
      // Mark all pair suggestions as confirmed with merged acceptedBy
      for (const s of pairSugs) {
        const merged = new Set<string>(s.acceptedBy || [])
        unionAccepted.forEach(a => merged.add(a))
        await repo.updateSuggestionAcceptedByAndStatus(s.id, Array.from(merged), 'confirmed')
      }
      suggestion.acceptedBy = Array.from(unionAccepted)
      suggestion.status = 'confirmed'
      await repo.updateSuggestion(suggestion)
      
      // Create final MatchRecord
      const now = new Date().toISOString()
      const match: MatchRecord = suggestion.kind === 'pair'
        ? {
            kind: 'pair',
            aId: suggestion.memberIds[0],
            bId: suggestion.memberIds[1],
            fit: suggestion.fitIndex / 100,
            fitIndex: suggestion.fitIndex,
            sectionScores: suggestion.sectionScores || {},
            reasons: suggestion.reasons || [],
            runId: suggestion.runId,
            locked: true,
            createdAt: now
          }
        : {
            kind: 'group',
            memberIds: suggestion.memberIds,
            avgFit: suggestion.fitIndex / 100,
            fitIndex: suggestion.fitIndex,
            runId: suggestion.runId,
            locked: true,
            createdAt: now
          }
      
      // Save the confirmed match
      await repo.saveMatches([match])
      await repo.lockMatch(suggestion.memberIds, suggestion.runId)
      await repo.markUsersMatched(suggestion.memberIds, suggestion.runId)
      
      // Create chat on confirmation (idempotent)
      try {
        const admin = await createAdminClient()
        const [userA, userB] = suggestion.memberIds
        // Check if chat already exists for these two users
        const { data: existingChats } = await admin
          .from('chat_members')
          .select('chat_id')
          .eq('user_id', userA)
        let chatId: string | undefined
        if (existingChats && existingChats.length > 0) {
          const chatIds = existingChats.map((r: any) => r.chat_id)
          const { data: common } = await admin
            .from('chat_members')
            .select('chat_id')
            .in('chat_id', chatIds)
            .eq('user_id', userB)
          if (common && common.length > 0) {
            chatId = common[0].chat_id
          }
        }
        if (!chatId) {
          // Create chat
          const { data: createdChat, error: chatErr } = await admin
            .from('chats')
            .insert({ is_group: false, created_by: user.id, match_id: null })
            .select('id')
            .single()
          if (chatErr) throw chatErr
          chatId = createdChat.id
          // Add members
          await admin.from('chat_members').insert([
            { chat_id: chatId, user_id: userA },
            { chat_id: chatId, user_id: userB }
          ])
          // System message
          await admin.from('messages').insert({
            chat_id: chatId,
            user_id: user.id,
            content: "You’re matched! Start your conversation 👋"
          })
          // Touch chat updated_at
          await admin.from('chats').update({ updated_at: new Date().toISOString() }).eq('id', chatId)
        }
        
        // Create notifications for confirmed match
        try {
          if (suggestion.kind === 'pair') {
            await createMatchNotification(
              suggestion.memberIds[0],
              suggestion.memberIds[1],
              'match_confirmed',
              suggestion.id,
              chatId
            )
          } else {
            await createGroupMatchNotification(
              suggestion.memberIds,
              suggestion.id,
              chatId
            )
          }
        } catch (notificationError) {
          console.error('Failed to create match notifications:', notificationError)
        }
      } catch (chatError) {
        console.error('Failed to create chat on confirmation:', chatError)
      }
      
      return NextResponse.json({ ok: true, suggestion, match })
    } else {
      // Mark all pair suggestions as accepted for this user (merge acceptedBy)
      for (const s of pairSugs) {
        const merged = new Set<string>(s.acceptedBy || [])
        merged.add(user.id)
        await repo.updateSuggestionAcceptedByAndStatus(s.id, Array.from(merged), 'accepted')
      }
      suggestion.acceptedBy = Array.from(unionAccepted)
      suggestion.status = 'accepted'
      await repo.updateSuggestion(suggestion)

      // Create notification for match acceptance
      try {
        if (suggestion.kind === 'pair') {
          if (otherId) {
            await createMatchNotification(
              user.id,
              otherId,
              'match_accepted',
              suggestion.id,
              undefined
            )
          }
        }
      } catch (notificationError) {
        console.error('Failed to create acceptance notification:', notificationError)
        // Don't fail the entire request if notifications fail
      }
      
      return NextResponse.json({ ok: true, suggestion })
    }
    
  } catch (error) {
    console.error('Error responding to suggestion:', error)
    return NextResponse.json(
      { error: 'Failed to respond to suggestion' },
      { status: 500 }
    )
  }
}
