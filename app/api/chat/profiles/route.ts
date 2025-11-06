import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userIds, chatId } = await request.json()
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'userIds array is required' }, { status: 400 })
    }

    // Security: If chatId is provided, verify membership.
    // If chatId is omitted, restrict userIds to only users the caller has chat memberships with.
    if (chatId) {
      const { data: membership } = await supabase
        .from('chat_members')
        .select('id')
        .eq('chat_id', chatId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (!membership) {
        return NextResponse.json({ error: 'Not a member of this chat' }, { status: 403 })
      }

      // Verify all requested userIds are members of this chat
      const { data: chatMembers } = await supabase
        .from('chat_members')
        .select('user_id')
        .eq('chat_id', chatId)
        .in('user_id', userIds)

      const allowedUserIds = new Set(chatMembers?.map(m => m.user_id) || [])
      const invalidUserIds = userIds.filter(id => !allowedUserIds.has(id))
      
      if (invalidUserIds.length > 0) {
        return NextResponse.json(
          { error: `User IDs not in chat: ${invalidUserIds.join(', ')}` },
          { status: 403 }
        )
      }
    } else {
      // No chatId provided: restrict userIds to users the caller has chat memberships with
      const { data: userChats } = await supabase
        .from('chat_members')
        .select('chat_id')
        .eq('user_id', user.id)

      if (!userChats || userChats.length === 0) {
        return NextResponse.json({ error: 'No chat memberships found' }, { status: 403 })
      }

      const chatIds = userChats.map(c => c.chat_id)
      const { data: chatMembers } = await supabase
        .from('chat_members')
        .select('user_id')
        .in('chat_id', chatIds)
        .in('user_id', userIds)

      const allowedUserIds = new Set(chatMembers?.map(m => m.user_id) || [])
      const invalidUserIds = userIds.filter(id => !allowedUserIds.has(id))
      
      if (invalidUserIds.length > 0) {
        return NextResponse.json(
          { error: `User IDs not in your chats: ${invalidUserIds.join(', ')}` },
          { status: 403 }
        )
      }

      // Also allow the caller's own user ID
      if (!allowedUserIds.has(user.id) && userIds.includes(user.id)) {
        allowedUserIds.add(user.id)
      }
    }

    // Use admin client to fetch profiles (bypasses RLS)
    // At this point, we've verified all userIds are authorized
    const admin = await createAdminClient()
    const { data: profiles, error: profilesError } = await admin
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', userIds)

    if (profilesError) {
      console.error('Failed to fetch profiles:', profilesError)
      return NextResponse.json(
        { error: `Failed to fetch profiles: ${profilesError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ profiles: profiles || [] })
  } catch (error) {
    console.error('Error fetching chat profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}

