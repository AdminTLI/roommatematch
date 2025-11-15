import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getMatchRepo } from '@/lib/matching/repo.factory'
import { createMatchNotification } from '@/lib/notifications/create'
import { requireAdmin } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/admin/audit'
import { safeLogger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    // Use requireAdmin helper (includes audit logging and prevents enumeration)
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { user, adminRecord } = adminCheck
    const supabase = await createClient()

    // Audit log admin action
    await logAdminAction(user!.id, 'confirm_pending_matches', null, null, {
      action: 'Starting manual confirmation of pending matches',
      role: adminRecord!.role
    })
    
    const admin = await createAdminClient()
    const repo = await getMatchRepo()
    
    // Query ALL pair suggestions (not just accepted/pending) to find all pairs
    // This ensures we catch matches even if suggestions have different statuses
    const { data: allPairSuggestions, error: sugError } = await admin
      .from('match_suggestions')
      .select('id, member_ids, accepted_by, status, kind, fit_index, section_scores, reasons, run_id, expires_at, created_at')
      .eq('kind', 'pair')

    if (sugError) {
      throw new Error(`Failed to fetch pair suggestions: ${sugError.message}`)
    }

    if (!allPairSuggestions || allPairSuggestions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No pair suggestions found',
        processed: 0
      })
    }

    safeLogger.info('[Admin] Found pair suggestions', {
      count: allPairSuggestions.length
    })

    // Group by pair (sorted memberIds as key) - this groups ALL suggestions for each pair
    const pairMap = new Map<string, any[]>()
    for (const sug of allPairSuggestions) {
      const memberIds = sug.member_ids as string[]
      if (!memberIds || memberIds.length !== 2) continue
      
      const [userA, userB] = memberIds.sort()
      const pairKey = `${userA}::${userB}`
      
      if (!pairMap.has(pairKey)) {
        pairMap.set(pairKey, [])
      }
      pairMap.get(pairKey)!.push(sug)
    }

    safeLogger.info('[Admin] Grouped into unique pairs', {
      pairCount: pairMap.size
    })

    let processed = 0
    let skipped = 0
    const errors: string[] = []

    // Process each pair
    for (const [pairKey, suggestions] of pairMap.entries()) {
      try {
        const [userA, userB] = pairKey.split('::')
        
        // Union all acceptedBy values across ALL suggestions for this pair
        // This catches acceptances even if they're on different suggestion IDs
        const unionAccepted = new Set<string>()
        for (const sug of suggestions) {
          const acceptedBy = sug.accepted_by as string[] || []
          acceptedBy.forEach(id => unionAccepted.add(id))
        }

        safeLogger.debug('[Admin] Processing pair', {
          suggestionCount: suggestions.length,
          suggestionStatuses: suggestions.map(s => s.status),
          unionAcceptedCount: unionAccepted.size
        })

        // Check if both users have accepted (regardless of suggestion status)
        const bothAccepted = unionAccepted.has(userA) && unionAccepted.has(userB)
        
        if (!bothAccepted) {
          skipped++
          safeLogger.debug('[Admin] Skipping pair - not both accepted')
          continue
        }

        // Check if already confirmed
        const alreadyConfirmed = suggestions.some(s => s.status === 'confirmed')
        if (alreadyConfirmed) {
          safeLogger.debug('[Admin] Pair already confirmed - checking if chat exists')
          
          // Even if already confirmed, ensure chat exists
          let chatId: string | undefined
          try {
            const { data: existingChatsA } = await admin
              .from('chat_members')
              .select('chat_id')
              .eq('user_id', userA)

            if (existingChatsA && existingChatsA.length > 0) {
              const chatIds = existingChatsA.map((r: any) => r.chat_id)
              const { data: common } = await admin
                .from('chat_members')
                .select('chat_id')
                .in('chat_id', chatIds)
                .eq('user_id', userB)
              if (common && common.length > 0) {
                chatId = common[0].chat_id
                safeLogger.debug('[Admin] Chat already exists for confirmed pair')
              }
            }

            if (!chatId) {
              safeLogger.info('[Admin] Creating missing chat for already-confirmed pair')
              // Use the first confirmed suggestion ID as match_id
              const confirmedSuggestion = suggestions.find(s => s.status === 'confirmed') || suggestions[0]
              const { data: createdChat, error: chatErr } = await admin
                .from('chats')
                .insert({ is_group: false, created_by: userA, match_id: confirmedSuggestion?.id || null })
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
                safeLogger.info('[Admin] Created missing chat for confirmed pair')
                processed++ // Count as processed since we created the chat
              } else if (chatErr) {
                safeLogger.error('[Admin] Failed to create chat for confirmed pair', chatErr)
              }
            }
          } catch (chatError) {
            safeLogger.error('[Admin] Error checking/creating chat for confirmed pair', chatError)
          }
          
          skipped++
          continue
        }

        safeLogger.info('[Admin] Confirming match for pair')

        // Update ALL suggestions for this pair to confirmed (including expired ones)
        // This ensures consistency across all suggestion records for the pair
        for (const sug of suggestions) {
          const merged = new Set<string>(sug.accepted_by as string[] || [])
          unionAccepted.forEach(a => merged.add(a))
          
          safeLogger.debug('[Admin] Updating suggestion to confirmed', {
            suggestionId: sug.id,
            previousStatus: sug.status
          })
          await repo.updateSuggestionAcceptedByAndStatus(
            sug.id,
            Array.from(merged),
            'confirmed'
          )
        }

        // Create match record (use first suggestion as template)
        const firstSug = suggestions[0]
        const now = new Date().toISOString()
        const match = {
          kind: 'pair' as const,
          aId: userA,
          bId: userB,
          fit: (firstSug.fit_index as number) / 100,
          fitIndex: firstSug.fit_index as number,
          sectionScores: firstSug.section_scores || {},
          reasons: firstSug.reasons || [],
          runId: firstSug.run_id as string,
          locked: true,
          createdAt: now
        }

        // Save match record (optional - if table doesn't exist, log and continue)
        try {
          await repo.saveMatches([match])
          await repo.lockMatch([userA, userB], firstSug.run_id as string)
          await repo.markUsersMatched([userA, userB], firstSug.run_id as string)
        } catch (matchRecordError) {
          safeLogger.warn('[Admin] Failed to save match record for pair', matchRecordError)
          // Continue anyway - suggestions are already confirmed
        }

        // Create chat if it doesn't exist
        let chatId: string | undefined
        try {
          safeLogger.debug('[Admin] Checking for existing chat for pair')
          const { data: existingChatsA, error: existingChatsError } = await admin
            .from('chat_members')
            .select('chat_id')
            .eq('user_id', userA)

          if (existingChatsError) {
            safeLogger.warn('[Admin] Error checking existing chats', existingChatsError)
          }

          if (existingChatsA && existingChatsA.length > 0) {
            const chatIds = existingChatsA.map((r: any) => r.chat_id)
            safeLogger.debug('[Admin] Found existing chats, checking if pair exists', {
              chatCount: chatIds.length
            })
            const { data: common, error: commonError } = await admin
              .from('chat_members')
              .select('chat_id')
              .in('chat_id', chatIds)
              .eq('user_id', userB)
            
            if (commonError) {
              safeLogger.warn('[Admin] Error checking common chats', commonError)
            }
            
            if (common && common.length > 0) {
              chatId = common[0].chat_id
              safeLogger.debug('[Admin] Found existing chat for pair')
            }
          }

          if (!chatId) {
            safeLogger.info('[Admin] Creating new chat for pair')
            // Use the first suggestion ID as match_id
            const { data: createdChat, error: chatErr } = await admin
              .from('chats')
              .insert({ is_group: false, created_by: userA, match_id: firstSug.id })
              .select('id')
              .single()

            if (chatErr) {
              throw new Error(`Failed to create chat: ${chatErr.message}`)
            }

            chatId = createdChat.id
            safeLogger.info('[Admin] Created chat for pair')

            const { error: membersErr } = await admin.from('chat_members').insert([
              { chat_id: chatId, user_id: userA },
              { chat_id: chatId, user_id: userB }
            ])

            if (membersErr) {
              throw new Error(`Failed to add chat members: ${membersErr.message}`)
            }
            safeLogger.debug('[Admin] Added members to chat')

            const { error: msgErr } = await admin.from('messages').insert({
              chat_id: chatId,
              user_id: userA,
              content: "You're matched! Start your conversation 👋"
            })

            if (msgErr) {
              safeLogger.warn('[Admin] Failed to create system message for chat', msgErr)
              // Don't fail if message creation fails
            } else {
              safeLogger.debug('[Admin] Created system message in chat')
            }

            const { error: updateErr } = await admin
              .from('chats')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', chatId)

            if (updateErr) {
              safeLogger.warn('[Admin] Failed to update chat updated_at', updateErr)
            }
            
            safeLogger.info('[Admin] Successfully created chat for pair')
          }
        } catch (chatError) {
          safeLogger.error('[Admin] Failed to create chat for pair', chatError)
          // Don't fail the whole operation if chat creation fails
          // The match is still confirmed
        }

        // Create notifications
        try {
          await createMatchNotification(
            userA,
            userB,
            'match_confirmed',
            firstSug.id,
            chatId
          )
        } catch (notifError) {
          safeLogger.warn('[Admin] Failed to create notifications for pair', notifError)
        }

        processed++
      } catch (error) {
        const errorMsg = `Error processing pair: ${error instanceof Error ? error.message : 'Unknown error'}`
        safeLogger.error('[Admin] Error processing pair', error)
        errors.push(errorMsg)
      }
    }

    // Audit log completion
    await logAdminAction(user!.id, 'confirm_pending_matches_complete', null, null, {
      processed,
      skipped,
      totalPairs: pairMap.size,
      errorCount: errors.length,
      role: adminRecord!.role
    })

    return NextResponse.json({
      success: true,
      message: `Match confirmation completed`,
      processed,
      skipped,
      totalPairs: pairMap.size,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined
    })

  } catch (error) {
    safeLogger.error('[Admin] Match confirmation failed', error)
    return NextResponse.json(
      { 
        error: 'Match confirmation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

