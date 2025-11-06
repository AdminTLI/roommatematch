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
    const admin = await createAdminClient()
    const { data: message, error: messageError } = await admin
      .from('messages')
      .insert({
        chat_id,
        user_id: user.id,
        content: content.trim()
      })
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
      .single()

    if (messageError) {
      // If profile join fails, try to fetch the message without profile join
      // This can happen if profile doesn't exist yet
      // First, insert the message without the join to get its ID
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
        safeLogger.error('Failed to create message after profile join failure', insertError)
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
      }
      
      // Update chat's updated_at timestamp
      await admin
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chat_id)
      
      return NextResponse.json({ message: insertedMessage }, { status: 201 })
    }

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
