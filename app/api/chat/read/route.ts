import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chat_id } = await request.json()

    if (!chat_id) {
      return NextResponse.json({ error: 'Missing chat_id' }, { status: 400 })
    }

    // Verify user is a member of the chat
    const { data: membership } = await supabase
      .from('chat_members')
      .select('id')
      .eq('chat_id', chat_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this chat' }, { status: 403 })
    }

    // Get all unread messages in this chat (messages created before last_read_at or if last_read_at is null)
    const { data: membershipWithRead, error: membershipReadError } = await supabase
      .from('chat_members')
      .select('last_read_at')
      .eq('chat_id', chat_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (membershipReadError) {
      console.error('Failed to fetch membership read status:', membershipReadError)
      return NextResponse.json({ error: 'Failed to fetch membership read status' }, { status: 500 })
    }

    const lastReadAt = membershipWithRead?.last_read_at || new Date(0).toISOString()

    // Get all messages that should be marked as read
    const { data: unreadMessages, error: messagesError } = await supabase
      .from('messages')
      .select('id')
      .eq('chat_id', chat_id)
      .lte('created_at', new Date().toISOString())
      .gt('created_at', lastReadAt)

    if (messagesError) {
      console.error('Failed to fetch unread messages:', messagesError)
      return NextResponse.json({ error: 'Failed to fetch unread messages' }, { status: 500 })
    }

    // Insert read receipts for all unread messages
    if (unreadMessages && unreadMessages.length > 0) {
      const readReceipts = unreadMessages.map(msg => ({
        message_id: msg.id,
        user_id: user.id
      }))

      const { error: readsError } = await supabase
        .from('message_reads')
        .upsert(readReceipts, { onConflict: 'message_id,user_id' })

      if (readsError) {
        console.error('Failed to insert read receipts:', readsError)
        return NextResponse.json({ error: 'Failed to insert read receipts' }, { status: 500 })
      }
    }

    // Update last_read_at for this user in this chat
    const { error: updateError } = await supabase
      .from('chat_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('chat_id', chat_id)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Failed to update read status:', updateError)
      return NextResponse.json({ error: 'Failed to update read status' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    console.error('Chat read error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
