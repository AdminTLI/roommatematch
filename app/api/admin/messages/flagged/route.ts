import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { safeLogger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const admin = createAdminClient()

    // Fetch flagged messages with sender and chat info
    const { data: flaggedMessages, error } = await admin
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        is_flagged,
        auto_flagged,
        flagged_reason,
        flagged_at,
        user_id,
        chat_id,
        profiles(
          user_id,
          first_name,
          last_name,
          email
        ),
        chats(
          id,
          is_group
        )
      `)
      .eq('is_flagged', true)
      .order('flagged_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      safeLogger.error('[Admin] Failed to fetch flagged messages', error)
      return NextResponse.json(
        { error: 'Failed to fetch flagged messages' },
        { status: 500 }
      )
    }

    // Get total count
    const { count } = await admin
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('is_flagged', true)

    return NextResponse.json({
      messages: flaggedMessages || [],
      total: count || 0
    })
  } catch (error) {
    safeLogger.error('[Admin] Error fetching flagged messages', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const body = await request.json()
    const { messageId, action } = body

    if (!messageId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    if (action === 'approve') {
      // Remove flag
      const { error } = await admin
        .from('messages')
        .update({
          is_flagged: false,
          flagged_reason: [],
          flagged_at: null,
          auto_flagged: false
        })
        .eq('id', messageId)

      if (error) {
        safeLogger.error('[Admin] Failed to approve message', error)
        return NextResponse.json(
          { error: 'Failed to approve message' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    } else if (action === 'delete') {
      // Delete the message
      const { error } = await admin
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) {
        safeLogger.error('[Admin] Failed to delete message', error)
        return NextResponse.json(
          { error: 'Failed to delete message' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    safeLogger.error('[Admin] Error processing flagged message action', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
