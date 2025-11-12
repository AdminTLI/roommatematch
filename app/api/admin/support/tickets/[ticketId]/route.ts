import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTicket, getTicketMessages, addTicketMessage, updateTicketStatus } from '@/lib/support/tickets'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/admin/support/tickets/[ticketId]
 * Get ticket details and messages (admin only)
 */
export async function GET(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id, role, university_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (adminError || !adminData) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get ticket (no user restriction for admin)
    const ticket = await getTicket(params.ticketId)

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Get messages (admin can see all messages including internal)
    const messages = await getTicketMessages(params.ticketId, user.id)

    // Get user information
    const { data: userData } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('id', ticket.user_id)
      .maybeSingle()

    return NextResponse.json({
      success: true,
      data: {
        ticket: {
          ...ticket,
          user: userData
        },
        messages
      }
    })
  } catch (error) {
    safeLogger.error('Error fetching ticket', { error })
    return NextResponse.json(
      { error: 'Failed to fetch ticket', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/support/tickets/[ticketId]
 * Add message to ticket (admin only)
 */
export async function POST(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id, role, university_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (adminError || !adminData) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { message, is_internal } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Add message (admin can send internal messages)
    const ticketMessage = await addTicketMessage(
      params.ticketId,
      user.id,
      message,
      is_internal || false
    )

    if (!ticketMessage) {
      return NextResponse.json(
        { error: 'Failed to add message' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: ticketMessage
    }, { status: 201 })
  } catch (error) {
    safeLogger.error('Error adding ticket message', { error })
    return NextResponse.json(
      { error: 'Failed to add message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/support/tickets/[ticketId]
 * Update ticket status (admin only)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id, role, university_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (adminError || !adminData) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { status, resolution } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Update ticket status
    const updated = await updateTicketStatus(
      params.ticketId,
      status,
      user.id,
      resolution
    )

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update ticket status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket status updated'
    })
  } catch (error) {
    safeLogger.error('Error updating ticket status', { error })
    return NextResponse.json(
      { error: 'Failed to update ticket status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

