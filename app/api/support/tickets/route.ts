import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSupportTicket, getUserTickets } from '@/lib/support/tickets'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/support/tickets
 * Get user's support tickets
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get status from query params
    const url = new URL(request.url)
    const status = url.searchParams.get('status') as 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled' | null

    // Get user's tickets
    const tickets = await getUserTickets(user.id, status || undefined)

    return NextResponse.json({
      success: true,
      data: tickets
    })
  } catch (error) {
    safeLogger.error('Error fetching support tickets', { error })
    return NextResponse.json(
      { error: 'Failed to fetch support tickets', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/support/tickets
 * Create a new support ticket
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's university
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('university_id')
      .eq('user_id', user.id)
      .maybeSingle()

    // Parse request body
    const body = await request.json()
    const { subject, description, category, priority, tags, metadata } = body

    // Validate required fields
    if (!subject || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, description, category' },
        { status: 400 }
      )
    }

    // Create ticket
    const ticket = await createSupportTicket(
      user.id,
      {
        subject,
        description,
        category,
        priority,
        tags,
        metadata
      },
      userProfile?.university_id
    )

    if (!ticket) {
      return NextResponse.json(
        { error: 'Failed to create support ticket' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: ticket
    }, { status: 201 })
  } catch (error) {
    safeLogger.error('Error creating support ticket', { error })
    return NextResponse.json(
      { error: 'Failed to create support ticket', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

