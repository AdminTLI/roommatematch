import { NextResponse } from 'next/server'
import { processOnboardingEmailSequence, getUsersNeedingEmailReminders, sendVerificationReminderEmail } from '@/lib/email/onboarding-sequences'
import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/cron/email-sequences
 * Cron job to send onboarding email sequences
 * Runs hourly to send scheduled emails
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret for security - REQUIRED in production
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET

    // Require secret in production - fail fast if missing
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV) {
      if (!cronSecret) {
        safeLogger.error('[Cron] CRON_SECRET or VERCEL_CRON_SECRET is required in production')
        return NextResponse.json(
          { error: 'Cron secret not configured' },
          { status: 500 }
        )
      }
    }

    // Verify authorization header matches secret
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      safeLogger.warn('[Cron] Unauthorized email sequence request attempt', {
        hasHeader: !!authHeader,
        hasSecret: !!cronSecret
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // If no secret configured in development, warn but allow (for local testing)
    if (!cronSecret && (process.env.NODE_ENV !== 'production' && !process.env.VERCEL_ENV)) {
      safeLogger.warn('[Cron] No cron secret configured - allowing request in development only')
    }

    safeLogger.info('[Cron] Starting email sequence processing')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const results = {
      verificationReminders: 0,
      onboardingReminders: 0,
      errors: 0
    }

    // Send verification reminder emails
    const usersNeedingVerification = await getUsersNeedingEmailReminders('verification_reminder', 24)
    for (const user of usersNeedingVerification) {
      try {
        const emailSent = await sendVerificationReminderEmail(
          user.user_id,
          user.email,
          `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
        )

        if (emailSent) {
          results.verificationReminders++
        } else {
          results.errors++
        }
      } catch (error) {
        safeLogger.error('Failed to send verification reminder email', { error, userId: user.user_id })
        results.errors++
      }
    }

    // Send onboarding reminder emails
    const usersNeedingOnboarding = await getUsersNeedingEmailReminders('onboarding_reminder', 48)
    for (const user of usersNeedingOnboarding) {
      try {
        const emailSent = await processOnboardingEmailSequence(user.user_id, 'onboarding_started', 0)

        if (emailSent) {
          results.onboardingReminders++
        } else {
          results.errors++
        }
      } catch (error) {
        safeLogger.error('Failed to send onboarding reminder email', { error, userId: user.user_id })
        results.errors++
      }
    }

    safeLogger.info('[Cron] Email sequence processing complete', {
      verificationReminders: results.verificationReminders,
      onboardingReminders: results.onboardingReminders,
      errors: results.errors
    })

    return NextResponse.json({
      success: true,
      runId: `email_sequences_${Date.now()}`,
      results: {
        verificationReminders: results.verificationReminders,
        onboardingReminders: results.onboardingReminders,
        errors: results.errors
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    safeLogger.error('[Cron] Email sequence processing failed', { error })
    return NextResponse.json(
      { error: 'Email sequence processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

