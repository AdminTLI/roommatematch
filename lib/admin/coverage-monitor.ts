// Programme Coverage Monitoring
// This module monitors programme coverage for all institutions and detects regressions

import { loadInstitutions } from '@/lib/loadInstitutions'
import { getInstitutionBrinCode } from '@/lib/duo/erkenningen'
import { getProgrammeCountsByInstitution } from '@/lib/programmes/repo'
import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'
import type { Institution } from '@/types/institution'
import type { DegreeLevel } from '@/types/programme'

export interface InstitutionCoverage {
  id: string
  label: string
  slug: string
  brin: string | null
  hasBrin: boolean
  programmes: {
    bachelor: number
    premaster: number
    master: number
  }
  missingLevels: DegreeLevel[]
  status: 'complete' | 'incomplete' | 'missing'
  totalProgrammes: number
}

export interface CoverageReport {
  totalInstitutions: number
  completeInstitutions: number
  incompleteInstitutions: number
  missingInstitutions: number
  totalProgrammes: number
  institutions: InstitutionCoverage[]
  generatedAt: string
}

/**
 * Check programme coverage for all onboarding institutions
 */
export async function checkProgrammeCoverage(): Promise<CoverageReport> {
  try {
    const institutions = loadInstitutions()
    const allInstitutions = [...institutions.wo, ...institutions.wo_special, ...institutions.hbo]

    // Get programme counts from database
    const countsByInstitution = await getProgrammeCountsByInstitution(true)

    const coverage: InstitutionCoverage[] = []
    let completeCount = 0
    let incompleteCount = 0
    let missingCount = 0
    let totalProgrammes = 0

    // Check each onboarding institution
    for (const institution of allInstitutions) {
      const brinCode = getInstitutionBrinCode(institution.id)
      const counts = countsByInstitution[institution.id] || { bachelor: 0, premaster: 0, master: 0 }

      const missingLevels: DegreeLevel[] = []
      if (counts.bachelor === 0) missingLevels.push('bachelor')
      if (counts.premaster === 0) missingLevels.push('premaster')
      if (counts.master === 0) missingLevels.push('master')

      const total = counts.bachelor + counts.premaster + counts.master
      const status = !brinCode ? 'missing' : total === 0 ? 'missing' : missingLevels.length === 0 ? 'complete' : 'incomplete'

      coverage.push({
        id: institution.id,
        label: institution.label,
        slug: institution.id,
        brin: brinCode || null,
        hasBrin: !!brinCode,
        programmes: counts,
        missingLevels,
        status,
        totalProgrammes: total
      })

      if (status === 'complete') completeCount++
      else if (status === 'incomplete') incompleteCount++
      else missingCount++

      totalProgrammes += total
    }

    return {
      totalInstitutions: allInstitutions.length,
      completeInstitutions: completeCount,
      incompleteInstitutions: incompleteCount,
      missingInstitutions: missingCount,
      totalProgrammes,
      institutions: coverage,
      generatedAt: new Date().toISOString()
    }
  } catch (error) {
    safeLogger.error('Error checking programme coverage', { error })
    throw error
  }
}

/**
 * Check if coverage has regressed (incomplete institutions increased)
 */
export async function checkCoverageRegression(
  previousReport?: CoverageReport
): Promise<{
  hasRegression: boolean
  currentReport: CoverageReport
  regressionDetails: {
    newlyIncomplete: InstitutionCoverage[]
    newlyMissing: InstitutionCoverage[]
    coverageDropped: boolean
  }
}> {
  const currentReport = await checkProgrammeCoverage()

  if (!previousReport) {
    return {
      hasRegression: false,
      currentReport,
      regressionDetails: {
        newlyIncomplete: [],
        newlyMissing: [],
        coverageDropped: false
      }
    }
  }

  // Find institutions that became incomplete or missing
  const previousInstitutions = new Map(
    previousReport.institutions.map(inst => [inst.id, inst])
  )

  const newlyIncomplete: InstitutionCoverage[] = []
  const newlyMissing: InstitutionCoverage[] = []

  for (const currentInst of currentReport.institutions) {
    const previousInst = previousInstitutions.get(currentInst.id)

    if (previousInst) {
      // Institution was complete before, now incomplete
      if (previousInst.status === 'complete' && currentInst.status === 'incomplete') {
        newlyIncomplete.push(currentInst)
      }
      // Institution was complete/incomplete before, now missing
      if ((previousInst.status === 'complete' || previousInst.status === 'incomplete') && 
          currentInst.status === 'missing') {
        newlyMissing.push(currentInst)
      }
    }
  }

  const hasRegression = newlyIncomplete.length > 0 || newlyMissing.length > 0 ||
                       currentReport.incompleteInstitutions > previousReport.incompleteInstitutions ||
                       currentReport.missingInstitutions > previousReport.missingInstitutions

  return {
    hasRegression,
    currentReport,
    regressionDetails: {
      newlyIncomplete,
      newlyMissing,
      coverageDropped: currentReport.completeInstitutions < previousReport.completeInstitutions
    }
  }
}

/**
 * Store coverage metrics in analytics_metrics table
 */
export async function storeCoverageMetrics(report: CoverageReport): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for monitoring')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const now = new Date()
    const periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000) // Last 24 hours

    // Calculate coverage percentage
    const coveragePercentage = report.totalInstitutions > 0
      ? (report.completeInstitutions / report.totalInstitutions) * 100
      : 0

    // Store overall coverage metric
    const { error: metricError } = await supabase
      .from('analytics_metrics')
      .insert({
        metric_name: 'programme_coverage_percentage',
        metric_category: 'data_quality',
        metric_type: 'percentage',
        metric_value: coveragePercentage,
        previous_value: null, // Will be updated on next run
        period_start: periodStart.toISOString(),
        period_end: now.toISOString(),
        granularity: 'daily',
        filter_criteria: {
          totalInstitutions: report.totalInstitutions,
          completeInstitutions: report.completeInstitutions,
          incompleteInstitutions: report.incompleteInstitutions,
          missingInstitutions: report.missingInstitutions,
          totalProgrammes: report.totalProgrammes
        },
        data_source: 'coverage_monitor',
        calculation_method: 'institution_programme_check',
        confidence_level: 1.0
      })

    if (metricError) {
      safeLogger.error('Failed to store coverage metric', { error: metricError })
      return false
    }

    // Store per-institution metrics for incomplete/missing institutions
    for (const institution of report.institutions) {
      if (institution.status !== 'complete') {
        const { error: instError } = await supabase
          .from('analytics_metrics')
          .insert({
            metric_name: 'institution_programme_coverage',
            metric_category: 'data_quality',
            metric_type: 'count',
            metric_value: institution.totalProgrammes,
            period_start: periodStart.toISOString(),
            period_end: now.toISOString(),
            granularity: 'daily',
            filter_criteria: {
              institutionId: institution.id,
              institutionName: institution.label,
              status: institution.status,
              missingLevels: institution.missingLevels,
              programmes: institution.programmes
            },
            data_source: 'coverage_monitor',
            calculation_method: 'institution_programme_check',
            confidence_level: 1.0
          })

        if (instError) {
          safeLogger.error('Failed to store institution coverage metric', {
            error: instError,
            institutionId: institution.id
          })
        }
      }
    }

    return true
  } catch (error) {
    safeLogger.error('Error storing coverage metrics', { error })
    return false
  }
}

/**
 * Get coverage metrics for admin dashboard
 */
export async function getCoverageMetrics(
  universityId?: string,
  periodDays: number = 30
): Promise<Array<{
  metric_name: string
  metric_value: number
  period_start: string
  period_end: string
  filter_criteria: Record<string, any>
}>> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for monitoring')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000)

    let query = supabase
      .from('analytics_metrics')
      .select('metric_name, metric_value, period_start, period_end, filter_criteria')
      .eq('metric_category', 'data_quality')
      .in('metric_name', ['programme_coverage_percentage', 'institution_programme_coverage'])
      .gte('period_start', periodStart.toISOString())
      .order('period_end', { ascending: false })

    if (universityId) {
      // Filter by university if provided
      query = query.contains('filter_criteria', { universityId })
    }

    const { data, error } = await query

    if (error) {
      safeLogger.error('Failed to fetch coverage metrics', { error })
      return []
    }

    return data || []
  } catch (error) {
    safeLogger.error('Error fetching coverage metrics', { error })
    return []
  }
}

