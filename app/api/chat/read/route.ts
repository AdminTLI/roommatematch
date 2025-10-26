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
