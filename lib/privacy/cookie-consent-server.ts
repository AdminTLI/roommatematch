/**
 * Cookie Consent Management - Server Side
 * 
 * Server-side functions for cookie consent management (database operations)
 * This file should only be imported in server components and API routes
 */

import { createClient } from '@/lib/supabase/server'
import type { ConsentType, ConsentStatus } from './cookie-consent-client'

export interface ConsentRecord {
  id: string
  user_id?: string
  consent_type: ConsentType
  status: ConsentStatus
  ip_address?: string
  user_agent?: string
  consent_method: string
  granted_at: string
  withdrawn_at?: string
  created_at: string
  updated_at: string
}

/**
 * Get user's active consents
 * Works for both authenticated and anonymous users
 */
export async function getUserConsents(
  userId?: string,
  sessionId?: string
): Promise<Record<ConsentType, boolean>> {
  const consents: Record<ConsentType, boolean> = {
    essential: true, // Always granted
    analytics: false,
    error_tracking: false,
    session_replay: false,
    marketing: false
  }

  if (!userId && !sessionId) {
    return consents
  }

  try {
    const supabase = await createClient()
    
    // For authenticated users, query by user_id
    if (userId) {
      const { data } = await supabase
        .from('user_consents')
        .select('consent_type, status, withdrawn_at')
        .eq('user_id', userId)
        .eq('status', 'granted')
        .is('withdrawn_at', null)
      
      if (data) {
        data.forEach(record => {
          consents[record.consent_type as ConsentType] = true
        })
      }
    } else if (sessionId) {
      // For anonymous users, we'd need to store session_id
      // For now, we'll check localStorage on client side
      // This function is mainly for server-side checks
    }
  } catch (error) {
    console.error('Failed to get user consents', error)
  }

  return consents
}

/**
 * Grant consent for a specific type
 */
export async function grantConsent(
  consentType: ConsentType,
  userId?: string,
  metadata?: {
    ip_address?: string
    user_agent?: string
    consent_method?: string
  }
): Promise<ConsentRecord> {
  const supabase = await createClient()

  // Withdraw any existing consent of this type first
  if (userId) {
    await supabase
      .from('user_consents')
      .update({
        status: 'withdrawn',
        withdrawn_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('consent_type', consentType)
      .eq('status', 'granted')
  }

  // Create new consent record
  const { data, error } = await supabase
    .from('user_consents')
    .insert({
      user_id: userId || null,
      consent_type: consentType,
      status: 'granted',
      ip_address: metadata?.ip_address,
      user_agent: metadata?.user_agent,
      consent_method: metadata?.consent_method || 'banner',
      granted_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to grant consent: ${error.message}`)
  }

  return data as ConsentRecord
}

/**
 * Withdraw consent for a specific type
 */
export async function withdrawConsent(
  consentType: ConsentType,
  userId?: string
): Promise<void> {
  if (consentType === 'essential') {
    throw new Error('Cannot withdraw essential consent')
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('user_consents')
    .update({
      status: 'withdrawn',
      withdrawn_at: new Date().toISOString()
    })
    .eq('user_id', userId || null)
    .eq('consent_type', consentType)
    .eq('status', 'granted')

  if (error) {
    throw new Error(`Failed to withdraw consent: ${error.message}`)
  }
}

/**
 * Grant multiple consents at once
 */
export async function grantMultipleConsents(
  consentTypes: ConsentType[],
  userId?: string,
  metadata?: {
    ip_address?: string
    user_agent?: string
    consent_method?: string
  }
): Promise<ConsentRecord[]> {
  const records: ConsentRecord[] = []

  for (const consentType of consentTypes) {
    if (consentType !== 'essential') {
      const record = await grantConsent(consentType, userId, metadata)
      records.push(record)
    }
  }

  return records
}

/**
 * Withdraw all non-essential consents
 */
export async function withdrawAllConsents(userId?: string): Promise<void> {
  const supabase = await createClient()
  // Non-essential consent types
  const nonEssentialTypes: ConsentType[] = ['analytics', 'error_tracking', 'session_replay', 'marketing']

  const { error } = await supabase
    .from('user_consents')
    .update({
      status: 'withdrawn',
      withdrawn_at: new Date().toISOString()
    })
    .eq('user_id', userId || null)
    .in('consent_type', nonEssentialTypes)
    .eq('status', 'granted')

  if (error) {
    throw new Error(`Failed to withdraw consents: ${error.message}`)
  }
}

/**
 * Check if consent is granted for a specific type
 */
export async function hasConsent(
  consentType: ConsentType,
  userId?: string,
  sessionId?: string
): Promise<boolean> {
  if (consentType === 'essential') {
    return true // Always granted
  }

  const consents = await getUserConsents(userId, sessionId)
  return consents[consentType] || false
}

