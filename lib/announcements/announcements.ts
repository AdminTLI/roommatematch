// In-Product Announcements System
// This module handles announcements and user interactions

import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

export interface Announcement {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error' | 'promotion'
  is_active: boolean
  priority: number
  university_id?: string
  user_segments?: string[]
  filter_criteria?: Record<string, any>
  display_type: 'banner' | 'modal' | 'toast' | 'inline'
  position: 'top' | 'bottom' | 'center'
  dismissible: boolean
  auto_dismiss_seconds?: number
  primary_action_label?: string
  primary_action_url?: string
  secondary_action_label?: string
  secondary_action_url?: string
  start_date?: string
  end_date?: string
  metadata?: Record<string, any>
  created_by?: string
  created_at: string
  updated_at: string
}

export interface AnnouncementView {
  id: string
  announcement_id: string
  user_id: string
  viewed_at: string
  dismissed: boolean
  dismissed_at?: string
  action_clicked?: 'primary' | 'secondary'
  action_clicked_at?: string
  created_at: string
  updated_at: string
}

/**
 * Get active announcements for user
 */
export async function getActiveAnnouncements(
  userId: string,
  universityId?: string
): Promise<Announcement[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for announcements')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const now = new Date().toISOString()

    // Get active announcements
    let query = supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', now)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    // Filter by university if provided
    if (universityId) {
      query = query.or(`university_id.is.null,university_id.eq.${universityId}`)
    } else {
      query = query.is('university_id', null)
    }

    const { data: announcements, error } = await query

    if (error) {
      safeLogger.error('Failed to fetch announcements', { error })
      return []
    }

    // Get user's viewed announcements
    const { data: views, error: viewsError } = await supabase
      .from('announcement_views')
      .select('announcement_id, dismissed')
      .eq('user_id', userId)

    if (viewsError) {
      safeLogger.error('Failed to fetch announcement views', { error: viewsError })
    }

    // Filter out dismissed announcements
    const dismissedIds = new Set(
      (views || [])
        .filter(v => v.dismissed)
        .map(v => v.announcement_id)
    )

    return (announcements || [])
      .filter(announcement => !dismissedIds.has(announcement.id))
      .map(announcement => ({
        id: announcement.id,
        title: announcement.title,
        message: announcement.message,
        type: announcement.type,
        is_active: announcement.is_active,
        priority: announcement.priority,
        university_id: announcement.university_id,
        user_segments: announcement.user_segments,
        filter_criteria: announcement.filter_criteria,
        display_type: announcement.display_type,
        position: announcement.position,
        dismissible: announcement.dismissible,
        auto_dismiss_seconds: announcement.auto_dismiss_seconds,
        primary_action_label: announcement.primary_action_label,
        primary_action_url: announcement.primary_action_url,
        secondary_action_label: announcement.secondary_action_label,
        secondary_action_url: announcement.secondary_action_url,
        start_date: announcement.start_date,
        end_date: announcement.end_date,
        metadata: announcement.metadata,
        created_by: announcement.created_by,
        created_at: announcement.created_at,
        updated_at: announcement.updated_at
      }))
  } catch (error) {
    safeLogger.error('Error fetching active announcements', { error })
    return []
  }
}

/**
 * Record announcement view
 */
export async function recordAnnouncementView(
  announcementId: string,
  userId: string
): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for announcements')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if view already exists
    const { data: existingView } = await supabase
      .from('announcement_views')
      .select('id')
      .eq('announcement_id', announcementId)
      .eq('user_id', userId)
      .maybeSingle()

    if (existingView) {
      // Update viewed_at timestamp
      const { error } = await supabase
        .from('announcement_views')
        .update({
          viewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingView.id)

      if (error) {
        safeLogger.error('Failed to update announcement view', { error })
        return false
      }
    } else {
      // Create new view
      const { error } = await supabase
        .from('announcement_views')
        .insert({
          announcement_id: announcementId,
          user_id: userId,
          viewed_at: new Date().toISOString()
        })

      if (error) {
        safeLogger.error('Failed to create announcement view', { error })
        return false
      }
    }

    return true
  } catch (error) {
    safeLogger.error('Error recording announcement view', { error })
    return false
  }
}

/**
 * Dismiss announcement
 */
export async function dismissAnnouncement(
  announcementId: string,
  userId: string
): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for announcements')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if view exists
    const { data: existingView } = await supabase
      .from('announcement_views')
      .select('id')
      .eq('announcement_id', announcementId)
      .eq('user_id', userId)
      .maybeSingle()

    if (existingView) {
      // Update view to dismissed
      const { error } = await supabase
        .from('announcement_views')
        .update({
          dismissed: true,
          dismissed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingView.id)

      if (error) {
        safeLogger.error('Failed to dismiss announcement', { error })
        return false
      }
    } else {
      // Create new view with dismissed = true
      const { error } = await supabase
        .from('announcement_views')
        .insert({
          announcement_id: announcementId,
          user_id: userId,
          dismissed: true,
          dismissed_at: new Date().toISOString(),
          viewed_at: new Date().toISOString()
        })

      if (error) {
        safeLogger.error('Failed to create dismissed announcement view', { error })
        return false
      }
    }

    return true
  } catch (error) {
    safeLogger.error('Error dismissing announcement', { error })
    return false
  }
}

/**
 * Record announcement action click
 */
export async function recordAnnouncementAction(
  announcementId: string,
  userId: string,
  action: 'primary' | 'secondary'
): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for announcements')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if view exists
    const { data: existingView } = await supabase
      .from('announcement_views')
      .select('id')
      .eq('announcement_id', announcementId)
      .eq('user_id', userId)
      .maybeSingle()

    if (existingView) {
      // Update view with action click
      const { error } = await supabase
        .from('announcement_views')
        .update({
          action_clicked: action,
          action_clicked_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingView.id)

      if (error) {
        safeLogger.error('Failed to record announcement action', { error })
        return false
      }
    } else {
      // Create new view with action click
      const { error } = await supabase
        .from('announcement_views')
        .insert({
          announcement_id: announcementId,
          user_id: userId,
          action_clicked: action,
          action_clicked_at: new Date().toISOString(),
          viewed_at: new Date().toISOString()
        })

      if (error) {
        safeLogger.error('Failed to create announcement view with action', { error })
        return false
      }
    }

    return true
  } catch (error) {
    safeLogger.error('Error recording announcement action', { error })
    return false
  }
}

/**
 * Create announcement (admin only)
 */
export async function createAnnouncement(
  data: {
    title: string
    message: string
    type: Announcement['type']
    is_active?: boolean
    priority?: number
    university_id?: string
    user_segments?: string[]
    filter_criteria?: Record<string, any>
    display_type?: Announcement['display_type']
    position?: Announcement['position']
    dismissible?: boolean
    auto_dismiss_seconds?: number
    primary_action_label?: string
    primary_action_url?: string
    secondary_action_label?: string
    secondary_action_url?: string
    start_date?: string
    end_date?: string
    metadata?: Record<string, any>
  },
  createdBy: string
): Promise<Announcement | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for announcements')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Create announcement
    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert({
        title: data.title,
        message: data.message,
        type: data.type,
        is_active: data.is_active !== undefined ? data.is_active : true,
        priority: data.priority || 0,
        university_id: data.university_id,
        user_segments: data.user_segments,
        filter_criteria: data.filter_criteria,
        display_type: data.display_type || 'banner',
        position: data.position || 'top',
        dismissible: data.dismissible !== undefined ? data.dismissible : true,
        auto_dismiss_seconds: data.auto_dismiss_seconds,
        primary_action_label: data.primary_action_label,
        primary_action_url: data.primary_action_url,
        secondary_action_label: data.secondary_action_label,
        secondary_action_url: data.secondary_action_url,
        start_date: data.start_date,
        end_date: data.end_date,
        metadata: data.metadata,
        created_by: createdBy
      })
      .select()
      .single()

    if (error) {
      safeLogger.error('Failed to create announcement', { error })
      return null
    }

    return {
      id: announcement.id,
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      is_active: announcement.is_active,
      priority: announcement.priority,
      university_id: announcement.university_id,
      user_segments: announcement.user_segments,
      filter_criteria: announcement.filter_criteria,
      display_type: announcement.display_type,
      position: announcement.position,
      dismissible: announcement.dismissible,
      auto_dismiss_seconds: announcement.auto_dismiss_seconds,
      primary_action_label: announcement.primary_action_label,
      primary_action_url: announcement.primary_action_url,
      secondary_action_label: announcement.secondary_action_label,
      secondary_action_url: announcement.secondary_action_url,
      start_date: announcement.start_date,
      end_date: announcement.end_date,
      metadata: announcement.metadata,
      created_by: announcement.created_by,
      created_at: announcement.created_at,
      updated_at: announcement.updated_at
    }
  } catch (error) {
    safeLogger.error('Error creating announcement', { error })
    return null
  }
}

