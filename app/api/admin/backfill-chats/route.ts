import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to check admin status (bypasses RLS)
    const adminClient = await createAdminClient()
    const { data: adminRecord } = await adminClient
      .from('admins')
      .select('role, user_id, university_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!adminRecord) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('[Admin] Starting chat backfill for confirmed matches')
    
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

    console.log(`[Admin] Found ${confirmedSuggestions.length} confirmed pair suggestions`)

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

    console.log(`[Admin] Grouped into ${pairMap.size} unique confirmed pairs`)

    let processed = 0
    let skipped = 0
    const errors: string[] = []

    // Process each pair
    for (const [pairKey, suggestions] of pairMap.entries()) {
      try {
        const [userA, userB] = pairKey.split('::')
        
        console.log(`[Admin] Processing pair ${pairKey} for chat creation`)

        // Check if chat already exists
        let chatId: string | undefined
        const { data: existingChatsA, error: existingChatsError } = await admin
          .from('chat_members')
          .select('chat_id')
          .eq('user_id', userA)

        if (existingChatsError) {
          console.warn(`[Admin] Error checking existing chats for userA:`, existingChatsError)
        }

        if (existingChatsA && existingChatsA.length > 0) {
          const chatIds = existingChatsA.map((r: any) => r.chat_id)
          const { data: common, error: commonError } = await admin
            .from('chat_members')
            .select('chat_id')
            .in('chat_id', chatIds)
            .eq('user_id', userB)
          
          if (commonError) {
            console.warn(`[Admin] Error checking common chats:`, commonError)
          }
          
          if (common && common.length > 0) {
            chatId = common[0].chat_id
            console.log(`[Admin] Chat ${chatId} already exists for pair ${pairKey}`)
            skipped++
            continue
          }
        }

        // Create chat
        console.log(`[Admin] Creating chat for confirmed pair ${pairKey}`)
        const { data: createdChat, error: chatErr } = await admin
          .from('chats')
          .insert({ is_group: false, created_by: userA, match_id: null })
          .select('id')
          .single()

        if (chatErr || !createdChat) {
          throw new Error(`Failed to create chat: ${chatErr?.message || 'Unknown error'}`)
        }

        chatId = createdChat.id
        console.log(`[Admin] Created chat ${chatId}`)

        // Add members
        const { error: membersErr } = await admin.from('chat_members').insert([
          { chat_id: chatId, user_id: userA },
          { chat_id: chatId, user_id: userB }
        ])

        if (membersErr) {
          throw new Error(`Failed to add chat members: ${membersErr.message}`)
        }
        console.log(`[Admin] Added members to chat ${chatId}`)

        // Create system message
        const { error: msgErr } = await admin.from('messages').insert({
          chat_id: chatId,
          user_id: userA,
          content: "You're matched! Start your conversation 👋"
        })

        if (msgErr) {
          console.warn(`[Admin] Failed to create system message for chat ${chatId}:`, msgErr)
          // Don't fail if message creation fails
        } else {
          console.log(`[Admin] Created system message in chat ${chatId}`)
        }

        // Update chat updated_at
        const { error: updateErr } = await admin
          .from('chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', chatId)

        if (updateErr) {
          console.warn(`[Admin] Failed to update chat ${chatId} updated_at:`, updateErr)
        }

        console.log(`[Admin] Successfully created chat ${chatId} for pair ${pairKey}`)
        processed++
      } catch (error) {
        const errorMsg = `Error processing pair ${pairKey}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Chat backfill completed`,
      processed,
      skipped,
      totalPairs: pairMap.size,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined
    })

  } catch (error) {
    console.error('[Admin] Chat backfill failed:', error)
    return NextResponse.json(
      { 
        error: 'Chat backfill failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
