import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

    // Insert message
    const { data: message, error: messageError } = await supabase
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
          first_name,
          last_name
        )
      `)
      .single()

    if (messageError) {
      console.error('Failed to create message:', messageError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Update chat's updated_at timestamp
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chat_id)

    return NextResponse.json({ message }, { status: 201 })

  } catch (error) {
    console.error('Chat send error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
