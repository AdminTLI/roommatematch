// CRM Metrics Calculation
// This module calculates user lifecycle and engagement metrics

import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

export interface CRMMetrics {
  totalUsers: number
  activeUsers: number
  newUsers: number
  churnedUsers: number
  engagedUsers: number
  lifecycleStage: Record<string, number> // signup, onboarding, active, churned
  engagementScore: number
  averageSessionDuration: number
  averageSessionsPerUser: number
  period: {
    start: string
    end: string
  }
}

export interface UserLifecycleStage {
  user_id: string
  stage: 'signup' | 'onboarding' | 'active' | 'churned' | 'engaged'
  stage_date: string
  metadata?: Record<string, any>
}

/**
 * Calculate CRM metrics
 */
export async function calculateCRMMetrics(
  universityId?: string,
  periodDays: number = 30
): Promise<CRMMetrics> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for CRM metrics')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000)
    const periodEnd = new Date()

    // Get total users
    // Get from profiles to filter by university
    let totalUsersQuery = supabase
      .from('profiles')
      .select('user_id', { count: 'exact', head: true })

    if (universityId) {
      totalUsersQuery = totalUsersQuery.eq('university_id', universityId)
    }

    const { count: totalUsers, error: totalError } = await totalUsersQuery

    if (totalError) {
      safeLogger.error('Failed to count total users', { error: totalError })
    }

    // Get active users (users with activity in last 30 days)
    const activeStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Get unique active users
    let activeUsersQuery = supabase
      .from('user_journey_events')
      .select('user_id')
      .gte('event_timestamp', activeStart.toISOString())
      .lte('event_timestamp', periodEnd.toISOString())

    const { data: activeEvents, error: activeError } = await activeUsersQuery

    if (activeError) {
      safeLogger.error('Failed to fetch active users', { error: activeError })
    }

    // Filter by university if provided
    let activeUserIds = new Set((activeEvents || []).map(e => e.user_id))
    if (universityId && activeUserIds.size > 0) {
      // Get user profiles to filter by university
      const { data: userProfiles } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('university_id', universityId)
        .in('user_id', Array.from(activeUserIds))

      const universityUserIds = new Set((userProfiles || []).map(p => p.user_id))
      activeUserIds = new Set(Array.from(activeUserIds).filter(id => universityUserIds.has(id)))
    }

    const activeUsers = activeUserIds.size

    // Get new users (users who signed up in period)
    // Query users table first, then filter by profiles.university_id
    const { data: newUsersData, error: newUsersError } = await supabase
      .from('users')
      .select('id')
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString())
      .eq('is_active', true)

    let newUserIds = (newUsersData || []).map(u => u.id)
    
    // Filter by university if provided
    if (universityId && newUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('university_id', universityId)
        .in('user_id', newUserIds)
      
      newUserIds = (profiles || []).map(p => p.user_id)
    }

    const newUsers = newUserIds.length

    if (newUsersError) {
      safeLogger.error('Failed to count new users', { error: newUsersError })
    }

    // Get churned users (users with no activity in last 90 days but had activity before)
    // This is a simplified calculation - in production, you'd want more sophisticated churn detection
    const churnStart = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    
    // Get all users who had activity before churn period but no activity in last 30 days
    // Get users with activity before churn period
    const { data: oldActivity } = await supabase
      .from('user_journey_events')
      .select('user_id')
      .lt('event_timestamp', churnStart.toISOString())

    const oldActiveUserIds = new Set((oldActivity || []).map(e => e.user_id))
    
    // Get users with recent activity (last 30 days)
    const recentStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const { data: recentActivity } = await supabase
      .from('user_journey_events')
      .select('user_id')
      .gte('event_timestamp', recentStart.toISOString())

    const recentActiveUserIds = new Set((recentActivity || []).map(e => e.user_id))
    
    // Churned users = users with old activity but no recent activity
    let churnedUserIds = new Set(
      Array.from(oldActiveUserIds).filter(id => !recentActiveUserIds.has(id))
    )
    
    // Filter by university if provided
    if (universityId && churnedUserIds.size > 0) {
      const { data: userProfiles } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('university_id', universityId)
        .in('user_id', Array.from(churnedUserIds))

      const universityUserIds = new Set((userProfiles || []).map(p => p.user_id))
      churnedUserIds = new Set(Array.from(churnedUserIds).filter(id => universityUserIds.has(id)))
    }
    
    const churnedUsers = churnedUserIds.size

    // Get engaged users (users with multiple sessions or matches)
    let engagedUsersQuery = supabase
      .from('user_journey_events')
      .select('user_id')
      .gte('event_timestamp', periodStart.toISOString())
      .lte('event_timestamp', periodEnd.toISOString())

    const { data: engagedEvents, error: engagedError } = await engagedUsersQuery

    if (engagedError) {
      safeLogger.error('Failed to fetch engaged users', { error: engagedError })
    }

    // Count unique engaged users
    let engagedUserIds = new Set((engagedEvents || []).map(e => e.user_id))
    
    // Filter by university if provided
    if (universityId && engagedUserIds.size > 0) {
      // Get user profiles to filter by university
      const { data: userProfiles } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('university_id', universityId)
        .in('user_id', Array.from(engagedUserIds))

      const universityUserIds = new Set((userProfiles || []).map(p => p.user_id))
      engagedUserIds = new Set(Array.from(engagedUserIds).filter(id => universityUserIds.has(id)))
    }
    
    const engagedUsers = engagedUserIds.size

    // Calculate lifecycle stages
    const lifecycleStage: Record<string, number> = {
      signup: 0,
      onboarding: 0,
      active: 0,
      churned: 0,
      engaged: 0
    }

    // Get users by lifecycle stage
    // Get user profiles and verifications
    let usersQuery = supabase
      .from('profiles')
      .select('user_id, university_id, created_at, verification_status')

    if (universityId) {
      usersQuery = usersQuery.eq('university_id', universityId)
    }

    const { data: userProfiles, error: usersError } = await usersQuery

    if (usersError) {
      safeLogger.error('Failed to fetch user profiles', { error: usersError })
    } else if (userProfiles) {
      // Get onboarding completion status from onboarding_sections
      const userIds = userProfiles.map(up => up.user_id)
      
      const { data: onboardingData } = await supabase
        .from('onboarding_sections')
        .select('user_id, section, completed_at')
        .in('user_id', userIds)
        .eq('section', 'complete')

      const completedOnboarding = new Set(
        (onboardingData || [])
          .filter(o => o.completed_at)
          .map(o => o.user_id)
      )

      // Get user activity
      const { data: userActivity } = await supabase
        .from('user_journey_events')
        .select('user_id, event_timestamp')
        .in('user_id', userIds)
        .gte('event_timestamp', activeStart.toISOString())

      const activeUserIds = new Set((userActivity || []).map(a => a.user_id))

      for (const profile of userProfiles) {
        const hasCompletedOnboarding = completedOnboarding.has(profile.user_id)
        const isVerified = profile.verification_status === 'verified'
        const isActive = activeUserIds.has(profile.user_id)

        if (!hasCompletedOnboarding && !isVerified) {
          lifecycleStage.signup++
        } else if (!hasCompletedOnboarding) {
          lifecycleStage.onboarding++
        } else if (isActive) {
          lifecycleStage.active++
          if (engagedUserIds.has(profile.user_id)) {
            lifecycleStage.engaged++
          }
        } else {
          lifecycleStage.churned++
        }
      }
    }

    // Get all user journey events for the period
    let eventsQuery = supabase
      .from('user_journey_events')
      .select('user_id, session_id, event_timestamp, session_duration_seconds')
      .gte('event_timestamp', periodStart.toISOString())
      .lte('event_timestamp', periodEnd.toISOString())

    if (universityId) {
      // We'll filter by university after getting events
      eventsQuery = eventsQuery.not('user_id', 'is', null)
    }

    const { data: allEvents, error: eventsError } = await eventsQuery

    if (eventsError) {
      safeLogger.error('Failed to fetch user journey events', { error: eventsError })
    }

    // Filter by university if provided
    let filteredEvents = allEvents || []
    if (universityId && filteredEvents.length > 0) {
      const userIds = new Set(filteredEvents.map(e => e.user_id).filter(Boolean))
      if (userIds.size > 0) {
        const { data: userProfiles } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('university_id', universityId)
          .in('user_id', Array.from(userIds))

        const universityUserIds = new Set((userProfiles || []).map(p => p.user_id))
        filteredEvents = filteredEvents.filter(e => !e.user_id || universityUserIds.has(e.user_id))
      }
    }

    // Calculate session durations from event timestamps
    // Group events by session_id
    const sessionsBySessionId = new Map<string, Array<{ event_timestamp: string; session_duration_seconds?: number }>>()
    for (const event of filteredEvents) {
      if (event.session_id) {
        if (!sessionsBySessionId.has(event.session_id)) {
          sessionsBySessionId.set(event.session_id, [])
        }
        sessionsBySessionId.get(event.session_id)!.push({
          event_timestamp: event.event_timestamp,
          session_duration_seconds: event.session_duration_seconds
        })
      }
    }

    // Calculate session durations
    const sessionDurations: number[] = []
    for (const [sessionId, events] of Array.from(sessionsBySessionId.entries())) {
      if (events.length === 0) continue

      // Sort events by timestamp
      events.sort((a: { event_timestamp: string; session_duration_seconds?: number }, b: { event_timestamp: string; session_duration_seconds?: number }) => 
        new Date(a.event_timestamp).getTime() - new Date(b.event_timestamp).getTime()
      )

      // Use stored duration if available, otherwise calculate from timestamps
      let duration = events[0].session_duration_seconds
      if (!duration || duration === 0) {
        const firstEvent = new Date(events[0].event_timestamp)
        const lastEvent = new Date(events[events.length - 1].event_timestamp)
        duration = Math.round((lastEvent.getTime() - firstEvent.getTime()) / 1000)
      }

      // Only count sessions with meaningful duration (at least 5 seconds)
      if (duration >= 5) {
        sessionDurations.push(duration)
      }
    }

    // Calculate average session duration in minutes
    const averageSessionDuration = sessionDurations.length > 0
      ? sessionDurations.reduce((sum, d) => sum + d, 0) / sessionDurations.length / 60 // Convert to minutes
      : 0

    // Calculate average sessions per user
    // Group sessions by user_id
    const sessionsByUserId = new Map<string, Set<string>>()
    for (const event of filteredEvents) {
      if (event.user_id && event.session_id) {
        if (!sessionsByUserId.has(event.user_id)) {
          sessionsByUserId.set(event.user_id, new Set())
        }
        sessionsByUserId.get(event.user_id)!.add(event.session_id)
      }
    }

    // Calculate total unique sessions
    const totalSessions = sessionsByUserId.size > 0
      ? Array.from(sessionsByUserId.values()).reduce((sum, sessions) => sum + sessions.size, 0)
      : 0

    // Get unique users who have sessions
    const usersWithSessions = sessionsByUserId.size

    // Average sessions per user (only for users who have sessions)
    const averageSessionsPerUser = usersWithSessions > 0
      ? totalSessions / usersWithSessions
      : 0

    // Calculate engagement score based on multiple factors
    // Engagement = (active users / total users) * 100
    // But also factor in session frequency and duration
    const baseEngagementScore = totalUsers && totalUsers > 0
      ? (activeUsers / totalUsers) * 100
      : 0

    // Boost engagement score based on session activity
    // Users with multiple sessions or longer sessions are more engaged
    const sessionActivityBoost = usersWithSessions > 0 && totalUsers && totalUsers > 0
      ? (averageSessionsPerUser / 5) * 20 // Cap boost at 20 points for 5+ sessions per user
      : 0

    const engagementScore = Math.min(100, baseEngagementScore + sessionActivityBoost)

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      newUsers: newUsers || 0,
      churnedUsers: churnedUsers || 0,
      engagedUsers,
      lifecycleStage,
      engagementScore,
      averageSessionDuration,
      averageSessionsPerUser,
      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString()
      }
    }
  } catch (error) {
    safeLogger.error('Error calculating CRM metrics', { error })
    throw error
  }
}

/**
 * Store CRM metrics in analytics_metrics table
 */
export async function storeCRMMetrics(
  metrics: CRMMetrics,
  universityId?: string
): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for CRM metrics')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Store overall CRM metrics
    const { error: metricError } = await supabase
      .from('analytics_metrics')
      .insert({
        metric_name: 'crm_total_users',
        metric_category: 'user_engagement',
        metric_type: 'count',
        metric_value: metrics.totalUsers,
        period_start: metrics.period.start,
        period_end: metrics.period.end,
        granularity: 'daily',
        university_id: universityId,
        filter_criteria: {
          activeUsers: metrics.activeUsers,
          newUsers: metrics.newUsers,
          churnedUsers: metrics.churnedUsers,
          engagedUsers: metrics.engagedUsers,
          lifecycleStage: metrics.lifecycleStage,
          engagementScore: metrics.engagementScore,
          averageSessionDuration: metrics.averageSessionDuration,
          averageSessionsPerUser: metrics.averageSessionsPerUser
        },
        data_source: 'crm_metrics_calculator',
        calculation_method: 'user_lifecycle_analysis',
        confidence_level: 1.0
      })

    if (metricError) {
      safeLogger.error('Failed to store CRM metrics', { error: metricError })
      return false
    }

    // Store engagement score
    const { error: engagementError } = await supabase
      .from('analytics_metrics')
      .insert({
        metric_name: 'crm_engagement_score',
        metric_category: 'user_engagement',
        metric_type: 'percentage',
        metric_value: metrics.engagementScore,
        period_start: metrics.period.start,
        period_end: metrics.period.end,
        granularity: 'daily',
        university_id: universityId,
        filter_criteria: {
          engagedUsers: metrics.engagedUsers,
          totalUsers: metrics.totalUsers
        },
        data_source: 'crm_metrics_calculator',
        calculation_method: 'user_engagement_analysis',
        confidence_level: 1.0
      })

    if (engagementError) {
      safeLogger.error('Failed to store engagement score', { error: engagementError })
    }

    // Store lifecycle stage metrics
    for (const [stage, count] of Object.entries(metrics.lifecycleStage)) {
      const { error: stageError } = await supabase
        .from('analytics_metrics')
        .insert({
          metric_name: `crm_lifecycle_${stage}`,
          metric_category: 'user_engagement',
          metric_type: 'count',
          metric_value: count,
          period_start: metrics.period.start,
          period_end: metrics.period.end,
          granularity: 'daily',
          university_id: universityId,
          filter_criteria: {
            stage,
            totalUsers: metrics.totalUsers
          },
          data_source: 'crm_metrics_calculator',
          calculation_method: 'user_lifecycle_analysis',
          confidence_level: 1.0
        })

      if (stageError) {
        safeLogger.error(`Failed to store lifecycle stage ${stage}`, { error: stageError })
      }
    }

    return true
  } catch (error) {
    safeLogger.error('Error storing CRM metrics', { error })
    return false
  }
}

/**
 * Get CRM metrics for dashboard
 */
export async function getCRMMetrics(
  universityId?: string,
  periodDays: number = 30
): Promise<CRMMetrics | null> {
  try {
    const metrics = await calculateCRMMetrics(universityId, periodDays)
    return metrics
  } catch (error) {
    safeLogger.error('Error fetching CRM metrics', { error })
    return null
  }
}

