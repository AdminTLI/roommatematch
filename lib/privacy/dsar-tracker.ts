/**
 * DSAR (Data Subject Access Request) Tracker
 * 
 * Handles creation, tracking, and management of GDPR data subject access requests
 */

import { createClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

export type DSARRequestType = 'export' | 'deletion' | 'rectification' | 'portability' | 'restriction' | 'objection'
export type DSARRequestStatus = 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled'

export interface DSARRequest {
  id: string
  user_id: string
  request_type: DSARRequestType
  status: DSARRequestStatus
  requested_at: string
  sla_deadline: string
  completed_at?: string
  admin_id?: string
  admin_notes?: string
  processing_metadata?: Record<string, any>
  export_file_url?: string
  export_format?: string
  deletion_scheduled_at?: string
  deletion_grace_period_days?: number
  deletion_completed_at?: string
  created_at: string
  updated_at: string
}

export interface CreateDSARRequestParams {
  userId: string
  requestType: DSARRequestType
  metadata?: Record<string, any>
}

/**
 * Create a new DSAR request
 */
export async function createDSARRequest(params: CreateDSARRequestParams): Promise<DSARRequest> {
  const supabase = await createClient()
  
  // Check rate limiting for export requests (1 per 24 hours)
  if (params.requestType === 'export') {
    const { data: hasRecent } = await supabase.rpc('has_recent_export_request', {
      p_user_id: params.userId
    })
    
    if (hasRecent) {
      throw new Error('You can only request one data export per 24 hours. Please wait before requesting another export.')
    }
  }
  
  const { data, error } = await supabase
    .from('dsar_requests')
    .insert({
      user_id: params.userId,
      request_type: params.requestType,
      status: 'pending',
      processing_metadata: params.metadata || {}
    })
    .select()
    .single()
  
  if (error) {
    safeLogger.error('Failed to create DSAR request', { error, params })
    throw new Error(`Failed to create DSAR request: ${error.message}`)
  }
  
  safeLogger.info('DSAR request created', { 
    requestId: data.id, 
    userId: params.userId, 
    type: params.requestType 
  })
  
  return data as DSARRequest
}

/**
 * Get DSAR request by ID
 */
export async function getDSARRequest(requestId: string, userId?: string): Promise<DSARRequest | null> {
  const supabase = await createClient()
  
  let query = supabase
    .from('dsar_requests')
    .select('*')
    .eq('id', requestId)
  
  // If userId provided, ensure user can only access their own requests
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data, error } = await query.single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    safeLogger.error('Failed to get DSAR request', { error, requestId })
    throw new Error(`Failed to get DSAR request: ${error.message}`)
  }
  
  return data as DSARRequest
}

/**
 * Get all DSAR requests for a user
 */
export async function getUserDSARRequests(userId: string): Promise<DSARRequest[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('dsar_requests')
    .select('*')
    .eq('user_id', userId)
    .order('requested_at', { ascending: false })
  
  if (error) {
    safeLogger.error('Failed to get user DSAR requests', { error, userId })
    throw new Error(`Failed to get DSAR requests: ${error.message}`)
  }
  
  return (data || []) as DSARRequest[]
}

/**
 * Update DSAR request status
 */
export async function updateDSARRequestStatus(
  requestId: string,
  status: DSARRequestStatus,
  adminId?: string,
  notes?: string,
  metadata?: Record<string, any>
): Promise<DSARRequest> {
  const supabase = await createClient()
  
  const updateData: any = {
    status,
    updated_at: new Date().toISOString()
  }
  
  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString()
  }
  
  if (adminId) {
    updateData.admin_id = adminId
  }
  
  if (notes) {
    updateData.admin_notes = notes
  }
  
  if (metadata) {
    updateData.processing_metadata = metadata
  }
  
  const { data, error } = await supabase
    .from('dsar_requests')
    .update(updateData)
    .eq('id', requestId)
    .select()
    .single()
  
  if (error) {
    safeLogger.error('Failed to update DSAR request', { error, requestId, status })
    throw new Error(`Failed to update DSAR request: ${error.message}`)
  }
  
  return data as DSARRequest
}

/**
 * Get requests approaching SLA deadline (for admin notifications)
 */
export async function getRequestsApproachingDeadline(daysBefore: number = 3): Promise<DSARRequest[]> {
  const supabase = await createClient()
  
  const deadlineThreshold = new Date()
  deadlineThreshold.setDate(deadlineThreshold.getDate() + daysBefore)
  
  const { data, error } = await supabase
    .from('dsar_requests')
    .select('*')
    .in('status', ['pending', 'in_progress'])
    .lte('sla_deadline', deadlineThreshold.toISOString())
    .order('sla_deadline', { ascending: true })
  
  if (error) {
    safeLogger.error('Failed to get requests approaching deadline', { error })
    throw new Error(`Failed to get requests: ${error.message}`)
  }
  
  return (data || []) as DSARRequest[]
}

/**
 * Get overdue requests
 */
export async function getOverdueRequests(): Promise<DSARRequest[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('dsar_requests')
    .select('*')
    .in('status', ['pending', 'in_progress'])
    .lt('sla_deadline', new Date().toISOString())
    .order('sla_deadline', { ascending: true })
  
  if (error) {
    safeLogger.error('Failed to get overdue requests', { error })
    throw new Error(`Failed to get overdue requests: ${error.message}`)
  }
  
  return (data || []) as DSARRequest[]
}

// Utility functions moved to dsar-utils.ts for client-side use
// Re-exported here for backward compatibility
export { getDaysUntilDeadline, isRequestOverdue } from './dsar-utils'

