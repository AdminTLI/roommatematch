// Referral System
// This module handles referral codes, tracking, and rewards

import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'
import crypto from 'crypto'

export interface ReferralCode {
  id: string
  code: string
  user_id: string
  is_active: boolean
  max_uses?: number
  uses_count: number
  reward_type: 'credit' | 'discount' | 'feature' | 'none'
  reward_amount?: number
  reward_description?: string
  expires_at?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  referral_code_id?: string
  status: 'pending' | 'completed' | 'rewarded' | 'expired' | 'cancelled'
  completion_criteria: 'signup' | 'verification' | 'onboarding' | 'first_match' | 'first_agreement'
  completed_at?: string
  referrer_reward_amount?: number
  referred_reward_amount?: number
  referrer_rewarded_at?: string
  referred_rewarded_at?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CampusAmbassador {
  id: string
  user_id: string
  university_id: string
  status: 'pending' | 'active' | 'inactive' | 'suspended'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  total_referrals: number
  active_referrals: number
  completed_referrals: number
  total_rewards: number
  custom_referral_code?: string
  marketing_materials?: Record<string, any>
  metadata?: Record<string, any>
  approved_at?: string
  created_at: string
  updated_at: string
}

/**
 * Generate a unique referral code
 */
function generateReferralCode(userId: string): string {
  const userCode = userId.substring(0, 8).toUpperCase()
  const randomCode = crypto.randomBytes(2).toString('hex').toUpperCase()
  return `REF-${userCode}-${randomCode}`
}

/**
 * Get or create referral code for user
 */
export async function getOrCreateReferralCode(
  userId: string
): Promise<ReferralCode | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for referrals')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if user already has a referral code
    const { data: existingCode, error: checkError } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      safeLogger.error('Failed to check existing referral code', { error: checkError })
      return null
    }

    if (existingCode) {
      return {
        id: existingCode.id,
        code: existingCode.code,
        user_id: existingCode.user_id,
        is_active: existingCode.is_active,
        max_uses: existingCode.max_uses,
        uses_count: existingCode.uses_count,
        reward_type: existingCode.reward_type,
        reward_amount: existingCode.reward_amount,
        reward_description: existingCode.reward_description,
        expires_at: existingCode.expires_at,
        metadata: existingCode.metadata,
        created_at: existingCode.created_at,
        updated_at: existingCode.updated_at
      }
    }

    // Generate new referral code
    let code = generateReferralCode(userId)
    let attempts = 0
    const maxAttempts = 10

    // Ensure code is unique
    while (attempts < maxAttempts) {
      const { data: duplicate } = await supabase
        .from('referral_codes')
        .select('id')
        .eq('code', code)
        .maybeSingle()

      if (!duplicate) {
        break
      }

      code = generateReferralCode(userId)
      attempts++
    }

    if (attempts >= maxAttempts) {
      safeLogger.error('Failed to generate unique referral code', { userId })
      return null
    }

    // Create referral code
    const { data: newCode, error: createError } = await supabase
      .from('referral_codes')
      .insert({
        code,
        user_id: userId,
        is_active: true,
        reward_type: 'credit',
        reward_amount: 10.00, // Default reward amount
        reward_description: 'Referral credit'
      })
      .select()
      .single()

    if (createError) {
      safeLogger.error('Failed to create referral code', { error: createError })
      return null
    }

    return {
      id: newCode.id,
      code: newCode.code,
      user_id: newCode.user_id,
      is_active: newCode.is_active,
      max_uses: newCode.max_uses,
      uses_count: newCode.uses_count,
      reward_type: newCode.reward_type,
      reward_amount: newCode.reward_amount,
      reward_description: newCode.reward_description,
      expires_at: newCode.expires_at,
      metadata: newCode.metadata,
      created_at: newCode.created_at,
      updated_at: newCode.updated_at
    }
  } catch (error) {
    safeLogger.error('Error getting or creating referral code', { error })
    return null
  }
}

/**
 * Validate referral code
 */
export async function validateReferralCode(
  code: string
): Promise<{ valid: boolean; referralCode?: ReferralCode; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for referrals')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get referral code
    const { data: referralCode, error } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle()

    if (error || !referralCode) {
      return { valid: false, error: 'Invalid referral code' }
    }

    // Check if code has expired
    if (referralCode.expires_at && new Date(referralCode.expires_at) < new Date()) {
      return { valid: false, error: 'Referral code has expired' }
    }

    // Check if code has reached max uses
    if (referralCode.max_uses && referralCode.uses_count >= referralCode.max_uses) {
      return { valid: false, error: 'Referral code has reached maximum uses' }
    }

    return {
      valid: true,
      referralCode: {
        id: referralCode.id,
        code: referralCode.code,
        user_id: referralCode.user_id,
        is_active: referralCode.is_active,
        max_uses: referralCode.max_uses,
        uses_count: referralCode.uses_count,
        reward_type: referralCode.reward_type,
        reward_amount: referralCode.reward_amount,
        reward_description: referralCode.reward_description,
        expires_at: referralCode.expires_at,
        metadata: referralCode.metadata,
        created_at: referralCode.created_at,
        updated_at: referralCode.updated_at
      }
    }
  } catch (error) {
    safeLogger.error('Error validating referral code', { error })
    return { valid: false, error: 'Failed to validate referral code' }
  }
}

/**
 * Create referral
 */
export async function createReferral(
  referrerId: string,
  referredId: string,
  referralCodeId: string,
  completionCriteria: Referral['completion_criteria'] = 'signup'
): Promise<Referral | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for referrals')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if referral already exists
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_id', referredId)
      .maybeSingle()

    if (existingReferral) {
      safeLogger.warn('Referral already exists', { referredId })
      return null
    }

    // Create referral
    const { data: referral, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: referredId,
        referral_code_id: referralCodeId,
        status: 'pending',
        completion_criteria: completionCriteria
      })
      .select()
      .single()

    if (error) {
      safeLogger.error('Failed to create referral', { error })
      return null
    }

    // Update referral code uses count
    await supabase.rpc('increment_referral_code_uses', {
      p_code_id: referralCodeId
    }).catch(err => {
      // If RPC doesn't exist, update manually
      safeLogger.warn('Failed to increment referral code uses via RPC', { error: err })
      supabase
        .from('referral_codes')
        .update({ uses_count: supabase.raw('uses_count + 1') })
        .eq('id', referralCodeId)
    })

    return {
      id: referral.id,
      referrer_id: referral.referrer_id,
      referred_id: referral.referred_id,
      referral_code_id: referral.referral_code_id,
      status: referral.status,
      completion_criteria: referral.completion_criteria,
      completed_at: referral.completed_at,
      referrer_reward_amount: referral.referrer_reward_amount,
      referred_reward_amount: referral.referred_reward_amount,
      referrer_rewarded_at: referral.referrer_rewarded_at,
      referred_rewarded_at: referral.referred_rewarded_at,
      metadata: referral.metadata,
      created_at: referral.created_at,
      updated_at: referral.updated_at
    }
  } catch (error) {
    safeLogger.error('Error creating referral', { error })
    return null
  }
}

/**
 * Complete referral
 */
export async function completeReferral(
  referralId: string,
  completionCriteria: Referral['completion_criteria']
): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for referrals')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get referral
    const { data: referral, error: getError } = await supabase
      .from('referrals')
      .select('*')
      .eq('id', referralId)
      .maybeSingle()

    if (getError || !referral) {
      safeLogger.error('Failed to fetch referral', { error: getError })
      return false
    }

    // Check if referral is already completed
    if (referral.status === 'completed' || referral.status === 'rewarded') {
      return true
    }

    // Check if completion criteria matches
    if (referral.completion_criteria !== completionCriteria) {
      return false
    }

    // Get referral code to get reward amounts
    const { data: referralCode } = await supabase
      .from('referral_codes')
      .select('reward_amount, reward_type')
      .eq('id', referral.referral_code_id)
      .maybeSingle()

    // Update referral status
    const updateData: any = {
      status: 'completed',
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (referralCode && referralCode.reward_amount) {
      updateData.referrer_reward_amount = referralCode.reward_amount
      updateData.referred_reward_amount = referralCode.reward_amount
    }

    const { error: updateError } = await supabase
      .from('referrals')
      .update(updateData)
      .eq('id', referralId)

    if (updateError) {
      safeLogger.error('Failed to complete referral', { error: updateError })
      return false
    }

    // Update campus ambassador metrics if applicable
    await supabase.rpc('increment_ambassador_referrals', {
      p_user_id: referral.referrer_id
    }).catch(err => {
      safeLogger.warn('Failed to increment ambassador referrals via RPC', { error: err })
    })

    return true
  } catch (error) {
    safeLogger.error('Error completing referral', { error })
    return false
  }
}

/**
 * Get user's referrals
 */
export async function getUserReferrals(
  userId: string,
  type: 'referrer' | 'referred' | 'all' = 'all'
): Promise<Referral[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for referrals')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    let query = supabase
      .from('referrals')
      .select('*')
      .order('created_at', { ascending: false })

    if (type === 'referrer') {
      query = query.eq('referrer_id', userId)
    } else if (type === 'referred') {
      query = query.eq('referred_id', userId)
    } else {
      query = query.or(`referrer_id.eq.${userId},referred_id.eq.${userId}`)
    }

    const { data: referrals, error } = await query

    if (error) {
      safeLogger.error('Failed to fetch user referrals', { error })
      return []
    }

    return (referrals || []).map(ref => ({
      id: ref.id,
      referrer_id: ref.referrer_id,
      referred_id: ref.referred_id,
      referral_code_id: ref.referral_code_id,
      status: ref.status,
      completion_criteria: ref.completion_criteria,
      completed_at: ref.completed_at,
      referrer_reward_amount: ref.referrer_reward_amount,
      referred_reward_amount: ref.referred_reward_amount,
      referrer_rewarded_at: ref.referrer_rewarded_at,
      referred_rewarded_at: ref.referred_rewarded_at,
      metadata: ref.metadata,
      created_at: ref.created_at,
      updated_at: ref.updated_at
    }))
  } catch (error) {
    safeLogger.error('Error fetching user referrals', { error })
    return []
  }
}

/**
 * Get or create campus ambassador
 */
export async function getOrCreateCampusAmbassador(
  userId: string,
  universityId: string
): Promise<CampusAmbassador | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables for referrals')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if ambassador already exists
    const { data: existingAmbassador, error: checkError } = await supabase
      .from('campus_ambassadors')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      safeLogger.error('Failed to check existing ambassador', { error: checkError })
      return null
    }

    if (existingAmbassador) {
      return {
        id: existingAmbassador.id,
        user_id: existingAmbassador.user_id,
        university_id: existingAmbassador.university_id,
        status: existingAmbassador.status,
        tier: existingAmbassador.tier,
        total_referrals: existingAmbassador.total_referrals,
        active_referrals: existingAmbassador.active_referrals,
        completed_referrals: existingAmbassador.completed_referrals,
        total_rewards: existingAmbassador.total_rewards,
        custom_referral_code: existingAmbassador.custom_referral_code,
        marketing_materials: existingAmbassador.marketing_materials,
        metadata: existingAmbassador.metadata,
        approved_at: existingAmbassador.approved_at,
        created_at: existingAmbassador.created_at,
        updated_at: existingAmbassador.updated_at
      }
    }

    // Create new ambassador
    const { data: newAmbassador, error: createError } = await supabase
      .from('campus_ambassadors')
      .insert({
        user_id: userId,
        university_id: universityId,
        status: 'pending',
        tier: 'bronze'
      })
      .select()
      .single()

    if (createError) {
      safeLogger.error('Failed to create campus ambassador', { error: createError })
      return null
    }

    return {
      id: newAmbassador.id,
      user_id: newAmbassador.user_id,
      university_id: newAmbassador.university_id,
      status: newAmbassador.status,
      tier: newAmbassador.tier,
      total_referrals: newAmbassador.total_referrals,
      active_referrals: newAmbassador.active_referrals,
      completed_referrals: newAmbassador.completed_referrals,
      total_rewards: newAmbassador.total_rewards,
      custom_referral_code: newAmbassador.custom_referral_code,
      marketing_materials: newAmbassador.marketing_materials,
      metadata: newAmbassador.metadata,
      approved_at: newAmbassador.approved_at,
      created_at: newAmbassador.created_at,
      updated_at: newAmbassador.updated_at
    }
  } catch (error) {
    safeLogger.error('Error getting or creating campus ambassador', { error })
    return null
  }
}

