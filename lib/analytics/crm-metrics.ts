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
    // Get from user_profiles to filter by university
    let totalUsersQuery = supabase
      .from('user_profiles')
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
        .from('user_profiles')
        .select('user_id')
        .eq('university_id', universityId)
        .in('user_id', Array.from(activeUserIds))

      const universityUserIds = new Set((userProfiles || []).map(p => p.user_id))
      activeUserIds = new Set(Array.from(activeUserIds).filter(id => universityUserIds.has(id)))
    }

    const activeUsers = activeUserIds.size

    // Get new users (users who signed up in period)
    // Get from user_profiles to filter by university
    let newUsersQuery = supabase
      .from('user_profiles')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString())

    if (universityId) {
      newUsersQuery = newUsersQuery.eq('university_id', universityId)
    }

    const { count: newUsers, error: newError } = await newUsersQuery

    if (newError) {
      safeLogger.error('Failed to count new users', { error: newError })
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
        .from('user_profiles')
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
        .from('user_profiles')
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
      .from('user_profiles')
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

    // Calculate engagement score (simplified)
    const engagementScore = totalUsers && totalUsers > 0
      ? (engagedUsers / totalUsers) * 100
      : 0

    // Calculate average session duration (simplified)
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_journey_events')
      .select('session_id, event_timestamp, session_duration_seconds')
      .gte('event_timestamp', periodStart.toISOString())
      .lte('event_timestamp', periodEnd.toISOString())
      .not('session_duration_seconds', 'is', null)

    if (sessionsError) {
      safeLogger.error('Failed to fetch sessions', { error: sessionsError })
    }

    const averageSessionDuration = sessions && sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.session_duration_seconds || 0), 0) / sessions.length
      : 0

    // Calculate average sessions per user
    const sessionCounts = new Map<string, number>()
    for (const session of sessions || []) {
      if (session.session_id) {
        sessionCounts.set(session.session_id, (sessionCounts.get(session.session_id) || 0) + 1)
      }
    }

    const averageSessionsPerUser = totalUsers && totalUsers > 0
      ? sessionCounts.size / totalUsers
      : 0

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

