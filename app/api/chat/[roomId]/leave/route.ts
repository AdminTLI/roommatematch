import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId } = await params

    // Verify user is a member of the chat
    const { data: membership } = await supabase
      .from('chat_members')
      .select('id')
      .eq('chat_id', roomId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this chat' }, { status: 403 })
    }

    // Remove user from chat members
    const { error: deleteError } = await supabase
      .from('chat_members')
      .delete()
      .eq('chat_id', roomId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Failed to leave chat:', deleteError)
      return NextResponse.json({ error: 'Failed to leave chat' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

