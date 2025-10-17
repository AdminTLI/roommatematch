// Community Pulse Dashboard for Admins - Advanced Analytics Types

export interface AnalyticsMetric {
  id: string
  metric_name: string
  metric_category: MetricCategory
  metric_type: MetricType
  metric_value: number
  previous_value?: number
  target_value?: number
  unit?: string
  period_start: string
  period_end: string
  granularity: TimeGranularity
  university_id?: string
  user_segment?: string
  filter_criteria?: Record<string, any>
  data_source: string
  calculation_method?: string
  confidence_level?: number
  calculated_at: string
  created_at: string
}

export interface AnalyticsAnomaly {
  id: string
  metric_id: string
  anomaly_type: AnomalyType
  severity: SeverityLevel
  expected_value?: number
  actual_value: number
  deviation_percentage?: number
  confidence_score?: number
  possible_causes?: string[]
  impact_assessment?: string
  recommended_actions?: string[]
  status: AnomalyStatus
  assigned_to?: string
  investigation_notes?: string
  detected_at: string
  resolved_at?: string
  created_at: string
  updated_at: string
}

export interface UserJourneyEvent {
  id: string
  user_id: string
  session_id?: string
  event_name: string
  event_category: EventCategory
  event_properties?: Record<string, any>
  page_url?: string
  referrer_url?: string
  user_agent?: string
  device_type?: string
  browser?: string
  operating_system?: string
  event_timestamp: string
  session_duration_seconds?: number
  conversion_value?: number
  conversion_goal?: string
  created_at: string
}

export interface AnalyticsFunnel {
  id: string
  funnel_name: string
  funnel_category: FunnelCategory
  steps: FunnelStep[]
  period_start: string
  period_end: string
  total_users: number
  step_conversions: Record<string, number>
  drop_off_points?: Record<string, number>
  completion_rate: number
  average_time_to_complete?: string
  bottlenecks?: string[]
  optimization_opportunities?: string[]
  analyzed_at: string
  created_at: string
}

export interface SatisfactionSurvey {
  id: string
  survey_name: string
  survey_type: SurveyType
  target_audience?: string
  questions: SurveyQuestion[]
  response_options?: SurveyResponseOption[]
  university_id?: string
  user_segments?: string[]
  distribution_method: DistributionMethod
  status: SurveyStatus
  start_date?: string
  end_date?: string
  total_responses: number
  completion_rate?: number
  average_score?: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface SurveyResponse {
  id: string
  survey_id: string
  user_id?: string
  responses: Record<string, any>
  overall_score?: number
  completion_time_seconds?: number
  device_type?: string
  browser?: string
  ip_address?: string
  started_at: string
  completed_at?: string
  created_at: string
}

export interface HousingMarketAnalytics {
  id: string
  university_id: string
  location?: string
  total_listings: number
  available_listings: number
  average_price_per_month: number
  price_range_min: number
  price_range_max: number
  total_searches: number
  unique_searchers: number
  average_search_duration_minutes?: number
  listings_per_searcher: number
  demand_supply_ratio: number
  price_trend?: PriceTrend
  availability_trend?: AvailabilityTrend
  period_start: string
  period_end: string
  calculated_at: string
  created_at: string
}

export interface ConflictHotspot {
  id: string
  university_id: string
  location_type: LocationType
  location_name?: string
  location_coordinates?: { lat: number; lng: number }
  total_incidents: number
  incidents_by_type: Record<string, number>
  incidents_by_severity: Record<string, number>
  average_resolution_time_hours: number
  safety_score: number
  risk_level: RiskLevel
  incident_trend?: IncidentTrend
  last_incident_date?: string
  period_start: string
  period_end: string
  recommended_actions?: string[]
  priority_level: number
  analyzed_at: string
  created_at: string
}

export interface AdminDashboardConfig {
  id: string
  dashboard_name: string
  dashboard_type: DashboardType
  layout_config: DashboardLayout
  widget_configs: WidgetConfig[]
  university_id?: string
  allowed_roles: string[]
  is_default: boolean
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface AnalyticsReport {
  id: string
  report_name: string
  report_type: ReportType
  report_category: ReportCategory
  report_data: Record<string, any>
  insights?: string[]
  recommendations?: string[]
  recipients: string[]
  delivery_method: DeliveryMethod
  delivery_schedule?: string
  status: ReportStatus
  generated_at?: string
  delivered_at?: string
  created_at: string
  updated_at: string
}

// Enums
export type MetricCategory = 
  | 'user_engagement' 
  | 'matching_success' 
  | 'safety_incidents' 
  | 'housing_availability' 
  | 'satisfaction_scores' 
  | 'retention_rates' 
  | 'revenue_metrics' 
  | 'performance_metrics'

export type MetricType = 'count' | 'percentage' | 'average' | 'sum' | 'rate' | 'ratio'

export type TimeGranularity = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export type AnomalyType = 
  | 'spike' 
  | 'drop' 
  | 'trend_change' 
  | 'seasonal_deviation' 
  | 'outlier' 
  | 'pattern_break'

export type AnomalyStatus = 'detected' | 'investigating' | 'acknowledged' | 'resolved' | 'false_positive'

export type EventCategory = 
  | 'page_view' 
  | 'user_action' 
  | 'system_event' 
  | 'conversion' 
  | 'error' 
  | 'performance'

export type FunnelCategory = 
  | 'onboarding' 
  | 'matching' 
  | 'housing_search' 
  | 'agreement_signing' 
  | 'payment' 
  | 'engagement'

export type SurveyType = 
  | 'nps' 
  | 'csat' 
  | 'ces' 
  | 'custom' 
  | 'post_match' 
  | 'post_agreement' 
  | 'post_move_in'

export type SurveyStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived'

export type DistributionMethod = 'in_app' | 'email' | 'sms' | 'external'

export type PriceTrend = 'increasing' | 'decreasing' | 'stable' | 'volatile'

export type AvailabilityTrend = 'improving' | 'worsening' | 'stable'

export type LocationType = 
  | 'residence_hall' 
  | 'apartment_complex' 
  | 'neighborhood' 
  | 'campus_area' 
  | 'specific_address'

export type IncidentTrend = 'increasing' | 'decreasing' | 'stable'

export type DashboardType = 
  | 'university_admin' 
  | 'super_admin' 
  | 'safety_admin' 
  | 'housing_admin' 
  | 'analytics_admin'

export type ReportType = 'scheduled' | 'triggered' | 'ad_hoc' | 'alert'

export type ReportCategory = 'summary' | 'detailed' | 'anomaly' | 'performance' | 'safety' | 'housing'

export type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed' | 'delivered'

// Complex types
export interface FunnelStep {
  name: string
  order: number
  event_name: string
  description?: string
  expected_conversion_rate?: number
}

export interface SurveyQuestion {
  id: string
  question_text: string
  question_type: 'text' | 'rating' | 'multiple_choice' | 'single_choice' | 'yes_no'
  required: boolean
  options?: string[]
  scale_min?: number
  scale_max?: number
}

export interface SurveyResponseOption {
  id: string
  label: string
  value: string | number
  color?: string
}

export interface DashboardLayout {
  columns: number
  rows: number
  widget_positions: WidgetPosition[]
}

export interface WidgetConfig {
  id: string
  type: WidgetType
  title: string
  data_source: string
  config: Record<string, any>
  refresh_interval?: number
  position: WidgetPosition
}

export interface WidgetPosition {
  x: number
  y: number
  width: number
  height: number
}

export type WidgetType = 
  | 'metric_card' 
  | 'chart' 
  | 'table' 
  | 'funnel' 
  | 'heatmap' 
  | 'alert_list' 
  | 'trend_line'

// Dashboard data types
export interface DashboardData {
  metrics: DashboardMetric[]
  charts: DashboardChart[]
  alerts: AnalyticsAnomaly[]
  trends: TrendData[]
  summary: DashboardSummary
}

export interface DashboardMetric {
  id: string
  name: string
  value: number
  previous_value?: number
  target_value?: number
  unit?: string
  change_percentage?: number
  trend: 'up' | 'down' | 'stable'
  status: 'good' | 'warning' | 'critical'
  category: MetricCategory
}

export interface DashboardChart {
  id: string
  title: string
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter'
  data: ChartDataPoint[]
  x_axis_label?: string
  y_axis_label?: string
  period: string
}

export interface ChartDataPoint {
  x: string | number
  y: number
  label?: string
  color?: string
}

export interface TrendData {
  metric_name: string
  trend_direction: 'increasing' | 'decreasing' | 'stable'
  change_percentage: number
  period: string
  significance: 'low' | 'medium' | 'high'
}

export interface DashboardSummary {
  total_users: number
  active_users: number
  new_signups: number
  total_matches: number
  successful_matches: number
  safety_incidents: number
  housing_listings: number
  average_satisfaction: number
  key_insights: string[]
  critical_alerts: number
}

// Form types
export interface CreateSurveyData {
  survey_name: string
  survey_type: SurveyType
  target_audience?: string
  questions: SurveyQuestion[]
  university_id?: string
  user_segments?: string[]
  distribution_method: DistributionMethod
  start_date?: string
  end_date?: string
}

export interface CreateReportData {
  report_name: string
  report_type: ReportType
  report_category: ReportCategory
  recipients: string[]
  delivery_method: DeliveryMethod
  delivery_schedule?: string
}

// Configuration types
export const METRIC_CATEGORY_CONFIG = {
  user_engagement: { 
    name: 'User Engagement', 
    icon: 'Users', 
    color: 'bg-blue-100 text-blue-800',
    description: 'User activity and interaction metrics'
  },
  matching_success: { 
    name: 'Matching Success', 
    icon: 'Heart', 
    color: 'bg-pink-100 text-pink-800',
    description: 'Success rates and quality of matches'
  },
  safety_incidents: { 
    name: 'Safety Incidents', 
    icon: 'Shield', 
    color: 'bg-red-100 text-red-800',
    description: 'Safety and security related metrics'
  },
  housing_availability: { 
    name: 'Housing Availability', 
    icon: 'Home', 
    color: 'bg-green-100 text-green-800',
    description: 'Housing market and availability data'
  },
  satisfaction_scores: { 
    name: 'Satisfaction Scores', 
    icon: 'Star', 
    color: 'bg-yellow-100 text-yellow-800',
    description: 'User satisfaction and feedback metrics'
  },
  retention_rates: { 
    name: 'Retention Rates', 
    icon: 'Repeat', 
    color: 'bg-purple-100 text-purple-800',
    description: 'User retention and churn metrics'
  },
  revenue_metrics: { 
    name: 'Revenue Metrics', 
    icon: 'DollarSign', 
    color: 'bg-emerald-100 text-emerald-800',
    description: 'Financial performance indicators'
  },
  performance_metrics: { 
    name: 'Performance Metrics', 
    icon: 'Activity', 
    color: 'bg-gray-100 text-gray-800',
    description: 'System and application performance'
  }
} as const

export const ANOMALY_TYPE_CONFIG = {
  spike: { 
    name: 'Spike', 
    icon: 'TrendingUp', 
    color: 'bg-green-100 text-green-800',
    description: 'Sudden increase in metric value'
  },
  drop: { 
    name: 'Drop', 
    icon: 'TrendingDown', 
    color: 'bg-red-100 text-red-800',
    description: 'Sudden decrease in metric value'
  },
  trend_change: { 
    name: 'Trend Change', 
    icon: 'RefreshCw', 
    color: 'bg-blue-100 text-blue-800',
    description: 'Change in long-term trend direction'
  },
  seasonal_deviation: { 
    name: 'Seasonal Deviation', 
    icon: 'Calendar', 
    color: 'bg-purple-100 text-purple-800',
    description: 'Unusual seasonal pattern'
  },
  outlier: { 
    name: 'Outlier', 
    icon: 'AlertTriangle', 
    color: 'bg-orange-100 text-orange-800',
    description: 'Data point significantly different from others'
  },
  pattern_break: { 
    name: 'Pattern Break', 
    icon: 'Zap', 
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Break in established patterns'
  }
} as const

export const DASHBOARD_TYPE_CONFIG = {
  university_admin: { 
    name: 'University Admin', 
    icon: 'GraduationCap', 
    color: 'bg-blue-100 text-blue-800',
    description: 'Dashboard for university administrators'
  },
  super_admin: { 
    name: 'Super Admin', 
    icon: 'Crown', 
    color: 'bg-purple-100 text-purple-800',
    description: 'Dashboard for platform super administrators'
  },
  safety_admin: { 
    name: 'Safety Admin', 
    icon: 'Shield', 
    color: 'bg-red-100 text-red-800',
    description: 'Dashboard for safety and security administrators'
  },
  housing_admin: { 
    name: 'Housing Admin', 
    icon: 'Home', 
    color: 'bg-green-100 text-green-800',
    description: 'Dashboard for housing administrators'
  },
  analytics_admin: { 
    name: 'Analytics Admin', 
    icon: 'BarChart3', 
    color: 'bg-orange-100 text-orange-800',
    description: 'Dashboard for analytics administrators'
  }
} as const

export const SURVEY_TYPE_CONFIG = {
  nps: { 
    name: 'Net Promoter Score', 
    icon: 'Star', 
    color: 'bg-blue-100 text-blue-800',
    description: 'Measure customer loyalty and satisfaction'
  },
  csat: { 
    name: 'Customer Satisfaction', 
    icon: 'Smile', 
    color: 'bg-green-100 text-green-800',
    description: 'Measure overall customer satisfaction'
  },
  ces: { 
    name: 'Customer Effort Score', 
    icon: 'Activity', 
    color: 'bg-purple-100 text-purple-800',
    description: 'Measure ease of customer experience'
  },
  custom: { 
    name: 'Custom Survey', 
    icon: 'FileText', 
    color: 'bg-gray-100 text-gray-800',
    description: 'Custom-designed survey'
  },
  post_match: { 
    name: 'Post-Match Survey', 
    icon: 'Heart', 
    color: 'bg-pink-100 text-pink-800',
    description: 'Survey after successful matching'
  },
  post_agreement: { 
    name: 'Post-Agreement Survey', 
    icon: 'FileCheck', 
    color: 'bg-emerald-100 text-emerald-800',
    description: 'Survey after agreement signing'
  },
  post_move_in: { 
    name: 'Post-Move-in Survey', 
    icon: 'Home', 
    color: 'bg-orange-100 text-orange-800',
    description: 'Survey after move-in completion'
  }
} as const

// Risk assessment thresholds
export const RISK_LEVEL_CONFIG = {
  low: { 
    name: 'Low Risk', 
    color: 'bg-green-100 text-green-800', 
    threshold: 0.2,
    description: 'Minimal risk, normal operations'
  },
  medium: { 
    name: 'Medium Risk', 
    color: 'bg-yellow-100 text-yellow-800', 
    threshold: 0.5,
    description: 'Moderate risk, monitor closely'
  },
  high: { 
    name: 'High Risk', 
    color: 'bg-orange-100 text-orange-800', 
    threshold: 0.8,
    description: 'High risk, immediate attention needed'
  },
  critical: { 
    name: 'Critical Risk', 
    color: 'bg-red-100 text-red-800', 
    threshold: 1.0,
    description: 'Critical risk, emergency response required'
  }
} as const
