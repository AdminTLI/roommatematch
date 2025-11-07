import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { requireAdmin } from '@/lib/auth/admin'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting: 10 chat creations per hour per user
    const rateLimitKey = getUserRateLimitKey('chat_creation', user.id)
    const rateLimitResult = await checkRateLimit('chat_creation', rateLimitKey)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    const { other_user_id, otherUserId } = await request.json()
    const targetUserId = other_user_id || otherUserId
    
    if (!targetUserId) {
      return NextResponse.json({ error: 'other_user_id is required' }, { status: 400 })
    }

    if (targetUserId === user.id) {
      return NextResponse.json({ error: 'Cannot chat with yourself' }, { status: 400 })
    }

    // Verify users share a confirmed match
    // Check both match_suggestions (status='confirmed') and match_records (locked=true)
    const admin = await createAdminClient()
    
    // Check for confirmed match suggestion
    const { data: confirmedSuggestion } = await admin
      .from('match_suggestions')
      .select('id')
      .eq('status', 'confirmed')
      .contains('member_ids', [user.id, targetUserId])
      .maybeSingle()
    
    // Check for locked match record
    const { data: lockedMatch } = await admin
      .from('match_records')
      .select('id')
      .eq('locked', true)
      .contains('user_ids', [user.id, targetUserId])
      .maybeSingle()
    
    // Allow admin override for testing/debugging
    const adminCheck = await requireAdmin(request)
    const isAdmin = adminCheck.ok
    
    // Audit log admin override
    if (isAdmin) {
      safeLogger.warn('Admin override for chat creation', {
        adminUserId: user.id,
        targetUserId,
        hasConfirmedMatch: !!confirmedSuggestion,
        hasLockedMatch: !!lockedMatch
      })
    }
    
    if (!confirmedSuggestion && !lockedMatch && !isAdmin) {
      return NextResponse.json(
        { error: 'You can only chat with people you\'ve matched with' },
        { status: 403 }
      )
    }

    // Check if chat already exists
    const { data: existingChats } = await admin
      .from('chat_members')
      .select('chat_id')
      .eq('user_id', user.id)

    if (existingChats && existingChats.length > 0) {
      const chatIds = existingChats.map((r: any) => r.chat_id)
      const { data: common } = await admin
        .from('chat_members')
        .select('chat_id')
        .in('chat_id', chatIds)
        .eq('user_id', targetUserId)
      
      if (common && common.length > 0) {
        return NextResponse.json({ chat_id: common[0].chat_id })
      }
    }

    // Create new chat
    const { data: createdChat, error: chatErr } = await admin
      .from('chats')
      .insert({ is_group: false, created_by: user.id })
      .select('id')
      .single()

    if (chatErr || !createdChat) {
      return NextResponse.json(
        { error: `Failed to create chat: ${chatErr?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    const chatId = createdChat.id

    // Add members
    const { error: membersErr } = await admin.from('chat_members').insert([
      { chat_id: chatId, user_id: user.id },
      { chat_id: chatId, user_id: targetUserId }
    ])

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
      content: "You're matched! Start your conversation 👋"
    })

    // Update chat updated_at
    await admin
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId)

    return NextResponse.json({ chat_id: chatId })
  } catch (error) {
    safeLogger.error('Error getting or creating chat', error)
    return NextResponse.json(
      { error: 'Failed to get or create chat' },
      { status: 500 }
    )
  }
}

