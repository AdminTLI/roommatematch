import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getMatchRepo } from '@/lib/matching/repo.factory'
import type { MatchRecord } from '@/lib/matching/repo'
import { createMatchNotification, createGroupMatchNotification } from '@/lib/notifications/create'
import { safeLogger } from '@/lib/utils/logger'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { trackEvent, EVENT_TYPES } from '@/lib/events'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check email verification
    if (!user.email_confirmed_at) {
      safeLogger.warn('[Match Respond] Email verification required', {
        userId: user.id,
        email: user.email
      })
      return NextResponse.json({ 
        error: 'Email verification required',
        requiresVerification: true 
      }, { status: 403 })
    }

    // Rate limiting: 20 requests per hour per user
    const rateLimitKey = getUserRateLimitKey('matching', user.id)
    const rateLimitResult = await checkRateLimit('matching', rateLimitKey)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
          details: `Rate limit exceeded. Please wait ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000)} minutes before trying again.`
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    let suggestionId: string
    let action: 'accept' | 'decline'
    
    try {
      const body = await request.json()
      suggestionId = body.suggestionId
      action = body.action
    } catch (parseError) {
      safeLogger.error('[Match Respond] Failed to parse request body', {
        error: parseError,
        userId: user.id
      })
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON with suggestionId and action.' },
        { status: 400 }
      )
    }
    
    if (!suggestionId || !action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request. Missing suggestionId or action.' },
        { status: 400 }
      )
    }

    let repo
    try {
      repo = await getMatchRepo()
    } catch (repoError) {
      safeLogger.error('[Match Respond] Failed to get match repo', {
        error: repoError,
        userId: user.id
      })
      return NextResponse.json(
        { error: 'Failed to initialize match repository', details: process.env.NODE_ENV === 'development' ? String(repoError) : undefined },
        { status: 500 }
      )
    }

    let suggestion
    try {
      suggestion = await repo.getSuggestionById(suggestionId)
    } catch (fetchError) {
      safeLogger.error('[Match Respond] Failed to fetch suggestion', {
        error: fetchError,
        suggestionId,
        userId: user.id
      })
      return NextResponse.json(
        { error: 'Failed to fetch suggestion', details: process.env.NODE_ENV === 'development' ? String(fetchError) : undefined },
        { status: 500 }
      )
    }
    
    if (!suggestion) {
      safeLogger.warn('[Match Respond] Suggestion not found', {
        suggestionId,
        userId: user.id
      })
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 })
    }
    
    // Check if user is part of this suggestion
    if (!suggestion.memberIds.includes(user.id)) {
      safeLogger.warn('[Match Respond] User not authorized - not in memberIds', {
        suggestionId,
        userId: user.id,
        memberIds: suggestion.memberIds,
        suggestionStatus: suggestion.status
      })
      return NextResponse.json({ 
        error: 'Unauthorized: You are not part of this match suggestion',
        details: 'The suggestion may have been updated or you may not have access to it.'
      }, { status: 403 })
    }
    
    // Allow declined suggestions to be re-opened if needed (matches don't expire)
    // Only block if already declined by this user
    if (action === 'decline') {
      try {
        suggestion.status = 'declined'
        // Ensure acceptedBy is set (even if empty array) to avoid null issues
        if (!suggestion.acceptedBy) {
          suggestion.acceptedBy = []
        }
        
        safeLogger.debug('[Match Decline] Updating suggestion status', {
          suggestionId: suggestion.id,
          status: suggestion.status,
          acceptedBy: suggestion.acceptedBy
        })
        
        try {
          await repo.updateSuggestion(suggestion)
        } catch (updateError) {
          safeLogger.error('[Match Decline] Failed to update suggestion', {
            error: updateError,
            errorMessage: updateError instanceof Error ? updateError.message : String(updateError),
            errorStack: updateError instanceof Error ? updateError.stack : undefined,
            suggestionId: suggestion.id,
            userId: user.id,
            suggestionStatus: suggestion.status
          })
          throw new Error(`Failed to update suggestion: ${updateError instanceof Error ? updateError.message : String(updateError)}`)
        }
        
        // Add to blocklist
        const otherIds = suggestion.memberIds.filter(id => id !== user.id)
        const admin = await createAdminClient()
        
        safeLogger.debug('[Match Decline] Adding to blocklist', {
          userId: user.id,
          otherIds: otherIds
        })
        
        for (const otherId of otherIds) {
          try {
            await repo.addToBlocklist(user.id, otherId)
            safeLogger.debug('[Match Decline] Successfully added to blocklist', {
              userId: user.id,
              otherId: otherId
            })
          } catch (blocklistError) {
            safeLogger.error('[Match Decline] Failed to add to blocklist', {
              error: blocklistError,
              userId: user.id,
              otherId: otherId,
              errorMessage: blocklistError instanceof Error ? blocklistError.message : String(blocklistError)
            })
            // Continue with other operations even if blocklist fails
          }
          
          // Track blocklist addition event for analytics and admin dashboard
          try {
            await admin
              .from('app_events')
              .insert({
                user_id: user.id,
                name: EVENT_TYPES.MATCH_REJECTED,
                props: {
                  suggestion_id: suggestion.id,
                  declined_by: user.id,
                  blocked_user_id: otherId,
                  match_score: suggestion.fitIndex,
                  match_fit_index: suggestion.fitIndex,
                  reason: 'user_declined_match',
                  blocklist_action: 'added'
                },
                created_at: new Date().toISOString()
              })
          } catch (error) {
            safeLogger.warn('[Match Decline] Failed to track blocklist event', { error })
          }
        }
        
        // Track overall decline event for admin analytics
        try {
          await admin
            .from('app_events')
            .insert({
              user_id: user.id,
              name: 'match_declined',
              props: {
                suggestion_id: suggestion.id,
                match_score: suggestion.fitIndex,
                match_fit_index: suggestion.fitIndex,
                other_user_ids: otherIds,
                blocklist_added: true,
                total_blocked: otherIds.length
              },
              created_at: new Date().toISOString()
            })
        } catch (error) {
          safeLogger.warn('[Match Decline] Failed to log decline event to app_events', { error })
        }
        
        safeLogger.info('[Match Decline] Match declined and blocklist updated', {
          suggestionId: suggestion.id,
          userId: user.id,
          otherUserIds: otherIds,
          matchScore: suggestion.fitIndex
        })
        
        return NextResponse.json({ ok: true, suggestion })
      } catch (declineError) {
        safeLogger.error('[Match Decline] Error during decline operation', {
          error: declineError,
          errorMessage: declineError instanceof Error ? declineError.message : String(declineError),
          errorStack: declineError instanceof Error ? declineError.stack : undefined,
          suggestionId: suggestion.id,
          userId: user.id
        })
        throw declineError // Re-throw to be caught by outer try-catch
      }
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
    // Include all suggestions to merge acceptances across different runs
    const pairSugs = await repo.getSuggestionsForPair(user.id, otherId, true)
    safeLogger.debug(`[DEBUG] Accept action - Found ${pairSugs.length} suggestions for pair`, {
      statuses: pairSugs.map(s => s.status)
    })
    
    let unionAccepted = new Set<string>()
    for (const s of pairSugs) {
      (s.acceptedBy || []).forEach(a => unionAccepted.add(a))
    }
    unionAccepted.add(user.id)

    safeLogger.debug(`[DEBUG] Accept action - Union acceptedBy count: ${unionAccepted.size}`)
    
    const allAccepted = suggestion.memberIds.every(id => unionAccepted.has(id))
    safeLogger.debug(`[DEBUG] Accept action - All accepted: ${allAccepted}`)
    
    if (allAccepted) {
      // Mark all pair suggestions as confirmed with merged acceptedBy
      safeLogger.debug(`[DEBUG] Confirming match - Updating ${pairSugs.length} suggestions to confirmed`)
      for (const s of pairSugs) {
        const merged = new Set<string>(s.acceptedBy || [])
        unionAccepted.forEach(a => merged.add(a))
        safeLogger.debug(`[DEBUG] Updating suggestion from status ${s.status} to confirmed`)
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
      
      // Create chat on confirmation (idempotent) - CRITICAL: Always create chat for confirmed matches
      let chatId: string | undefined
      try {
        const admin = await createAdminClient()
        const [userA, userB] = suggestion.memberIds
        
        // Prevent self-matching in chat creation
        if (userA === userB) {
          safeLogger.error(`[ERROR] Cannot create chat: self-match detected`)
        } else {
            // In production, prevent demo user from being added to chats with real users
            if (process.env.NODE_ENV === 'production') {
              const { data: userAProfile } = await admin
                .from('profiles')
                .select('user_id, users!inner(email)')
                .eq('user_id', userA)
                .single()
              
              const { data: userBProfile } = await admin
                .from('profiles')
                .select('user_id, users!inner(email)')
                .eq('user_id', userB)
                .single()
              
              const demoEmail = process.env.DEMO_USER_EMAIL
              const userAIsDemo = userAProfile?.users?.email === demoEmail
              const userBIsDemo = userBProfile?.users?.email === demoEmail
              
              if (userAIsDemo || userBIsDemo) {
                safeLogger.warn(`[WARN] Blocked chat creation: demo user cannot be matched with real users in production`)
                throw new Error('Demo users cannot be matched in production')
              }
            }
          // Check if chat already exists for these two users
          const { data: existingChats } = await admin
            .from('chat_members')
            .select('chat_id')
            .eq('user_id', userA)
          
          if (existingChats && existingChats.length > 0) {
            const chatIds = existingChats.map((r: any) => r.chat_id)
            const { data: common } = await admin
              .from('chat_members')
              .select('chat_id')
              .in('chat_id', chatIds)
              .eq('user_id', userB)
            if (common && common.length > 0) {
              chatId = common[0].chat_id
              safeLogger.debug(`[DEBUG] Chat already exists for pair`)
            }
          }
          
          if (!chatId) {
            // Create chat
            const { data: createdChat, error: chatErr } = await admin
              .from('chats')
              .insert({ is_group: false, created_by: userA, match_id: null })
              .select('id')
              .single()
            
            if (chatErr) {
              safeLogger.error(`[ERROR] Failed to create chat`, chatErr)
              throw chatErr
            }
            
            chatId = createdChat.id
            safeLogger.debug(`[DEBUG] Created chat for pair`)
            
            // Add members
            const { error: membersErr } = await admin
              .from('chat_members')
              .insert([
                { chat_id: chatId, user_id: userA },
                { chat_id: chatId, user_id: userB }
              ])
            
            if (membersErr) {
              safeLogger.error(`[ERROR] Failed to add chat members`, membersErr)
              throw membersErr
            }
            
            // System message (use first user as sender)
            const { error: msgErr } = await admin
              .from('messages')
              .insert({
                chat_id: chatId,
                user_id: userA,
                content: "You're matched! Start your conversation 👋"
              })
            
            if (msgErr) {
              safeLogger.warn(`[WARN] Failed to create system message for chat`)
              // Don't fail the whole operation if message creation fails
            }
            
            // Touch chat updated_at
            await admin
              .from('chats')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', chatId)
          }
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
          safeLogger.error('Failed to create match notifications', notificationError)
        }
      } catch (chatError) {
        safeLogger.error('Failed to create chat on confirmation', chatError)
      }
      
      return NextResponse.json({ ok: true, suggestion, match })
    } else {
      // Mark all pair suggestions as accepted for this user (merge acceptedBy)
      safeLogger.debug(`[DEBUG] Not all accepted yet - updating ${pairSugs.length} suggestions to accepted`)
      for (const s of pairSugs) {
        const merged = new Set<string>(s.acceptedBy || [])
        merged.add(user.id)
        safeLogger.debug(`[DEBUG] Updating suggestion - adding user to acceptedBy`)
        await repo.updateSuggestionAcceptedByAndStatus(s.id, Array.from(merged), 'accepted')
      }
      suggestion.acceptedBy = Array.from(unionAccepted)
      suggestion.status = 'accepted'
      await repo.updateSuggestion(suggestion)

      // Re-check if match should be confirmed after updates
      // This catches cases where the update itself made both users accept
      safeLogger.debug(`[DEBUG] Re-checking pair after updates to see if match should be confirmed`)
      const updatedPairSugs = await repo.getSuggestionsForPair(user.id, otherId, true)
      let recheckUnionAccepted = new Set<string>()
      for (const s of updatedPairSugs) {
        (s.acceptedBy || []).forEach(a => recheckUnionAccepted.add(a))
      }
      
      const recheckAllAccepted = suggestion.memberIds.every(id => recheckUnionAccepted.has(id))
      safeLogger.debug(`[DEBUG] Re-check result - all accepted: ${recheckAllAccepted}`)
      
      if (recheckAllAccepted) {
        // Both users have now accepted - confirm the match
        safeLogger.debug(`[DEBUG] Re-check confirmed match - both users have accepted after update`)
        
        // Update all pair suggestions to confirmed
        for (const s of updatedPairSugs) {
          const merged = new Set<string>(s.acceptedBy || [])
          recheckUnionAccepted.forEach(a => merged.add(a))
          await repo.updateSuggestionAcceptedByAndStatus(s.id, Array.from(merged), 'confirmed')
        }
        
        // Create match record
        const now = new Date().toISOString()
        const match: MatchRecord = {
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
        
        await repo.saveMatches([match])
        await repo.lockMatch(suggestion.memberIds, suggestion.runId)
        await repo.markUsersMatched(suggestion.memberIds, suggestion.runId)
        
        // Create chat
        let chatId: string | undefined
        try {
          const admin = await createAdminClient()
          const [userA, userB] = suggestion.memberIds
          
          if (userA !== userB) {
            // In production, prevent demo user from being added to chats with real users
            if (process.env.NODE_ENV === 'production') {
              const { data: userAProfile } = await admin
                .from('profiles')
                .select('user_id, users!inner(email)')
                .eq('user_id', userA)
                .single()
              
              const { data: userBProfile } = await admin
                .from('profiles')
                .select('user_id, users!inner(email)')
                .eq('user_id', userB)
                .single()
              
              const demoEmail = process.env.DEMO_USER_EMAIL
              const userAIsDemo = userAProfile?.users?.email === demoEmail
              const userBIsDemo = userBProfile?.users?.email === demoEmail
              
              if (userAIsDemo || userBIsDemo) {
                safeLogger.warn(`[WARN] Blocked chat creation: demo user cannot be matched with real users in production`)
                throw new Error('Demo users cannot be matched in production')
              }
            }
            
            const { data: existingChats } = await admin
              .from('chat_members')
              .select('chat_id')
              .eq('user_id', userA)
            
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
              const { data: createdChat, error: chatErr } = await admin
                .from('chats')
                .insert({ is_group: false, created_by: userA, match_id: null })
                .select('id')
                .single()
              
              if (!chatErr && createdChat) {
                chatId = createdChat.id
                await admin.from('chat_members').insert([
                  { chat_id: chatId, user_id: userA },
                  { chat_id: chatId, user_id: userB }
                ])
                await admin.from('messages').insert({
                  chat_id: chatId,
                  user_id: userA,
                  content: "You're matched! Start your conversation 👋"
                })
                await admin
                  .from('chats')
                  .update({ updated_at: new Date().toISOString() })
                  .eq('id', chatId)
              }
            }
            
            // Create notifications
            try {
              await createMatchNotification(
                userA,
                userB,
                'match_confirmed',
                suggestion.id,
                chatId
              )
            } catch (notifError) {
              safeLogger.error('Failed to create confirmation notifications', notifError)
            }
          }
        } catch (chatError) {
          safeLogger.error('Failed to create chat on re-check confirmation', chatError)
        }
        
        return NextResponse.json({ ok: true, suggestion: { ...suggestion, status: 'confirmed' }, match })
      }

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
        safeLogger.error('Failed to create acceptance notification', notificationError)
        // Don't fail the entire request if notifications fail
      }
      
      return NextResponse.json({ ok: true, suggestion })
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    
    // Log full error details for debugging
    safeLogger.error('Error responding to suggestion', {
      error,
      errorMessage,
      errorStack,
      errorType: typeof error,
      errorString: String(error),
      errorName: error instanceof Error ? error.name : undefined
    })
    
    // Return more detailed error in development, generic in production
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    return NextResponse.json(
      { 
        error: 'Failed to respond to suggestion',
        details: isDevelopment ? errorMessage : 'An unexpected error occurred. Please try again.',
        ...(isDevelopment && errorStack ? { stack: errorStack } : {})
      },
      { status: 500 }
    )
  }
}
