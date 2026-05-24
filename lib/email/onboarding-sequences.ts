// Onboarding Email Sequences
// This module handles automated email sequences for new users

import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'
import { sendEmail } from './workflows'
import { renderEmailLayout, renderButton, renderInfoBox, escapeHtml } from './layout'
import { BRAND, COLORS, URLS, buildUnsubscribeUrl } from './brand'
import { createUnsubscribeToken } from './unsubscribe-token'

function safeUnsubUrl(userId: string | undefined): string | undefined {
  if (!userId) return undefined
  try {
    return buildUnsubscribeUrl(createUnsubscribeToken(userId))
  } catch {
    return undefined
  }
}

/**
 * Should we send a lifecycle / marketing-style email (welcome, verification
 * reminder, onboarding nudge, first-match alert) to this user?
 *
 * Hard transactional mail (password reset, ticket replies, security alerts,
 * legal warnings) never goes through this gate.
 *
 * We map all lifecycle/marketing copy to `emailUpdates` so users have a
 * single, predictable toggle on the unsubscribe page.
 */
export async function canSendLifecycleEmail(userId: string): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) return true

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data: profile } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('user_id', userId)
      .maybeSingle()

    const prefs = (profile as any)?.notification_preferences
    if (!prefs || typeof prefs !== 'object') return true
    return prefs.emailUpdates !== false
  } catch (error) {
    safeLogger.warn('[Email] canSendLifecycleEmail check failed; allowing send', { error })
    return true
  }
}

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
    const niceName = userName?.trim() || 'there'
    const bodyHtml = `
      <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${COLORS.textHeading};text-align:center;letter-spacing:-0.2px;">
        Welcome to Domu Match
      </h1>
      <p style="margin:0 0 20px;text-align:center;color:${COLORS.textMuted};font-size:15px;">
        Hey ${escapeHtml(niceName)} - we’re so glad you’re here. Finding a roommate shouldn’t feel like a gamble, and your perfect match could be just a few questions away.
      </p>
      <div style="margin:24px 0;">
        ${renderButton('Set up your profile', URLS.signIn)}
      </div>
      ${renderInfoBox(
        `<strong style="color:${COLORS.textBody};">Quick start (about 5 minutes):</strong>
         <ol style="margin:8px 0 0;padding-left:18px;color:${COLORS.textMuted};font-size:14px;line-height:22px;">
           <li>Verify your email and identity.</li>
           <li>Answer the compatibility questionnaire.</li>
           <li>Set your preferences - budget, move-in, dealbreakers.</li>
         </ol>`,
        'neutral'
      )}`

    const html = renderEmailLayout({
      preheader: 'Welcome to Domu Match - set up your profile in about 5 minutes.',
      title: 'Welcome to Domu Match',
      bodyHtml,
      recipientEmail: userEmail,
      includeUnsubscribe: true,
      unsubscribeUrl: safeUnsubUrl(userId),
    })

    const text = `Hey ${niceName},\n\nWelcome to Domu Match! Set up your profile in about 5 minutes:\n1. Verify your email and identity\n2. Answer the compatibility questionnaire\n3. Set your preferences\n\nGet started: ${URLS.signIn}\n\n- ${BRAND.name}\n${BRAND.tagline}\n`

    return await sendEmail({
      to: userEmail,
      subject: 'Welcome to Domu Match',
      html,
      text,
    })
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
    const niceName = userName?.trim() || 'there'
    const dashboardUrl = `${URLS.home}/dashboard`

    const bodyHtml = `
      <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${COLORS.textHeading};text-align:center;letter-spacing:-0.2px;">
        Your profile is ready
      </h1>
      <p style="margin:0 0 20px;text-align:center;color:${COLORS.textMuted};font-size:15px;">
        Nice work, ${escapeHtml(niceName)}. Your profile is complete and we’re already running compatibility checks. Matches will start arriving in your dashboard soon.
      </p>
      <div style="margin:24px 0;">
        ${renderButton('Open your dashboard', dashboardUrl)}
      </div>
      ${renderInfoBox(
        `<strong style="color:${COLORS.textBody};">While you wait:</strong> review your preferences, peek at potential matches, and keep your profile fresh - small tweaks can sharpen your recommendations.`,
        'neutral'
      )}`

    const html = renderEmailLayout({
      preheader: 'Your Domu Match profile is complete - matches are on the way.',
      title: 'Your profile is ready - Domu Match',
      bodyHtml,
      recipientEmail: userEmail,
      includeUnsubscribe: true,
      unsubscribeUrl: safeUnsubUrl(userId),
    })

    const text = `Hey ${niceName},\n\nYour Domu Match profile is complete and we're running compatibility checks. Match suggestions will start landing in your dashboard soon.\n\nOpen your dashboard: ${dashboardUrl}\n\n- ${BRAND.name}\n${BRAND.tagline}\n`

    return await sendEmail({
      to: userEmail,
      subject: 'Your profile is ready - Domu Match',
      html,
      text,
    })
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
    const niceName = userName?.trim() || 'there'
    const verifyUrl = `${URLS.home}/settings`

    const bodyHtml = `
      <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${COLORS.textHeading};text-align:center;letter-spacing:-0.2px;">
        Finish verifying your account
      </h1>
      <p style="margin:0 0 20px;text-align:center;color:${COLORS.textMuted};font-size:15px;">
        Hey ${escapeHtml(niceName)} - a quick verification step keeps Domu Match a safe place for everyone. It only takes a minute and unlocks matching.
      </p>
      <div style="margin:24px 0;">
        ${renderButton('Complete verification', verifyUrl)}
      </div>
      ${renderInfoBox(
        `Need a hand? Email us anytime at <a href="mailto:${BRAND.supportEmail}" style="color:${COLORS.primary};text-decoration:underline;">${BRAND.supportEmail}</a> and we’ll help you through it.`,
        'neutral'
      )}`

    const html = renderEmailLayout({
      preheader: 'A quick verification step unlocks Domu Match.',
      title: 'Finish verifying your Domu Match account',
      bodyHtml,
      recipientEmail: userEmail,
      includeUnsubscribe: true,
      unsubscribeUrl: safeUnsubUrl(userId),
    })

    const text = `Hey ${niceName},\n\nA quick verification step keeps Domu Match safe and unlocks matching for you. It only takes a minute.\n\nComplete verification: ${verifyUrl}\n\nNeed help? Email ${BRAND.supportEmail}.\n\n- ${BRAND.name}\n${BRAND.tagline}\n`

    return await sendEmail({
      to: userEmail,
      subject: 'Finish verifying your Domu Match account',
      html,
      text,
    })
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
    const niceName = userName?.trim() || 'there'
    const matchesUrl = `${URLS.home}/matches`
    const plural = matchCount > 1 ? 'matches' : 'match'
    const subject = `You have ${matchCount} new ${plural}`

    const bodyHtml = `
      <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${COLORS.textHeading};text-align:center;letter-spacing:-0.2px;">
        Your first ${escapeHtml(plural)}${matchCount > 1 ? ' are' : ' is'} here
      </h1>
      <p style="margin:0 0 20px;text-align:center;color:${COLORS.textMuted};font-size:15px;">
        Big moment, ${escapeHtml(niceName)} - we found <strong style="color:${COLORS.textHeading};">${matchCount}</strong> compatible roommate${matchCount > 1 ? 's' : ''} for you. Have a look and say hi when you’re ready.
      </p>
      <div style="margin:24px 0;">
        ${renderButton('See your matches', matchesUrl)}
      </div>
      ${renderInfoBox(
        `<strong style="color:${COLORS.textBody};">Tip:</strong> A friendly first message - “When are you hoping to move in?” - gets replies faster than a hello.`,
        'neutral'
      )}`

    const html = renderEmailLayout({
      preheader: `${matchCount} new compatible roommate${matchCount > 1 ? 's are' : ' is'} waiting on Domu Match.`,
      title: subject,
      bodyHtml,
      recipientEmail: userEmail,
      includeUnsubscribe: true,
      unsubscribeUrl: safeUnsubUrl(userId),
    })

    const text = `Hey ${niceName},\n\nWe found ${matchCount} compatible roommate${matchCount > 1 ? 's' : ''} for you. Have a look and say hi when you're ready.\n\nSee your matches: ${matchesUrl}\n\n- ${BRAND.name}\n${BRAND.tagline}\n`

    return await sendEmail({
      to: userEmail,
      subject,
      html,
      text,
    })
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
      case 'verification_completed': {
        const dashboardUrl = `${URLS.home}/dashboard`
        const bodyHtml = `
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${COLORS.textHeading};text-align:center;letter-spacing:-0.2px;">
            Verification complete
          </h1>
          <p style="margin:0 0 20px;text-align:center;color:${COLORS.textMuted};font-size:15px;">
            You’re all set, ${escapeHtml(userName)}. Your identity has been verified and every Domu Match feature is now unlocked.
          </p>
          <div style="margin:24px 0;">
            ${renderButton('Open your dashboard', dashboardUrl)}
          </div>`

        const html = renderEmailLayout({
          preheader: 'Your Domu Match identity verification is complete.',
          title: 'Verification complete - Domu Match',
          bodyHtml,
          recipientEmail: user.email,
          includeUnsubscribe: false,
        })

        const text = `Hello ${userName},\n\nYour Domu Match identity verification is complete. Every feature is now unlocked.\n\nOpen your dashboard: ${dashboardUrl}\n\n- ${BRAND.name}\n${BRAND.tagline}\n`

        emailSent = await sendEmail({
          to: user.email,
          subject: 'Verification complete - Domu Match',
          html,
          text,
        })
        break
      }
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

      return (users || []).map((row) => {
        const linkedUser = Array.isArray(row.users) ? row.users[0] : row.users
        return {
          user_id: row.user_id,
          email: linkedUser?.email,
          first_name: linkedUser?.first_name,
          last_name: linkedUser?.last_name,
          created_at: linkedUser?.created_at,
        }
      })
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

      return (users || []).map((row) => {
        const linkedUser = Array.isArray(row.users) ? row.users[0] : row.users
        return {
          user_id: row.user_id,
          email: linkedUser?.email,
          first_name: linkedUser?.first_name,
          last_name: linkedUser?.last_name,
          created_at: linkedUser?.created_at,
        }
      })
    }

    return []
  } catch (error) {
    safeLogger.error('Error fetching users needing email reminders', { error })
    return []
  }
}

