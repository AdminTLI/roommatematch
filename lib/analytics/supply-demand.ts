// Supply/Demand Metrics Calculation
// This module calculates supply and demand metrics for the platform

import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

export interface SupplyDemandMetrics {
  totalSupply: number // Total users looking for roommates
  totalDemand: number // Total users offering rooms/spaces
  supplyDemandRatio: number // Demand / Supply ratio
  activeListings: number // Active housing listings
  activeSearchers: number // Active users searching for housing
  conversionRate: number // Percentage of matches that convert to agreements
  period: {
    start: string
    end: string
  }
}

export interface CohortRetentionMetrics {
  cohortDate: string
  cohortSize: number
  day1Retention: number // Percentage of users active on day 1
  day7Retention: number // Percentage of users active on day 7
  day30Retention: number // Percentage of users active on day 30
  day90Retention: number // Percentage of users active on day 90
  period: {
    start: string
    end: string
  }
}

/**
 * Calculate supply and demand metrics
 */
export async function calculateSupplyDemandMetrics(
  universityId?: string,
  periodDays: number = 30
): Promise<SupplyDemandMetrics> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for analytics')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000)
    const periodEnd = new Date()

    // Count users looking for housing (demand)
    let demandQuery = supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('looking_for', 'roommate')
      .eq('status', 'active')

    if (universityId) {
      demandQuery = demandQuery.eq('university_id', universityId)
    }

    const { count: totalDemand, error: demandError } = await demandQuery

    if (demandError) {
      safeLogger.error('Failed to count demand', { error: demandError })
    }

    // Count users offering housing (supply)
    let supplyQuery = supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('looking_for', 'room')
      .eq('status', 'active')

    if (universityId) {
      supplyQuery = supplyQuery.eq('university_id', universityId)
    }

    const { count: totalSupply, error: supplyError } = await supplyQuery

    if (supplyError) {
      safeLogger.error('Failed to count supply', { error: supplyError })
    }

    // Count active listings
    let listingsQuery = supabase
      .from('housing_listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('created_at', periodStart.toISOString())

    if (universityId) {
      listingsQuery = listingsQuery.eq('university_id', universityId)
    }

    const { count: activeListings, error: listingsError } = await listingsQuery

    if (listingsError) {
      safeLogger.error('Failed to count active listings', { error: listingsError })
    }

    // Count active searchers (users with recent activity)
    let searchersQuery = supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('looking_for', 'roommate')
      .eq('status', 'active')
      .gte('last_active_at', periodStart.toISOString())

    if (universityId) {
      searchersQuery = searchersQuery.eq('university_id', universityId)
    }

    const { count: activeSearchers, error: searchersError } = await searchersQuery

    if (searchersError) {
      safeLogger.error('Failed to count active searchers', { error: searchersError })
    }

    // Calculate conversion rate (matches -> agreements)
    let matchesQuery = supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString())

    if (universityId) {
      matchesQuery = matchesQuery.eq('university_id', universityId)
    }

    const { count: totalMatches, error: matchesError } = await matchesQuery

    let agreementsQuery = supabase
      .from('agreements')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString())

    if (universityId) {
      agreementsQuery = agreementsQuery.eq('university_id', universityId)
    }

    const { count: totalAgreements, error: agreementsError } = await agreementsQuery

    if (agreementsError) {
      safeLogger.error('Failed to count agreements', { error: agreementsError })
    }

    const conversionRate = totalMatches && totalMatches > 0
      ? (totalAgreements || 0) / totalMatches * 100
      : 0

    const supplyDemandRatio = totalSupply && totalSupply > 0
      ? (totalDemand || 0) / totalSupply
      : 0

    return {
      totalSupply: totalSupply || 0,
      totalDemand: totalDemand || 0,
      supplyDemandRatio,
      activeListings: activeListings || 0,
      activeSearchers: activeSearchers || 0,
      conversionRate,
      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString()
      }
    }
  } catch (error) {
    safeLogger.error('Error calculating supply/demand metrics', { error })
    throw error
  }
}

/**
 * Store supply/demand metrics in analytics_metrics table
 */
export async function storeSupplyDemandMetrics(
  metrics: SupplyDemandMetrics,
  universityId?: string
): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for analytics')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Store overall supply/demand ratio
    const { error: ratioError } = await supabase
      .from('analytics_metrics')
      .insert({
        metric_name: 'supply_demand_ratio',
        metric_category: 'housing_availability',
        metric_type: 'ratio',
        metric_value: metrics.supplyDemandRatio,
        period_start: metrics.period.start,
        period_end: metrics.period.end,
        granularity: 'daily',
        university_id: universityId,
        filter_criteria: {
          totalSupply: metrics.totalSupply,
          totalDemand: metrics.totalDemand,
          activeListings: metrics.activeListings,
          activeSearchers: metrics.activeSearchers,
          conversionRate: metrics.conversionRate
        },
        data_source: 'supply_demand_calculator',
        calculation_method: 'user_profile_count',
        confidence_level: 1.0
      })

    if (ratioError) {
      safeLogger.error('Failed to store supply/demand ratio', { error: ratioError })
      return false
    }

    // Store total supply
    const { error: supplyError } = await supabase
      .from('analytics_metrics')
      .insert({
        metric_name: 'total_supply',
        metric_category: 'housing_availability',
        metric_type: 'count',
        metric_value: metrics.totalSupply,
        period_start: metrics.period.start,
        period_end: metrics.period.end,
        granularity: 'daily',
        university_id: universityId,
        filter_criteria: {
          looking_for: 'room'
        },
        data_source: 'supply_demand_calculator',
        calculation_method: 'user_profile_count',
        confidence_level: 1.0
      })

    if (supplyError) {
      safeLogger.error('Failed to store total supply', { error: supplyError })
    }

    // Store total demand
    const { error: demandError } = await supabase
      .from('analytics_metrics')
      .insert({
        metric_name: 'total_demand',
        metric_category: 'housing_availability',
        metric_type: 'count',
        metric_value: metrics.totalDemand,
        period_start: metrics.period.start,
        period_end: metrics.period.end,
        granularity: 'daily',
        university_id: universityId,
        filter_criteria: {
          looking_for: 'roommate'
        },
        data_source: 'supply_demand_calculator',
        calculation_method: 'user_profile_count',
        confidence_level: 1.0
      })

    if (demandError) {
      safeLogger.error('Failed to store total demand', { error: demandError })
    }

    // Store conversion rate
    const { error: conversionError } = await supabase
      .from('analytics_metrics')
      .insert({
        metric_name: 'match_to_agreement_conversion_rate',
        metric_category: 'matching_success',
        metric_type: 'percentage',
        metric_value: metrics.conversionRate,
        period_start: metrics.period.start,
        period_end: metrics.period.end,
        granularity: 'daily',
        university_id: universityId,
        filter_criteria: {
          activeListings: metrics.activeListings,
          activeSearchers: metrics.activeSearchers
        },
        data_source: 'supply_demand_calculator',
        calculation_method: 'matches_to_agreements',
        confidence_level: 1.0
      })

    if (conversionError) {
      safeLogger.error('Failed to store conversion rate', { error: conversionError })
    }

    return true
  } catch (error) {
    safeLogger.error('Error storing supply/demand metrics', { error })
    return false
  }
}

/**
 * Calculate cohort retention metrics
 */
export async function calculateCohortRetentionMetrics(
  cohortDate: string,
  universityId?: string
): Promise<CohortRetentionMetrics> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for analytics')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const cohortStart = new Date(cohortDate)
    const cohortEnd = new Date(cohortStart.getTime() + 24 * 60 * 60 * 1000) // +1 day

    // Count cohort size (users who signed up in this cohort)
    let cohortQuery = supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', cohortStart.toISOString())
      .lt('created_at', cohortEnd.toISOString())

    if (universityId) {
      cohortQuery = cohortQuery.eq('university_id', universityId)
    }

    const { count: cohortSize, error: cohortError } = await cohortQuery

    if (cohortError) {
      safeLogger.error('Failed to count cohort size', { error: cohortError })
    }

    if (!cohortSize || cohortSize === 0) {
      return {
        cohortDate,
        cohortSize: 0,
        day1Retention: 0,
        day7Retention: 0,
        day30Retention: 0,
        day90Retention: 0,
        period: {
          start: cohortStart.toISOString(),
          end: cohortEnd.toISOString()
        }
      }
    }

    // Get cohort user IDs
    let cohortUsersQuery = supabase
      .from('users')
      .select('id')
      .gte('created_at', cohortStart.toISOString())
      .lt('created_at', cohortEnd.toISOString())

    if (universityId) {
      cohortUsersQuery = cohortUsersQuery.eq('university_id', universityId)
    }

    const { data: cohortUsers, error: usersError } = await cohortUsersQuery

    if (usersError || !cohortUsers) {
      safeLogger.error('Failed to fetch cohort users', { error: usersError })
      return {
        cohortDate,
        cohortSize: 0,
        day1Retention: 0,
        day7Retention: 0,
        day30Retention: 0,
        day90Retention: 0,
        period: {
          start: cohortStart.toISOString(),
          end: cohortEnd.toISOString()
        }
      }
    }

    const cohortUserIds = cohortUsers.map(u => u.id)

    // Calculate Day 1 retention (users active on day 1)
    const day1Start = new Date(cohortStart.getTime() + 24 * 60 * 60 * 1000)
    const day1End = new Date(cohortStart.getTime() + 2 * 24 * 60 * 60 * 1000)

    const { count: day1Active, error: day1Error } = await supabase
      .from('user_journey_events')
      .select('user_id', { count: 'exact', head: true })
      .in('user_id', cohortUserIds)
      .gte('event_timestamp', day1Start.toISOString())
      .lt('event_timestamp', day1End.toISOString())

    const day1Retention = day1Error || !day1Active || cohortSize === 0
      ? 0
      : (day1Active / cohortSize) * 100

    // Calculate Day 7 retention (users active on day 7)
    const day7Start = new Date(cohortStart.getTime() + 7 * 24 * 60 * 60 * 1000)
    const day7End = new Date(cohortStart.getTime() + 8 * 24 * 60 * 60 * 1000)

    const { count: day7Active, error: day7Error } = await supabase
      .from('user_journey_events')
      .select('user_id', { count: 'exact', head: true })
      .in('user_id', cohortUserIds)
      .gte('event_timestamp', day7Start.toISOString())
      .lt('event_timestamp', day7End.toISOString())

    const day7Retention = day7Error || !day7Active || cohortSize === 0
      ? 0
      : (day7Active / cohortSize) * 100

    // Calculate Day 30 retention (users active on day 30)
    const day30Start = new Date(cohortStart.getTime() + 30 * 24 * 60 * 60 * 1000)
    const day30End = new Date(cohortStart.getTime() + 31 * 24 * 60 * 60 * 1000)

    const { count: day30Active, error: day30Error } = await supabase
      .from('user_journey_events')
      .select('user_id', { count: 'exact', head: true })
      .in('user_id', cohortUserIds)
      .gte('event_timestamp', day30Start.toISOString())
      .lt('event_timestamp', day30End.toISOString())

    const day30Retention = day30Error || !day30Active || cohortSize === 0
      ? 0
      : (day30Active / cohortSize) * 100

    // Calculate Day 90 retention (users active on day 90)
    const day90Start = new Date(cohortStart.getTime() + 90 * 24 * 60 * 60 * 1000)
    const day90End = new Date(cohortStart.getTime() + 91 * 24 * 60 * 60 * 1000)

    const { count: day90Active, error: day90Error } = await supabase
      .from('user_journey_events')
      .select('user_id', { count: 'exact', head: true })
      .in('user_id', cohortUserIds)
      .gte('event_timestamp', day90Start.toISOString())
      .lt('event_timestamp', day90End.toISOString())

    const day90Retention = day90Error || !day90Active || cohortSize === 0
      ? 0
      : (day90Active / cohortSize) * 100

    return {
      cohortDate,
      cohortSize,
      day1Retention,
      day7Retention,
      day30Retention,
      day90Retention,
      period: {
        start: cohortStart.toISOString(),
        end: cohortEnd.toISOString()
      }
    }
  } catch (error) {
    safeLogger.error('Error calculating cohort retention metrics', { error })
    throw error
  }
}

/**
 * Store cohort retention metrics in analytics_metrics table
 */
export async function storeCohortRetentionMetrics(
  metrics: CohortRetentionMetrics,
  universityId?: string
): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for analytics')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Store retention rates
    const retentionRates = [
      { name: 'day1_retention', value: metrics.day1Retention },
      { name: 'day7_retention', value: metrics.day7Retention },
      { name: 'day30_retention', value: metrics.day30Retention },
      { name: 'day90_retention', value: metrics.day90Retention }
    ]

    for (const rate of retentionRates) {
      const { error } = await supabase
        .from('analytics_metrics')
        .insert({
          metric_name: rate.name,
          metric_category: 'retention_rates',
          metric_type: 'percentage',
          metric_value: rate.value,
          period_start: metrics.period.start,
          period_end: metrics.period.end,
          granularity: 'daily',
          university_id: universityId,
          filter_criteria: {
            cohortDate: metrics.cohortDate,
            cohortSize: metrics.cohortSize
          },
          data_source: 'cohort_retention_calculator',
          calculation_method: 'user_journey_events',
          confidence_level: 1.0
        })

      if (error) {
        safeLogger.error(`Failed to store ${rate.name}`, { error })
      }
    }

    return true
  } catch (error) {
    safeLogger.error('Error storing cohort retention metrics', { error })
    return false
  }
}

