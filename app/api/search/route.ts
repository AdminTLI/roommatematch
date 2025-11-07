import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    if (!query || query.length < 2) {
      return NextResponse.json({ matches: [], messages: [] })
    }

    const searchTerm = `%${query.toLowerCase()}%`

    // Search matches (users you've matched with)
    const { data: chatMembers } = await supabase
      .from('chat_members')
      .select('chat_id, user_id')
      .eq('user_id', user.id)

    const chatIds = chatMembers?.map(cm => cm.chat_id) || []

    let matchedUsers: any[] = []
    if (chatIds.length > 0) {
      // Get other users from chats
      const { data: otherMembers } = await supabase
        .from('chat_members')
        .select('user_id, chat_id')
        .in('chat_id', chatIds)
        .neq('user_id', user.id)

      const otherUserIds = [...new Set(otherMembers?.map(m => m.user_id) || [])]

      if (otherUserIds.length > 0) {
        // Fetch profiles matching search
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, program, university_id, universities(name)')
          .in('user_id', otherUserIds)
          .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},program.ilike.${searchTerm}`)
          .limit(5)

        matchedUsers = (profiles || []).map((profile: any) => ({
          id: profile.user_id,
          type: 'match',
          name: [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User',
          program: profile.program || '',
          university: profile.universities?.name || '',
          chatId: otherMembers?.find(m => m.user_id === profile.user_id)?.chat_id
        }))
      }
    }

    // Search messages
    let matchedMessages: any[] = []
    if (chatIds.length > 0) {
      const { data: messages } = await supabase
        .from('messages')
        .select('id, content, chat_id, created_at, user_id')
        .in('chat_id', chatIds)
        .ilike('content', searchTerm)
        .order('created_at', { ascending: false })
        .limit(5)

      if (messages && messages.length > 0) {
        // Get sender profiles
        const senderIds = [...new Set(messages.map(m => m.user_id))]
        const { data: senderProfiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', senderIds)

        const profilesMap = new Map(senderProfiles?.map(p => [p.user_id, p]) || [])

        matchedMessages = messages.map((msg: any) => {
          const profile = profilesMap.get(msg.user_id)
          const senderName = profile
            ? [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User'
            : 'User'

          return {
            id: msg.id,
            type: 'message',
            content: msg.content,
            chatId: msg.chat_id,
            senderName,
            createdAt: msg.created_at
          }
        })
      }
    }

    return NextResponse.json({
      matches: matchedUsers,
      messages: matchedMessages
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    )
  }
}

