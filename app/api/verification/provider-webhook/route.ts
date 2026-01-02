import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { PersonaWebhookSchema, VeriffWebhookSchema, OnfidoWebhookSchema } from '@/lib/webhooks/schemas'
import { clearVerificationCache } from '@/lib/auth/verification-check'
import crypto from 'crypto'

type KYCProvider = 'veriff' | 'persona' | 'onfido'

/**
 * Verify webhook signature based on provider
 */
function verifyWebhookSignature(
  provider: KYCProvider,
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    return false
  }

  try {
    switch (provider) {
      case 'veriff': {
        // Veriff uses HMAC SHA256
        const expectedSignature = crypto
          .createHmac('sha256', secret)
          .update(payload)
          .digest('hex')
        return crypto.timingSafeEqual(
          Buffer.from(signature),
          Buffer.from(expectedSignature)
        )
      }

      case 'persona': {
        // Persona uses HMAC SHA256 with 'sha256=' prefix
        const signatureValue = signature.replace('sha256=', '')
        const expectedSignature = crypto
          .createHmac('sha256', secret)
          .update(payload)
          .digest('hex')
        return crypto.timingSafeEqual(
          Buffer.from(signatureValue),
          Buffer.from(expectedSignature)
        )
      }

      case 'onfido': {
        // Onfido uses HMAC SHA1
        const expectedSignature = crypto
          .createHmac('sha1', secret)
          .update(payload)
          .digest('hex')
        return crypto.timingSafeEqual(
          Buffer.from(signature),
          Buffer.from(expectedSignature)
        )
      }

      default:
        return false
    }
  } catch (error) {
    safeLogger.error('[Verification] Signature verification error', error)
    return false
  }
}

/**
 * Parse webhook payload based on provider
 */
function parseWebhookPayload(provider: KYCProvider, body: any): {
  sessionId: string
  status: 'approved' | 'rejected' | 'pending' | 'expired'
  reason?: string
  dob?: string
} | null {
  try {
    switch (provider) {
      case 'veriff': {
        // Veriff webhook format
        const { verification } = body
        if (!verification || !verification.id) {
          return null
        }

        const statusMap: Record<string, 'approved' | 'rejected' | 'pending' | 'expired'> = {
          'success': 'approved',
          'failed': 'rejected',
          'abandoned': 'expired',
          'declined': 'rejected'
        }

        return {
          sessionId: verification.id,
          status: statusMap[verification.status] || 'pending',
          reason: verification.reason || verification.code
        }
      }

      case 'persona': {
        // Persona webhook format
        const { data } = body
        if (!data || !data.id) {
          return null
        }

        const statusMap: Record<string, 'approved' | 'rejected' | 'pending' | 'expired'> = {
          'completed': 'approved',
          'failed': 'rejected',
          'expired': 'expired',
          'pending': 'pending'
        }

        return {
          sessionId: data.id,
          status: statusMap[data.attributes?.status] || 'pending',
          reason: data.attributes?.reason,
          dob: extractPersonaDob(body)
        }
      }

      case 'onfido': {
        // Onfido webhook format
        const { payload } = body
        if (!payload || !payload.resource_id) {
          return null
        }

        const statusMap: Record<string, 'approved' | 'rejected' | 'pending' | 'expired'> = {
          'clear': 'approved',
          'consider': 'rejected',
          'unidentified': 'rejected'
        }

        return {
          sessionId: payload.resource_id,
          status: statusMap[payload.action] || 'pending',
          reason: payload.reason
        }
      }

      default:
        return null
    }
  } catch (error) {
    safeLogger.error('[Verification] Payload parsing error', error)
    return null
  }
}

function normalizeDateString(value?: string | null): string | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  const normalized = new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()))
  return normalized.toISOString().split('T')[0]
}

function extractPersonaDob(payload: any): string | undefined {
  const candidates: Array<string | undefined> = [
    payload?.data?.attributes?.birthdate,
    payload?.data?.attributes?.birth_date,
    payload?.data?.attributes?.dob,
    payload?.data?.attributes?.['date-of-birth'],
    payload?.data?.attributes?.['date_of_birth'],
    payload?.data?.attributes?.payload?.data?.attributes?.birthdate,
    payload?.data?.attributes?.payload?.data?.attributes?.dob,
    payload?.data?.attributes?.payload?.data?.attributes?.['date-of-birth'],
  ]

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }

  if (Array.isArray(payload?.included)) {
    for (const item of payload.included) {
      const possibleDob =
        item?.attributes?.birthdate ||
        item?.attributes?.dob ||
        item?.attributes?.['date-of-birth'] ||
        item?.attributes?.['date_of_birth']
      if (typeof possibleDob === 'string' && possibleDob.trim()) {
        return possibleDob
      }
    }
  }

  return undefined
}

async function fetchPersonaInquiryDob(sessionId: string): Promise<string | undefined> {
  const apiKey = process.env.PERSONA_API_KEY
  const apiUrl = process.env.PERSONA_API_URL || 'https://withpersona.com/api/v1'
  if (!apiKey) {
    safeLogger.warn('[Verification] Persona API key missing; cannot fetch DOB from inquiry')
    return undefined
  }

  try {
    const response = await fetch(`${apiUrl}/inquiries/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const body = await response.text()
      safeLogger.warn('[Verification] Failed to fetch Persona inquiry', { sessionId, status: response.status, body })
      return undefined
    }

    const data = await response.json()
    return extractPersonaDob(data)
  } catch (error) {
    safeLogger.error('[Verification] Persona inquiry fetch error', { sessionId, error })
    return undefined
  }
}

async function getExpectedDob(admin: ReturnType<typeof createAdminClient>, userId: string) {
  const { data: profile } = await admin
    .from('profiles')
    .select('date_of_birth')
    .eq('user_id', userId)
    .maybeSingle()

  let authDob: string | null = null
  try {
    const { data: authUser } = await admin.auth.admin.getUserById(userId)
    authDob = (authUser?.user?.user_metadata as Record<string, any> | undefined)?.date_of_birth ?? null
  } catch (error) {
    safeLogger.warn('[Verification] Unable to read auth metadata for DOB', { userId, error })
  }

  return {
    fromProfile: profile?.date_of_birth ?? null,
    fromAuth: authDob
  }
}

export async function POST(request: NextRequest) {
  try {
    // Determine provider from query param or header
    const providerParam = request.nextUrl.searchParams.get('provider')
    const provider = (providerParam || process.env.KYC_PROVIDER || 'veriff') as KYCProvider

    // Get webhook secret - fail-closed: reject all requests if secret is missing
    const secretKey = process.env[`${provider.toUpperCase()}_WEBHOOK_SECRET`] || ''
    if (!secretKey) {
      safeLogger.error('[Verification] CRITICAL: Webhook secret missing for provider', { provider })
      // Return 503 (Service Unavailable) instead of 500 to indicate configuration issue
      // This ensures fail-closed behavior: no webhooks are processed without proper secret
      return NextResponse.json({ 
        error: 'Webhook verification service temporarily unavailable' 
      }, { status: 503 })
    }

    // Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('x-signature') || 
                     request.headers.get('x-veriff-signature') ||
                     request.headers.get('x-persona-signature') ||
                     request.headers.get('x-sdk-token')

    // Verify signature
    if (!verifyWebhookSignature(provider, rawBody, signature, secretKey)) {
      safeLogger.warn('[Verification] Invalid webhook signature', { provider })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse and validate payload
    let body: any
    try {
      body = JSON.parse(rawBody)
    } catch (parseError) {
      safeLogger.warn('[Verification] Failed to parse webhook JSON', { provider, error: parseError })
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    // Validate payload structure based on provider
    let validatedBody: any
    try {
      switch (provider) {
        case 'persona':
          validatedBody = PersonaWebhookSchema.parse(body)
          break
        case 'veriff':
          validatedBody = VeriffWebhookSchema.parse(body)
          break
        case 'onfido':
          validatedBody = OnfidoWebhookSchema.parse(body)
          break
        default:
          safeLogger.warn('[Verification] Unknown provider', { provider })
          return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
      }
    } catch (validationError) {
      safeLogger.warn('[Verification] Webhook payload validation failed', { 
        provider, 
        error: validationError instanceof Error ? validationError.message : String(validationError),
        payload: body
      })
      return NextResponse.json({ error: 'Invalid webhook payload format' }, { status: 400 })
    }

    // Parse validated payload
    const parsed = parseWebhookPayload(provider, validatedBody)

    if (!parsed) {
      safeLogger.warn('[Verification] Failed to parse webhook payload after validation', { provider, validatedBody })
      return NextResponse.json({ error: 'Invalid payload structure' }, { status: 400 })
    }

    // Log webhook to audit table
    const admin = await createAdminClient()
    const { error: webhookError } = await admin
      .from('verification_webhooks')
      .insert({
        provider,
        event_type: validatedBody.type || validatedBody.event || 'unknown',
        payload: validatedBody,
        processed: false
      })

    if (webhookError) {
      safeLogger.error('[Verification] Failed to log webhook', webhookError)
    }

    // Find verification record
    const { data: verification, error: fetchError } = await admin
      .from('verifications')
      .select('id, user_id, status, provider_data')
      .eq('provider_session_id', parsed.sessionId)
      .eq('provider', provider)
      .maybeSingle()

    if (fetchError || !verification) {
      safeLogger.warn('[Verification] Verification not found', {
        sessionId: parsed.sessionId,
        provider
      })
      
      // Mark webhook as processed with error
      if (!webhookError) {
        await admin
          .from('verification_webhooks')
          .update({ processed: true, error: 'Verification not found' })
          .eq('provider', provider)
          .eq('payload->>id', parsed.sessionId)
          .order('created_at', { ascending: false })
          .limit(1)
      }

      return NextResponse.json({ error: 'Verification not found' }, { status: 404 })
    }

    let personaDob: string | undefined
    let expectedDob: string | null = null

    if (provider === 'persona') {
      const expected = await getExpectedDob(admin, verification.user_id)
      expectedDob = expected.fromProfile || expected.fromAuth || null

      personaDob = parsed.dob || await fetchPersonaInquiryDob(parsed.sessionId)
    }

    const normalizedExpectedDob = normalizeDateString(expectedDob)
    const normalizedPersonaDob = normalizeDateString(personaDob)
    const dobMismatch = provider === 'persona' &&
      normalizedExpectedDob &&
      normalizedPersonaDob &&
      normalizedExpectedDob !== normalizedPersonaDob

    const finalStatus: 'approved' | 'rejected' | 'pending' | 'expired' = dobMismatch ? 'rejected' : parsed.status
    const finalReason = dobMismatch
      ? 'Date of birth does not match Persona verification.'
      : parsed.reason

    // Prevent duplicate processing
    if (verification.status === finalStatus) {
      safeLogger.debug('[Verification] Status already set', {
        sessionId: parsed.sessionId,
        status: finalStatus
      })
      
      await admin
        .from('verification_webhooks')
        .update({ processed: true })
        .eq('provider', provider)
        .eq('payload->>id', parsed.sessionId)
        .order('created_at', { ascending: false })
        .limit(1)

      return NextResponse.json({ ok: true, message: 'Already processed' })
    }

    // Update verification status
    const providerDataUpdate = {
      ...(verification.provider_data || {}),
      persona_birthdate: normalizedPersonaDob || personaDob || null,
      expected_birthdate: normalizedExpectedDob || expectedDob || null,
      dob_match: dobMismatch ? false : true
    }

    const { error: updateError } = await admin
      .from('verifications')
      .update({
        status: finalStatus,
        review_reason: finalReason,
        provider_data: providerDataUpdate,
        updated_at: new Date().toISOString()
      })
      .eq('id', verification.id)

    if (updateError) {
      safeLogger.error('[Verification] Failed to update verification', updateError)
      
      await admin
        .from('verification_webhooks')
        .update({ processed: true, error: updateError.message })
        .eq('provider', provider)
        .eq('payload->>id', parsed.sessionId)
        .order('created_at', { ascending: false })
        .limit(1)

      return NextResponse.json(
        { error: 'Failed to update verification' },
        { status: 500 }
      )
    }

    // Mark webhook as processed
    await admin
      .from('verification_webhooks')
      .update({ processed: true })
      .eq('provider', provider)
      .eq('payload->>id', parsed.sessionId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (provider === 'persona') {
      if (dobMismatch) {
        await admin
          .from('profiles')
          .update({ verification_status: 'failed', updated_at: new Date().toISOString() })
          .eq('user_id', verification.user_id)
      } else if (finalStatus === 'approved') {
        await admin
          .from('profiles')
          .update({ verification_status: 'verified', updated_at: new Date().toISOString() })
          .eq('user_id', verification.user_id)
      }
    }

    safeLogger.info('[Verification] Webhook processed successfully', {
      userId: verification.user_id,
      sessionId: parsed.sessionId,
      status: finalStatus,
      dobMismatch,
      personaDob: normalizedPersonaDob,
      expectedDob: normalizedExpectedDob
    })

    // Clear verification cache to ensure fresh data on next check
    // This prevents stale cache from causing redirect loops after verification status changes
    clearVerificationCache(verification.user_id)

    return NextResponse.json({ ok: true })
  } catch (error) {
    safeLogger.error('[Verification] Webhook processing error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}








