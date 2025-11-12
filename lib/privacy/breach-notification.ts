/**
 * Data Breach Notification System
 * 
 * Handles GDPR Article 33 (72-hour DPA notification) and Article 34 (user notification)
 */

import { createClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

export interface BreachAssessment {
  breachId: string
  detectedAt: string
  reportedBy?: string
  description: string
  affectedUsers: number
  dataCategories: string[]
  likelyConsequences: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  measuresTaken: string[]
  requiresDPANotification: boolean
  requiresUserNotification: boolean
  assessedBy?: string
  assessedAt: string
}

export interface BreachNotification {
  breachId: string
  notificationType: 'dpa' | 'user' | 'both'
  sentAt: string
  recipient?: string
  method: 'email' | 'in_app' | 'public'
  content: string
  status: 'sent' | 'failed' | 'pending'
}

/**
 * Assess data breach and determine notification requirements
 */
export function assessBreach(breach: Partial<BreachAssessment>): BreachAssessment {
  const breachId = breach.breachId || `breach_${Date.now()}`
  const detectedAt = breach.detectedAt || new Date().toISOString()

  // Determine if DPA notification is required (Article 33)
  // Required if breach is likely to result in a risk to rights and freedoms
  const requiresDPANotification = 
    breach.riskLevel === 'high' || 
    breach.riskLevel === 'critical' ||
    (breach.affectedUsers || 0) > 100 ||
    breach.dataCategories?.includes('special_category') ||
    breach.dataCategories?.includes('biometric') ||
    false

  // Determine if user notification is required (Article 34)
  // Required if breach is likely to result in a high risk to rights and freedoms
  const requiresUserNotification = 
    breach.riskLevel === 'critical' ||
    breach.dataCategories?.includes('special_category') ||
    breach.dataCategories?.includes('biometric') ||
    (breach.likelyConsequences?.includes('identity theft') ||
     breach.likelyConsequences?.includes('discrimination') ||
     breach.likelyConsequences?.includes('financial loss')) ||
    false

  return {
    breachId,
    detectedAt,
    reportedBy: breach.reportedBy,
    description: breach.description || 'Data breach detected',
    affectedUsers: breach.affectedUsers || 0,
    dataCategories: breach.dataCategories || [],
    likelyConsequences: breach.likelyConsequences || 'Unknown',
    riskLevel: breach.riskLevel || 'medium',
    measuresTaken: breach.measuresTaken || [],
    requiresDPANotification,
    requiresUserNotification,
    assessedBy: breach.assessedBy,
    assessedAt: new Date().toISOString()
  }
}

/**
 * Generate DPA notification content (72-hour notification)
 */
export function generateDPANotification(assessment: BreachAssessment): string {
  return `
DATA BREACH NOTIFICATION
Article 33 GDPR - Notification to Supervisory Authority

Breach ID: ${assessment.breachId}
Detected: ${new Date(assessment.detectedAt).toLocaleString()}
Assessed: ${new Date(assessment.assessedAt).toLocaleString()}

1. NATURE OF THE BREACH
${assessment.description}

2. DATA CATEGORIES AFFECTED
${assessment.dataCategories.join(', ') || 'Not specified'}

3. APPROXIMATE NUMBER OF DATA SUBJECTS AFFECTED
${assessment.affectedUsers}

4. LIKELY CONSEQUENCES
${assessment.likelyConsequences}

5. MEASURES TAKEN OR PROPOSED
${assessment.measuresTaken.map((m, i) => `${i + 1}. ${m}`).join('\n')}

6. CONTACT DETAILS
Data Protection Officer: dpo@domumatch.nl
Privacy Contact: privacy@domumatch.nl

This notification is made within 72 hours of breach detection as required by GDPR Article 33.
  `.trim()
}

/**
 * Generate user notification content
 */
export function generateUserNotification(assessment: BreachAssessment): string {
  return `
IMPORTANT: Data Breach Notification

We are writing to inform you of a data breach that may have affected your personal data.

WHAT HAPPENED:
${assessment.description}

WHAT DATA WAS AFFECTED:
${assessment.dataCategories.join(', ') || 'Personal data'}

WHAT WE ARE DOING:
${assessment.measuresTaken.map((m, i) => `${i + 1}. ${m}`).join('\n')}

WHAT YOU CAN DO:
- Monitor your accounts for suspicious activity
- Change your password if you haven't recently
- Be cautious of phishing attempts
- Contact us if you have concerns: privacy@domumatch.nl

We take data protection seriously and are committed to keeping your information secure.

For more information, please contact our Data Protection Officer at dpo@domumatch.nl
  `.trim()
}

/**
 * Calculate 72-hour deadline from breach detection
 */
export function calculateDPANotificationDeadline(detectedAt: string): Date {
  const detected = new Date(detectedAt)
  const deadline = new Date(detected)
  deadline.setHours(deadline.getHours() + 72)
  return deadline
}

/**
 * Check if 72-hour deadline has passed
 */
export function isDPANotificationOverdue(detectedAt: string): boolean {
  const deadline = calculateDPANotificationDeadline(detectedAt)
  return new Date() > deadline
}

/**
 * Get hours remaining until 72-hour deadline
 */
export function getHoursUntilDPADeadline(detectedAt: string): number {
  const deadline = calculateDPANotificationDeadline(detectedAt)
  const now = new Date()
  const diffMs = deadline.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60))
}

/**
 * Breach notification checklist
 */
export const BREACH_NOTIFICATION_CHECKLIST = [
  'Breach detected and confirmed',
  'Breach assessed and risk level determined',
  'Affected users identified and counted',
  'Data categories affected documented',
  'Measures to address breach implemented',
  'DPA notification prepared (if required)',
  'DPA notification sent within 72 hours (if required)',
  'User notifications prepared (if required)',
  'User notifications sent without undue delay (if required)',
  'Incident documented in breach log',
  'Post-incident review conducted',
  'Preventive measures implemented'
]

/**
 * Log breach assessment
 */
export async function logBreachAssessment(assessment: BreachAssessment): Promise<void> {
  const supabase = await createClient()
  
  // Store in breach log (would need a breaches table)
  // For now, we'll log it
  safeLogger.warn('Data breach assessed', {
    breachId: assessment.breachId,
    riskLevel: assessment.riskLevel,
    requiresDPANotification: assessment.requiresDPANotification,
    requiresUserNotification: assessment.requiresUserNotification,
    affectedUsers: assessment.affectedUsers
  })

  // TODO: Create breaches table and store assessment
}

