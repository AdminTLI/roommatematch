import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getMatchRepo } from '@/lib/matching/repo.factory'
import { createMatchNotification } from '@/lib/notifications/create'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminRecord } = await supabase
      .from('admins')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!adminRecord) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('[Admin] Starting manual confirmation of pending matches')
    
    const admin = await createAdminClient()
    const repo = await getMatchRepo()
    
    // Get all accepted pair suggestions
    const { data: acceptedSuggestions, error: sugError } = await admin
      .from('match_suggestions')
      .select('id, member_ids, accepted_by, status, kind, fit_index, section_scores, reasons, run_id, expires_at, created_at')
      .eq('kind', 'pair')
      .in('status', ['accepted', 'pending'])
      .not('accepted_by', 'is', null)

    if (sugError) {
      throw new Error(`Failed to fetch accepted suggestions: ${sugError.message}`)
    }

    if (!acceptedSuggestions || acceptedSuggestions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No accepted suggestions found',
        processed: 0
      })
    }

    console.log(`[Admin] Found ${acceptedSuggestions.length} accepted/pending suggestions`)

    // Group by pair (sorted memberIds as key)
    const pairMap = new Map<string, any[]>()
    for (const sug of acceptedSuggestions) {
      const memberIds = sug.member_ids as string[]
      if (!memberIds || memberIds.length !== 2) continue
      
      const [userA, userB] = memberIds.sort()
      const pairKey = `${userA}::${userB}`
      
      if (!pairMap.has(pairKey)) {
        pairMap.set(pairKey, [])
      }
      pairMap.get(pairKey)!.push(sug)
    }

    let processed = 0
    let skipped = 0
    const errors: string[] = []

    // Process each pair
    for (const [pairKey, suggestions] of pairMap.entries()) {
      try {
        const [userA, userB] = pairKey.split('::')
        
        // Union all acceptedBy values across all suggestions for this pair
        const unionAccepted = new Set<string>()
        for (const sug of suggestions) {
          const acceptedBy = sug.accepted_by as string[] || []
          acceptedBy.forEach(id => unionAccepted.add(id))
        }

        // Check if both users have accepted
        const bothAccepted = unionAccepted.has(userA) && unionAccepted.has(userB)
        
        if (!bothAccepted) {
          skipped++
          continue
        }

        console.log(`[Admin] Confirming match for pair ${userA} <-> ${userB}`, {
          suggestionIds: suggestions.map(s => s.id),
          unionAccepted: Array.from(unionAccepted)
        })

        // Update all suggestions for this pair to confirmed
        for (const sug of suggestions) {
          const merged = new Set<string>(sug.accepted_by as string[] || [])
          unionAccepted.forEach(a => merged.add(a))
          
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

        await repo.saveMatches([match])
        await repo.lockMatch([userA, userB], firstSug.run_id as string)
        await repo.markUsersMatched([userA, userB], firstSug.run_id as string)

        // Create chat if it doesn't exist
        let chatId: string | undefined
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
          }
        }

        if (!chatId) {
          const { data: createdChat, error: chatErr } = await admin
            .from('chats')
            .insert({ is_group: false, created_by: userA, match_id: null })
            .select('id')
            .single()

          if (chatErr) {
            throw new Error(`Failed to create chat: ${chatErr.message}`)
          }

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
          console.warn(`[Admin] Failed to create notifications for pair ${pairKey}:`, notifError)
        }

        processed++
      } catch (error) {
        const errorMsg = `Error processing pair ${pairKey}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Match confirmation completed`,
      processed,
      skipped,
      totalPairs: pairMap.size,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined
    })

  } catch (error) {
    console.error('[Admin] Match confirmation failed:', error)
    return NextResponse.json(
      { 
        error: 'Match confirmation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

