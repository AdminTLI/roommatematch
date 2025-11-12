import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateReferralCode, validateReferralCode } from '@/lib/referrals/referrals'
import { safeLogger } from '@/lib/utils/logger'

/**
 * GET /api/referrals/code
 * Get user's referral code
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create referral code
    const referralCode = await getOrCreateReferralCode(user.id)

    if (!referralCode) {
      return NextResponse.json(
        { error: 'Failed to get referral code' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: referralCode
    })
  } catch (error) {
    safeLogger.error('Error fetching referral code', { error })
    return NextResponse.json(
      { error: 'Failed to fetch referral code', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/referrals/code/validate
 * Validate a referral code
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      )
    }

    // Validate referral code
    const validation = await validateReferralCode(code)

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid referral code' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        referralCode: validation.referralCode
      }
    })
  } catch (error) {
    safeLogger.error('Error validating referral code', { error })
    return NextResponse.json(
      { error: 'Failed to validate referral code', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

