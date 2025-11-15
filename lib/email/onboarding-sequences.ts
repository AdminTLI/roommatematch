// Onboarding Email Sequences
// This module handles automated email sequences for new users

import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'
import { sendEmail } from './workflows'

export interface EmailSequence {
  id: string
  name: string
  trigger: 'signup' | 'onboarding_started' | 'onboarding_completed' | 'verification_completed' | 'first_match'
  delay_hours: number
  subject: string
  template: string
  is_active: boolean
  university_id?: string
  user_segments?: string[]
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface EmailSequenceLog {
  id: string
  sequence_id: string
  user_id: string
  email_sent: boolean
  sent_at?: string
  error?: string
  created_at: string
}

/**
 * Send onboarding welcome email
 */
export async function sendOnboardingWelcomeEmail(
  userId: string,
  userEmail: string,
  userName?: string
): Promise<boolean> {
  try {
    const emailSent = await sendEmail({
      to: userEmail,
      subject: 'Welcome to Domu Match!',
      html: `
        <h2>Welcome to Domu Match!</h2>
        <p>Hello ${userName || 'there'},</p>
        <p>Thank you for joining Domu Match! We're excited to help you find your perfect roommate.</p>
        <p>To get started, please complete your profile by:</p>
        <ol>
          <li>Verifying your identity</li>
          <li>Completing your onboarding questionnaire</li>
          <li>Adding your preferences and requirements</li>
        </ol>
        <p>Once your profile is complete, we'll start matching you with compatible roommates.</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The Domu Match Team</p>
      `,
      text: `
        Welcome to Domu Match!
        
        Hello ${userName || 'there'},
        
        Thank you for joining Domu Match! We're excited to help you find your perfect roommate.
        
        To get started, please complete your profile by:
        1. Verifying your identity
        2. Completing your onboarding questionnaire
        3. Adding your preferences and requirements
        
        Once your profile is complete, we'll start matching you with compatible roommates.
        
        If you have any questions, feel free to reach out to our support team.
        
        Best regards,
        The Domu Match Team
      `
    })

    return emailSent
  } catch (error) {
    safeLogger.error('Error sending onboarding welcome email', { error })
    return false
  }
}

/**
 * Send onboarding completion email
 */
export async function sendOnboardingCompletionEmail(
  userId: string,
  userEmail: string,
  userName?: string
): Promise<boolean> {
  try {
    const emailSent = await sendEmail({
      to: userEmail,
      subject: 'Your Profile is Complete!',
      html: `
        <h2>Your Profile is Complete!</h2>
        <p>Hello ${userName || 'there'},</p>
        <p>Great news! Your profile is complete and we're now matching you with compatible roommates.</p>
        <p>You'll receive match suggestions soon. In the meantime, you can:</p>
        <ul>
          <li>Review your preferences</li>
          <li>Explore potential matches</li>
          <li>Update your profile if needed</li>
        </ul>
        <p>We'll notify you when we have new matches for you.</p>
        <p>Best regards,<br>The Domu Match Team</p>
      `,
      text: `
        Your Profile is Complete!
        
        Hello ${userName || 'there'},
        
        Great news! Your profile is complete and we're now matching you with compatible roommates.
        
        You'll receive match suggestions soon. In the meantime, you can:
        - Review your preferences
        - Explore potential matches
        - Update your profile if needed
        
        We'll notify you when we have new matches for you.
        
        Best regards,
        The Domu Match Team
      `
    })

    return emailSent
  } catch (error) {
    safeLogger.error('Error sending onboarding completion email', { error })
    return false
  }
}

/**
 * Send verification reminder email
 */
export async function sendVerificationReminderEmail(
  userId: string,
  userEmail: string,
  userName?: string
): Promise<boolean> {
  try {
    const emailSent = await sendEmail({
      to: userEmail,
      subject: 'Complete Your Verification',
      html: `
        <h2>Complete Your Verification</h2>
        <p>Hello ${userName || 'there'},</p>
        <p>We noticed you haven't completed your identity verification yet.</p>
        <p>Verification is required to use Domu Match and helps ensure a safe environment for everyone.</p>
        <p>Please complete your verification to continue using the platform.</p>
        <p>If you have any questions or need help, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The Domu Match Team</p>
      `,
      text: `
        Complete Your Verification
        
        Hello ${userName || 'there'},
        
        We noticed you haven't completed your identity verification yet.
        
        Verification is required to use Domu Match and helps ensure a safe environment for everyone.
        
        Please complete your verification to continue using the platform.
        
        If you have any questions or need help, feel free to reach out to our support team.
        
        Best regards,
        The Domu Match Team
      `
    })

    return emailSent
  } catch (error) {
    safeLogger.error('Error sending verification reminder email', { error })
    return false
  }
}

/**
 * Send first match email
 */
export async function sendFirstMatchEmail(
  userId: string,
  userEmail: string,
  userName?: string,
  matchCount: number = 1
): Promise<boolean> {
  try {
    const emailSent = await sendEmail({
      to: userEmail,
      subject: `You have ${matchCount} new match${matchCount > 1 ? 'es' : ''}!`,
      html: `
        <h2>You Have New Matches!</h2>
        <p>Hello ${userName || 'there'},</p>
        <p>Great news! We've found ${matchCount} compatible roommate${matchCount > 1 ? 's' : ''} for you.</p>
        <p>Log in to your account to view your matches and start connecting.</p>
        <p>Best regards,<br>The Domu Match Team</p>
      `,
      text: `
        You Have New Matches!
        
        Hello ${userName || 'there'},
        
        Great news! We've found ${matchCount} compatible roommate${matchCount > 1 ? 's' : ''} for you.
        
        Log in to your account to view your matches and start connecting.
        
        Best regards,
        The Domu Match Team
      `
    })

    return emailSent
  } catch (error) {
    safeLogger.error('Error sending first match email', { error })
    return false
  }
}

/**
 * Process onboarding email sequence
 */
export async function processOnboardingEmailSequence(
  userId: string,
  trigger: 'signup' | 'onboarding_started' | 'onboarding_completed' | 'verification_completed' | 'first_match',
  delayHours: number = 0
): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user information
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('id', userId)
      .maybeSingle()

    if (userError || !user) {
      safeLogger.error('Failed to fetch user', { error: userError })
      return false
    }

    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email

    // Send email based on trigger
    let emailSent = false

    switch (trigger) {
      case 'signup':
        emailSent = await sendOnboardingWelcomeEmail(userId, user.email, userName)
        break
      case 'onboarding_completed':
        emailSent = await sendOnboardingCompletionEmail(userId, user.email, userName)
        break
      case 'verification_completed':
        // Send verification completion email
        emailSent = await sendEmail({
          to: user.email,
          subject: 'Verification Complete!',
          html: `
            <h2>Verification Complete!</h2>
            <p>Hello ${userName},</p>
            <p>Your identity verification has been completed successfully.</p>
            <p>You can now use all features of Domu Match.</p>
            <p>Best regards,<br>The Domu Match Team</p>
          `,
          text: `
            Verification Complete!
            
            Hello ${userName},
            
            Your identity verification has been completed successfully.
            
            You can now use all features of Domu Match.
            
            Best regards,
            The Domu Match Team
          `
        })
        break
      case 'first_match':
        // Get match suggestion count
        const now = new Date().toISOString()
        const { count: matchCount } = await supabase
          .from('match_suggestions')
          .select('id', { count: 'exact', head: true })
          .eq('kind', 'pair')
          .contains('member_ids', [userId])
          .eq('status', 'pending')
          .gte('expires_at', now)

        emailSent = await sendFirstMatchEmail(userId, user.email, userName, matchCount || 0)
        break
      default:
        safeLogger.warn('Unknown email trigger', { trigger })
        return false
    }

    return emailSent
  } catch (error) {
    safeLogger.error('Error processing onboarding email sequence', { error })
    return false
  }
}

/**
 * Get users who need email reminders
 */
export async function getUsersNeedingEmailReminders(
  trigger: 'verification_reminder' | 'onboarding_reminder',
  hoursSince: number = 24
): Promise<Array<{
  user_id: string
  email: string
  first_name?: string
  last_name?: string
  created_at: string
}>> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const cutoffDate = new Date(Date.now() - hoursSince * 60 * 60 * 1000)

    if (trigger === 'verification_reminder') {
      // Get users who haven't verified after 24 hours
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select(`
          user_id,
          users!inner(email, first_name, last_name, created_at),
          verification_status
        `)
        .neq('verification_status', 'verified')
        .lt('users.created_at', cutoffDate.toISOString())
        .limit(100)

      if (error) {
        safeLogger.error('Failed to fetch users needing verification reminders', { error })
        return []
      }

      return (users || []).map(user => ({
        user_id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        created_at: user.created_at
      }))
    } else if (trigger === 'onboarding_reminder') {
      // Get users who haven't completed onboarding after 48 hours
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select(`
          user_id,
          users!inner(email, first_name, last_name, created_at),
          onboarding_sections!inner(section, completed_at)
        `)
        .lt('users.created_at', cutoffDate.toISOString())
        .neq('onboarding_sections.section', 'complete')
        .is('onboarding_sections.completed_at', null)
        .limit(100)

      if (error) {
        safeLogger.error('Failed to fetch users needing onboarding reminders', { error })
        return []
      }

      return (users || []).map(user => ({
        user_id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        created_at: user.created_at
      }))
    }

    return []
  } catch (error) {
    safeLogger.error('Error fetching users needing email reminders', { error })
    return []
  }
}

