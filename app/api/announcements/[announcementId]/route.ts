import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { recordAnnouncementView, dismissAnnouncement, recordAnnouncementAction } from '@/lib/announcements/announcements'
import { safeLogger } from '@/lib/utils/logger'

/**
 * POST /api/announcements/[announcementId]/view
 * Record announcement view
 */
export async function POST(
  request: Request,
  { params }: { params: { announcementId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json().catch(() => ({}))
    const { action } = body

    if (action === 'dismiss') {
      // Dismiss announcement
      const dismissed = await dismissAnnouncement(params.announcementId, user.id)

      if (!dismissed) {
        return NextResponse.json(
          { error: 'Failed to dismiss announcement' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Announcement dismissed'
      })
    } else if (action === 'primary' || action === 'secondary') {
      // Record action click
      const recorded = await recordAnnouncementAction(params.announcementId, user.id, action)

      if (!recorded) {
        return NextResponse.json(
          { error: 'Failed to record announcement action' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Announcement action recorded'
      })
    } else {
      // Record view
      const viewed = await recordAnnouncementView(params.announcementId, user.id)

      if (!viewed) {
        return NextResponse.json(
          { error: 'Failed to record announcement view' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Announcement view recorded'
      })
    }
  } catch (error) {
    safeLogger.error('Error handling announcement action', { error })
    return NextResponse.json(
      { error: 'Failed to handle announcement action', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

