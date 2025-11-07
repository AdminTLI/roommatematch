import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireAdmin, logAdminAction } from '@/lib/auth/admin'
import { safeLogger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    // Use requireAdmin helper (includes audit logging and prevents enumeration)
    const adminCheck = await requireAdmin(request)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { user, adminRecord } = adminCheck
    const supabase = await createClient()

    // Audit log admin action
    logAdminAction('backfill_chats', {
      action: 'Starting chat backfill for confirmed matches'
    }, user!.id, adminRecord!.role)

    const admin = await createAdminClient()
    
    // Get all confirmed pair suggestions
    const { data: confirmedSuggestions, error: sugError } = await admin
      .from('match_suggestions')
      .select('id, member_ids, status, kind')
      .eq('kind', 'pair')
      .eq('status', 'confirmed')

    if (sugError) {
      throw new Error(`Failed to fetch confirmed suggestions: ${sugError.message}`)
    }

    if (!confirmedSuggestions || confirmedSuggestions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No confirmed suggestions found',
        processed: 0
      })
    }

    safeLogger.info('[Admin] Found confirmed pair suggestions', {
      count: confirmedSuggestions.length
    })

    // Group by pair (sorted memberIds as key)
    const pairMap = new Map<string, any[]>()
    for (const sug of confirmedSuggestions) {
      const memberIds = sug.member_ids as string[]
      if (!memberIds || memberIds.length !== 2) continue
      
      const [userA, userB] = memberIds.sort()
      const pairKey = `${userA}::${userB}`
      
      if (!pairMap.has(pairKey)) {
        pairMap.set(pairKey, [])
      }
      pairMap.get(pairKey)!.push(sug)
    }

    safeLogger.info('[Admin] Grouped into unique confirmed pairs', {
      pairCount: pairMap.size
    })

    let processed = 0
    let skipped = 0
    const errors: string[] = []

    // Process each pair
    for (const [pairKey, suggestions] of pairMap.entries()) {
      try {
        const [userA, userB] = pairKey.split('::')
        
        safeLogger.debug('[Admin] Processing pair for chat creation')

        // Check if chat already exists
        let chatId: string | undefined
        const { data: existingChatsA, error: existingChatsError } = await admin
          .from('chat_members')
          .select('chat_id')
          .eq('user_id', userA)

        if (existingChatsError) {
          safeLogger.warn('[Admin] Error checking existing chats', existingChatsError)
        }

        if (existingChatsA && existingChatsA.length > 0) {
          const chatIds = existingChatsA.map((r: any) => r.chat_id)
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
            safeLogger.debug('[Admin] Chat already exists for pair')
            skipped++
            continue
          }
        }

        // Create chat
        safeLogger.info('[Admin] Creating chat for confirmed pair')
        const { data: createdChat, error: chatErr } = await admin
          .from('chats')
          .insert({ is_group: false, created_by: userA })
          .select('id')
          .single()

        if (chatErr || !createdChat) {
          throw new Error(`Failed to create chat: ${chatErr?.message || 'Unknown error'}`)
        }

        chatId = createdChat.id
        safeLogger.debug('[Admin] Created chat for pair')

        // Add members
        const { error: membersErr } = await admin.from('chat_members').insert([
          { chat_id: chatId, user_id: userA },
          { chat_id: chatId, user_id: userB }
        ])

        if (membersErr) {
          throw new Error(`Failed to add chat members: ${membersErr.message}`)
        }
        safeLogger.debug('[Admin] Added members to chat')

        // Create system message
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

        // Update chat updated_at
        const { error: updateErr } = await admin
          .from('chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', chatId)

        if (updateErr) {
          safeLogger.warn('[Admin] Failed to update chat updated_at', updateErr)
        }

        safeLogger.info('[Admin] Successfully created chat for pair')
        processed++
      } catch (error) {
        const errorMsg = `Error processing pair: ${error instanceof Error ? error.message : 'Unknown error'}`
        safeLogger.error('[Admin] Error processing pair', error)
        errors.push(errorMsg)
      }
    }

    // Audit log completion
    logAdminAction('backfill_chats_complete', {
      processed,
      skipped,
      totalPairs: pairMap.size,
      errorCount: errors.length
    }, user!.id, adminRecord!.role)

    return NextResponse.json({
      success: true,
      message: `Chat backfill completed`,
      processed,
      skipped,
      totalPairs: pairMap.size,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined
    })

  } catch (error) {
    safeLogger.error('[Admin] Chat backfill failed', error)
    return NextResponse.json(
      { 
        error: 'Chat backfill failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
