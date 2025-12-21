// Analytics and Event Tracking
// This module handles app event logging for analytics and monitoring

import {
  parseUTMParamsFromURL,
  classifyTrafficSource,
  getReferrer,
  type UTMParams,
} from '@/lib/analytics/traffic-source-utils'

export interface AppEvent {
  id?: string
  userId?: string
  name: string
  props: Record<string, any>
  timestamp?: Date
}

export interface EventProps {
  [key: string]: string | number | boolean | null | undefined
}

// Pre-defined event types for consistency
export const EVENT_TYPES = {
  // Authentication events
  AUTH_SIGNUP: 'auth_signup',
  AUTH_SIGNIN: 'auth_signin',
  AUTH_SIGNOUT: 'auth_signout',
  AUTH_SIGNUP_SSO: 'auth_signup_sso',
  AUTH_SIGNIN_SSO: 'auth_signin_sso',

  // Profile events
  PROFILE_CREATED: 'profile_created',
  PROFILE_UPDATED: 'profile_updated',
  PROFILE_VIEWED: 'profile_viewed',

  // Verification events
  VERIFICATION_STARTED: 'verification_started',
  VERIFICATION_COMPLETED: 'verification_completed',
  VERIFICATION_FAILED: 'verification_failed',

  // Questionnaire events
  QUESTIONNAIRE_STARTED: 'questionnaire_started',
  QUESTIONNAIRE_SECTION_STARTED: 'questionnaire_section_started',
  QUESTIONNAIRE_SECTION_COMPLETED: 'questionnaire_section_completed',
  QUESTIONNAIRE_COMPLETED: 'questionnaire_completed',
  QUESTIONNAIRE_ABANDONED: 'questionnaire_abandoned',

  // Matching events
  MATCHES_VIEWED: 'matches_viewed',
  MATCH_ACCEPTED: 'match_accepted',
  MATCH_REJECTED: 'match_rejected',
  MATCH_VIEWED: 'match_viewed',
  GROUP_SUGGESTION_VIEWED: 'group_suggestion_viewed',
  GROUP_SUGGESTION_ACCEPTED: 'group_suggestion_accepted',
  GROUP_SUGGESTION_REJECTED: 'group_suggestion_rejected',

  // Chat events
  CHAT_CREATED: 'chat_created',
  CHAT_JOINED: 'chat_joined',
  CHAT_LEFT: 'chat_left',
  MESSAGE_SENT: 'message_sent',
  MESSAGE_READ: 'message_read',
  CHAT_VIEWED: 'chat_viewed',

  // Forum events
  FORUM_POST_CREATED: 'forum_post_created',
  FORUM_POST_VIEWED: 'forum_post_viewed',
  FORUM_COMMENT_CREATED: 'forum_comment_created',
  FORUM_POST_ANONYMOUS: 'forum_post_anonymous',

  // Reporting events
  REPORT_CREATED: 'report_created',
  REPORT_RESOLVED: 'report_resolved',

  // Admin events
  ADMIN_USER_SUSPENDED: 'admin_user_suspended',
  ADMIN_USER_REMOVED: 'admin_user_removed',
  ADMIN_ANNOUNCEMENT_CREATED: 'admin_announcement_created',
  ADMIN_ANNOUNCEMENT_UPDATED: 'admin_announcement_updated',
  ADMIN_ANNOUNCEMENT_DELETED: 'admin_announcement_deleted',

  // Error events
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',

  // Feature usage events
  FEATURE_USED: 'feature_used',
  SETTINGS_CHANGED: 'settings_changed',
  LANGUAGE_CHANGED: 'language_changed',

  // Performance events
  PAGE_LOAD: 'page_load',
  API_REQUEST: 'api_request',
  DATABASE_QUERY: 'database_query'
} as const

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES]

export class EventTracker {
  private supabase: any
  private isEnabled: boolean

  constructor(supabase: any) {
    this.supabase = supabase
    this.isEnabled = process.env.ANALYTICS_ENABLED === 'true'
  }

  /**
   * Track an event
   */
  async track(event: AppEvent): Promise<void> {
    if (!this.isEnabled) {
      return
    }

    try {
      const { error } = await this.supabase
        .from('app_events')
        .insert({
          user_id: event.userId,
          name: event.name,
          props: event.props,
          created_at: event.timestamp || new Date().toISOString()
        })

      if (error) {
        console.error('Event tracking error:', error)
      }
    } catch (error) {
      console.error('Event tracking failed:', error)
    }
  }

  /**
   * Track event with automatic user ID resolution
   */
  async trackEvent(
    name: EventType | string,
    props: EventProps = {},
    userId?: string
  ): Promise<void> {
    const event: AppEvent = {
      name,
      props,
      userId
    }

    await this.track(event)
  }

  /**
   * Track user action with context
   */
  async trackUserAction(
    action: EventType | string,
    context: EventProps = {},
    userId?: string
  ): Promise<void> {
    const url = typeof window !== 'undefined' ? window.location.href : undefined
    const referrer = getReferrer()
    
    // Extract UTM parameters from URL if available
    let utmParams: UTMParams = {}
    if (url) {
      utmParams = parseUTMParamsFromURL(url)
    }
    
    // Classify traffic source
    const trafficSource = classifyTrafficSource(
      referrer,
      utmParams.utm_source,
      utmParams.utm_medium
    )

    const props = {
      ...context,
      timestamp: new Date().toISOString(),
      user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url,
      referrer,
      ...utmParams,
      traffic_source: trafficSource,
    }

    await this.trackEvent(action, props, userId)
  }

  /**
   * Track page view with UTM and traffic source attribution
   */
  async trackPageView(
    page: string,
    userId?: string,
    additionalProps: EventProps = {}
  ): Promise<void> {
    const url = typeof window !== 'undefined' ? window.location.href : page
    const referrer = getReferrer()
    
    // Extract UTM parameters from URL
    const utmParams = parseUTMParamsFromURL(url)
    
    // Classify traffic source
    const trafficSource = classifyTrafficSource(
      referrer,
      utmParams.utm_source,
      utmParams.utm_medium
    )

    await this.trackEvent(EVENT_TYPES.PAGE_LOAD, {
      page,
      url,
      referrer,
      ...utmParams,
      traffic_source: trafficSource,
      ...additionalProps
    }, userId)
  }

  /**
   * Track API request
   */
  async trackAPIRequest(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    userId?: string
  ): Promise<void> {
    await this.trackEvent(EVENT_TYPES.API_REQUEST, {
      endpoint,
      method,
      status_code: statusCode,
      duration_ms: duration,
      success: statusCode < 400
    }, userId)
  }

  /**
   * Track error
   */
  async trackError(
    error: Error | string,
    context: EventProps = {},
    userId?: string
  ): Promise<void> {
    const errorMessage = typeof error === 'string' ? error : error.message
    const errorStack = typeof error === 'string' ? undefined : error.stack

    await this.trackEvent(EVENT_TYPES.ERROR_OCCURRED, {
      error_message: errorMessage,
      error_stack: errorStack,
      ...context
    }, userId)
  }

  /**
   * Track feature usage
   */
  async trackFeatureUsage(
    feature: string,
    props: EventProps = {},
    userId?: string
  ): Promise<void> {
    await this.trackEvent(EVENT_TYPES.FEATURE_USED, {
      feature,
      ...props
    }, userId)
  }

  /**
   * Get analytics data for admin dashboard
   */
  async getAnalytics(
    startDate: Date,
    endDate: Date,
    universityId?: string,
    eventTypes?: EventType[]
  ): Promise<any[]> {
    try {
      let query = this.supabase
        .from('app_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (eventTypes && eventTypes.length > 0) {
        query = query.in('name', eventTypes)
      }

      if (universityId) {
        // Join with profiles to filter by university
        query = query
          .select(`
            *,
            profiles!inner(university_id)
          `)
          .eq('profiles.university_id', universityId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Analytics query error:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Analytics fetch failed:', error)
      return []
    }
  }

  /**
   * Get user analytics summary
   */
  async getUserAnalyticsSummary(userId: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await this.supabase
        .from('app_events')
        .select('name, props, created_at')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())

      if (error) {
        console.error('User analytics error:', error)
        return null
      }

      // Process data into summary
      const summary = {
        total_events: data?.length || 0,
        unique_features: new Set(data?.map((d: any) => d.name) || []).size,
        last_activity: data?.[data.length - 1]?.created_at,
        events_by_type: {},
        events_by_day: {}
      }

      // Group by event type
      data?.forEach((event: any) => {
        summary.events_by_type[event.name] = (summary.events_by_type[event.name] || 0) + 1
        
        const day = event.created_at.split('T')[0]
        summary.events_by_day[day] = (summary.events_by_day[day] || 0) + 1
      })

      return summary
    } catch (error) {
      console.error('User analytics summary failed:', error)
      return null
    }
  }

  /**
   * Enable/disable tracking
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }

  /**
   * Check if tracking is enabled
   */
  isTrackingEnabled(): boolean {
    return this.isEnabled
  }
}

// Helper functions for common tracking scenarios
export async function trackAuthEvent(
  event: 'signup' | 'signin' | 'signout',
  method: 'email' | 'sso' = 'email',
  userId?: string,
  additionalProps: EventProps = {}
): Promise<void> {
  const eventName = method === 'sso' ? `auth_${event}_sso` : `auth_${event}`
  await trackEvent(eventName, additionalProps, userId)
}

export async function trackQuestionnaireProgress(
  section: string,
  progress: number,
  userId?: string,
  additionalProps: EventProps = {}
): Promise<void> {
  await trackEvent(EVENT_TYPES.QUESTIONNAIRE_SECTION_COMPLETED, {
    section,
    progress,
    ...additionalProps
  }, userId)
}

export async function trackMatchInteraction(
  action: 'viewed' | 'accepted' | 'rejected',
  matchId: string,
  matchType: 'individual' | 'group',
  userId?: string,
  additionalProps: EventProps = {}
): Promise<void> {
  const eventName = matchType === 'group' ? `group_suggestion_${action}` : `match_${action}`
  await trackEvent(eventName, {
    match_id: matchId,
    match_type: matchType,
    ...additionalProps
  }, userId)
}

export async function trackChatActivity(
  action: 'created' | 'joined' | 'left' | 'message_sent' | 'message_read',
  chatId: string,
  isGroup: boolean,
  userId?: string,
  additionalProps: EventProps = {}
): Promise<void> {
  const eventName = action.startsWith('message') ? `message_${action.split('_')[1]}` : `chat_${action}`
  await trackEvent(eventName, {
    chat_id: chatId,
    is_group: isGroup,
    ...additionalProps
  }, userId)
}

// Global event tracking functions
let globalTracker: EventTracker | null = null

export function initializeEventTracker(supabase: any): void {
  globalTracker = new EventTracker(supabase)
}

export async function trackEvent(
  name: EventType | string,
  props: EventProps = {},
  userId?: string
): Promise<void> {
  if (globalTracker) {
    try {
      await globalTracker.trackEvent(name, props, userId)
    } catch (error) {
      // Silently fail - don't log errors for analytics failures
      // This is expected in server-side contexts where tracker isn't initialized
    }
  }
  // Silently return if tracker isn't initialized
  // This is expected in server-side contexts or before client-side initialization
}

export async function trackUserAction(
  action: EventType | string,
  context: EventProps = {},
  userId?: string
): Promise<void> {
  if (globalTracker) {
    try {
      await globalTracker.trackUserAction(action, context, userId)
    } catch (error) {
      // Silently fail - don't log errors for analytics failures
    }
  }
  // Silently return if tracker isn't initialized
}

export async function trackPageView(
  page: string,
  userId?: string,
  additionalProps: EventProps = {}
): Promise<void> {
  if (globalTracker) {
    try {
      await globalTracker.trackPageView(page, userId, additionalProps)
    } catch (error) {
      // Silently fail - don't log errors for analytics failures
    }
  }
  // Silently return if tracker isn't initialized
}

export async function trackError(
  error: Error | string,
  context: EventProps = {},
  userId?: string
): Promise<void> {
  if (globalTracker) {
    try {
      await globalTracker.trackError(error, context, userId)
    } catch (trackingError) {
      // Silently fail - don't log errors for analytics failures
    }
  }
  // Silently return if tracker isn't initialized
}

export function getEventTracker(): EventTracker | null {
  return globalTracker
}
