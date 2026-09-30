import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'
import { PersonaWebhookSchema, VeriffWebhookSchema, OnfidoWebhookSchema } from '@/lib/webhooks/schemas'
import { clearVerificationCache, markIdentityVerified } from '@/lib/auth/verification-check'
import { fetchPersonaInquiry } from '@/lib/verification/persona-client'
import {
  decidePersonaIdentity,
  extractPersonaDob,
  extractPersonaIssuingCountry,
  extractPersonaName,
} from '@/lib/verification/persona-decision'
import { normalizeDateInput } from '@/lib/auth/age-verification'
import crypto from 'crypto'

type KYCProvider = 'veriff' | 'persona' | 'onfido'

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
        const expectedSignature = crypto
          .createHmac('sha256', secret)
          .update(payload)
          .digest('hex')
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
      }

      case 'persona': {
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
        const expectedSignature = crypto
          .createHmac('sha1', secret)
          .update(payload)
          .digest('hex')
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
      }

      default:
        return false
    }
  } catch (error) {
    safeLogger.error('[Verification] Signature verification error', error)
    return false
  }
}

function parseWebhookPayload(
  provider: KYCProvider,
  body: any
): {
  sessionId: string
  status: 'approved' | 'rejected' | 'pending' | 'expired'
  reason?: string
} | null {
  try {
    switch (provider) {
      case 'veriff': {
        const { verification } = body
        if (!verification || !verification.id) return null

        const statusMap: Record<string, 'approved' | 'rejected' | 'pending' | 'expired'> = {
          success: 'approved',
          failed: 'rejected',
          abandoned: 'expired',
          declined: 'rejected',
        }

        return {
          sessionId: verification.id,
          status: statusMap[verification.status] || 'pending',
          reason: verification.reason || verification.code,
        }
      }

      case 'persona': {
        const { data } = body
        if (!data || !data.id) return null

        const statusMap: Record<string, 'approved' | 'rejected' | 'pending' | 'expired'> = {
          completed: 'approved',
          approved: 'approved',
          failed: 'rejected',
          declined: 'rejected',
          expired: 'expired',
          pending: 'pending',
        }

        return {
          sessionId: data.id,
          status: statusMap[data.attributes?.status] || 'pending',
          reason: data.attributes?.reason,
        }
      }

      case 'onfido': {
        const { payload } = body
        if (!payload || !payload.resource_id) return null

        const statusMap: Record<string, 'approved' | 'rejected' | 'pending' | 'expired'> = {
          clear: 'approved',
          consider: 'rejected',
          unidentified: 'rejected',
        }

        return {
          sessionId: payload.resource_id,
          status: statusMap[payload.action] || 'pending',
          reason: payload.reason,
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

async function getExpectedIdentity(
  admin: ReturnType<typeof createAdminClient>,
  userId: string
) {
  const { data: profile } = await admin
    .from('profiles')
    .select('first_name, last_name, date_of_birth')
    .eq('user_id', userId)
    .maybeSingle()

  let authMeta: Record<string, unknown> | undefined
  try {
    const { data: authUser } = await admin.auth.admin.getUserById(userId)
    authMeta = authUser?.user?.user_metadata as Record<string, unknown> | undefined
  } catch (error) {
    safeLogger.warn('[Verification] Unable to read auth metadata for identity', {
      userId,
      error,
    })
  }

  return {
    firstName:
      (profile?.first_name as string | null)?.trim() ||
      (typeof authMeta?.first_name === 'string' ? authMeta.first_name.trim() : '') ||
      '',
    lastName:
      (profile?.last_name as string | null)?.trim() ||
      (typeof authMeta?.last_name === 'string' ? authMeta.last_name.trim() : '') ||
      '',
    dateOfBirth:
      normalizeDateInput(profile?.date_of_birth as string | null) ||
      normalizeDateInput(
        typeof authMeta?.date_of_birth === 'string' ? authMeta.date_of_birth : null
      ),
  }
}

export async function POST(request: NextRequest) {
  try {
    const providerParam = request.nextUrl.searchParams.get('provider')
    const provider = (providerParam || process.env.KYC_PROVIDER || 'persona') as KYCProvider

    const secretKey = process.env[`${provider.toUpperCase()}_WEBHOOK_SECRET`] || ''
    if (!secretKey) {
      safeLogger.error('[Verification] CRITICAL: Webhook secret missing for provider', {
        provider,
      })
      return NextResponse.json(
        { error: 'Webhook verification service temporarily unavailable' },
        { status: 503 }
      )
    }

    const rawBody = await request.text()
    const signature =
      request.headers.get('x-signature') ||
      request.headers.get('x-veriff-signature') ||
      request.headers.get('x-persona-signature') ||
      request.headers.get('x-sdk-token')

    if (!verifyWebhookSignature(provider, rawBody, signature, secretKey)) {
      safeLogger.warn('[Verification] Invalid webhook signature', { provider })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    let body: any
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

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
          return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
      }
    } catch (validationError) {
      safeLogger.warn('[Verification] Webhook payload validation failed', {
        provider,
        error:
          validationError instanceof Error
            ? validationError.message
            : String(validationError),
      })
      return NextResponse.json({ error: 'Invalid webhook payload format' }, { status: 400 })
    }

    const parsed = parseWebhookPayload(provider, validatedBody)
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid payload structure' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error: webhookError } = await admin.from('verification_webhooks').insert({
      provider,
      event_type: validatedBody.type || validatedBody.event || 'unknown',
      payload: validatedBody,
      processed: false,
    })

    if (webhookError) {
      safeLogger.error('[Verification] Failed to log webhook', webhookError)
    }

    const { data: verification, error: fetchError } = await admin
      .from('verifications')
      .select('id, user_id, status, provider_data')
      .eq('provider_session_id', parsed.sessionId)
      .eq('provider', provider)
      .maybeSingle()

    if (fetchError || !verification) {
      safeLogger.warn('[Verification] Verification not found', {
        sessionId: parsed.sessionId,
        provider,
      })

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

    let finalStatus: 'approved' | 'rejected' | 'pending' | 'expired' = parsed.status
    let finalReason = parsed.reason
    let providerDataUpdate: Record<string, unknown> = {
      ...(verification.provider_data || {}),
    }

    if (provider === 'persona') {
      const expected = await getExpectedIdentity(admin, verification.user_id)
      let personaIdentity = {
        ...extractPersonaName(validatedBody),
        dateOfBirth: extractPersonaDob(validatedBody),
        issuingCountry: extractPersonaIssuingCountry(validatedBody),
      }

      // Enrich from API when webhook payload is thin
      if (!personaIdentity.dateOfBirth || !personaIdentity.firstName || !personaIdentity.lastName) {
        const inquiry = await fetchPersonaInquiry(parsed.sessionId)
        if (inquiry) {
          const name = extractPersonaName(inquiry)
          personaIdentity = {
            firstName: personaIdentity.firstName || name.firstName,
            lastName: personaIdentity.lastName || name.lastName,
            dateOfBirth: personaIdentity.dateOfBirth || extractPersonaDob(inquiry),
            issuingCountry:
              personaIdentity.issuingCountry || extractPersonaIssuingCountry(inquiry),
          }
        }
      }

      const decision = decidePersonaIdentity({
        personaApproved: parsed.status === 'approved',
        expected,
        persona: personaIdentity,
      })

      providerDataUpdate = {
        ...providerDataUpdate,
        ...decision.providerData,
      }

      if (!decision.approved) {
        finalStatus = 'rejected'
        finalReason = decision.reviewReason || finalReason
      }
    }

    if (verification.status === finalStatus) {
      await admin
        .from('verification_webhooks')
        .update({ processed: true })
        .eq('provider', provider)
        .eq('payload->>id', parsed.sessionId)
        .order('created_at', { ascending: false })
        .limit(1)

      return NextResponse.json({ ok: true, message: 'Already processed' })
    }

    const { error: updateError } = await admin
      .from('verifications')
      .update({
        status: finalStatus,
        review_reason: finalReason,
        provider_data: providerDataUpdate,
        updated_at: new Date().toISOString(),
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

      return NextResponse.json({ error: 'Failed to update verification' }, { status: 500 })
    }

    await admin
      .from('verification_webhooks')
      .update({ processed: true })
      .eq('provider', provider)
      .eq('payload->>id', parsed.sessionId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (finalStatus === 'rejected') {
      await admin
        .from('profiles')
        .update({ verification_status: 'failed', updated_at: new Date().toISOString() })
        .eq('user_id', verification.user_id)
    } else if (finalStatus === 'approved') {
      await markIdentityVerified(verification.user_id, provider)
    }

    clearVerificationCache(verification.user_id)

    safeLogger.info('[Verification] Webhook processed successfully', {
      userId: verification.user_id,
      sessionId: parsed.sessionId,
      status: finalStatus,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    safeLogger.error('[Verification] Webhook processing error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
