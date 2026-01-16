import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { safeLogger } from '@/lib/utils/logger'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { getUserFriendlyError } from '@/lib/errors/user-friendly-messages'
import { filterContent, getViolationErrorMessage } from '@/lib/utils/content-filter'
import { createNotificationsForUsers } from '@/lib/notifications/create'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      safeLogger.error('Auth error in chat send', { error: authError })
      return NextResponse.json({ 
        error: getUserFriendlyError('Authentication failed')
      }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ 
        error: getUserFriendlyError('Authentication required')
      }, { status: 401 })
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

    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      safeLogger.error('Failed to parse request body', { error: jsonError })
      return NextResponse.json({ 
        error: getUserFriendlyError('Invalid request format')
      }, { status: 400 })
    }

    const { chat_id, content } = body

    if (!chat_id || !content) {
      return NextResponse.json({ 
        error: getUserFriendlyError('Please enter a message')
      }, { status: 400 })
    }

    // Content validation - check for prohibited content
    const trimmedContent = content.trim()
    const contentCheck = filterContent(trimmedContent)
    
    // Reject messages with links, emails, or phone numbers
    if (contentCheck.hasLinks || contentCheck.hasEmail || contentCheck.hasPhone) {
      const errorMessage = getViolationErrorMessage(contentCheck.violations.filter(v => 
        v === 'links' || v === 'email' || v === 'phone'
      ))
      
      safeLogger.warn('Message rejected due to prohibited content', {
        userId: user.id,
        chatId: chat_id,
        violations: contentCheck.violations,
        hasLinks: contentCheck.hasLinks,
        hasEmail: contentCheck.hasEmail,
        hasPhone: contentCheck.hasPhone
      })
      
      return NextResponse.json({ 
        error: errorMessage || getUserFriendlyError('Your message contains prohibited content')
      }, { status: 400 })
    }
    
    // Track if message should be flagged for suspicious content
    const shouldFlag = contentCheck.suspicious.flagged
    const flaggedReasons: string[] = []
    
    if (shouldFlag) {
      flaggedReasons.push(contentCheck.suspicious.reason)
    }

    // Verify user is a member of the chat (using regular client for RLS check)
    // If chat has no members, it means it was closed by an admin
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
      // Check if chat exists but has no members (was closed)
      const { data: chatExists } = await supabase
        .from('chats')
        .select('id')
        .eq('id', chat_id)
        .maybeSingle()
      
      if (chatExists) {
        safeLogger.warn('User attempted to send message to closed chat', {
          userId: user.id,
          chatId: chat_id
        })
        return NextResponse.json({ 
          error: getUserFriendlyError('Chat has been closed')
        }, { status: 403 })
      }
      
      safeLogger.warn('User attempted to send message to chat they are not a member of', {
        userId: user.id,
        chatId: chat_id
      })
      return NextResponse.json({ 
        error: getUserFriendlyError('Failed to verify chat membership')
      }, { status: 403 })
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
    const insertData: any = {
      chat_id,
      user_id: user.id,
      content: trimmedContent
    }
    
    // Add flagging fields if message is suspicious
    if (shouldFlag) {
      insertData.is_flagged = true
      insertData.auto_flagged = true
      insertData.flagged_reason = flaggedReasons
      insertData.flagged_at = new Date().toISOString()
    }
    
    const { data: insertedMessage, error: insertError } = await supabase
      .from('messages')
      .insert(insertData)
      .select('id, content, created_at, user_id, is_flagged, auto_flagged, flagged_reason')
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
          error: getUserFriendlyError('Permission denied')
        }, { status: 403 })
      }
      
      safeLogger.error('Failed to create message', {
        error: insertError,
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        userId: user.id,
        chatId: chat_id
      })
      
      // In development, return the actual error message for debugging
      const errorMessage = process.env.NODE_ENV === 'development'
        ? insertError.message || 'Failed to send message'
        : getUserFriendlyError('Failed to send message')
      
      return NextResponse.json({ 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          details: {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint
          }
        })
      }, { status: 500 })
    }

    if (!insertedMessage) {
      safeLogger.error('Message insert returned no data', {
        userId: user.id,
        chatId: chat_id
      })

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a9ae1253-eb67-47e3-8214-0f523bc4444c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix1',hypothesisId:'H3',location:'app/api/chat/send/route.ts:177',message:'insertedMessage missing',data:{userId:user.id,chatId:chat_id},timestamp:Date.now()})}).catch(()=>{})
      // #endregion

      return NextResponse.json({ 
        error: getUserFriendlyError('Failed to send message')
      }, { status: 500 })
    }

    safeLogger.info('Message inserted successfully', {
      messageId: insertedMessage.id,
      userId: user.id,
      chatId: chat_id,
      isFlagged: shouldFlag
    })
    
    // Notify admins if message was auto-flagged
    if (shouldFlag && insertedMessage.is_flagged) {
      try {
        const admin = await createAdminClient()
        const { data: admins } = await admin
          .from('admins')
          .select('user_id')
        
        if (admins && admins.length > 0) {
          const adminUserIds = admins.map(a => a.user_id)
          
          // Get sender profile for notification
          const { data: senderProfile } = await admin
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', user.id)
            .maybeSingle()
          
          const senderName = senderProfile
            ? [senderProfile.first_name, senderProfile.last_name].filter(Boolean).join(' ') || 'User'
            : 'User'
          
          // Truncate message preview for notification
          const messagePreview = trimmedContent.length > 100 
            ? trimmedContent.substring(0, 100) + '...'
            : trimmedContent
          
          const reasonLabels: Record<string, string> = {
            profanity: 'Profanity',
            spam: 'Spam',
            suspicious_content: 'Suspicious Content',
            excessive_caps: 'Excessive Capitalization',
            repetitive_content: 'Repetitive Content'
          }
          
          const reasonLabel = reasonLabels[contentCheck.suspicious.reason] || contentCheck.suspicious.reason
          
          await createNotificationsForUsers(
            adminUserIds,
            'admin_alert',
            'Suspicious Message Flagged',
            `Message from ${senderName} flagged for ${reasonLabel}: "${messagePreview}"`,
            {
              message_id: insertedMessage.id,
              chat_id: chat_id,
              sender_id: user.id,
              sender_name: senderName,
              flagged_reason: flaggedReasons,
              auto_flagged: true,
              link: `/admin/reports?type=flagged&message_id=${insertedMessage.id}`
            }
          )
          
          safeLogger.info('Notified admins about flagged message', {
            messageId: insertedMessage.id,
            adminCount: adminUserIds.length,
            reason: contentCheck.suspicious.reason
          })
        }
      } catch (notifyError) {
        // Don't fail the message send if notification fails
        safeLogger.error('Failed to notify admins about flagged message', {
          error: notifyError,
          messageId: insertedMessage.id
        })
      }
    }

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

    // Update chat's updated_at timestamp
    // NOTE: Temporarily commented out due to trigger function issue with public.now()
    // The trigger will automatically update this when the function is fixed
    // TODO: Re-enable after fixing update_updated_at_column() function in database
    /*
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
    */

    return NextResponse.json({ message }, { status: 201 })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorName = error instanceof Error ? error.name : typeof error
    
    safeLogger.error('Chat send error', {
      error,
      errorMessage,
      errorName,
      errorStack,
      errorString: String(error),
      errorType: typeof error,
      errorJSON: JSON.stringify(error, Object.getOwnPropertyNames(error))
    })
    
    // Return detailed error in development, generic in production
    // Don't use getUserFriendlyError here - we want to see the actual error in dev
    const detailedError = process.env.NODE_ENV === 'development' 
      ? errorMessage 
      : getUserFriendlyError('Failed to send message')
    
    return NextResponse.json({ 
      error: detailedError,
      ...(process.env.NODE_ENV === 'development' && { 
        details: {
          name: errorName,
          message: errorMessage,
          stack: errorStack,
          errorString: String(error)
        }
      })
    }, { status: 500 })
  }
}
