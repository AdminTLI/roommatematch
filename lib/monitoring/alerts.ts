// Monitoring and Alert System
// This module provides functions to check for data quality issues and trigger alerts

import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

interface AlertConfig {
  threshold: number // Percentage threshold for alerts (0-100)
  enabled: boolean
}

interface StudyMonthAlert {
  totalUsers: number
  usersWithMissingMonths: number
  percentage: number
  threshold: number
  shouldAlert: boolean
}

interface CoverageAlert {
  institutionId: string
  institutionName: string
  missingLevels: string[]
  status: 'complete' | 'incomplete' | 'missing'
}

/**
 * Check for users with missing study month data
 * Returns alert information if percentage exceeds threshold
 */
export async function checkStudyMonthCompleteness(
  threshold: number = 10
): Promise<StudyMonthAlert | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for monitoring')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Count total users with academic data
    const { count: totalCount, error: totalError } = await supabase
      .from('user_academic')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      safeLogger.error('Failed to count total users', { error: totalError })
      return null
    }

    // Count users with missing study_start_month or graduation_month
    const { count: missingCount, error: missingError } = await supabase
      .from('user_academic')
      .select('*', { count: 'exact', head: true })
      .or('study_start_month.is.null,graduation_month.is.null')

    if (missingError) {
      safeLogger.error('Failed to count users with missing months', { error: missingError })
      return null
    }

    const totalUsers = totalCount || 0
    const usersWithMissingMonths = missingCount || 0
    const percentage = totalUsers > 0 ? (usersWithMissingMonths / totalUsers) * 100 : 0
    const shouldAlert = percentage > threshold

    const alert: StudyMonthAlert = {
      totalUsers,
      usersWithMissingMonths,
      percentage,
      threshold,
      shouldAlert
    }

    if (shouldAlert) {
      safeLogger.warn('Study month completeness alert triggered', {
        percentage: percentage.toFixed(2),
        threshold,
        totalUsers,
        usersWithMissingMonths
      })
    }

    return alert
  } catch (error) {
    safeLogger.error('Error checking study month completeness', { error })
    return null
  }
}

/**
 * Get list of users with missing study months
 */
export async function getUsersWithMissingStudyMonths(limit: number = 100): Promise<Array<{
  user_id: string
  email: string
  study_start_month: number | null
  graduation_month: number | null
}>> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for monitoring')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('user_academic')
      .select(`
        user_id,
        study_start_month,
        graduation_month,
        users!inner(email)
      `)
      .or('study_start_month.is.null,graduation_month.is.null')
      .limit(limit)

    if (error) {
      safeLogger.error('Failed to fetch users with missing study months', { error })
      return []
    }

    return (data || []).map((user: any) => ({
      user_id: user.user_id,
      email: user.users?.email || 'unknown',
      study_start_month: user.study_start_month,
      graduation_month: user.graduation_month
    }))
  } catch (error) {
    safeLogger.error('Error fetching users with missing study months', { error })
    return []
  }
}

/**
 * Store alert in analytics_metrics table
 */
export async function storeAlertMetric(
  metricName: string,
  metricValue: number,
  metadata: Record<string, any> = {}
): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for monitoring')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const now = new Date()
    const periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000) // Last 24 hours

    const { error } = await supabase
      .from('analytics_metrics')
      .insert({
        metric_name: metricName,
        metric_category: 'data_quality',
        metric_type: 'percentage',
        metric_value: metricValue,
        period_start: periodStart.toISOString(),
        period_end: now.toISOString(),
        granularity: 'daily',
        filter_criteria: metadata,
        data_source: 'monitoring_system',
        calculation_method: 'automated_check',
        confidence_level: 1.0
      })

    if (error) {
      safeLogger.error('Failed to store alert metric', { error, metricName })
      return false
    }

    return true
  } catch (error) {
    safeLogger.error('Error storing alert metric', { error, metricName })
    return false
  }
}

/**
 * Send alert notification via email/Slack
 */
export async function sendAlert(
  alertType: 'study_months' | 'coverage' | 'security' | 'anomaly',
  title: string,
  message: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  metadata: Record<string, any> = {}
): Promise<boolean> {
  try {
    // Store alert in analytics_anomalies table
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for monitoring')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Determine severity level for database
    const severityLevel = severity === 'critical' ? 'critical' :
                          severity === 'high' ? 'high' :
                          severity === 'medium' ? 'medium' : 'low'

    // Map alert type to anomaly type
    const anomalyTypeMap: Record<string, 'spike' | 'drop' | 'trend_change' | 'seasonal_deviation' | 'outlier' | 'pattern_break'> = {
      'study_months': 'drop',
      'coverage': 'drop',
      'security': 'outlier',
      'anomaly': 'outlier'
    }
    const anomalyType = anomalyTypeMap[alertType] || 'outlier'

    // Get or create metric for this alert
    // First, try to find existing metric
    const now = new Date()
    const periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    let metricId: string | null = null

    // Create a metric entry for this alert if it doesn't exist
    const metricName = alertType === 'study_months' ? 'study_month_completeness' :
                      alertType === 'coverage' ? 'programme_coverage_percentage' :
                      'alert_metric'

    const { data: existingMetric } = await supabase
      .from('analytics_metrics')
      .select('id')
      .eq('metric_name', metricName)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingMetric) {
      metricId = existingMetric.id
    } else {
      // Create a new metric entry
      const actualValue = metadata.percentage || metadata.coveragePercentage || 0
      const { data: newMetric, error: metricError } = await supabase
        .from('analytics_metrics')
        .insert({
          metric_name: metricName,
          metric_category: 'data_quality',
          metric_type: 'percentage',
          metric_value: actualValue,
          period_start: periodStart.toISOString(),
          period_end: now.toISOString(),
          granularity: 'daily',
          filter_criteria: metadata,
          data_source: 'monitoring_system',
          calculation_method: 'automated_check',
          confidence_level: 1.0
        })
        .select('id')
        .single()

      if (metricError) {
        safeLogger.error('Failed to create metric for alert', { error: metricError })
      } else if (newMetric) {
        metricId = newMetric.id
      }
    }

    // Store in analytics_anomalies (only if we have a metric_id)
    if (metricId) {
      const { error: anomalyError } = await supabase
        .from('analytics_anomalies')
        .insert({
          metric_id: metricId,
          anomaly_type: anomalyType,
          severity: severityLevel,
          actual_value: metadata.percentage || metadata.coveragePercentage || 0,
          expected_value: metadata.threshold || 90,
          deviation_percentage: metadata.percentage ? (metadata.threshold || 90) - metadata.percentage : undefined,
          confidence_score: 0.9,
          possible_causes: [`${alertType} issue detected`],
          impact_assessment: message,
          recommended_actions: ['Review data quality', 'Check data sources', 'Fix missing data'],
          status: 'detected',
          detected_at: new Date().toISOString()
        })

      if (anomalyError) {
        safeLogger.error('Failed to store alert in analytics_anomalies', { error: anomalyError })
      }
    }

    // Send email alert if configured
    const emailEnabled = process.env.ALERTS_EMAIL_ENABLED === 'true'
    if (emailEnabled) {
      await sendEmailAlert(title, message, severity, metadata)
    }

    // Send Slack alert if configured
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL
    if (slackWebhookUrl) {
      await sendSlackAlert(title, message, severity, metadata)
    }

    safeLogger.info('Alert sent', { alertType, title, severity })
    return true
  } catch (error) {
    safeLogger.error('Error sending alert', { error, alertType, title })
    return false
  }
}

/**
 * Send email alert
 */
async function sendEmailAlert(
  title: string,
  message: string,
  severity: string,
  metadata: Record<string, any>
): Promise<boolean> {
  try {
    // TODO: Implement email sending via SMTP
    // For now, just log the alert
    safeLogger.info('Email alert (not implemented)', { title, message, severity, metadata })
    return true
  } catch (error) {
    safeLogger.error('Error sending email alert', { error })
    return false
  }
}

/**
 * Send Slack alert
 */
async function sendSlackAlert(
  title: string,
  message: string,
  severity: string,
  metadata: Record<string, any>
): Promise<boolean> {
  try {
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL
    if (!slackWebhookUrl) {
      return false
    }

    // Determine color based on severity
    const color = severity === 'critical' ? '#FF0000' :
                  severity === 'high' ? '#FF8C00' :
                  severity === 'medium' ? '#FFD700' : '#32CD32'

    const payload = {
      text: title,
      attachments: [
        {
          color,
          fields: [
            {
              title: 'Message',
              value: message,
              short: false
            },
            {
              title: 'Severity',
              value: severity.toUpperCase(),
              short: true
            },
            {
              title: 'Timestamp',
              value: new Date().toISOString(),
              short: true
            }
          ],
          footer: 'Domu Match Monitoring',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    }

    // Add metadata fields if present
    if (Object.keys(metadata).length > 0) {
      payload.attachments[0].fields.push({
        title: 'Details',
        value: JSON.stringify(metadata, null, 2),
        short: false
      })
    }

    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`)
    }

    return true
  } catch (error) {
    safeLogger.error('Error sending Slack alert', { error })
    return false
  }
}

/**
 * Check study month completeness and send alert if threshold exceeded
 */
export async function checkAndAlertStudyMonthCompleteness(
  threshold: number = 10
): Promise<StudyMonthAlert | null> {
  const alert = await checkStudyMonthCompleteness(threshold)

  if (alert && alert.shouldAlert) {
    // Store metric
    await storeAlertMetric(
      'study_month_completeness',
      alert.percentage,
      {
        totalUsers: alert.totalUsers,
        usersWithMissingMonths: alert.usersWithMissingMonths,
        threshold: alert.threshold
      }
    )

    // Send alert
    await sendAlert(
      'study_months',
      'Study Month Data Completeness Alert',
      `${alert.percentage.toFixed(2)}% of users (${alert.usersWithMissingMonths}/${alert.totalUsers}) have missing study month data. Threshold: ${threshold}%`,
      alert.percentage > 50 ? 'high' : alert.percentage > 25 ? 'medium' : 'low',
      {
        totalUsers: alert.totalUsers,
        usersWithMissingMonths: alert.usersWithMissingMonths,
        percentage: alert.percentage,
        threshold: alert.threshold
      }
    )
  }

  return alert
}

