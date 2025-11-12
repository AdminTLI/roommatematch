// Security Monitoring System
// This module monitors security events, tracks suspicious activity, and generates alerts

import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'
import { sendAlert } from '@/lib/monitoring/alerts'

export interface SecurityEvent {
  id: string
  event_type: 'failed_login' | 'suspicious_activity' | 'api_key_usage' | 'rls_violation' | 'verification_failure' | 'rate_limit_exceeded'
  user_id?: string
  ip_address?: string
  details: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
}

export interface SecurityMetrics {
  failedLoginAttempts: number
  suspiciousActivities: number
  rlsViolations: number
  verificationFailures: number
  rateLimitExceeded: number
  period: {
    start: string
    end: string
  }
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  eventType: SecurityEvent['event_type'],
  details: Record<string, any>,
  severity: SecurityEvent['severity'] = 'medium',
  userId?: string,
  ipAddress?: string
): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for security monitoring')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Store security event in analytics_metrics or create security_events table
    // For now, store in analytics_metrics with category 'security_incidents'
    const now = new Date()
    const periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const { error } = await supabase
      .from('analytics_metrics')
      .insert({
        metric_name: `security_event_${eventType}`,
        metric_category: 'safety_incidents',
        metric_type: 'count',
        metric_value: 1,
        period_start: periodStart.toISOString(),
        period_end: now.toISOString(),
        granularity: 'hourly',
        filter_criteria: {
          event_type: eventType,
          user_id: userId,
          ip_address: ipAddress,
          details: details,
          severity: severity
        },
        data_source: 'security_monitoring',
        calculation_method: 'event_logging',
        confidence_level: 1.0
      })

    if (error) {
      safeLogger.error('Failed to log security event', { error, eventType })
      return false
    }

    // Check if alert should be triggered
    if (severity === 'critical' || severity === 'high') {
      await sendAlert(
        'security',
        `Security Event: ${eventType}`,
        `Security event detected: ${eventType}. Severity: ${severity}. Details: ${JSON.stringify(details)}`,
        severity,
        {
          event_type: eventType,
          user_id: userId,
          ip_address: ipAddress,
          details: details
        }
      )
    }

    safeLogger.info('Security event logged', { eventType, severity, userId })
    return true
  } catch (error) {
    safeLogger.error('Error logging security event', { error, eventType })
    return false
  }
}

/**
 * Track failed login attempts
 */
export async function trackFailedLogin(
  email: string,
  ipAddress: string,
  reason: string = 'Invalid credentials'
): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for security monitoring')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check recent failed login attempts from same IP
    const periodStart = new Date(Date.now() - 60 * 60 * 1000) // Last hour

    const { data: recentAttempts, error: checkError } = await supabase
      .from('analytics_metrics')
      .select('metric_value, filter_criteria')
      .eq('metric_name', 'security_event_failed_login')
      .eq('filter_criteria->>ip_address', ipAddress)
      .gte('period_start', periodStart.toISOString())
      .order('period_end', { ascending: false })
      .limit(10)

    if (checkError) {
      safeLogger.error('Failed to check recent login attempts', { error: checkError })
    }

    const attemptCount = recentAttempts?.length || 0
    const totalAttempts = recentAttempts?.reduce((sum, m) => sum + (m.metric_value || 0), 0) || 0

    // Log the event
    await logSecurityEvent(
      'failed_login',
      {
        email,
        reason,
        attempt_count: totalAttempts + 1
      },
      totalAttempts >= 5 ? 'high' : totalAttempts >= 3 ? 'medium' : 'low',
      undefined,
      ipAddress
    )

    // Alert if multiple failed attempts from same IP
    if (totalAttempts >= 5) {
      await sendAlert(
        'security',
        'Multiple Failed Login Attempts',
        `Multiple failed login attempts (${totalAttempts + 1}) detected from IP ${ipAddress}. Possible brute force attack.`,
        'high',
        {
          ip_address: ipAddress,
          attempt_count: totalAttempts + 1,
          email
        }
      )
    }

    return true
  } catch (error) {
    safeLogger.error('Error tracking failed login', { error })
    return false
  }
}

/**
 * Track suspicious activity
 */
export async function trackSuspiciousActivity(
  activityType: string,
  details: Record<string, any>,
  userId?: string,
  ipAddress?: string
): Promise<boolean> {
  return logSecurityEvent(
    'suspicious_activity',
    {
      activity_type: activityType,
      ...details
    },
    'high',
    userId,
    ipAddress
  )
}

/**
 * Track RLS policy violations
 */
export async function trackRLSViolation(
  table: string,
  operation: string,
  userId?: string,
  details: Record<string, any> = {}
): Promise<boolean> {
  return logSecurityEvent(
    'rls_violation',
    {
      table,
      operation,
      ...details
    },
    'high',
    userId
  )
}

/**
 * Track verification failures
 */
export async function trackVerificationFailure(
  userId: string,
  reason: string,
  provider?: string
): Promise<boolean> {
  try {
    // Check verification failure rate
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for security monitoring')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const periodStart = new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours

    const { data: recentFailures } = await supabase
      .from('analytics_metrics')
      .select('metric_value')
      .eq('metric_name', 'security_event_verification_failure')
      .gte('period_start', periodStart.toISOString())

    const failureCount = recentFailures?.reduce((sum, m) => sum + (m.metric_value || 0), 0) || 0

    // Log the event
    await logSecurityEvent(
      'verification_failure',
      {
        reason,
        provider,
        failure_count: failureCount + 1
      },
      failureCount >= 10 ? 'high' : 'medium',
      userId
    )

    // Alert if high failure rate
    if (failureCount >= 10) {
      await sendAlert(
        'security',
        'High Verification Failure Rate',
        `${failureCount + 1} verification failures detected in last 24 hours. Review verification process.`,
        'high',
        {
          failure_count: failureCount + 1,
          period: '24 hours'
        }
      )
    }

    return true
  } catch (error) {
    safeLogger.error('Error tracking verification failure', { error })
    return false
  }
}

/**
 * Get security metrics for dashboard
 */
export async function getSecurityMetrics(
  periodHours: number = 24
): Promise<SecurityMetrics> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for security monitoring')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const periodStart = new Date(Date.now() - periodHours * 60 * 60 * 1000)
    const periodEnd = new Date()

    // Get all security event metrics
    const { data: metrics, error } = await supabase
      .from('analytics_metrics')
      .select('metric_name, metric_value, filter_criteria')
      .eq('metric_category', 'safety_incidents')
      .like('metric_name', 'security_event_%')
      .gte('period_start', periodStart.toISOString())
      .lte('period_end', periodEnd.toISOString())

    if (error) {
      safeLogger.error('Failed to fetch security metrics', { error })
      return {
        failedLoginAttempts: 0,
        suspiciousActivities: 0,
        rlsViolations: 0,
        verificationFailures: 0,
        rateLimitExceeded: 0,
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString()
        }
      }
    }

    const securityMetrics: SecurityMetrics = {
      failedLoginAttempts: 0,
      suspiciousActivities: 0,
      rlsViolations: 0,
      verificationFailures: 0,
      rateLimitExceeded: 0,
      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString()
      }
    }

    // Aggregate metrics by event type
    for (const metric of metrics || []) {
      const eventType = metric.filter_criteria?.event_type
      const value = metric.metric_value || 0

      if (eventType === 'failed_login') {
        securityMetrics.failedLoginAttempts += value
      } else if (eventType === 'suspicious_activity') {
        securityMetrics.suspiciousActivities += value
      } else if (eventType === 'rls_violation') {
        securityMetrics.rlsViolations += value
      } else if (eventType === 'verification_failure') {
        securityMetrics.verificationFailures += value
      } else if (eventType === 'rate_limit_exceeded') {
        securityMetrics.rateLimitExceeded += value
      }
    }

    return securityMetrics
  } catch (error) {
    safeLogger.error('Error fetching security metrics', { error })
    return {
      failedLoginAttempts: 0,
      suspiciousActivities: 0,
      rlsViolations: 0,
      verificationFailures: 0,
      rateLimitExceeded: 0,
      period: {
        start: new Date(Date.now() - periodHours * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      }
    }
  }
}

/**
 * Get recent security events
 */
export async function getRecentSecurityEvents(
  limit: number = 50
): Promise<SecurityEvent[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for security monitoring')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: metrics, error } = await supabase
      .from('analytics_metrics')
      .select('id, metric_name, filter_criteria, calculated_at')
      .eq('metric_category', 'safety_incidents')
      .like('metric_name', 'security_event_%')
      .order('calculated_at', { ascending: false })
      .limit(limit)

    if (error) {
      safeLogger.error('Failed to fetch recent security events', { error })
      return []
    }

    return (metrics || []).map(metric => ({
      id: metric.id,
      event_type: metric.filter_criteria?.event_type || 'suspicious_activity',
      user_id: metric.filter_criteria?.user_id,
      ip_address: metric.filter_criteria?.ip_address,
      details: metric.filter_criteria?.details || {},
      severity: metric.filter_criteria?.severity || 'medium',
      timestamp: metric.calculated_at
    }))
  } catch (error) {
    safeLogger.error('Error fetching recent security events', { error })
    return []
  }
}

/**
 * Check for suspicious patterns and trigger alerts
 */
export async function checkSuspiciousPatterns(): Promise<{
  hasSuspiciousActivity: boolean
  patterns: Array<{
    type: string
    description: string
    severity: 'low' | 'medium' | 'high' | 'critical'
  }>
}> {
  try {
    const metrics = await getSecurityMetrics(24)

    const patterns: Array<{
      type: string
      description: string
      severity: 'low' | 'medium' | 'high' | 'critical'
    }> = []

    // Check for high failed login attempts
    if (metrics.failedLoginAttempts > 20) {
      patterns.push({
        type: 'brute_force_attack',
        description: `${metrics.failedLoginAttempts} failed login attempts in last 24 hours`,
        severity: metrics.failedLoginAttempts > 50 ? 'critical' : 'high'
      })
    }

    // Check for high verification failure rate
    if (metrics.verificationFailures > 10) {
      patterns.push({
        type: 'verification_issues',
        description: `${metrics.verificationFailures} verification failures in last 24 hours`,
        severity: metrics.verificationFailures > 20 ? 'high' : 'medium'
      })
    }

    // Check for RLS violations
    if (metrics.rlsViolations > 5) {
      patterns.push({
        type: 'security_policy_violations',
        description: `${metrics.rlsViolations} RLS policy violations in last 24 hours`,
        severity: 'high'
      })
    }

    // Check for suspicious activities
    if (metrics.suspiciousActivities > 5) {
      patterns.push({
        type: 'suspicious_activity',
        description: `${metrics.suspiciousActivities} suspicious activities detected in last 24 hours`,
        severity: 'high'
      })
    }

    // Send alerts for critical patterns
    for (const pattern of patterns) {
      if (pattern.severity === 'critical' || pattern.severity === 'high') {
        await sendAlert(
          'security',
          `Security Pattern Detected: ${pattern.type}`,
          pattern.description,
          pattern.severity,
          {
            pattern_type: pattern.type,
            metrics
          }
        )
      }
    }

    return {
      hasSuspiciousActivity: patterns.length > 0,
      patterns
    }
  } catch (error) {
    safeLogger.error('Error checking suspicious patterns', { error })
    return {
      hasSuspiciousActivity: false,
      patterns: []
    }
  }
}

