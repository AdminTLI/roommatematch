import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's chat memberships with last read times
    const { data: memberships, error: membershipsError } = await supabase
      .from('chat_members')
      .select(`
        chat_id,
        last_read_at,
        chats!inner(
          id,
          updated_at
        )
      `)
      .eq('user_id', user.id)

    if (membershipsError) {
      console.error('Failed to fetch chat memberships:', membershipsError)
      return NextResponse.json({ error: 'Failed to fetch chat memberships' }, { status: 500 })
    }

    // Calculate unread counts for each chat
    const unreadCounts = await Promise.all(
      memberships.map(async (membership) => {
        const lastReadAt = membership.last_read_at || new Date(0).toISOString()
        
        const { count, error: countError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', membership.chat_id)
          .gt('created_at', lastReadAt)

        if (countError) {
          console.error('Failed to count unread messages:', countError)
          return { chat_id: membership.chat_id, unread_count: 0 }
        }

        return {
          chat_id: membership.chat_id,
          unread_count: count || 0
        }
      })
    )

    // Calculate total unread count
    const totalUnread = unreadCounts.reduce((sum, chat) => sum + chat.unread_count, 0)

    return NextResponse.json({
      total_unread: totalUnread,
      chat_counts: unreadCounts
    }, { status: 200 })

  } catch (error) {
    console.error('Unread count error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
