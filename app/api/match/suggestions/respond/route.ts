import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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
    
    // Accept action
    if (!suggestion.acceptedBy.includes(user.id)) {
      suggestion.acceptedBy.push(user.id)
    }
    
    // Check if all members have accepted
    const allAccepted = suggestion.memberIds.every(id => suggestion.acceptedBy.includes(id))
    
    if (allAccepted) {
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
      
      // Create notifications for confirmed match
      try {
        if (suggestion.kind === 'pair') {
          await createMatchNotification(
            suggestion.memberIds[0],
            suggestion.memberIds[1],
            'match_confirmed',
            suggestion.id, // Use suggestion ID as match reference
            undefined // Chat will be created by database trigger
          )
        } else {
          await createGroupMatchNotification(
            suggestion.memberIds,
            suggestion.id,
            undefined // Chat will be created by database trigger
          )
        }
      } catch (notificationError) {
        console.error('Failed to create match notifications:', notificationError)
        // Don't fail the entire request if notifications fail
      }
      
      return NextResponse.json({ ok: true, suggestion, match })
    } else {
      suggestion.status = 'accepted'
      await repo.updateSuggestion(suggestion)
      
      // Create notification for match acceptance
      try {
        if (suggestion.kind === 'pair') {
          const otherUserId = suggestion.memberIds.find(id => id !== user.id)
          if (otherUserId) {
            await createMatchNotification(
              user.id,
              otherUserId,
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
