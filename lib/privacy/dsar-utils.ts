/**
 * DSAR Utility Functions
 * 
 * Client-safe utility functions for DSAR request handling
 * These functions are pure and don't require server-side code
 */

/**
 * Calculate days until SLA deadline
 */
export function getDaysUntilDeadline(slaDeadline: string): number {
  const deadline = new Date(slaDeadline)
  const now = new Date()
  const diffTime = deadline.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Check if request is overdue
 */
export function isRequestOverdue(slaDeadline: string): boolean {
  return getDaysUntilDeadline(slaDeadline) < 0
}

