import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { grantConsent, withdrawConsent, type ConsentType } from '@/lib/privacy/cookie-consent-server'
import { safeLogger } from '@/lib/utils/logger'

/**
 * POST /api/privacy/consent
 * 
 * Grant or withdraw consent for tracking/analytics
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await req.json()
    const { consents, action } = body

    if (!Array.isArray(consents) || !['grant', 'withdraw'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request. consents must be an array and action must be "grant" or "withdraw"' },
        { status: 400 }
      )
    }

    const metadata = {
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
      user_agent: req.headers.get('user-agent') || undefined,
      consent_method: 'preference_center'
    }

    const results = []

    for (const consentType of consents as ConsentType[]) {
      try {
        if (action === 'grant') {
          const record = await grantConsent(consentType, user?.id, metadata)
          results.push({ consent_type: consentType, status: 'granted', record_id: record.id })
        } else {
          await withdrawConsent(consentType, user?.id)
          results.push({ consent_type: consentType, status: 'withdrawn' })
        }
      } catch (error) {
        safeLogger.error('Failed to process consent', { error, consentType, action })
        results.push({ consent_type: consentType, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      user_id: user?.id || null
    })

  } catch (error) {
    safeLogger.error('Consent API error', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process consent',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

