// Support Tickets System
// This module handles support ticket creation, management, and messaging

import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

export interface SupportTicket {
  id: string
  ticket_number: string
  subject: string
  description: string
  category: 'technical' | 'account' | 'matching' | 'payment' | 'safety' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled'
  user_id: string
  university_id?: string
  assigned_to?: string
  assigned_at?: string
  resolution?: string
  resolved_at?: string
  resolved_by?: string
  tags?: string[]
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  closed_at?: string
}

export interface TicketMessage {
  id: string
  ticket_id: string
  message: string
  message_type: 'user' | 'admin' | 'system'
  sender_id?: string
  sender_name?: string
  sender_email?: string
  is_internal: boolean
  attachments?: Array<{
    id: string
    file_name: string
    file_type: string
    file_url: string
  }>
  created_at: string
  updated_at: string
}

export interface CreateTicketData {
  subject: string
  description: string
  category: SupportTicket['category']
  priority?: SupportTicket['priority']
  tags?: string[]
  metadata?: Record<string, any>
}

/**
 * Create a new support ticket
 */
export async function createSupportTicket(
  userId: string,
  data: CreateTicketData,
  universityId?: string
): Promise<SupportTicket | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for support tickets')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user information
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('id', userId)
      .maybeSingle()

    if (userError || !user) {
      safeLogger.error('Failed to fetch user', { error: userError })
      return null
    }

    // Create ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        subject: data.subject,
        description: data.description,
        category: data.category,
        priority: data.priority || 'medium',
        status: 'open',
        user_id: userId,
        university_id: universityId,
        tags: data.tags || [],
        metadata: data.metadata || {}
      })
      .select()
      .single()

    if (ticketError) {
      safeLogger.error('Failed to create support ticket', { error: ticketError })
      return null
    }

    // Create initial message
    const { error: messageError } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticket.id,
        message: data.description,
        message_type: 'user',
        sender_id: userId,
        sender_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        sender_email: user.email,
        is_internal: false
      })

    if (messageError) {
      safeLogger.error('Failed to create initial message', { error: messageError })
    }

    safeLogger.info('Support ticket created', { ticketId: ticket.id, ticketNumber: ticket.ticket_number })

    return ticket
  } catch (error) {
    safeLogger.error('Error creating support ticket', { error })
    return null
  }
}

/**
 * Get user's tickets
 */
export async function getUserTickets(
  userId: string,
  status?: SupportTicket['status']
): Promise<SupportTicket[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for support tickets')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    let query = supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: tickets, error } = await query

    if (error) {
      safeLogger.error('Failed to fetch user tickets', { error })
      return []
    }

    return tickets || []
  } catch (error) {
    safeLogger.error('Error fetching user tickets', { error })
    return []
  }
}

/**
 * Get ticket by ID
 */
export async function getTicket(
  ticketId: string,
  userId?: string
): Promise<SupportTicket | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for support tickets')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    let query = supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: ticket, error } = await query.maybeSingle()

    if (error) {
      safeLogger.error('Failed to fetch ticket', { error })
      return null
    }

    return ticket
  } catch (error) {
    safeLogger.error('Error fetching ticket', { error })
    return null
  }
}

/**
 * Get ticket messages
 */
export async function getTicketMessages(
  ticketId: string,
  userId?: string
): Promise<TicketMessage[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for support tickets')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get messages
    let query = supabase
      .from('ticket_messages')
      .select(`
        *,
        ticket_attachments (
          id,
          file_name,
          file_type,
          file_url
        )
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    // Filter internal messages for non-admin users
    if (userId) {
      // Check if user is admin
      const { data: admin } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (!admin) {
        query = query.eq('is_internal', false)
      }
    } else {
      query = query.eq('is_internal', false)
    }

    const { data: messages, error } = await query

    if (error) {
      safeLogger.error('Failed to fetch ticket messages', { error })
      return []
    }

    // Transform messages to include attachments
    return (messages || []).map(msg => ({
      id: msg.id,
      ticket_id: msg.ticket_id,
      message: msg.message,
      message_type: msg.message_type,
      sender_id: msg.sender_id,
      sender_name: msg.sender_name,
      sender_email: msg.sender_email,
      is_internal: msg.is_internal,
      attachments: msg.ticket_attachments?.map((att: any) => ({
        id: att.id,
        file_name: att.file_name,
        file_type: att.file_type,
        file_url: att.file_url
      })) || [],
      created_at: msg.created_at,
      updated_at: msg.updated_at
    }))
  } catch (error) {
    safeLogger.error('Error fetching ticket messages', { error })
    return []
  }
}

/**
 * Add message to ticket
 */
export async function addTicketMessage(
  ticketId: string,
  userId: string,
  message: string,
  isInternal: boolean = false
): Promise<TicketMessage | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for support tickets')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user information
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('id', userId)
      .maybeSingle()

    if (userError || !user) {
      safeLogger.error('Failed to fetch user', { error: userError })
      return null
    }

    // Check if user is admin
    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    const messageType = admin ? 'admin' : 'user'

    // Create message
    const { data: ticketMessage, error: messageError } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        message,
        message_type: messageType,
        sender_id: userId,
        sender_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        sender_email: user.email,
        is_internal: isInternal
      })
      .select()
      .single()

    if (messageError) {
      safeLogger.error('Failed to create ticket message', { error: messageError })
      return null
    }

    // Update ticket updated_at timestamp
    await supabase
      .from('support_tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', ticketId)

    // If admin message, update ticket status to in_progress if still open
    if (admin && messageType === 'admin') {
      await supabase
        .from('support_tickets')
        .update({ status: 'in_progress' })
        .eq('id', ticketId)
        .eq('status', 'open')
    }

    return {
      id: ticketMessage.id,
      ticket_id: ticketMessage.ticket_id,
      message: ticketMessage.message,
      message_type: ticketMessage.message_type,
      sender_id: ticketMessage.sender_id,
      sender_name: ticketMessage.sender_name,
      sender_email: ticketMessage.sender_email,
      is_internal: ticketMessage.is_internal,
      attachments: [],
      created_at: ticketMessage.created_at,
      updated_at: ticketMessage.updated_at
    }
  } catch (error) {
    safeLogger.error('Error adding ticket message', { error })
    return null
  }
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(
  ticketId: string,
  status: SupportTicket['status'],
  adminId: string,
  resolution?: string
): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for support tickets')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'resolved' || status === 'closed') {
      updateData.resolved_at = new Date().toISOString()
      updateData.resolved_by = adminId
      updateData.closed_at = new Date().toISOString()
      if (resolution) {
        updateData.resolution = resolution
      }
    } else if (status === 'in_progress') {
      updateData.assigned_to = adminId
      updateData.assigned_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', ticketId)

    if (error) {
      safeLogger.error('Failed to update ticket status', { error })
      return false
    }

    return true
  } catch (error) {
    safeLogger.error('Error updating ticket status', { error })
    return false
  }
}

/**
 * Get all tickets (admin only)
 */
export async function getAllTickets(
  status?: SupportTicket['status'],
  category?: SupportTicket['category'],
  priority?: SupportTicket['priority'],
  limit: number = 50,
  offset: number = 0
): Promise<SupportTicket[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for support tickets')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    let query = supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (priority) {
      query = query.eq('priority', priority)
    }

    const { data: tickets, error } = await query

    if (error) {
      safeLogger.error('Failed to fetch tickets', { error })
      return []
    }

    return tickets || []
  } catch (error) {
    safeLogger.error('Error fetching tickets', { error })
    return []
  }
}

