/**
 * DSAR Automation
 * 
 * Handles automated DSAR request processing, SLA tracking, and reminders
 */

import { createClient } from '@/lib/supabase/server'
import { 
  getRequestsApproachingDeadline, 
  getOverdueRequests,
  getDaysUntilDeadline,
  isRequestOverdue,
  type DSARRequest
} from './dsar-tracker'
import { safeLogger } from '@/lib/utils/logger'

/**
 * Send SLA reminder notifications
 */
export async function sendSLAReminders(): Promise<{
  approaching: number
  overdue: number
  errors: number
}> {
  const supabase = await createClient()
  const results = {
    approaching: 0,
    overdue: 0,
    errors: 0
  }

  try {
    // Get requests approaching deadline (3 days before)
    const approaching = await getRequestsApproachingDeadline(3)
    
    for (const request of approaching) {
      try {
        const daysRemaining = getDaysUntilDeadline(request.sla_deadline)
        
        // Send email notification to admins
        // This would integrate with your email service
        await notifyAdminsOfApproachingDeadline(request, daysRemaining)
        
        results.approaching++
        safeLogger.info('SLA reminder sent', {
          requestId: request.id,
          daysRemaining,
          userId: request.user_id
        })
      } catch (error) {
        results.errors++
        safeLogger.error('Failed to send SLA reminder', { error, requestId: request.id })
      }
    }

    // Get overdue requests
    const overdue = await getOverdueRequests()
    
    for (const request of overdue) {
      try {
        // Escalate overdue requests
        await escalateOverdueRequest(request)
        
        results.overdue++
        safeLogger.warn('Overdue request escalated', {
          requestId: request.id,
          userId: request.user_id,
          daysOverdue: Math.abs(getDaysUntilDeadline(request.sla_deadline))
        })
      } catch (error) {
        results.errors++
        safeLogger.error('Failed to escalate overdue request', { error, requestId: request.id })
      }
    }

  } catch (error) {
    safeLogger.error('Failed to process SLA reminders', { error })
    throw error
  }

  return results
}

/**
 * Notify admins of approaching deadline
 */
async function notifyAdminsOfApproachingDeadline(
  request: DSARRequest,
  daysRemaining: number
): Promise<void> {
  // This would send an email to admins
  // For now, we'll log it and update the request metadata
  
  const supabase = await createClient()
  
  await supabase
    .from('dsar_requests')
    .update({
      processing_metadata: {
        ...request.processing_metadata,
        last_reminder_sent: new Date().toISOString(),
        days_remaining: daysRemaining
      }
    })
    .eq('id', request.id)

  // TODO: Integrate with email service to send actual notifications
  safeLogger.info('Admin notification queued', {
    requestId: request.id,
    daysRemaining
  })
}

/**
 * Escalate overdue request
 */
async function escalateOverdueRequest(request: DSARRequest): Promise<void> {
  const supabase = await createClient()
  const daysOverdue = Math.abs(getDaysUntilDeadline(request.sla_deadline))

  // Update request status and add escalation note
  await supabase
    .from('dsar_requests')
    .update({
      status: 'in_progress', // Ensure it's marked as in progress
      admin_notes: `⚠️ OVERDUE: ${daysOverdue} days past SLA deadline. Immediate attention required.`,
      processing_metadata: {
        ...request.processing_metadata,
        escalated: true,
        escalated_at: new Date().toISOString(),
        days_overdue: daysOverdue
      }
    })
    .eq('id', request.id)

  // TODO: Send urgent notification to admins and DPO
  safeLogger.warn('Request escalated', {
    requestId: request.id,
    daysOverdue
  })
}

/**
 * Process pending DSAR requests automatically
 */
export async function processPendingDSARRequests(): Promise<{
  processed: number
  errors: number
}> {
  const supabase = await createClient()
  const results = {
    processed: 0,
    errors: 0
  }

  try {
    // Get pending export requests that can be auto-processed
    const { data: pendingExports } = await supabase
      .from('dsar_requests')
      .select('*')
      .eq('request_type', 'export')
      .eq('status', 'pending')
      .order('requested_at', { ascending: true })
      .limit(10) // Process in batches

    if (!pendingExports) {
      return results
    }

    for (const request of pendingExports) {
      try {
        // Export requests are processed on-demand when user requests download
        // This function mainly tracks and monitors
        results.processed++
      } catch (error) {
        results.errors++
        safeLogger.error('Failed to process DSAR request', { error, requestId: request.id })
      }
    }

  } catch (error) {
    safeLogger.error('Failed to process pending DSAR requests', { error })
  }

  return results
}

/**
 * Get DSAR statistics for admin dashboard
 */
export async function getDSARStatistics(): Promise<{
  total: number
  pending: number
  in_progress: number
  completed: number
  overdue: number
  approaching: number
}> {
  const supabase = await createClient()

  const [total, pending, inProgress, completed, overdue, approaching] = await Promise.all([
    // Total requests
    supabase
      .from('dsar_requests')
      .select('id', { count: 'exact', head: true }),
    
    // Pending
    supabase
      .from('dsar_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    
    // In progress
    supabase
      .from('dsar_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'in_progress'),
    
    // Completed
    supabase
      .from('dsar_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'completed'),
    
    // Overdue
    supabase
      .from('dsar_requests')
      .select('id')
      .in('status', ['pending', 'in_progress'])
      .lt('sla_deadline', new Date().toISOString()),
    
    // Approaching (within 3 days)
    getRequestsApproachingDeadline(3)
  ])

  return {
    total: total.count || 0,
    pending: pending.count || 0,
    in_progress: inProgress.count || 0,
    completed: completed.count || 0,
    overdue: overdue.data?.length || 0,
    approaching: approaching.length
  }
}

