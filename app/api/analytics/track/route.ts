import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { trackEvent } from '@/lib/events'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { event, props, user_id } = body

    if (!event) {
      return NextResponse.json({ error: 'Missing event name' }, { status: 400 })
    }

    // Use provided user_id or fall back to authenticated user
    const userId = user_id || user.id

    // Track the event
    await trackEvent(event, props || {}, userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    // Don't fail the request if analytics fails
    return NextResponse.json({ success: false, error: 'Analytics tracking failed' }, { status: 500 })
  }
}

