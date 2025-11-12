import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAllTickets } from '@/lib/support/tickets'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/admin/support/tickets
 * Get all support tickets (admin only)
 */
export async function GET(request: Request) {
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

    // Get filters from query params
    const url = new URL(request.url)
    const status = url.searchParams.get('status') as 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled' | null
    const priority = url.searchParams.get('priority') as 'low' | 'medium' | 'high' | 'urgent' | null
    const category = url.searchParams.get('category') as 'technical' | 'account' | 'matching' | 'payment' | 'safety' | 'other' | null
    const search = url.searchParams.get('search') || ''

    // Get tickets
    const tickets = await getAllTickets(status || undefined, category || undefined, priority || undefined, 100, 0)

    // Filter by search query if provided
    let filteredTickets = tickets
    if (search) {
      filteredTickets = tickets.filter(ticket => 
        ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
        ticket.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
        ticket.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Get user information for each ticket
    const ticketIds = filteredTickets.map(t => t.user_id)
    const { data: users } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .in('id', ticketIds)

    const usersMap = new Map((users || []).map(u => [u.id, u]))

    // Add user information to tickets
    const ticketsWithUsers = filteredTickets.map(ticket => ({
      ...ticket,
      user: usersMap.get(ticket.user_id)
    }))

    return NextResponse.json({
      success: true,
      data: ticketsWithUsers
    })
  } catch (error) {
    safeLogger.error('Error fetching support tickets', { error })
    return NextResponse.json(
      { error: 'Failed to fetch support tickets', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

