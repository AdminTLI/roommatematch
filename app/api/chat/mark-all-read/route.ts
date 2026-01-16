import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all chats for this user
    const { data: memberships, error: membershipsError } = await supabase
      .from('chat_members')
      .select('chat_id')
      .eq('user_id', user.id)

    if (membershipsError) {
      safeLogger.error('[MarkAllRead] Failed to fetch memberships', membershipsError)
      return NextResponse.json({ error: 'Failed to fetch chat memberships' }, { status: 500 })
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ success: true, updated_count: 0, message: 'No chats found' })
    }

    const chatIds = memberships.map(m => m.chat_id)

    // Get all unread messages for these chats (messages not from the user)
    const { data: unreadMessages, error: messagesError } = await supabase
      .from('messages')
      .select('id, chat_id')
      .in('chat_id', chatIds)
      .neq('user_id', user.id)

    if (messagesError) {
      safeLogger.error('[MarkAllRead] Failed to fetch messages', messagesError)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    if (!unreadMessages || unreadMessages.length === 0) {
      // Update last_read_at for all chats
      const admin = await createAdminClient()
      await admin
        .from('chat_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .in('chat_id', chatIds)

      return NextResponse.json({ 
        success: true, 
        updated_count: 0,
        message: 'All chats already marked as read'
      })
    }

    // Create read receipts for all unread messages
    const readReceipts = unreadMessages.map(msg => ({
      message_id: msg.id,
      user_id: user.id
    }))

    // Use admin client to bypass RLS
    const admin = await createAdminClient()
    
    // Insert read receipts in batches
    const batchSize = 100
    let totalInserted = 0
    
    for (let i = 0; i < readReceipts.length; i += batchSize) {
      const batch = readReceipts.slice(i, i + batchSize)
      const { error: readsError } = await admin
        .from('message_reads')
        .upsert(batch, { onConflict: 'message_id,user_id' })

      if (readsError) {
        safeLogger.error('[MarkAllRead] Failed to insert read receipts', readsError)
        // Continue with other batches even if one fails
      } else {
        totalInserted += batch.length
      }
    }

    // Update last_read_at for all chats
    await admin
      .from('chat_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .in('chat_id', chatIds)

    safeLogger.info('[MarkAllRead] Marked all chats as read', {
      userId: user.id,
      chatCount: chatIds.length,
      messageCount: unreadMessages.length,
      receiptsInserted: totalInserted
    })

    return NextResponse.json({ 
      success: true, 
      updated_count: totalInserted,
      chat_count: chatIds.length,
      message_count: unreadMessages.length
    })

  } catch (error) {
    safeLogger.error('[MarkAllRead] Error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
