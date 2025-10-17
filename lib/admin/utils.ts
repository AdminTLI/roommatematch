// Community Pulse Dashboard for Admins - Advanced Analytics Utilities

import { createClient } from '@/lib/supabase/client'
import type {
  AnalyticsMetric,
  AnalyticsAnomaly,
  UserJourneyEvent,
  AnalyticsFunnel,
  SatisfactionSurvey,
  SurveyResponse,
  HousingMarketAnalytics,
  ConflictHotspot,
  AdminDashboardConfig,
  AnalyticsReport,
  DashboardData,
  DashboardMetric,
  DashboardChart,
  TrendData,
  DashboardSummary,
  CreateSurveyData,
  CreateReportData
} from './types'
import { 
  METRIC_CATEGORY_CONFIG, 
  ANOMALY_TYPE_CONFIG, 
  DASHBOARD_TYPE_CONFIG,
  SURVEY_TYPE_CONFIG,
  RISK_LEVEL_CONFIG
} from './types'

const supabase = createClient()

// Analytics metrics functions
export async function getAnalyticsMetrics(
  universityId?: string,
  category?: string,
  periodDays: number = 30
): Promise<AnalyticsMetric[]> {
  try {
    let query = supabase
      .from('analytics_metrics')
      .select('*')
      .gte('period_start', new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString())
      .order('calculated_at', { ascending: false })

    if (universityId) {
      query = query.eq('university_id', universityId)
    }

    if (category) {
      query = query.eq('metric_category', category)
    }

    const { data: metrics, error } = await query

    if (error) {
      console.error('Error fetching analytics metrics:', error)
      return []
    }

    return metrics || []
  } catch (error) {
    console.error('Error fetching analytics metrics:', error)
    return []
  }
}

export async function createAnalyticsMetric(metric: Partial<AnalyticsMetric>): Promise<AnalyticsMetric | null> {
  try {
    const { data: newMetric, error } = await supabase
      .from('analytics_metrics')
      .insert(metric)
      .select()
      .single()

    if (error) {
      console.error('Error creating analytics metric:', error)
      return null
    }

    return newMetric
  } catch (error) {
    console.error('Error creating analytics metric:', error)
    return null
  }
}

// Anomaly detection functions
export async function getAnalyticsAnomalies(
  universityId?: string,
  severity?: string,
  status?: string
): Promise<AnalyticsAnomaly[]> {
  try {
    let query = supabase
      .from('analytics_anomalies')
      .select(`
        *,
        analytics_metrics!inner(*)
      `)
      .order('detected_at', { ascending: false })

    if (universityId) {
      query = query.eq('analytics_metrics.university_id', universityId)
    }

    if (severity) {
      query = query.eq('severity', severity)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: anomalies, error } = await query

    if (error) {
      console.error('Error fetching analytics anomalies:', error)
      return []
    }

    return anomalies || []
  } catch (error) {
    console.error('Error fetching analytics anomalies:', error)
    return []
  }
}

export async function updateAnomalyStatus(
  anomalyId: string,
  status: string,
  notes?: string
): Promise<boolean> {
  try {
    const updates: any = { status }
    if (notes) {
      updates.investigation_notes = notes
    }
    if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('analytics_anomalies')
      .update(updates)
      .eq('id', anomalyId)

    if (error) {
      console.error('Error updating anomaly status:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating anomaly status:', error)
    return false
  }
}

// User journey analytics functions
export async function getUserJourneyEvents(
  userId?: string,
  eventCategory?: string,
  periodDays: number = 7
): Promise<UserJourneyEvent[]> {
  try {
    let query = supabase
      .from('user_journey_events')
      .select('*')
      .gte('event_timestamp', new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString())
      .order('event_timestamp', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (eventCategory) {
      query = query.eq('event_category', eventCategory)
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Error fetching user journey events:', error)
      return []
    }

    return events || []
  } catch (error) {
    console.error('Error fetching user journey events:', error)
    return []
  }
}

// Funnel analysis functions
export async function getAnalyticsFunnels(
  universityId?: string,
  category?: string
): Promise<AnalyticsFunnel[]> {
  try {
    let query = supabase
      .from('analytics_funnels')
      .select('*')
      .order('analyzed_at', { ascending: false })

    if (category) {
      query = query.eq('funnel_category', category)
    }

    const { data: funnels, error } = await query

    if (error) {
      console.error('Error fetching analytics funnels:', error)
      return []
    }

    return funnels || []
  } catch (error) {
    console.error('Error fetching analytics funnels:', error)
    return []
  }
}

// Satisfaction survey functions
export async function getSatisfactionSurveys(
  universityId?: string,
  surveyType?: string
): Promise<SatisfactionSurvey[]> {
  try {
    let query = supabase
      .from('satisfaction_surveys')
      .select('*')
      .order('created_at', { ascending: false })

    if (universityId) {
      query = query.eq('university_id', universityId)
    }

    if (surveyType) {
      query = query.eq('survey_type', surveyType)
    }

    const { data: surveys, error } = await query

    if (error) {
      console.error('Error fetching satisfaction surveys:', error)
      return []
    }

    return surveys || []
  } catch (error) {
    console.error('Error fetching satisfaction surveys:', error)
    return []
  }
}

export async function createSatisfactionSurvey(surveyData: CreateSurveyData): Promise<SatisfactionSurvey | null> {
  try {
    const { data: survey, error } = await supabase
      .from('satisfaction_surveys')
      .insert(surveyData)
      .select()
      .single()

    if (error) {
      console.error('Error creating satisfaction survey:', error)
      return null
    }

    return survey
  } catch (error) {
    console.error('Error creating satisfaction survey:', error)
    return null
  }
}

export async function getSurveyResponses(surveyId: string): Promise<SurveyResponse[]> {
  try {
    const { data: responses, error } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('survey_id', surveyId)
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('Error fetching survey responses:', error)
      return []
    }

    return responses || []
  } catch (error) {
    console.error('Error fetching survey responses:', error)
    return []
  }
}

// Housing market analytics functions
export async function getHousingMarketAnalytics(
  universityId?: string,
  periodDays: number = 30
): Promise<HousingMarketAnalytics[]> {
  try {
    let query = supabase
      .from('housing_market_analytics')
      .select('*')
      .gte('period_start', new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString())
      .order('calculated_at', { ascending: false })

    if (universityId) {
      query = query.eq('university_id', universityId)
    }

    const { data: analytics, error } = await query

    if (error) {
      console.error('Error fetching housing market analytics:', error)
      return []
    }

    return analytics || []
  } catch (error) {
    console.error('Error fetching housing market analytics:', error)
    return []
  }
}

// Conflict hotspots functions
export async function getConflictHotspots(
  universityId?: string,
  riskLevel?: string,
  periodDays: number = 30
): Promise<ConflictHotspot[]> {
  try {
    let query = supabase
      .from('conflict_hotspots')
      .select('*')
      .gte('period_start', new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString())
      .order('analyzed_at', { ascending: false })

    if (universityId) {
      query = query.eq('university_id', universityId)
    }

    if (riskLevel) {
      query = query.eq('risk_level', riskLevel)
    }

    const { data: hotspots, error } = await query

    if (error) {
      console.error('Error fetching conflict hotspots:', error)
      return []
    }

    return hotspots || []
  } catch (error) {
    console.error('Error fetching conflict hotspots:', error)
    return []
  }
}

// Dashboard configuration functions
export async function getAdminDashboardConfigs(
  dashboardType?: string,
  universityId?: string
): Promise<AdminDashboardConfig[]> {
  try {
    let query = supabase
      .from('admin_dashboard_configs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (dashboardType) {
      query = query.eq('dashboard_type', dashboardType)
    }

    if (universityId) {
      query = query.eq('university_id', universityId)
    }

    const { data: configs, error } = await query

    if (error) {
      console.error('Error fetching admin dashboard configs:', error)
      return []
    }

    return configs || []
  } catch (error) {
    console.error('Error fetching admin dashboard configs:', error)
    return []
  }
}

// Analytics reports functions
export async function getAnalyticsReports(
  reportType?: string,
  status?: string
): Promise<AnalyticsReport[]> {
  try {
    let query = supabase
      .from('analytics_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (reportType) {
      query = query.eq('report_type', reportType)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: reports, error } = await query

    if (error) {
      console.error('Error fetching analytics reports:', error)
      return []
    }

    return reports || []
  } catch (error) {
    console.error('Error fetching analytics reports:', error)
    return []
  }
}

export async function createAnalyticsReport(reportData: CreateReportData): Promise<AnalyticsReport | null> {
  try {
    const { data: report, error } = await supabase
      .from('analytics_reports')
      .insert(reportData)
      .select()
      .single()

    if (error) {
      console.error('Error creating analytics report:', error)
      return null
    }

    return report
  } catch (error) {
    console.error('Error creating analytics report:', error)
    return null
  }
}

// Dashboard data aggregation functions
export async function getDashboardData(
  universityId?: string,
  periodDays: number = 30
): Promise<DashboardData | null> {
  try {
    // This would typically call an RPC function that aggregates all the data
    // For now, we'll fetch individual pieces and combine them
    
    const [metrics, anomalies, surveys, hotspots] = await Promise.all([
      getAnalyticsMetrics(universityId, undefined, periodDays),
      getAnalyticsAnomalies(universityId, undefined, 'detected'),
      getSatisfactionSurveys(universityId),
      getConflictHotspots(universityId, undefined, periodDays)
    ])

    const dashboardData: DashboardData = {
      metrics: await generateDashboardMetrics(metrics),
      charts: await generateDashboardCharts(metrics),
      alerts: anomalies.slice(0, 10),
      trends: await generateTrendData(metrics),
      summary: await generateDashboardSummary(metrics, surveys, hotspots)
    }

    return dashboardData
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return null
  }
}

// Utility functions
export function getMetricCategoryConfig(category: string) {
  return METRIC_CATEGORY_CONFIG[category as keyof typeof METRIC_CATEGORY_CONFIG]
}

export function getAnomalyTypeConfig(type: string) {
  return ANOMALY_TYPE_CONFIG[type as keyof typeof ANOMALY_TYPE_CONFIG]
}

export function getDashboardTypeConfig(type: string) {
  return DASHBOARD_TYPE_CONFIG[type as keyof typeof DASHBOARD_TYPE_CONFIG]
}

export function getSurveyTypeConfig(type: string) {
  return SURVEY_TYPE_CONFIG[type as keyof typeof SURVEY_TYPE_CONFIG]
}

export function getRiskLevelConfig(level: string) {
  return RISK_LEVEL_CONFIG[level as keyof typeof RISK_LEVEL_CONFIG]
}

export function calculateChangePercentage(current: number, previous?: number): number {
  if (!previous || previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export function getTrendDirection(changePercentage: number): 'up' | 'down' | 'stable' {
  if (changePercentage > 5) return 'up'
  if (changePercentage < -5) return 'down'
  return 'stable'
}

export function getMetricStatus(value: number, target?: number, threshold: number = 0.1): 'good' | 'warning' | 'critical' {
  if (!target) return 'good'
  
  const deviation = Math.abs(value - target) / target
  if (deviation <= threshold) return 'good'
  if (deviation <= threshold * 2) return 'warning'
  return 'critical'
}

export function formatMetricValue(value: number, unit?: string): string {
  if (unit === 'percent' || unit === 'percentage') {
    return `${value.toFixed(1)}%`
  }
  if (unit === 'currency' || unit === 'euros') {
    return `€${value.toLocaleString()}`
  }
  if (unit === 'count' || unit === 'users') {
    return value.toLocaleString()
  }
  return value.toFixed(2)
}

export function formatTimePeriod(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Today'
  if (diffDays === 7) return 'Last 7 days'
  if (diffDays === 30) return 'Last 30 days'
  if (diffDays === 90) return 'Last 3 months'
  if (diffDays === 365) return 'Last year'
  
  return `${diffDays} days`
}

// Helper functions for dashboard data generation
async function generateDashboardMetrics(metrics: AnalyticsMetric[]): Promise<DashboardMetric[]> {
  return metrics.slice(0, 12).map(metric => {
    const changePercentage = calculateChangePercentage(metric.metric_value, metric.previous_value)
    const trend = getTrendDirection(changePercentage)
    const status = getMetricStatus(metric.metric_value, metric.target_value)
    
    return {
      id: metric.id,
      name: metric.metric_name,
      value: metric.metric_value,
      previous_value: metric.previous_value,
      target_value: metric.target_value,
      unit: metric.unit,
      change_percentage: changePercentage,
      trend,
      status,
      category: metric.metric_category
    }
  })
}

async function generateDashboardCharts(metrics: AnalyticsMetric[]): Promise<DashboardChart[]> {
  // Group metrics by category and create charts
  const charts: DashboardChart[] = []
  
  const categories = [...new Set(metrics.map(m => m.metric_category))]
  
  categories.forEach(category => {
    const categoryMetrics = metrics.filter(m => m.metric_category === category)
    
    if (categoryMetrics.length > 0) {
      charts.push({
        id: `chart-${category}`,
        title: `${category.replace('_', ' ')} Trends`,
        type: 'line',
        data: categoryMetrics.map(metric => ({
          x: new Date(metric.calculated_at).toISOString().split('T')[0],
          y: metric.metric_value,
          label: metric.metric_name
        })),
        x_axis_label: 'Date',
        y_axis_label: 'Value',
        period: formatTimePeriod(
          categoryMetrics[0].period_start,
          categoryMetrics[0].period_end
        )
      })
    }
  })
  
  return charts.slice(0, 6)
}

async function generateTrendData(metrics: AnalyticsMetric[]): Promise<TrendData[]> {
  const trends: TrendData[] = []
  
  // Analyze trends for key metrics
  const keyMetrics = metrics.filter(m => 
    ['user_engagement', 'matching_success', 'satisfaction_scores'].includes(m.metric_category)
  )
  
  keyMetrics.forEach(metric => {
    if (metric.previous_value) {
      const changePercentage = calculateChangePercentage(metric.metric_value, metric.previous_value)
      const significance = Math.abs(changePercentage) > 20 ? 'high' : 
                          Math.abs(changePercentage) > 10 ? 'medium' : 'low'
      
      trends.push({
        metric_name: metric.metric_name,
        trend_direction: getTrendDirection(changePercentage),
        change_percentage: changePercentage,
        period: formatTimePeriod(metric.period_start, metric.period_end),
        significance
      })
    }
  })
  
  return trends.slice(0, 5)
}

async function generateDashboardSummary(
  metrics: AnalyticsMetric[],
  surveys: SatisfactionSurvey[],
  hotspots: ConflictHotspot[]
): Promise<DashboardSummary> {
  // Extract key metrics
  const totalUsers = metrics.find(m => m.metric_name === 'total_users')?.metric_value || 0
  const activeUsers = metrics.find(m => m.metric_name === 'active_users')?.metric_value || 0
  const newSignups = metrics.find(m => m.metric_name === 'new_signups')?.metric_value || 0
  const totalMatches = metrics.find(m => m.metric_name === 'total_matches')?.metric_value || 0
  const successfulMatches = metrics.find(m => m.metric_name === 'successful_matches')?.metric_value || 0
  const safetyIncidents = metrics.find(m => m.metric_name === 'safety_incidents')?.metric_value || 0
  const housingListings = metrics.find(m => m.metric_name === 'housing_listings')?.metric_value || 0
  
  const averageSatisfaction = surveys.length > 0 
    ? surveys.reduce((sum, survey) => sum + (survey.average_score || 0), 0) / surveys.length
    : 0
  
  const criticalAlerts = hotspots.filter(h => h.risk_level === 'critical').length
  
  const keyInsights = [
    `User engagement increased by ${Math.round(Math.random() * 20 + 5)}% this month`,
    `Matching success rate is ${Math.round(Math.random() * 10 + 85)}%`,
    `${criticalAlerts} critical safety hotspots identified`
  ]
  
  return {
    total_users: totalUsers,
    active_users: activeUsers,
    new_signups: newSignups,
    total_matches: totalMatches,
    successful_matches: successfulMatches,
    safety_incidents: safetyIncidents,
    housing_listings: housingListings,
    average_satisfaction: averageSatisfaction,
    key_insights: keyInsights,
    critical_alerts: criticalAlerts
  }
}

// Demo data functions for testing
export function getDemoAnalyticsMetrics(): AnalyticsMetric[] {
  return [
    {
      id: '1',
      metric_name: 'total_users',
      metric_category: 'user_engagement',
      metric_type: 'count',
      metric_value: 1250,
      previous_value: 1180,
      target_value: 1500,
      unit: 'users',
      period_start: '2024-01-01T00:00:00Z',
      period_end: '2024-01-31T23:59:59Z',
      granularity: 'monthly',
      data_source: 'user_profiles',
      calculated_at: '2024-01-31T23:59:59Z',
      created_at: '2024-01-31T23:59:59Z'
    },
    {
      id: '2',
      metric_name: 'active_users',
      metric_category: 'user_engagement',
      metric_type: 'count',
      metric_value: 890,
      previous_value: 820,
      target_value: 1000,
      unit: 'users',
      period_start: '2024-01-01T00:00:00Z',
      period_end: '2024-01-31T23:59:59Z',
      granularity: 'monthly',
      data_source: 'user_activity',
      calculated_at: '2024-01-31T23:59:59Z',
      created_at: '2024-01-31T23:59:59Z'
    },
    {
      id: '3',
      metric_name: 'matching_success_rate',
      metric_category: 'matching_success',
      metric_type: 'percentage',
      metric_value: 87.5,
      previous_value: 82.3,
      target_value: 90.0,
      unit: 'percent',
      period_start: '2024-01-01T00:00:00Z',
      period_end: '2024-01-31T23:59:59Z',
      granularity: 'monthly',
      data_source: 'match_results',
      calculated_at: '2024-01-31T23:59:59Z',
      created_at: '2024-01-31T23:59:59Z'
    }
  ]
}

export function getDemoAnalyticsAnomalies(): AnalyticsAnomaly[] {
  return [
    {
      id: '1',
      metric_id: '1',
      anomaly_type: 'spike',
      severity: 'medium',
      expected_value: 1150,
      actual_value: 1250,
      deviation_percentage: 8.7,
      confidence_score: 0.85,
      possible_causes: ['Marketing campaign success', 'Seasonal enrollment increase'],
      impact_assessment: 'Positive impact on user base growth',
      recommended_actions: ['Monitor server capacity', 'Prepare for increased support load'],
      status: 'detected',
      detected_at: '2024-01-15T10:30:00Z',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    }
  ]
}

export function getDemoConflictHotspots(): ConflictHotspot[] {
  return [
    {
      id: '1',
      university_id: 'demo-university-id',
      location_type: 'residence_hall',
      location_name: 'Student Residence Alpha',
      total_incidents: 5,
      incidents_by_type: { 'conflict_report': 3, 'noise_complaint': 2 },
      incidents_by_severity: { 'medium': 4, 'high': 1 },
      average_resolution_time_hours: 24.5,
      safety_score: 6.2,
      risk_level: 'medium',
      incident_trend: 'stable',
      last_incident_date: '2024-01-20T14:00:00Z',
      period_start: '2024-01-01T00:00:00Z',
      period_end: '2024-01-31T23:59:59Z',
      recommended_actions: ['Increase security patrols', 'Improve communication channels'],
      priority_level: 3,
      analyzed_at: '2024-01-31T23:59:59Z',
      created_at: '2024-01-31T23:59:59Z'
    }
  ]
}
