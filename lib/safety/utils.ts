// Safety Escalation & Wellness Checks System Utilities

import { createClient } from '@/lib/supabase/client'
import type {
  SafetyIncident,
  WellnessCheck,
  SafetyAlert,
  EmergencyContact,
  WellnessPattern,
  SafetyStatistics,
  UserSafetySummary,
  SafetyDashboardData,
  CreateSafetyIncidentData,
  CreateWellnessCheckData,
  CreateEmergencyContactData,
  CreateSafetyAlertData
} from './types'
import { 
  INCIDENT_TYPE_CONFIGS, 
  SEVERITY_CONFIGS, 
  WELLNESS_CHECK_CONFIGS,
  WELLNESS_SCORE_RANGES,
  RISK_THRESHOLDS
} from './types'

const supabase = createClient()

// Safety incident functions
export async function createSafetyIncident(data: CreateSafetyIncidentData): Promise<SafetyIncident | null> {
  try {
    const { data: incident, error } = await supabase.rpc('create_safety_incident', {
      p_incident_type: data.incident_type,
      p_severity_level: data.severity_level || 'medium',
      p_title: data.title,
      p_description: data.description,
      p_reported_for: data.reported_for || null,
      p_location: data.location || null,
      p_chat_room_id: data.chat_room_id || null,
      p_forum_post_id: data.forum_post_id || null,
      p_evidence_urls: data.evidence_urls || []
    })

    if (error) {
      console.error('Error creating safety incident:', error)
      return null
    }

    return incident
  } catch (error) {
    console.error('Error creating safety incident:', error)
    return null
  }
}

export async function getSafetyIncidents(userId?: string): Promise<SafetyIncident[]> {
  try {
    let query = supabase
      .from('safety_incidents')
      .select('*')
      .order('reported_at', { ascending: false })

    if (userId) {
      query = query.eq('reported_by', userId)
    }

    const { data: incidents, error } = await query

    if (error) {
      console.error('Error fetching safety incidents:', error)
      return []
    }

    return incidents || []
  } catch (error) {
    console.error('Error fetching safety incidents:', error)
    return []
  }
}

export async function getSafetyIncident(incidentId: string): Promise<SafetyIncident | null> {
  try {
    const { data: incident, error } = await supabase
      .from('safety_incidents')
      .select('*')
      .eq('id', incidentId)
      .single()

    if (error) {
      console.error('Error fetching safety incident:', error)
      return null
    }

    return incident
  } catch (error) {
    console.error('Error fetching safety incident:', error)
    return null
  }
}

export async function updateSafetyIncident(
  incidentId: string, 
  updates: Partial<SafetyIncident>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('safety_incidents')
      .update(updates)
      .eq('id', incidentId)

    if (error) {
      console.error('Error updating safety incident:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating safety incident:', error)
    return false
  }
}

// Wellness check functions
export async function createWellnessCheck(data: CreateWellnessCheckData): Promise<WellnessCheck | null> {
  try {
    const { data: check, error } = await supabase.rpc('create_wellness_check', {
      p_user_id: data.user_id,
      p_check_type: data.check_type,
      p_trigger_reason: data.trigger_reason || null
    })

    if (error) {
      console.error('Error creating wellness check:', error)
      return null
    }

    return check
  } catch (error) {
    console.error('Error creating wellness check:', error)
    return null
  }
}

export async function getWellnessChecks(userId: string): Promise<WellnessCheck[]> {
  try {
    const { data: checks, error } = await supabase
      .from('wellness_checks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching wellness checks:', error)
      return []
    }

    return checks || []
  } catch (error) {
    console.error('Error fetching wellness checks:', error)
    return []
  }
}

export async function updateWellnessCheck(
  checkId: string, 
  updates: Partial<WellnessCheck>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('wellness_checks')
      .update(updates)
      .eq('id', checkId)

    if (error) {
      console.error('Error updating wellness check:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating wellness check:', error)
    return false
  }
}

export async function triggerAutomatedWellnessCheck(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('trigger_automated_wellness_check', {
      p_user_id: userId
    })

    if (error) {
      console.error('Error triggering automated wellness check:', error)
      return false
    }

    return data || false
  } catch (error) {
    console.error('Error triggering automated wellness check:', error)
    return false
  }
}

// Safety alert functions
export async function createSafetyAlert(data: CreateSafetyAlertData): Promise<SafetyAlert | null> {
  try {
    const { data: alert, error } = await supabase
      .from('safety_alerts')
      .insert({
        alert_type: data.alert_type,
        severity: data.severity,
        target_users: data.target_users,
        target_universities: data.target_universities,
        target_roles: data.target_roles,
        title: data.title,
        message: data.message,
        action_required: data.action_required || false,
        action_url: data.action_url,
        delivery_methods: data.delivery_methods || ['in_app'],
        expires_at: data.expires_at
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating safety alert:', error)
      return null
    }

    return alert
  } catch (error) {
    console.error('Error creating safety alert:', error)
    return null
  }
}

export async function getSafetyAlerts(userId?: string): Promise<SafetyAlert[]> {
  try {
    let query = supabase
      .from('safety_alerts')
      .select('*')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.contains('target_users', [userId])
    }

    const { data: alerts, error } = await query

    if (error) {
      console.error('Error fetching safety alerts:', error)
      return []
    }

    return alerts || []
  } catch (error) {
    console.error('Error fetching safety alerts:', error)
    return []
  }
}

// Emergency contact functions
export async function createEmergencyContact(data: CreateEmergencyContactData): Promise<EmergencyContact | null> {
  try {
    const { data: contact, error } = await supabase
      .from('emergency_contacts')
      .insert({
        user_id: data.user_id,
        contact_type: data.contact_type,
        name: data.name,
        phone: data.phone,
        email: data.email,
        relationship: data.relationship,
        escalation_order: data.escalation_order || 1,
        auto_contact: data.auto_contact || false,
        contact_conditions: data.contact_conditions
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating emergency contact:', error)
      return null
    }

    return contact
  } catch (error) {
    console.error('Error creating emergency contact:', error)
    return null
  }
}

export async function getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
  try {
    const { data: contacts, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('escalation_order')

    if (error) {
      console.error('Error fetching emergency contacts:', error)
      return []
    }

    return contacts || []
  } catch (error) {
    console.error('Error fetching emergency contacts:', error)
    return []
  }
}

export async function updateEmergencyContact(
  contactId: string, 
  updates: Partial<EmergencyContact>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('emergency_contacts')
      .update(updates)
      .eq('id', contactId)

    if (error) {
      console.error('Error updating emergency contact:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating emergency contact:', error)
    return false
  }
}

// Summary and analytics functions
export async function getUserSafetySummary(userId: string): Promise<UserSafetySummary | null> {
  try {
    const { data: summary, error } = await supabase.rpc('get_user_safety_summary', {
      p_user_id: userId
    })

    if (error) {
      console.error('Error fetching user safety summary:', error)
      return null
    }

    return summary?.[0] || null
  } catch (error) {
    console.error('Error fetching user safety summary:', error)
    return null
  }
}

export async function getSafetyDashboardData(): Promise<SafetyDashboardData | null> {
  try {
    // This would typically be an RPC call that aggregates data
    // For now, we'll fetch individual pieces and combine them
    
    const [incidents, wellnessChecks, alerts] = await Promise.all([
      getSafetyIncidents(),
      supabase.from('wellness_checks').select('*').limit(10),
      getSafetyAlerts()
    ])

    const recentIncidents = incidents.slice(0, 5)
    
    const dashboardData: SafetyDashboardData = {
      total_incidents: incidents.length,
      open_incidents: incidents.filter(i => i.status === 'open').length,
      critical_incidents: incidents.filter(i => i.severity_level === 'critical').length,
      average_response_time: 45, // This would be calculated from actual data
      total_wellness_checks: wellnessChecks.data?.length || 0,
      users_at_risk: 0, // This would be calculated from wellness patterns
      recent_incidents,
      wellness_trends: [], // This would be fetched from wellness_patterns table
      safety_alerts: alerts.slice(0, 5)
    }

    return dashboardData
  } catch (error) {
    console.error('Error fetching safety dashboard data:', error)
    return null
  }
}

// Utility functions
export function getIncidentTypeConfig(type: string) {
  return INCIDENT_TYPE_CONFIGS[type as keyof typeof INCIDENT_TYPE_CONFIGS]
}

export function getSeverityConfig(severity: string) {
  return SEVERITY_CONFIGS[severity as keyof typeof SEVERITY_CONFIGS]
}

export function getWellnessCheckConfig(type: string) {
  return WELLNESS_CHECK_CONFIGS[type as keyof typeof WELLNESS_CHECK_CONFIGS]
}

export function calculateWellnessScore(check: WellnessCheck): number {
  const scores = [
    check.overall_wellness,
    check.stress_level ? 11 - check.stress_level : null, // Invert stress (higher = worse)
    check.sleep_quality,
    check.social_connections,
    check.academic_pressure ? 11 - check.academic_pressure : null // Invert academic pressure
  ].filter(score => score !== null) as number[]

  return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
}

export function getWellnessScoreRange(score: number) {
  for (const [key, range] of Object.entries(WELLNESS_SCORE_RANGES)) {
    if (score >= range.min && score <= range.max) {
      return { key, ...range }
    }
  }
  return { key: 'poor', ...WELLNESS_SCORE_RANGES.poor }
}

export function getRiskLevel(wellnessScore: number) {
  for (const [level, threshold] of Object.entries(RISK_THRESHOLDS)) {
    if (wellnessScore >= threshold.min && wellnessScore <= threshold.max) {
      return { level, ...threshold }
    }
  }
  return { level: 'high', ...RISK_THRESHOLDS.high }
}

export function formatIncidentDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getTimeSinceIncident(dateString: string): string {
  const now = new Date()
  const incidentDate = new Date(dateString)
  const diffMs = now.getTime() - incidentDate.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  }
}

export function shouldEscalateIncident(incident: SafetyIncident): boolean {
  const severityConfig = getSeverityConfig(incident.severity_level)
  const typeConfig = getIncidentTypeConfig(incident.incident_type)
  
  return severityConfig.auto_alert || typeConfig.auto_escalate
}

export function getEscalationActions(incident: SafetyIncident): string[] {
  const actions: string[] = []
  
  if (incident.severity_level === 'critical') {
    actions.push('Notify emergency contacts')
    actions.push('Alert campus security')
    actions.push('Contact local authorities if needed')
  } else if (incident.severity_level === 'high') {
    actions.push('Assign to senior admin')
    actions.push('Notify relevant staff')
    actions.push('Schedule follow-up')
  } else if (incident.severity_level === 'medium') {
    actions.push('Assign to admin')
    actions.push('Send acknowledgment')
  } else {
    actions.push('Add to queue')
    actions.push('Standard processing')
  }
  
  return actions
}

// Demo data functions for testing
export function getDemoSafetyIncidents(): SafetyIncident[] {
  return [
    {
      id: '1',
      incident_type: 'help_request',
      severity_level: 'medium',
      reported_by: 'demo-user-id',
      title: 'Need help with roommate conflict',
      description: 'My roommate and I are having disagreements about cleaning schedules and I need help mediating this.',
      status: 'in_progress',
      priority_score: 5,
      reported_at: '2024-01-15T10:00:00Z',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      incident_type: 'safety_concern',
      severity_level: 'high',
      reported_by: 'demo-user-id',
      title: 'Suspicious activity in building',
      description: 'I noticed someone trying to enter the building without a key card late at night.',
      evidence_urls: ['https://example.com/security-footage.jpg'],
      status: 'open',
      priority_score: 8,
      reported_at: '2024-01-14T22:30:00Z',
      created_at: '2024-01-14T22:30:00Z',
      updated_at: '2024-01-14T22:30:00Z'
    }
  ]
}

export function getDemoWellnessChecks(): WellnessCheck[] {
  return [
    {
      id: '1',
      user_id: 'demo-user-id',
      check_type: 'manual',
      overall_wellness: 7,
      stress_level: 6,
      sleep_quality: 8,
      social_connections: 7,
      academic_pressure: 5,
      concerns: ['Feeling overwhelmed with coursework'],
      positive_notes: ['Great relationship with roommates', 'Enjoying campus life'],
      support_needed: ['Study group', 'Time management tips'],
      status: 'completed',
      completed_at: '2024-01-15T14:00:00Z',
      created_at: '2024-01-15T14:00:00Z',
      updated_at: '2024-01-15T14:00:00Z'
    },
    {
      id: '2',
      user_id: 'demo-user-id',
      check_type: 'automated',
      trigger_reason: '7_day_interval',
      overall_wellness: 6,
      stress_level: 7,
      sleep_quality: 6,
      social_connections: 6,
      academic_pressure: 7,
      status: 'completed',
      completed_at: '2024-01-08T10:00:00Z',
      created_at: '2024-01-08T10:00:00Z',
      updated_at: '2024-01-08T10:00:00Z'
    }
  ]
}

export function getDemoEmergencyContacts(): EmergencyContact[] {
  return [
    {
      id: '1',
      user_id: 'demo-user-id',
      contact_type: 'family',
      name: 'Sarah Johnson',
      phone: '+31 6 12345678',
      email: 'sarah.johnson@email.com',
      relationship: 'Mother',
      escalation_order: 1,
      auto_contact: true,
      is_verified: true,
      verified_at: '2024-01-01T00:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      user_id: 'demo-user-id',
      contact_type: 'emergency',
      name: 'Campus Security',
      phone: '+31 20 1234567',
      escalation_order: 2,
      auto_contact: true,
      contact_conditions: ['Emergency situations only'],
      is_verified: true,
      verified_at: '2024-01-01T00:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]
}
