/**
 * Data Retention Policies
 * 
 * Defines data retention periods in compliance with GDPR and Dutch law
 * All periods are in days
 */

export interface RetentionPolicy {
  dataType: string
  retentionDays: number
  description: string
  legalBasis: string
  exceptions?: string[]
}

/**
 * Data retention policies per GDPR and Dutch law requirements
 */
export const RETENTION_POLICIES: RetentionPolicy[] = [
  {
    dataType: 'verification_documents',
    retentionDays: 28, // 4 weeks per Dutch law (UAVG)
    description: 'Identity verification document payloads (scrubbed after retention; approval confirmation retained)',
    legalBasis: 'Dutch law requires retention for 4 weeks after verification for fraud prevention',
    exceptions: [
      'May be retained longer if required for ongoing legal proceedings',
      'users.identity_verified_at and approved status stubs are retained as non-document confirmation',
    ]
  },
  {
    dataType: 'inactive_accounts',
    retentionDays: 365, // 1 year per privacy policy / Dutch DPA guidance
    description: 'User accounts inactive for 1 year',
    legalBasis:
      'Privacy policy: accounts inactive for 1 year are anonymized; non-identifying analytics may be retained',
    exceptions: ['Warnings at 30 and 7 days before processing; users may log in to reset the clock']
  },
  {
    dataType: 'chat_messages',
    retentionDays: 365, // 1 year
    description: 'Chat messages between users',
    legalBasis: 'Contractual necessity for providing communication service',
    exceptions: ['May be retained longer if required for legal disputes']
  },
  {
    dataType: 'match_suggestions',
    retentionDays: 90, // 90 days
    description: 'Expired match suggestions',
    legalBasis: 'No longer necessary for matching purposes after expiry',
    exceptions: []
  },
  {
    dataType: 'reports',
    retentionDays: 365, // 1 year
    description: 'User reports (safety, harassment, etc.)',
    legalBasis: 'Legal obligation to maintain safety records',
    exceptions: ['Critical safety reports may be retained longer']
  },
  {
    dataType: 'bug_reports',
    retentionDays: 365, // 1 year
    description: 'Product bug reports and diagnostic snapshots (URL, device, console/network errors)',
    legalBasis: 'Legitimate interest in diagnosing and improving platform reliability',
    exceptions: ['May be anonymized for longer-term quality analysis']
  },
  {
    dataType: 'wish_board',
    retentionDays: 365,
    description: 'Domu Lab feature wishes, votes, and focus-group opt-ins',
    legalBasis: 'Legitimate interest in product discovery and improving the platform',
    exceptions: ['Anonymized after account deletion via CASCADE']
  },
  {
    dataType: 'application_logs',
    retentionDays: 90, // 90 days
    description: 'Application and server logs',
    legalBasis: 'Legitimate interest in debugging and security monitoring',
    exceptions: ['Security-related logs may be retained longer']
  },
  {
    dataType: 'sentry_data',
    retentionDays: 90, // 90 days
    description: 'Error tracking data in Sentry',
    legalBasis: 'Legitimate interest in maintaining error logs for debugging',
    exceptions: ['Configurable via Sentry dashboard']
  },
  {
    dataType: 'analytics_events',
    retentionDays: 730, // 2 years (anonymized)
    description: 'Analytics events (anonymized)',
    legalBasis: 'Legitimate interest in understanding platform usage',
    exceptions: ['Data is anonymized before retention period']
  },
  {
    dataType: 'deleted_accounts',
    retentionDays: 30, // GDPR/AVG one-month erasure window
    description: 'Accounts marked for deletion',
    legalBasis: 'Grace period to allow account recovery before permanent erasure',
    exceptions: ['Verification documents retained for additional 4 weeks per Dutch law']
  },
  {
    dataType: 'email_unsubscribe_events',
    retentionDays: 90, // Same as application_logs — operational audit trail
    description: 'Audit log of email preference changes made via one-click unsubscribe links',
    legalBasis: 'Legitimate interest in deliverability auditing; minimised by truncated IP storage',
    exceptions: []
  },
  {
    dataType: 'domu_ai_chat_log',
    retentionDays: 365, // 1 year — same as chat_messages per DPIA §1.1.4
    description: 'Domu AI assistant conversation logs (user_message is personal data)',
    legalBasis: 'Contractual necessity for providing AI assistant feature; subject to GDPR Art. 17 erasure',
    exceptions: []
  }
]

/**
 * Get retention policy for a specific data type
 */
export function getRetentionPolicy(dataType: string): RetentionPolicy | undefined {
  return RETENTION_POLICIES.find(policy => policy.dataType === dataType)
}

/**
 * Calculate expiration date for a data record
 */
export function calculateRetentionExpiry(createdAt: Date, dataType: string): Date {
  const policy = getRetentionPolicy(dataType)
  if (!policy) {
    throw new Error(`No retention policy found for data type: ${dataType}`)
  }

  const expiryDate = new Date(createdAt)
  expiryDate.setDate(expiryDate.getDate() + policy.retentionDays)
  return expiryDate
}

/**
 * Check if a data record has expired based on retention policy
 */
export function isDataExpired(createdAt: Date, dataType: string): boolean {
  const expiryDate = calculateRetentionExpiry(createdAt, dataType)
  return new Date() > expiryDate
}

/**
 * Get all data types that should be purged
 */
export function getDataTypesForPurge(): string[] {
  return RETENTION_POLICIES
    .filter(policy => !policy.exceptions || policy.exceptions.length === 0)
    .map(policy => policy.dataType)
}

/**
 * Dutch law specific retention requirements
 */
export const DUTCH_LAW_RETENTION = {
  VERIFICATION_DOCUMENTS_DAYS: 28, // 4 weeks per UAVG
  MINIMUM_ACCOUNT_RETENTION_DAYS: 30, // Minimum retention for account data
  REPORT_RETENTION_DAYS: 365 // Safety reports
} as const

