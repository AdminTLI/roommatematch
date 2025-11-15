// Anomaly Detection System
// This module detects anomalies in verification, matching, and job processing

import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'
import { sendAlert } from '@/lib/monitoring/alerts'

export interface AnomalyDetectionResult {
  hasAnomaly: boolean
  anomalyType: 'verification' | 'matching' | 'job_processing' | 'performance' | 'data_quality'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  detectedAt: string
  metrics: {
    current: number
    expected: number
    deviation: number
    deviationPercentage: number
  }
  recommendations: string[]
}

export interface VerificationAnomaly {
  type: 'high_failure_rate' | 'slow_processing' | 'unusual_pattern'
  failureRate: number
  expectedFailureRate: number
  processingTime: number
  expectedProcessingTime: number
  period: {
    start: string
    end: string
  }
}

export interface MatchingAnomaly {
  type: 'low_match_rate' | 'high_rejection_rate' | 'slow_matching' | 'unusual_pattern'
  matchRate: number
  expectedMatchRate: number
  rejectionRate: number
  expectedRejectionRate: number
  averageProcessingTime: number
  expectedProcessingTime: number
  period: {
    start: string
    end: string
  }
}

export interface JobProcessingAnomaly {
  type: 'high_failure_rate' | 'slow_processing' | 'queue_backlog' | 'unusual_pattern'
  failureRate: number
  expectedFailureRate: number
  averageProcessingTime: number
  expectedProcessingTime: number
  queueSize: number
  expectedQueueSize: number
  period: {
    start: string
    end: string
  }
}

/**
 * Detect verification anomalies
 */
export async function detectVerificationAnomalies(
  periodHours: number = 24
): Promise<VerificationAnomaly[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for anomaly detection')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const periodStart = new Date(Date.now() - periodHours * 60 * 60 * 1000)
    const periodEnd = new Date()

    // Get verification metrics
    const { data: verifications, error: verificationsError } = await supabase
      .from('verifications')
      .select('id, status, created_at, updated_at')
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString())

    if (verificationsError) {
      safeLogger.error('Failed to fetch verifications', { error: verificationsError })
      return []
    }

    if (!verifications || verifications.length === 0) {
      return []
    }

    const total = verifications.length
    const failed = verifications.filter(v => v.status === 'failed' || v.status === 'rejected').length
    const failureRate = (failed / total) * 100

    // Calculate average processing time
    const processingTimes = verifications
      .filter(v => v.updated_at && v.created_at)
      .map(v => {
        const created = new Date(v.created_at)
        const updated = new Date(v.updated_at)
        return (updated.getTime() - created.getTime()) / 1000 / 60 // minutes
      })
      .filter(t => t > 0)

    const averageProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, t) => sum + t, 0) / processingTimes.length
      : 0

    // Expected values (baseline)
    const expectedFailureRate = 10 // 10% failure rate is expected
    const expectedProcessingTime = 5 // 5 minutes average processing time

    const anomalies: VerificationAnomaly[] = []

    // Check for high failure rate
    if (failureRate > expectedFailureRate * 2) {
      anomalies.push({
        type: 'high_failure_rate',
        failureRate,
        expectedFailureRate,
        processingTime: averageProcessingTime,
        expectedProcessingTime,
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString()
        }
      })
    }

    // Check for slow processing
    if (averageProcessingTime > expectedProcessingTime * 2) {
      anomalies.push({
        type: 'slow_processing',
        failureRate,
        expectedFailureRate,
        processingTime: averageProcessingTime,
        expectedProcessingTime,
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString()
        }
      })
    }

    // Check for unusual patterns (spike in failures)
    if (failureRate > expectedFailureRate * 1.5 && total > 10) {
      anomalies.push({
        type: 'unusual_pattern',
        failureRate,
        expectedFailureRate,
        processingTime: averageProcessingTime,
        expectedProcessingTime,
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString()
        }
      })
    }

    return anomalies
  } catch (error) {
    safeLogger.error('Error detecting verification anomalies', { error })
    return []
  }
}

/**
 * Detect matching anomalies
 */
export async function detectMatchingAnomalies(
  periodHours: number = 24
): Promise<MatchingAnomaly[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for anomaly detection')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const periodStart = new Date(Date.now() - periodHours * 60 * 60 * 1000)
    const periodEnd = new Date()

    // Get matching metrics from match_suggestions
    const now = new Date().toISOString()
    const { data: suggestions, error: suggestionsError } = await supabase
      .from('match_suggestions')
      .select('id, status, created_at')
      .eq('kind', 'pair')
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString())

    if (suggestionsError) {
      safeLogger.error('Failed to fetch match suggestions', { error: suggestionsError })
      return []
    }

    if (!suggestions || suggestions.length === 0) {
      return []
    }

    const total = suggestions.length
    const accepted = suggestions.filter(s => s.status === 'accepted' || s.status === 'confirmed').length
    const rejected = suggestions.filter(s => s.status === 'rejected' || s.status === 'declined').length
    const matchRate = (accepted / total) * 100
    const rejectionRate = (rejected / total) * 100

    // Calculate average processing time (using created_at as proxy since suggestions don't have updated_at)
    // For suggestions, processing time is minimal since they're created and immediately available
    const processingTimes = suggestions
      .map(s => {
        const created = new Date(s.created_at)
        // Use current time as proxy for "processed" time
        return (periodEnd.getTime() - created.getTime()) / 1000 / 60 // minutes
      })
      .filter(t => t > 0)

    const averageProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, t) => sum + t, 0) / processingTimes.length
      : 0

    // Expected values (baseline)
    const expectedMatchRate = 50 // 50% match rate is expected
    const expectedRejectionRate = 30 // 30% rejection rate is expected
    const expectedProcessingTime = 10 // 10 minutes average processing time

    const anomalies: MatchingAnomaly[] = []

    // Check for low match rate
    if (matchRate < expectedMatchRate * 0.5) {
      anomalies.push({
        type: 'low_match_rate',
        matchRate,
        expectedMatchRate,
        rejectionRate,
        expectedRejectionRate,
        averageProcessingTime,
        expectedProcessingTime,
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString()
        }
      })
    }

    // Check for high rejection rate
    if (rejectionRate > expectedRejectionRate * 2) {
      anomalies.push({
        type: 'high_rejection_rate',
        matchRate,
        expectedMatchRate,
        rejectionRate,
        expectedRejectionRate,
        averageProcessingTime,
        expectedProcessingTime,
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString()
        }
      })
    }

    // Check for slow matching
    if (averageProcessingTime > expectedProcessingTime * 2) {
      anomalies.push({
        type: 'slow_matching',
        matchRate,
        expectedMatchRate,
        rejectionRate,
        expectedRejectionRate,
        averageProcessingTime,
        expectedProcessingTime,
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString()
        }
      })
    }

    // Check for unusual patterns
    if ((matchRate < expectedMatchRate * 0.7 || rejectionRate > expectedRejectionRate * 1.5) && total > 10) {
      anomalies.push({
        type: 'unusual_pattern',
        matchRate,
        expectedMatchRate,
        rejectionRate,
        expectedRejectionRate,
        averageProcessingTime,
        expectedProcessingTime,
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString()
        }
      })
    }

    return anomalies
  } catch (error) {
    safeLogger.error('Error detecting matching anomalies', { error })
    return []
  }
}

/**
 * Detect job processing anomalies
 */
export async function detectJobProcessingAnomalies(
  periodHours: number = 24
): Promise<JobProcessingAnomaly[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for anomaly detection')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const periodStart = new Date(Date.now() - periodHours * 60 * 60 * 1000)
    const periodEnd = new Date()

    // Get job processing metrics (using match_suggestions as proxy)
    // Note: This assumes match suggestions represent "jobs" - may need review
    const { data: jobs, error: jobsError } = await supabase
      .from('match_suggestions')
      .select('id, status, created_at')
      .eq('kind', 'pair')
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString())

    if (jobsError) {
      safeLogger.error('Failed to fetch match suggestions for job metrics', { error: jobsError })
      return []
    }

    if (!jobs || jobs.length === 0) {
      return []
    }

    const total = jobs.length
    const failed = jobs.filter(j => j.status === 'rejected' || j.status === 'declined' || j.status === 'expired').length
    const failureRate = (failed / total) * 100

    // Calculate average processing time (using created_at as proxy)
    const processingTimes = jobs
      .map(j => {
        const created = new Date(j.created_at)
        return (periodEnd.getTime() - created.getTime()) / 1000 / 60 // minutes
      })
      .filter(t => t > 0)

    const averageProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, t) => sum + t, 0) / processingTimes.length
      : 0

    // Get queue size (pending suggestions)
    const { count: queueSize, error: queueError } = await supabase
      .from('match_suggestions')
      .select('id', { count: 'exact', head: true })
      .eq('kind', 'pair')
      .eq('status', 'pending')

    if (queueError) {
      safeLogger.error('Failed to fetch queue size', { error: queueError })
    }

    // Expected values (baseline)
    const expectedFailureRate = 5 // 5% failure rate is expected
    const expectedProcessingTime = 15 // 15 minutes average processing time
    const expectedQueueSize = 10 // 10 pending jobs is expected

    const anomalies: JobProcessingAnomaly[] = []

    // Check for high failure rate
    if (failureRate > expectedFailureRate * 2) {
      anomalies.push({
        type: 'high_failure_rate',
        failureRate,
        expectedFailureRate,
        averageProcessingTime,
        expectedProcessingTime,
        queueSize: queueSize || 0,
        expectedQueueSize,
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString()
        }
      })
    }

    // Check for slow processing
    if (averageProcessingTime > expectedProcessingTime * 2) {
      anomalies.push({
        type: 'slow_processing',
        failureRate,
        expectedFailureRate,
        averageProcessingTime,
        expectedProcessingTime,
        queueSize: queueSize || 0,
        expectedQueueSize,
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString()
        }
      })
    }

    // Check for queue backlog
    if (queueSize && queueSize > expectedQueueSize * 2) {
      anomalies.push({
        type: 'queue_backlog',
        failureRate,
        expectedFailureRate,
        averageProcessingTime,
        expectedProcessingTime,
        queueSize: queueSize,
        expectedQueueSize,
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString()
        }
      })
    }

    // Check for unusual patterns
    if ((failureRate > expectedFailureRate * 1.5 || (queueSize && queueSize > expectedQueueSize * 1.5)) && total > 10) {
      anomalies.push({
        type: 'unusual_pattern',
        failureRate,
        expectedFailureRate,
        averageProcessingTime,
        expectedProcessingTime,
        queueSize: queueSize || 0,
        expectedQueueSize,
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString()
        }
      })
    }

    return anomalies
  } catch (error) {
    safeLogger.error('Error detecting job processing anomalies', { error })
    return []
  }
}

/**
 * Detect all anomalies and store in analytics_anomalies table
 */
export async function detectAllAnomalies(
  periodHours: number = 24
): Promise<AnomalyDetectionResult[]> {
  try {
    const [verificationAnomalies, matchingAnomalies, jobAnomalies] = await Promise.all([
      detectVerificationAnomalies(periodHours),
      detectMatchingAnomalies(periodHours),
      detectJobProcessingAnomalies(periodHours)
    ])

    const results: AnomalyDetectionResult[] = []

    // Process verification anomalies
    for (const anomaly of verificationAnomalies) {
      const severity = anomaly.type === 'high_failure_rate' ? 'high' :
                      anomaly.type === 'slow_processing' ? 'medium' : 'low'
      
      const deviation = anomaly.failureRate - anomaly.expectedFailureRate
      const deviationPercentage = (deviation / anomaly.expectedFailureRate) * 100

      results.push({
        hasAnomaly: true,
        anomalyType: 'verification',
        severity,
        description: `Verification ${anomaly.type}: Failure rate ${anomaly.failureRate.toFixed(1)}% (expected ${anomaly.expectedFailureRate}%)`,
        detectedAt: new Date().toISOString(),
        metrics: {
          current: anomaly.failureRate,
          expected: anomaly.expectedFailureRate,
          deviation,
          deviationPercentage
        },
        recommendations: [
          'Review verification process',
          'Check verification provider status',
          'Review failed verifications',
          'Consider updating verification criteria'
        ]
      })

      // Send alert for high severity anomalies
      if (severity === 'high' || severity === 'critical') {
        await sendAlert(
          'anomaly',
          `Verification Anomaly Detected: ${anomaly.type}`,
          `Verification ${anomaly.type} detected. Failure rate: ${anomaly.failureRate.toFixed(1)}% (expected ${anomaly.expectedFailureRate}%)`,
          severity,
          {
            anomalyType: 'verification',
            type: anomaly.type,
            failureRate: anomaly.failureRate,
            expectedFailureRate: anomaly.expectedFailureRate,
            processingTime: anomaly.processingTime,
            expectedProcessingTime: anomaly.expectedProcessingTime
          }
        )
      }
    }

    // Process matching anomalies
    for (const anomaly of matchingAnomalies) {
      const severity = anomaly.type === 'low_match_rate' ? 'high' :
                      anomaly.type === 'high_rejection_rate' ? 'medium' :
                      anomaly.type === 'slow_matching' ? 'medium' : 'low'
      
      const deviation = anomaly.matchRate - anomaly.expectedMatchRate
      const deviationPercentage = (deviation / anomaly.expectedMatchRate) * 100

      results.push({
        hasAnomaly: true,
        anomalyType: 'matching',
        severity,
        description: `Matching ${anomaly.type}: Match rate ${anomaly.matchRate.toFixed(1)}% (expected ${anomaly.expectedMatchRate}%)`,
        detectedAt: new Date().toISOString(),
        metrics: {
          current: anomaly.matchRate,
          expected: anomaly.expectedMatchRate,
          deviation,
          deviationPercentage
        },
        recommendations: [
          'Review matching algorithm',
          'Check user profiles quality',
          'Review match criteria',
          'Consider adjusting matching weights'
        ]
      })

      // Send alert for high severity anomalies
      if (severity === 'high' || severity === 'critical') {
        await sendAlert(
          'anomaly',
          `Matching Anomaly Detected: ${anomaly.type}`,
          `Matching ${anomaly.type} detected. Match rate: ${anomaly.matchRate.toFixed(1)}% (expected ${anomaly.expectedMatchRate}%)`,
          severity,
          {
            anomalyType: 'matching',
            type: anomaly.type,
            matchRate: anomaly.matchRate,
            expectedMatchRate: anomaly.expectedMatchRate,
            rejectionRate: anomaly.rejectionRate,
            expectedRejectionRate: anomaly.expectedRejectionRate
          }
        )
      }
    }

    // Process job processing anomalies
    for (const anomaly of jobAnomalies) {
      const severity = anomaly.type === 'high_failure_rate' ? 'high' :
                      anomaly.type === 'queue_backlog' ? 'high' :
                      anomaly.type === 'slow_processing' ? 'medium' : 'low'
      
      const deviation = anomaly.failureRate - anomaly.expectedFailureRate
      const deviationPercentage = (deviation / anomaly.expectedFailureRate) * 100

      results.push({
        hasAnomaly: true,
        anomalyType: 'job_processing',
        severity,
        description: `Job processing ${anomaly.type}: Failure rate ${anomaly.failureRate.toFixed(1)}% (expected ${anomaly.expectedFailureRate}%)`,
        detectedAt: new Date().toISOString(),
        metrics: {
          current: anomaly.failureRate,
          expected: anomaly.expectedFailureRate,
          deviation,
          deviationPercentage
        },
        recommendations: [
          'Review job processing system',
          'Check job queue status',
          'Review failed jobs',
          'Consider scaling job processing capacity'
        ]
      })

      // Send alert for high severity anomalies
      if (severity === 'high' || severity === 'critical') {
        await sendAlert(
          'anomaly',
          `Job Processing Anomaly Detected: ${anomaly.type}`,
          `Job processing ${anomaly.type} detected. Failure rate: ${anomaly.failureRate.toFixed(1)}% (expected ${anomaly.expectedFailureRate}%)`,
          severity,
          {
            anomalyType: 'job_processing',
            type: anomaly.type,
            failureRate: anomaly.failureRate,
            expectedFailureRate: anomaly.expectedFailureRate,
            queueSize: anomaly.queueSize,
            expectedQueueSize: anomaly.expectedQueueSize
          }
        )
      }
    }

    // Store anomalies in analytics_anomalies table
    if (results.length > 0) {
      await storeAnomalies(results)
    }

    return results
  } catch (error) {
    safeLogger.error('Error detecting all anomalies', { error })
    return []
  }
}

/**
 * Store anomalies in analytics_anomalies table
 */
async function storeAnomalies(
  anomalies: AnomalyDetectionResult[]
): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for anomaly detection')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // First, create metrics for each anomaly
    for (const anomaly of anomalies) {
      // Create metric entry
      const { data: metric, error: metricError } = await supabase
        .from('analytics_metrics')
        .insert({
          metric_name: `anomaly_${anomaly.anomalyType}`,
          metric_category: 'performance_metrics',
          metric_type: 'percentage',
          metric_value: anomaly.metrics.current,
          previous_value: anomaly.metrics.expected,
          period_start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          period_end: new Date().toISOString(),
          granularity: 'hourly',
          filter_criteria: {
            anomalyType: anomaly.anomalyType,
            severity: anomaly.severity,
            metrics: anomaly.metrics,
            recommendations: anomaly.recommendations
          },
          data_source: 'anomaly_detection',
          calculation_method: 'statistical_analysis',
          confidence_level: 0.9
        })
        .select('id')
        .single()

      if (metricError || !metric) {
        safeLogger.error('Failed to create metric for anomaly', { error: metricError })
        continue
      }

      // Create anomaly entry
      const anomalyTypeMap: Record<string, 'spike' | 'drop' | 'trend_change' | 'seasonal_deviation' | 'outlier' | 'pattern_break'> = {
        'verification': 'outlier',
        'matching': 'drop',
        'job_processing': 'outlier',
        'performance': 'outlier',
        'data_quality': 'outlier'
      }

      const { error: anomalyError } = await supabase
        .from('analytics_anomalies')
        .insert({
          metric_id: metric.id,
          anomaly_type: anomalyTypeMap[anomaly.anomalyType] || 'outlier',
          severity: anomaly.severity,
          actual_value: anomaly.metrics.current,
          expected_value: anomaly.metrics.expected,
          deviation_percentage: anomaly.metrics.deviationPercentage,
          confidence_score: 0.9,
          possible_causes: [`${anomaly.anomalyType} issue detected`],
          impact_assessment: anomaly.description,
          recommended_actions: anomaly.recommendations,
          status: 'detected',
          detected_at: anomaly.detectedAt
        })

      if (anomalyError) {
        safeLogger.error('Failed to store anomaly', { error: anomalyError })
      }
    }

    return true
  } catch (error) {
    safeLogger.error('Error storing anomalies', { error })
    return false
  }
}

