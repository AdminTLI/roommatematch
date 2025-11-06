import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

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

    console.log('[Admin] Starting chat backfill for all confirmed matches')
    
    const admin = await createAdminClient()
    
    // Get all confirmed pair suggestions
    const { data: confirmedSuggestions, error: sugError } = await admin
      .from('match_suggestions')
      .select('id, member_ids, kind, created_at')
      .eq('status', 'confirmed')
      .eq('kind', 'pair')
      .order('created_at', { ascending: true })

    if (sugError) {
      throw new Error(`Failed to fetch confirmed suggestions: ${sugError.message}`)
    }

    if (!confirmedSuggestions || confirmedSuggestions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No confirmed matches found',
        processed: 0,
        skipped: 0
      })
    }

    console.log(`[Admin] Found ${confirmedSuggestions.length} confirmed pair suggestions`)

    let processed = 0
    let skipped = 0
    const errors: string[] = []

    // Process each confirmed match
    for (const sug of confirmedSuggestions) {
      try {
        const memberIds = sug.member_ids as string[]
        if (!memberIds || memberIds.length !== 2) {
          console.warn(`[Admin] Skipping suggestion ${sug.id}: invalid member_ids`)
          skipped++
          continue
        }

        const [userA, userB] = memberIds

        // Prevent self-matching
        if (userA === userB) {
          console.warn(`[Admin] Skipping suggestion ${sug.id}: self-match`)
          skipped++
          continue
        }

        // Check if chat already exists for these two users
        const { data: existingChatsA } = await admin
          .from('chat_members')
          .select('chat_id')
          .eq('user_id', userA)

        let chatId: string | undefined
        if (existingChatsA && existingChatsA.length > 0) {
          const chatIds = existingChatsA.map((r: any) => r.chat_id)
          const { data: common } = await admin
            .from('chat_members')
            .select('chat_id')
            .in('chat_id', chatIds)
            .eq('user_id', userB)
          if (common && common.length > 0) {
            chatId = common[0].chat_id
            console.log(`[Admin] Chat already exists for pair ${userA} <-> ${userB}: ${chatId}`)
            skipped++
            continue
          }
        }

        // Create chat
        const { data: createdChat, error: chatErr } = await admin
          .from('chats')
          .insert({ 
            is_group: false, 
            created_by: userA, // Use first user as creator
            match_id: null 
          })
          .select('id')
          .single()

        if (chatErr) {
          throw new Error(`Failed to create chat: ${chatErr.message}`)
        }

        chatId = createdChat.id

        // Add members
        const { error: membersErr } = await admin
          .from('chat_members')
          .insert([
            { chat_id: chatId, user_id: userA },
            { chat_id: chatId, user_id: userB }
          ])

        if (membersErr) {
          throw new Error(`Failed to add chat members: ${membersErr.message}`)
        }

        // System message
        const { error: msgErr } = await admin
          .from('messages')
          .insert({
            chat_id: chatId,
            user_id: userA, // Use first user as sender for system message
            content: "You're matched! Start your conversation 👋"
          })

        if (msgErr) {
          console.warn(`[Admin] Failed to create system message for chat ${chatId}: ${msgErr.message}`)
          // Don't fail the whole operation if message creation fails
        }

        // Update chat updated_at
        await admin
          .from('chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', chatId)

        processed++
        if (processed % 10 === 0) {
          console.log(`[Admin] Processed ${processed}/${confirmedSuggestions.length} matches`)
        }
      } catch (error) {
        const errorMsg = `Error processing suggestion ${sug.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Chat backfill completed`,
      processed,
      skipped,
      total: confirmedSuggestions.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined // Limit error output
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

