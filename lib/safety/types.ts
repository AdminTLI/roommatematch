// Safety Escalation & Wellness Checks System Types

export interface SafetyIncident {
  id: string
  incident_type: IncidentType
  severity_level: SeverityLevel
  reported_by: string
  reported_for?: string
  location?: string
  chat_room_id?: string
  forum_post_id?: string
  title: string
  description: string
  evidence_urls?: string[]
  status: IncidentStatus
  assigned_to?: string
  priority_score: number
  initial_response?: string
  resolution_notes?: string
  actions_taken?: string[]
  reported_at: string
  first_response_at?: string
  resolved_at?: string
  created_at: string
  updated_at: string
}

export interface WellnessCheck {
  id: string
  user_id: string
  check_type: WellnessCheckType
  trigger_reason?: string
  overall_wellness?: number
  stress_level?: number
  sleep_quality?: number
  social_connections?: number
  academic_pressure?: number
  concerns?: string[]
  positive_notes?: string[]
  support_needed?: string[]
  response_text?: string
  follow_up_required: boolean
  follow_up_date?: string
  status: WellnessCheckStatus
  scheduled_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface SafetyAlert {
  id: string
  alert_type: AlertType
  severity: SeverityLevel
  target_users?: string[]
  target_universities?: string[]
  target_roles?: string[]
  title: string
  message: string
  action_required: boolean
  action_url?: string
  delivery_methods: DeliveryMethod[]
  sent_at?: string
  expires_at?: string
  total_sent: number
  total_delivered: number
  total_read: number
  total_acted: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface EmergencyContact {
  id: string
  user_id: string
  contact_type: ContactType
  name: string
  phone?: string
  email?: string
  relationship?: string
  escalation_order: number
  auto_contact: boolean
  contact_conditions?: string[]
  is_verified: boolean
  verified_at?: string
  created_at: string
  updated_at: string
}

export interface WellnessPattern {
  id: string
  user_id: string
  analysis_period_start: string
  analysis_period_end: string
  average_wellness?: number
  wellness_trend?: WellnessTrend
  risk_factors?: string[]
  protective_factors?: string[]
  recommended_actions?: string[]
  next_check_in_date?: string
  calculated_at: string
  created_at: string
}

export interface SafetyStatistics {
  id: string
  period_start: string
  period_end: string
  university_id?: string
  total_incidents: number
  incidents_by_type: Record<string, number>
  incidents_by_severity: Record<string, number>
  average_response_time_minutes?: number
  total_wellness_checks: number
  average_wellness_score?: number
  users_at_risk: number
  incidents_resolved: number
  incidents_escalated: number
  user_satisfaction_score?: number
  calculated_at: string
  created_at: string
}

// Enums
export type IncidentType = 
  | 'help_request' 
  | 'safety_concern' 
  | 'emergency' 
  | 'wellness_check' 
  | 'conflict_report' 
  | 'harassment' 
  | 'other'

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical'

export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated'

export type WellnessCheckType = 'automated' | 'manual' | 'scheduled' | 'emergency'

export type WellnessCheckStatus = 'pending' | 'completed' | 'skipped' | 'overdue'

export type AlertType = 
  | 'emergency' 
  | 'safety_reminder' 
  | 'wellness_check' 
  | 'incident_update' 
  | 'security_notice'

export type DeliveryMethod = 'in_app' | 'email' | 'sms' | 'push'

export type ContactType = 
  | 'personal' 
  | 'family' 
  | 'emergency' 
  | 'campus_security' 
  | 'counselor' 
  | 'landlord' 
  | 'other'

export type WellnessTrend = 'improving' | 'stable' | 'declining' | 'volatile'

// Form types
export interface CreateSafetyIncidentData {
  incident_type: IncidentType
  severity_level?: SeverityLevel
  title: string
  description: string
  reported_for?: string
  location?: string
  chat_room_id?: string
  forum_post_id?: string
  evidence_urls?: string[]
}

export interface CreateWellnessCheckData {
  user_id: string
  check_type: WellnessCheckType
  trigger_reason?: string
  overall_wellness?: number
  stress_level?: number
  sleep_quality?: number
  social_connections?: number
  academic_pressure?: number
  concerns?: string[]
  positive_notes?: string[]
  support_needed?: string[]
  response_text?: string
}

export interface CreateEmergencyContactData {
  user_id: string
  contact_type: ContactType
  name: string
  phone?: string
  email?: string
  relationship?: string
  escalation_order?: number
  auto_contact?: boolean
  contact_conditions?: string[]
}

export interface CreateSafetyAlertData {
  alert_type: AlertType
  severity: SeverityLevel
  target_users?: string[]
  target_universities?: string[]
  target_roles?: string[]
  title: string
  message: string
  action_required?: boolean
  action_url?: string
  delivery_methods?: DeliveryMethod[]
  expires_at?: string
}

// Summary and dashboard types
export interface UserSafetySummary {
  user_id: string
  total_incidents: number
  open_incidents: number
  resolved_incidents: number
  last_wellness_check?: string
  average_wellness_score?: number
  risk_level: 'low' | 'medium' | 'high'
  emergency_contacts_count: number
}

export interface SafetyDashboardData {
  total_incidents: number
  open_incidents: number
  critical_incidents: number
  average_response_time: number
  total_wellness_checks: number
  users_at_risk: number
  recent_incidents: SafetyIncident[]
  wellness_trends: WellnessPattern[]
  safety_alerts: SafetyAlert[]
}

// Configuration types
export interface IncidentTypeConfig {
  type: IncidentType
  name: string
  description: string
  icon: string
  color: string
  default_severity: SeverityLevel
  requires_evidence: boolean
  auto_escalate: boolean
}

export interface SeverityConfig {
  level: SeverityLevel
  name: string
  description: string
  color: string
  priority_score: number
  response_time_minutes: number
  auto_alert: boolean
}

export interface WellnessCheckConfig {
  type: WellnessCheckType
  name: string
  description: string
  icon: string
  color: string
  frequency_days: number
  required_fields: string[]
  optional_fields: string[]
}

// Pre-defined configurations
export const INCIDENT_TYPE_CONFIGS: Record<IncidentType, IncidentTypeConfig> = {
  help_request: {
    type: 'help_request',
    name: 'Help Request',
    description: 'General request for assistance or support',
    icon: 'HelpCircle',
    color: 'bg-blue-100 text-blue-800',
    default_severity: 'medium',
    requires_evidence: false,
    auto_escalate: false
  },
  safety_concern: {
    type: 'safety_concern',
    name: 'Safety Concern',
    description: 'Report of a safety issue or concern',
    icon: 'AlertTriangle',
    color: 'bg-yellow-100 text-yellow-800',
    default_severity: 'high',
    requires_evidence: true,
    auto_escalate: true
  },
  emergency: {
    type: 'emergency',
    name: 'Emergency',
    description: 'Urgent situation requiring immediate attention',
    icon: 'AlertCircle',
    color: 'bg-red-100 text-red-800',
    default_severity: 'critical',
    requires_evidence: false,
    auto_escalate: true
  },
  wellness_check: {
    type: 'wellness_check',
    name: 'Wellness Check',
    description: 'Concern about someone\'s mental health or wellbeing',
    icon: 'Heart',
    color: 'bg-pink-100 text-pink-800',
    default_severity: 'medium',
    requires_evidence: false,
    auto_escalate: false
  },
  conflict_report: {
    type: 'conflict_report',
    name: 'Conflict Report',
    description: 'Report of conflict or dispute between roommates',
    icon: 'Users',
    color: 'bg-orange-100 text-orange-800',
    default_severity: 'medium',
    requires_evidence: true,
    auto_escalate: false
  },
  harassment: {
    type: 'harassment',
    name: 'Harassment',
    description: 'Report of harassment or inappropriate behavior',
    icon: 'Shield',
    color: 'bg-red-100 text-red-800',
    default_severity: 'high',
    requires_evidence: true,
    auto_escalate: true
  },
  other: {
    type: 'other',
    name: 'Other',
    description: 'Other type of incident or concern',
    icon: 'MoreHorizontal',
    color: 'bg-gray-100 text-gray-800',
    default_severity: 'low',
    requires_evidence: false,
    auto_escalate: false
  }
}

export const SEVERITY_CONFIGS: Record<SeverityLevel, SeverityConfig> = {
  low: {
    level: 'low',
    name: 'Low',
    description: 'Minor issue, can be addressed during normal hours',
    color: 'bg-green-100 text-green-800',
    priority_score: 3,
    response_time_minutes: 480, // 8 hours
    auto_alert: false
  },
  medium: {
    level: 'medium',
    name: 'Medium',
    description: 'Moderate issue, should be addressed within a few hours',
    color: 'bg-yellow-100 text-yellow-800',
    priority_score: 5,
    response_time_minutes: 120, // 2 hours
    auto_alert: false
  },
  high: {
    level: 'high',
    name: 'High',
    description: 'Serious issue, requires prompt attention',
    color: 'bg-orange-100 text-orange-800',
    priority_score: 8,
    response_time_minutes: 30, // 30 minutes
    auto_alert: true
  },
  critical: {
    level: 'critical',
    name: 'Critical',
    description: 'Emergency situation, requires immediate response',
    color: 'bg-red-100 text-red-800',
    priority_score: 10,
    response_time_minutes: 5, // 5 minutes
    auto_alert: true
  }
}

export const WELLNESS_CHECK_CONFIGS: Record<WellnessCheckType, WellnessCheckConfig> = {
  automated: {
    type: 'automated',
    name: 'Automated Check',
    description: 'Scheduled wellness check-in',
    icon: 'Clock',
    color: 'bg-blue-100 text-blue-800',
    frequency_days: 7,
    required_fields: ['overall_wellness'],
    optional_fields: ['stress_level', 'sleep_quality', 'social_connections', 'academic_pressure', 'concerns', 'positive_notes']
  },
  manual: {
    type: 'manual',
    name: 'Manual Check',
    description: 'User-initiated wellness check',
    icon: 'User',
    color: 'bg-green-100 text-green-800',
    frequency_days: 0,
    required_fields: ['overall_wellness'],
    optional_fields: ['stress_level', 'sleep_quality', 'social_connections', 'academic_pressure', 'concerns', 'positive_notes', 'support_needed']
  },
  scheduled: {
    type: 'scheduled',
    name: 'Scheduled Check',
    description: 'Pre-scheduled wellness check-in',
    icon: 'Calendar',
    color: 'bg-purple-100 text-purple-800',
    frequency_days: 14,
    required_fields: ['overall_wellness'],
    optional_fields: ['stress_level', 'sleep_quality', 'social_connections', 'academic_pressure', 'concerns', 'positive_notes']
  },
  emergency: {
    type: 'emergency',
    name: 'Emergency Check',
    description: 'Emergency wellness assessment',
    icon: 'AlertTriangle',
    color: 'bg-red-100 text-red-800',
    frequency_days: 0,
    required_fields: ['overall_wellness', 'stress_level', 'concerns', 'support_needed'],
    optional_fields: ['sleep_quality', 'social_connections', 'academic_pressure', 'positive_notes']
  }
}

export const INCIDENT_STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' },
  escalated: { label: 'Escalated', color: 'bg-red-100 text-red-800' }
} as const

export const WELLNESS_CHECK_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  skipped: { label: 'Skipped', color: 'bg-gray-100 text-gray-800' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800' }
} as const

export const CONTACT_TYPE_CONFIG = {
  personal: { label: 'Personal', icon: 'User', color: 'bg-blue-100 text-blue-800' },
  family: { label: 'Family', icon: 'Users', color: 'bg-green-100 text-green-800' },
  emergency: { label: 'Emergency', icon: 'AlertCircle', color: 'bg-red-100 text-red-800' },
  campus_security: { label: 'Campus Security', icon: 'Shield', color: 'bg-purple-100 text-purple-800' },
  counselor: { label: 'Counselor', icon: 'Heart', color: 'bg-pink-100 text-pink-800' },
  landlord: { label: 'Landlord', icon: 'Home', color: 'bg-orange-100 text-orange-800' },
  other: { label: 'Other', icon: 'MoreHorizontal', color: 'bg-gray-100 text-gray-800' }
} as const

// Wellness scoring ranges
export const WELLNESS_SCORE_RANGES = {
  excellent: { min: 8, max: 10, label: 'Excellent', color: 'text-green-600' },
  good: { min: 6, max: 7, label: 'Good', color: 'text-blue-600' },
  fair: { min: 4, max: 5, label: 'Fair', color: 'text-yellow-600' },
  poor: { min: 1, max: 3, label: 'Poor', color: 'text-red-600' }
} as const

// Risk assessment thresholds
export const RISK_THRESHOLDS = {
  low: { min: 7, max: 10, label: 'Low Risk', color: 'bg-green-100 text-green-800' },
  medium: { min: 4, max: 6, label: 'Medium Risk', color: 'bg-yellow-100 text-yellow-800' },
  high: { min: 1, max: 3, label: 'High Risk', color: 'bg-red-100 text-red-800' }
} as const
