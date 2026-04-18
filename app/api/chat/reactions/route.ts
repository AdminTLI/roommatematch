import { createAdminClient, createClient } from '@/lib/supabase/server'
import { createChatMessageReactionNotification } from '@/lib/notifications/create'
import { NextRequest, NextResponse } from 'next/server'
import { safeLogger } from '@/lib/utils/logger'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { getUserFriendlyError } from '@/lib/errors/user-friendly-messages'
import type { SupabaseClient } from '@supabase/supabase-js'

/** Prefer service role for reaction rows so INSERT is not blocked by RLS quirks after we already verified membership. */
function getReactionWriteClient(userClient: SupabaseClient): SupabaseClient {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return userClient
  }
  try {
    return createAdminClient()
  } catch (e) {
    safeLogger.warn('[reactions] Service role client unavailable, using user session for writes', {
      error: e instanceof Error ? e.message : String(e),
    })
    return userClient
  }
}

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

    const { message_id, emoji: rawEmoji } = body

    if (!message_id || !rawEmoji) {
      return NextResponse.json({ 
        error: getUserFriendlyError('Message ID and emoji are required')
      }, { status: 400 })
    }

    const emoji =
      typeof rawEmoji === 'string' ? rawEmoji.normalize('NFC').trim() : ''

    // Allow multi-codepoint emoji sequences (UTF-16 length can exceed grapheme count)
    if (!emoji || emoji.length === 0 || emoji.length > 48) {
      return NextResponse.json({ 
        error: getUserFriendlyError('Invalid emoji')
      }, { status: 400 })
    }

    // Verify user is a member of the chat containing this message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('chat_id, user_id')
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

    const reactionDb = getReactionWriteClient(supabase)

    // Check if reaction already exists (toggle behavior)
    const { data: existingReaction, error: checkError } = await reactionDb
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
      const { error: deleteError } = await reactionDb
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
      const { data: newReaction, error: insertError } = await reactionDb
        .from('message_reactions')
        .insert({
          message_id,
          user_id: user.id,
          emoji
        })
        .select('id, emoji, created_at')
        .single()

      if (insertError) {
        if (insertError.code === '23505') {
          const { data: row } = await reactionDb
            .from('message_reactions')
            .select('id, emoji, created_at')
            .eq('message_id', message_id)
            .eq('user_id', user.id)
            .eq('emoji', emoji)
            .maybeSingle()
          if (row) {
            return NextResponse.json({ action: 'added', reaction: row })
          }
        }
        safeLogger.error('Failed to add reaction', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        })
        return NextResponse.json({ 
          error: getUserFriendlyError('Failed to add reaction')
        }, { status: 500 })
      }

      const messageAuthorId = message.user_id as string | undefined
      if (messageAuthorId && messageAuthorId !== user.id) {
        try {
          const notifyClient = await createAdminClient()
          const { data: reactorProfile } = await notifyClient
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', user.id)
            .maybeSingle()

          let reactorName = 'Someone'
          if (reactorProfile) {
            reactorName =
              [reactorProfile.first_name, reactorProfile.last_name].filter(Boolean).join(' ').trim() || reactorName
          }

          await createChatMessageReactionNotification(
            messageAuthorId,
            reactorName,
            message.chat_id,
            message_id,
            emoji,
            user.id
          )
        } catch (notifyErr) {
          safeLogger.error('[reactions] Failed to create reaction notification', {
            error: notifyErr instanceof Error ? notifyErr.message : String(notifyErr),
            messageId: message_id,
            chatId: message.chat_id,
          })
        }
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
