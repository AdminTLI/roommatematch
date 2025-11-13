import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeLogger } from '@/lib/utils/logger'

// KYC Provider types
type KYCProvider = 'veriff' | 'persona' | 'onfido'

interface ProviderConfig {
  apiKey: string
  apiUrl: string
  createSessionEndpoint: string
}

/**
 * Get provider configuration from environment
 */
function getProviderConfig(provider: KYCProvider): ProviderConfig | null {
  const providerUpper = provider.toUpperCase()
  
  switch (provider) {
    case 'veriff':
      return {
        apiKey: process.env.VERIFF_API_KEY || '',
        apiUrl: process.env.VERIFF_API_URL || 'https://station.veriff.com',
        createSessionEndpoint: '/v1/sessions'
      }
    case 'persona':
      return {
        apiKey: process.env.PERSONA_API_KEY || '',
        apiUrl: process.env.PERSONA_API_URL || 'https://withpersona.com/api/v1',
        createSessionEndpoint: '/inquiries'
      }
    case 'onfido':
      return {
        apiKey: process.env.ONFIDO_API_KEY || '',
        apiUrl: process.env.ONFIDO_API_URL || 'https://api.onfido.com/v3',
        createSessionEndpoint: '/sdk_token'
      }
    default:
      return null
  }
}

/**
 * Create verification session with provider
 */
async function createProviderSession(
  provider: KYCProvider,
  userId: string,
  userEmail: string
): Promise<{ sessionId: string; clientToken?: string; redirectUrl?: string } | null> {
  const config = getProviderConfig(provider)
  if (!config || !config.apiKey) {
    safeLogger.error('[Verification] Provider config missing', { provider })
    return null
  }

  try {
    switch (provider) {
      case 'veriff': {
        // Veriff session creation
        const response = await fetch(`${config.apiUrl}${config.createSessionEndpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-AUTH-CLIENT': config.apiKey
          },
          body: JSON.stringify({
            verification: {
              callback: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/verification/provider-webhook`,
              person: {
                firstName: '', // Will be filled from profile
                lastName: ''
              }
            }
          })
        })

        if (!response.ok) {
          const error = await response.text()
          safeLogger.error('[Verification] Veriff session creation failed', { error })
          return null
        }

        const data = await response.json()
        return {
          sessionId: data.verification.id,
          clientToken: data.verification.url // Veriff returns URL directly
        }
      }

      case 'persona': {
        // Persona inquiry creation
        const response = await fetch(`${config.apiUrl}${config.createSessionEndpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          },
          body: JSON.stringify({
            data: {
              type: 'inquiry',
              attributes: {
                reference_id: userId,
                callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/verification/provider-webhook`
              }
            }
          })
        })

        if (!response.ok) {
          const error = await response.text()
          safeLogger.error('[Verification] Persona session creation failed', { error })
          return null
        }

        const data = await response.json()
        return {
          sessionId: data.data.id,
          clientToken: data.data.attributes.session_token
        }
      }

      case 'onfido': {
        // Onfido SDK token creation
        const response = await fetch(`${config.apiUrl}${config.createSessionEndpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token token=${config.apiKey}`
          },
          body: JSON.stringify({
            applicant_id: userId, // You'd need to create applicant first
            referrer: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify`
          })
        })

        if (!response.ok) {
          const error = await response.text()
          safeLogger.error('[Verification] Onfido session creation failed', { error })
          return null
        }

        const data = await response.json()
        return {
          sessionId: data.token,
          clientToken: data.token
        }
      }

      default:
        return null
    }
  } catch (error) {
    safeLogger.error('[Verification] Provider session creation error', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check existing verification
    const { data: profile } = await supabase
      .from('profiles')
      .select('verification_status')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if already verified
    if (profile.verification_status === 'verified') {
      return NextResponse.json({
        status: 'verified',
        message: 'Already verified'
      })
    }

    // Get provider from env (default to veriff)
    const provider = (process.env.KYC_PROVIDER || 'veriff') as KYCProvider

    // Check for existing pending verification
    const admin = await createAdminClient()
    const { data: existingVerification } = await admin
      .from('verifications')
      .select('id, provider_session_id, status')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingVerification) {
      // Return existing session
      return NextResponse.json({
        sessionId: existingVerification.provider_session_id,
        status: 'pending',
        provider
      })
    }

    // Create new verification session with provider
    const sessionResult = await createProviderSession(provider, user.id, user.email || '')

    if (!sessionResult) {
      return NextResponse.json(
        { error: 'Failed to create verification session' },
        { status: 500 }
      )
    }

    // Store verification record
    const { error: insertError } = await admin
      .from('verifications')
      .insert({
        user_id: user.id,
        provider,
        provider_session_id: sessionResult.sessionId,
        status: 'pending',
        provider_data: {
          client_token: sessionResult.clientToken,
          redirect_url: sessionResult.redirectUrl
        }
      })

    if (insertError) {
      safeLogger.error('[Verification] Failed to store verification record', insertError)
      return NextResponse.json(
        { error: 'Failed to store verification record' },
        { status: 500 }
      )
    }

    // Update profile status to pending
    await admin
      .from('profiles')
      .update({ verification_status: 'pending' })
      .eq('user_id', user.id)

    return NextResponse.json({
      sessionId: sessionResult.sessionId,
      clientToken: sessionResult.clientToken,
      redirectUrl: sessionResult.redirectUrl,
      provider,
      status: 'pending'
    })
  } catch (error) {
    safeLogger.error('[Verification] Start verification error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



