import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { safeLogger } from '@/lib/utils/logger'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { getUserFriendlyError } from '@/lib/errors/user-friendly-messages'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: getUserFriendlyError('Authentication required')
      }, { status: 401 })
    }

    // Rate limiting: 100 reactions per 5 minutes per user
    const rateLimitKey = getUserRateLimitKey('reactions', user.id)
    const rateLimitResult = await checkRateLimit('reactions', rateLimitKey)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      safeLogger.error('Failed to parse request body', { error: jsonError })
      return NextResponse.json({ 
        error: getUserFriendlyError('Invalid request format')
      }, { status: 400 })
    }

    const { message_id, emoji } = body

    if (!message_id || !emoji) {
      return NextResponse.json({ 
        error: getUserFriendlyError('Message ID and emoji are required')
      }, { status: 400 })
    }

    // Validate emoji (basic check - should be a single emoji)
    if (typeof emoji !== 'string' || emoji.length === 0 || emoji.length > 20) {
      return NextResponse.json({ 
        error: getUserFriendlyError('Invalid emoji')
      }, { status: 400 })
    }

    // Verify user is a member of the chat containing this message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('chat_id')
      .eq('id', message_id)
      .single()

    if (messageError || !message) {
      safeLogger.error('Failed to find message', { error: messageError, message_id })
      return NextResponse.json({ 
        error: getUserFriendlyError('Message not found')
      }, { status: 404 })
    }

    const { data: membership, error: membershipError } = await supabase
      .from('chat_members')
      .select('id')
      .eq('chat_id', message.chat_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (membershipError || !membership) {
      safeLogger.error('User not a member of chat', {
        error: membershipError,
        userId: user.id,
        chatId: message.chat_id
      })
      return NextResponse.json({ 
        error: getUserFriendlyError('You are not a member of this chat')
      }, { status: 403 })
    }

    // Check if reaction already exists (toggle behavior)
    const { data: existingReaction, error: checkError } = await supabase
      .from('message_reactions')
      .select('id')
      .eq('message_id', message_id)
      .eq('user_id', user.id)
      .eq('emoji', emoji)
      .maybeSingle()

    if (checkError) {
      safeLogger.error('Failed to check existing reaction', { error: checkError })
      return NextResponse.json({ 
        error: getUserFriendlyError('Failed to check reaction')
      }, { status: 500 })
    }

    // Toggle: Delete if exists, insert if not
    if (existingReaction) {
      // Remove reaction
      const { error: deleteError } = await supabase
        .from('message_reactions')
        .delete()
        .eq('id', existingReaction.id)

      if (deleteError) {
        safeLogger.error('Failed to remove reaction', { error: deleteError })
        return NextResponse.json({ 
          error: getUserFriendlyError('Failed to remove reaction')
        }, { status: 500 })
      }

      return NextResponse.json({ 
        action: 'removed',
        reaction: { id: existingReaction.id, emoji }
      })
    } else {
      // Add reaction
      const { data: newReaction, error: insertError } = await supabase
        .from('message_reactions')
        .insert({
          message_id,
          user_id: user.id,
          emoji
        })
        .select('id, emoji, created_at')
        .single()

      if (insertError) {
        safeLogger.error('Failed to add reaction', { error: insertError })
        return NextResponse.json({ 
          error: getUserFriendlyError('Failed to add reaction')
        }, { status: 500 })
      }

      return NextResponse.json({ 
        action: 'added',
        reaction: newReaction
      })
    }
  } catch (error) {
    safeLogger.error('Error toggling message reaction', error)
    return NextResponse.json(
      { error: getUserFriendlyError('Failed to toggle reaction') },
      { status: 500 }
    )
  }
}
