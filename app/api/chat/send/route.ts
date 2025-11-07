import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { safeLogger } from '@/lib/utils/logger'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting: 30 messages per 5 minutes per user
    const rateLimitKey = getUserRateLimitKey('messages', user.id)
    const rateLimitResult = await checkRateLimit('messages', rateLimitKey)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    const { chat_id, content } = await request.json()

    if (!chat_id || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify user is a member of the chat (using regular client for RLS check)
    const { data: membership, error: membershipError } = await supabase
      .from('chat_members')
      .select('id')
      .eq('chat_id', chat_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (membershipError) {
      safeLogger.error('Failed to check chat membership', {
        error: membershipError,
        userId: user.id,
        chatId: chat_id
      })
      return NextResponse.json({ error: 'Failed to verify chat membership' }, { status: 500 })
    }

    if (!membership) {
      safeLogger.warn('User attempted to send message to chat they are not a member of', {
        userId: user.id,
        chatId: chat_id
      })
      return NextResponse.json({ error: 'Not a member of this chat' }, { status: 403 })
    }

    safeLogger.info('Inserting message', {
      userId: user.id,
      chatId: chat_id,
      contentLength: content.trim().length
    })

    // Insert message using regular authenticated client (ensures RLS is evaluated for realtime)
    // This is critical: Supabase Realtime evaluates RLS from each subscriber's perspective
    // When inserts bypass RLS (admin client), Realtime cannot properly evaluate permissions
    // Insert with profile join - if profile doesn't exist, the insert will still succeed
    // but we'll fetch the message separately to avoid relying on the join
    const { data: insertedMessage, error: insertError } = await supabase
      .from('messages')
      .insert({
        chat_id,
        user_id: user.id,
        content: content.trim()
      })
      .select('id, content, created_at, user_id')
      .single()

    if (insertError) {
      // Check if it's an RLS error specifically
      if (insertError.code === '42501') {
        safeLogger.error('RLS policy violation when inserting message', {
          error: insertError,
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          userId: user.id,
          chatId: chat_id,
          membershipExists: !!membership
        })
        return NextResponse.json({ 
          error: 'Permission denied: Unable to send message. Please refresh and try again.' 
        }, { status: 403 })
      }
      
      safeLogger.error('Failed to create message', {
        error: insertError,
        code: insertError.code,
        message: insertError.message,
        userId: user.id,
        chatId: chat_id
      })
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    if (!insertedMessage) {
      safeLogger.error('Message insert returned no data', {
        userId: user.id,
        chatId: chat_id
      })
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    safeLogger.info('Message inserted successfully', {
      messageId: insertedMessage.id,
      userId: user.id,
      chatId: chat_id
    })

    // Fetch the message with profile data if available (using LEFT join via optional select)
    // This ensures we only fetch once and don't have a fallback path that could cause issues
    const { data: messageWithProfile } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles(
          user_id,
          first_name,
          last_name
        )
      `)
      .eq('id', insertedMessage.id)
      .single()

    // Use message with profile if available, otherwise use the basic inserted message
    const message = messageWithProfile || insertedMessage

    // Update chat's updated_at timestamp (using regular client - we've verified membership)
    const { error: updateError } = await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chat_id)

    if (updateError) {
      safeLogger.warn('Failed to update chat timestamp', {
        error: updateError,
        chatId: chat_id
      })
      // Don't fail the request - message was sent successfully
    }

    return NextResponse.json({ message }, { status: 201 })

  } catch (error) {
    safeLogger.error('Chat send error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
