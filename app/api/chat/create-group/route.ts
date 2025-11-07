import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { member_ids, name } = await request.json()
    
    if (!member_ids || !Array.isArray(member_ids) || member_ids.length < 2) {
      return NextResponse.json({ error: 'At least 2 members required for group chat' }, { status: 400 })
    }

    if (member_ids.length > 6) {
      return NextResponse.json({ error: 'Maximum 6 members allowed in a group' }, { status: 400 })
    }

    // Ensure current user is included
    const allMemberIds = Array.from(new Set([user.id, ...member_ids]))
    
    if (allMemberIds.length > 6) {
      return NextResponse.json({ error: 'Maximum 6 members allowed in a group' }, { status: 400 })
    }

    // Verify all members are matched with the current user
    const admin = await createAdminClient()
    
    for (const memberId of member_ids) {
      if (memberId === user.id) continue
      
      // Check if there's a match between user and this member
      const { data: match } = await admin
        .from('matches')
        .select('id')
        .or(`and(a_user.eq.${user.id},b_user.eq.${memberId}),and(a_user.eq.${memberId},b_user.eq.${user.id})`)
        .maybeSingle()
      
      if (!match) {
        return NextResponse.json(
          { error: `You can only chat with people you've matched with` },
          { status: 403 }
        )
      }
    }

    // Create group chat
    // Note: name field not in schema yet, will be added in future migration
    const { data: createdChat, error: chatErr } = await admin
      .from('chats')
      .insert({ 
        is_group: true, 
        created_by: user.id
      })
      .select('id')
      .single()

    if (chatErr || !createdChat) {
      return NextResponse.json(
        { error: `Failed to create group chat: ${chatErr?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    const chatId = createdChat.id

    // Add all members
    const membersToInsert = allMemberIds.map(memberId => ({
      chat_id: chatId,
      user_id: memberId
    }))

    const { error: membersErr } = await admin
      .from('chat_members')
      .insert(membersToInsert)

    if (membersErr) {
      return NextResponse.json(
        { error: `Failed to add chat members: ${membersErr.message}` },
        { status: 500 }
      )
    }

    // Create welcome message
    await admin.from('messages').insert({
      chat_id: chatId,
      user_id: user.id,
      content: `Group chat created! ${allMemberIds.length} members joined.`
    })

    // Update chat updated_at
    await admin
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId)

    return NextResponse.json({ chat_id: chatId })
  } catch (error) {
    console.error('Error creating group chat:', error)
    return NextResponse.json(
      { error: 'Failed to create group chat' },
      { status: 500 }
    )
  }
}

