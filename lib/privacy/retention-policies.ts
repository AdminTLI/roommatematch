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
    description: 'Identity verification documents (ID, selfie photos)',
    legalBasis: 'Dutch law requires retention for 4 weeks after verification for fraud prevention',
    exceptions: ['May be retained longer if required for ongoing legal proceedings']
  },
  {
    dataType: 'inactive_accounts',
    retentionDays: 730, // 2 years
    description: 'User accounts that have been inactive for 2 years',
    legalBasis: 'Legitimate interest in maintaining user data for potential re-engagement',
    exceptions: ['Will be anonymized rather than deleted to preserve analytics data']
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
    retentionDays: 7, // 7 days grace period
    description: 'Accounts marked for deletion',
    legalBasis: 'Grace period to allow account recovery',
    exceptions: ['Verification documents retained for additional 4 weeks per Dutch law']
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

