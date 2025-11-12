// Matching Experiments and A/B Testing
// This module handles experiment assignment and quality metrics tracking

import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'
import crypto from 'crypto'

export interface ExperimentVariant {
  name: string
  description: string
  configuration: Record<string, any> // Algorithm configuration
  weight: number // Traffic percentage (0-100)
}

export interface MatchingExperiment {
  id: string
  experiment_name: string
  experiment_description?: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived'
  variants: ExperimentVariant[]
  traffic_split: Record<string, number>
  assignment_method: 'random' | 'user_id_hash' | 'cohort'
  university_id?: string
  user_segments?: string[]
  filter_criteria?: Record<string, any>
  start_date?: string
  end_date?: string
  total_users: number
  users_by_variant: Record<string, number>
  metrics_summary?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ExperimentAssignment {
  id: string
  experiment_id: string
  user_id: string
  variant_name: string
  assignment_method: string
  assignment_timestamp: string
  matches_count: number
  matches_accepted: number
  matches_rejected: number
  chat_initiated: number
  agreement_signed: number
  created_at: string
  updated_at: string
}

export interface MatchingQualityMetrics {
  id: string
  experiment_id?: string
  variant_name?: string
  assignment_id?: string
  match_id: string
  user_id: string
  compatibility_score: number
  match_quality_score: number
  acceptance_rate: number
  chat_initiation_rate: number
  agreement_rate: number
  outcome?: string
  outcome_timestamp?: string
  match_created_at: string
  match_updated_at?: string
  period_start: string
  period_end: string
  calculated_at: string
  created_at: string
}

/**
 * Get active experiments for a user
 */
export async function getActiveExperiments(
  userId: string,
  universityId?: string
): Promise<MatchingExperiment[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for experiments')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const now = new Date().toISOString()

    let query = supabase
      .from('matching_experiments')
      .select('*')
      .eq('status', 'active')
      .lte('start_date', now)
      .or(`end_date.is.null,end_date.gte.${now}`)

    if (universityId) {
      query = query.eq('university_id', universityId)
    }

    const { data: experiments, error } = await query

    if (error) {
      safeLogger.error('Failed to fetch active experiments', { error })
      return []
    }

    return (experiments || []).map(exp => ({
      id: exp.id,
      experiment_name: exp.experiment_name,
      experiment_description: exp.experiment_description,
      status: exp.status,
      variants: exp.variants,
      traffic_split: exp.traffic_split,
      assignment_method: exp.assignment_method,
      university_id: exp.university_id,
      user_segments: exp.user_segments,
      filter_criteria: exp.filter_criteria,
      start_date: exp.start_date,
      end_date: exp.end_date,
      total_users: exp.total_users || 0,
      users_by_variant: exp.users_by_variant || {},
      metrics_summary: exp.metrics_summary,
      created_at: exp.created_at,
      updated_at: exp.updated_at
    }))
  } catch (error) {
    safeLogger.error('Error fetching active experiments', { error })
    return []
  }
}

/**
 * Assign user to experiment variant
 */
export async function assignUserToExperiment(
  userId: string,
  experimentId: string,
  experiment: MatchingExperiment
): Promise<string | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for experiments')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if user is already assigned
    const { data: existingAssignment, error: checkError } = await supabase
      .from('experiment_assignments')
      .select('variant_name')
      .eq('experiment_id', experimentId)
      .eq('user_id', userId)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      safeLogger.error('Failed to check existing assignment', { error: checkError })
      return null
    }

    if (existingAssignment) {
      return existingAssignment.variant_name
    }

    // Assign user to variant based on assignment method
    let variantName: string

    if (experiment.assignment_method === 'user_id_hash') {
      // Hash user ID to consistently assign to same variant
      const hash = crypto.createHash('md5').update(`${userId}:${experimentId}`).digest('hex')
      const hashValue = parseInt(hash.substring(0, 8), 16) % 100
      
      let cumulativeWeight = 0
      for (const variant of experiment.variants) {
        cumulativeWeight += variant.weight
        if (hashValue < cumulativeWeight) {
          variantName = variant.name
          break
        }
      }
      
      // Fallback to first variant if no match
      if (!variantName) {
        variantName = experiment.variants[0].name
      }
    } else {
      // Random assignment based on traffic split
      const random = Math.random() * 100
      let cumulativeWeight = 0
      
      for (const variant of experiment.variants) {
        cumulativeWeight += variant.weight
        if (random < cumulativeWeight) {
          variantName = variant.name
          break
        }
      }
      
      // Fallback to first variant if no match
      if (!variantName) {
        variantName = experiment.variants[0].name
      }
    }

    // Create assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('experiment_assignments')
      .insert({
        experiment_id: experimentId,
        user_id: userId,
        variant_name: variantName,
        assignment_method: experiment.assignment_method,
        assignment_timestamp: new Date().toISOString()
      })
      .select('variant_name')
      .single()

    if (assignmentError) {
      safeLogger.error('Failed to create assignment', { error: assignmentError })
      return null
    }

    // Update experiment user counts
    await supabase.rpc('increment_experiment_user_count', {
      p_experiment_id: experimentId,
      p_variant_name: variantName
    }).catch(err => {
      // If RPC doesn't exist, update manually
      safeLogger.warn('Failed to increment user count via RPC', { error: err })
    })

    return assignment.variant_name
  } catch (error) {
    safeLogger.error('Error assigning user to experiment', { error })
    return null
  }
}

/**
 * Get user's variant for an experiment
 */
export async function getUserVariant(
  userId: string,
  experimentId: string
): Promise<string | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for experiments')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: assignment, error } = await supabase
      .from('experiment_assignments')
      .select('variant_name')
      .eq('experiment_id', experimentId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      safeLogger.error('Failed to fetch user variant', { error })
      return null
    }

    return assignment?.variant_name || null
  } catch (error) {
    safeLogger.error('Error fetching user variant', { error })
    return null
  }
}

/**
 * Track match quality metrics
 */
export async function trackMatchQualityMetrics(
  matchId: string,
  userId: string,
  experimentId: string,
  variantName: string,
  metrics: {
    compatibility_score: number
    match_quality_score: number
    acceptance_rate?: number
    chat_initiation_rate?: number
    agreement_rate?: number
    outcome?: string
    outcome_timestamp?: string
  }
): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for experiments')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get match details
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('created_at, updated_at')
      .eq('id', matchId)
      .maybeSingle()

    if (matchError) {
      safeLogger.error('Failed to fetch match', { error: matchError })
      return false
    }

    // Get assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('experiment_assignments')
      .select('id')
      .eq('experiment_id', experimentId)
      .eq('user_id', userId)
      .maybeSingle()

    if (assignmentError) {
      safeLogger.error('Failed to fetch assignment', { error: assignmentError })
      return false
    }

    const now = new Date()
    const periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Store quality metrics
    const { error: metricsError } = await supabase
      .from('matching_quality_metrics')
      .insert({
        experiment_id: experimentId,
        variant_name: variantName,
        assignment_id: assignment?.id,
        match_id: matchId,
        user_id: userId,
        compatibility_score: metrics.compatibility_score,
        match_quality_score: metrics.match_quality_score,
        acceptance_rate: metrics.acceptance_rate || 0,
        chat_initiation_rate: metrics.chat_initiation_rate || 0,
        agreement_rate: metrics.agreement_rate || 0,
        outcome: metrics.outcome,
        outcome_timestamp: metrics.outcome_timestamp,
        match_created_at: match?.created_at,
        match_updated_at: match?.updated_at,
        period_start: periodStart.toISOString(),
        period_end: now.toISOString()
      })

    if (metricsError) {
      safeLogger.error('Failed to store quality metrics', { error: metricsError })
      return false
    }

    // Update assignment metrics
    if (assignment) {
      const updateData: any = {}
      
      if (metrics.outcome === 'accepted') {
        updateData.matches_accepted = supabase.raw('matches_accepted + 1')
      } else if (metrics.outcome === 'rejected') {
        updateData.matches_rejected = supabase.raw('matches_rejected + 1')
      } else if (metrics.outcome === 'chat_initiated') {
        updateData.chat_initiated = supabase.raw('chat_initiated + 1')
      } else if (metrics.outcome === 'agreement_signed') {
        updateData.agreement_signed = supabase.raw('agreement_signed + 1')
      }

      if (Object.keys(updateData).length > 0) {
        updateData.matches_count = supabase.raw('matches_count + 1')
        updateData.updated_at = new Date().toISOString()

        await supabase
          .from('experiment_assignments')
          .update(updateData)
          .eq('id', assignment.id)
          .catch(err => {
            safeLogger.error('Failed to update assignment metrics', { error: err })
          })
      }
    }

    return true
  } catch (error) {
    safeLogger.error('Error tracking match quality metrics', { error })
    return false
  }
}

/**
 * Get experiment metrics summary
 */
export async function getExperimentMetrics(
  experimentId: string
): Promise<{
  total_users: number
  users_by_variant: Record<string, number>
  metrics_by_variant: Record<string, {
    matches_count: number
    matches_accepted: number
    matches_rejected: number
    chat_initiated: number
    agreement_signed: number
    acceptance_rate: number
    chat_initiation_rate: number
    agreement_rate: number
    average_compatibility_score: number
    average_quality_score: number
  }>
}> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for experiments')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from('experiment_assignments')
      .select('variant_name, matches_count, matches_accepted, matches_rejected, chat_initiated, agreement_signed')
      .eq('experiment_id', experimentId)

    if (assignmentsError) {
      safeLogger.error('Failed to fetch assignments', { error: assignmentsError })
      return {
        total_users: 0,
        users_by_variant: {},
        metrics_by_variant: {}
      }
    }

    // Get quality metrics
    const { data: qualityMetrics, error: metricsError } = await supabase
      .from('matching_quality_metrics')
      .select('variant_name, compatibility_score, match_quality_score, outcome')
      .eq('experiment_id', experimentId)

    if (metricsError) {
      safeLogger.error('Failed to fetch quality metrics', { error: metricsError })
    }

    // Aggregate metrics by variant
    const usersByVariant: Record<string, number> = {}
    const metricsByVariant: Record<string, any> = {}

    for (const assignment of assignments || []) {
      const variant = assignment.variant_name
      
      if (!usersByVariant[variant]) {
        usersByVariant[variant] = 0
        metricsByVariant[variant] = {
          matches_count: 0,
          matches_accepted: 0,
          matches_rejected: 0,
          chat_initiated: 0,
          agreement_signed: 0,
          acceptance_rate: 0,
          chat_initiation_rate: 0,
          agreement_rate: 0,
          average_compatibility_score: 0,
          average_quality_score: 0
        }
      }

      usersByVariant[variant]++
      metricsByVariant[variant].matches_count += assignment.matches_count || 0
      metricsByVariant[variant].matches_accepted += assignment.matches_accepted || 0
      metricsByVariant[variant].matches_rejected += assignment.matches_rejected || 0
      metricsByVariant[variant].chat_initiated += assignment.chat_initiated || 0
      metricsByVariant[variant].agreement_signed += assignment.agreement_signed || 0
    }

    // Calculate rates and averages
    for (const variant of Object.keys(metricsByVariant)) {
      const metrics = metricsByVariant[variant]
      const users = usersByVariant[variant]

      if (metrics.matches_count > 0) {
        metrics.acceptance_rate = (metrics.matches_accepted / metrics.matches_count) * 100
        metrics.chat_initiation_rate = (metrics.chat_initiated / metrics.matches_count) * 100
        metrics.agreement_rate = (metrics.agreement_signed / metrics.matches_count) * 100
      }

      // Calculate average scores from quality metrics
      const variantMetrics = (qualityMetrics || []).filter(m => m.variant_name === variant)
      if (variantMetrics.length > 0) {
        metrics.average_compatibility_score = variantMetrics.reduce((sum, m) => sum + (m.compatibility_score || 0), 0) / variantMetrics.length
        metrics.average_quality_score = variantMetrics.reduce((sum, m) => sum + (m.match_quality_score || 0), 0) / variantMetrics.length
      }
    }

    return {
      total_users: assignments?.length || 0,
      users_by_variant: usersByVariant,
      metrics_by_variant: metricsByVariant
    }
  } catch (error) {
    safeLogger.error('Error fetching experiment metrics', { error })
    return {
      total_users: 0,
      users_by_variant: {},
      metrics_by_variant: {}
    }
  }
}

