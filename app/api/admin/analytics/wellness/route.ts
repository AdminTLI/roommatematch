import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { safeLogger } from '@/lib/utils/logger'

type SurveyType = 'day_14' | 'day_30'

interface WellnessRow {
  user_id: string
  survey_type: SurveyType
  found_housing: boolean
  found_with_match: boolean | null
  reduced_stress: boolean
  created_at: string
}

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin(request, false)

    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { adminRecord } = adminCheck
    const admin = createAdminClient()

    const isSuperAdmin = adminRecord?.role === 'super_admin'
    const universityId = isSuperAdmin ? null : adminRecord?.university_id

    // If admin is scoped to a university, find all user_ids for that university
    let universityUserIds: Set<string> | null = null
    if (universityId) {
      const { data: academic, error: academicError } = await admin
        .from('user_academic')
        .select('user_id')
        .eq('university_id', universityId)

      if (academicError) {
        safeLogger.error('[Admin Wellness Analytics] Failed to load user_academic', {
          error: academicError,
          universityId,
        })
      }

      universityUserIds = new Set(academic?.map((a) => a.user_id) || [])
    }

    // Load wellness survey rows, optionally filtered by university users
    let wellnessQuery = admin
      .from('wellness_surveys')
      .select('user_id, survey_type, found_housing, found_with_match, reduced_stress, created_at')

    if (universityId && universityUserIds) {
      if (universityUserIds.size === 0) {
        // No users in this university – return empty dataset
        return NextResponse.json({
          overall: {
            totalResponses: 0,
            day14Responses: 0,
            day30Responses: 0,
            foundHousingRate: 0,
            foundWithMatchRate: 0,
            reducedStressRate: 0,
          },
          bySurveyType: [],
          timeSeries: [],
        })
      }

      wellnessQuery = wellnessQuery.in('user_id', Array.from(universityUserIds))
    }

    const { data: rows, error } = await wellnessQuery

    if (error) {
      safeLogger.error('[Admin Wellness Analytics] Failed to load wellness_surveys', { error })
      return NextResponse.json(
        { error: 'Failed to load wellness survey analytics' },
        { status: 500 }
      )
    }

    const typedRows = (rows || []) as WellnessRow[]

    if (typedRows.length === 0) {
      return NextResponse.json({
        overall: {
          totalResponses: 0,
          day14Responses: 0,
          day30Responses: 0,
          foundHousingRate: 0,
          foundWithMatchRate: 0,
          reducedStressRate: 0,
        },
        bySurveyType: [],
        timeSeries: [],
      })
    }

    const surveyTypes: SurveyType[] = ['day_14', 'day_30']

    const bySurveyType = surveyTypes.map((type) => {
      const subset = typedRows.filter((r) => r.survey_type === type)
      const total = subset.length

      const foundHousingCount = subset.filter((r) => r.found_housing).length

      const foundHousingTrue = subset.filter((r) => r.found_housing)
      const foundWithMatchCount = foundHousingTrue.filter((r) => r.found_with_match === true).length

      const reducedStressCount = subset.filter((r) => r.reduced_stress).length

      return {
        surveyType: type,
        label: type === 'day_14' ? 'Day 14' : 'Day 30',
        totalResponses: total,
        foundHousingRate: total > 0 ? (foundHousingCount / total) * 100 : 0,
        foundWithMatchRate:
          foundHousingTrue.length > 0 ? (foundWithMatchCount / foundHousingTrue.length) * 100 : null,
        reducedStressRate: total > 0 ? (reducedStressCount / total) * 100 : 0,
      }
    })

    const totalResponses = typedRows.length
    const day14Responses = bySurveyType.find((s) => s.surveyType === 'day_14')?.totalResponses ?? 0
    const day30Responses = bySurveyType.find((s) => s.surveyType === 'day_30')?.totalResponses ?? 0

    const overallFoundHousingCount = typedRows.filter((r) => r.found_housing).length
    const overallFoundHousingTrue = typedRows.filter((r) => r.found_housing)
    const overallFoundWithMatchCount = overallFoundHousingTrue.filter(
      (r) => r.found_with_match === true
    ).length
    const overallReducedStressCount = typedRows.filter((r) => r.reduced_stress).length

    const overall = {
      totalResponses,
      day14Responses,
      day30Responses,
      foundHousingRate: totalResponses > 0 ? (overallFoundHousingCount / totalResponses) * 100 : 0,
      foundWithMatchRate:
        overallFoundHousingTrue.length > 0
          ? (overallFoundWithMatchCount / overallFoundHousingTrue.length) * 100
          : 0,
      reducedStressRate:
        totalResponses > 0 ? (overallReducedStressCount / totalResponses) * 100 : 0,
    }

    // Time series: aggregate by date (YYYY-MM-DD) and survey_type
    const timeSeriesMap = new Map<
      string,
      {
        date: string
        surveyType: SurveyType
        totalResponses: number
        foundHousing: number
        foundWithMatch: number
        reducedStress: number
      }
    >()

    for (const row of typedRows) {
      const dateKey = new Date(row.created_at).toISOString().split('T')[0]
      const key = `${dateKey}:${row.survey_type}`
      const existing = timeSeriesMap.get(key) ?? {
        date: dateKey,
        surveyType: row.survey_type,
        totalResponses: 0,
        foundHousing: 0,
        foundWithMatch: 0,
        reducedStress: 0,
      }

      existing.totalResponses += 1
      if (row.found_housing) {
        existing.foundHousing += 1
        if (row.found_with_match) {
          existing.foundWithMatch += 1
        }
      }
      if (row.reduced_stress) {
        existing.reducedStress += 1
      }

      timeSeriesMap.set(key, existing)
    }

    const timeSeries = Array.from(timeSeriesMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    )

    return NextResponse.json({
      overall,
      bySurveyType,
      timeSeries,
    })
  } catch (error) {
    safeLogger.error('[Admin Wellness Analytics] Unexpected error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

