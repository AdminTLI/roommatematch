import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { safeLogger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chat_id, content } = await request.json()

    if (!chat_id || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify user is a member of the chat (using regular client for RLS check)
    const { data: membership } = await supabase
      .from('chat_members')
      .select('id')
      .eq('chat_id', chat_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this chat' }, { status: 403 })
    }

    // Insert message using admin client (bypasses RLS, but we've verified membership above)
    // Insert first without join to ensure we get the message ID even if profile doesn't exist
    const admin = await createAdminClient()
    const { data: insertedMessage, error: insertError } = await admin
      .from('messages')
      .insert({
        chat_id,
        user_id: user.id,
        content: content.trim()
      })
      .select('id, content, created_at, user_id')
      .single()

    if (insertError || !insertedMessage) {
      safeLogger.error('Failed to create message', insertError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Try to fetch the message with profile join (if profile exists)
    const { data: messageWithProfile } = await admin
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles!inner(
          user_id,
          first_name,
          last_name
        )
      `)
      .eq('id', insertedMessage.id)
      .single()

    // Use message with profile if available, otherwise use the basic message
    const message = messageWithProfile || insertedMessage

    // Update chat's updated_at timestamp (using admin client)
    await admin
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chat_id)

    return NextResponse.json({ message }, { status: 201 })

  } catch (error) {
    safeLogger.error('Chat send error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
