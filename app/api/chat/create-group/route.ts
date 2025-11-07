import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { requireAdmin } from '@/lib/auth/admin'

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

    // Allow admin override for testing/debugging
    const adminCheck = await requireAdmin(request)
    const isAdmin = adminCheck.ok

    // Verify all members share confirmed matches with each other
    const admin = await createAdminClient()
    
    // For group chats, verify that all pairs share confirmed matches
    // This ensures the group is valid (all members are matched with each other)
    for (let i = 0; i < allMemberIds.length; i++) {
      for (let j = i + 1; j < allMemberIds.length; j++) {
        const userA = allMemberIds[i]
        const userB = allMemberIds[j]
        
        // Skip if same user
        if (userA === userB) continue
      
        // Check for confirmed match suggestion
        const { data: confirmedSuggestion } = await admin
          .from('match_suggestions')
          .select('id')
          .eq('status', 'confirmed')
          .contains('member_ids', [userA, userB])
          .maybeSingle()
        
        // Check for locked match record
        const { data: lockedMatch } = await admin
          .from('match_records')
        .select('id')
          .eq('locked', true)
          .contains('user_ids', [userA, userB])
        .maybeSingle()
      
        // If no confirmed match found and not admin, reject
        if (!confirmedSuggestion && !lockedMatch && !isAdmin) {
        return NextResponse.json(
            { error: `All group members must be matched with each other. ${userA === user.id ? 'You' : 'A member'} is not matched with another member.` },
          { status: 403 }
        )
        }
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
    safeLogger.error('Error creating group chat', error)
    return NextResponse.json(
      { error: 'Failed to create group chat' },
      { status: 500 }
    )
  }
}

