import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActiveAnnouncements, createAnnouncement } from '@/lib/announcements/announcements'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/announcements
 * Get active announcements for user
 */
export async function GET(request: Request) {
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

    // Get active announcements
    const announcements = await getActiveAnnouncements(user.id, userProfile?.university_id)

    return NextResponse.json({
      success: true,
      data: announcements
    })
  } catch (error) {
    safeLogger.error('Error fetching announcements', { error })
    return NextResponse.json(
      { error: 'Failed to fetch announcements', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/announcements
 * Create announcement (admin only)
 */
export async function POST(request: Request) {
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
    const {
      title,
      message,
      type,
      is_active,
      priority,
      university_id,
      user_segments,
      filter_criteria,
      display_type,
      position,
      dismissible,
      auto_dismiss_seconds,
      primary_action_label,
      primary_action_url,
      secondary_action_label,
      secondary_action_url,
      start_date,
      end_date,
      metadata
    } = body

    // Validate required fields
    if (!title || !message || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, message, type' },
        { status: 400 }
      )
    }

    // Create announcement
    const announcement = await createAnnouncement(
      {
        title,
        message,
        type,
        is_active,
        priority,
        university_id: university_id || adminData.university_id,
        user_segments,
        filter_criteria,
        display_type,
        position,
        dismissible,
        auto_dismiss_seconds,
        primary_action_label,
        primary_action_url,
        secondary_action_label,
        secondary_action_url,
        start_date,
        end_date,
        metadata
      },
      user.id
    )

    if (!announcement) {
      return NextResponse.json(
        { error: 'Failed to create announcement' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: announcement
    }, { status: 201 })
  } catch (error) {
    safeLogger.error('Error creating announcement', { error })
    return NextResponse.json(
      { error: 'Failed to create announcement', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

