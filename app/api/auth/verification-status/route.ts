import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkUserVerificationStatus } from '@/lib/auth/verification-check'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
  Vary: 'Cookie',
} as const

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: NO_STORE_HEADERS }
      )
    }

    const verificationStatus = await checkUserVerificationStatus(user)

    return NextResponse.json(
      {
        ...verificationStatus,
        userId: user.id,
        email: user.email,
      },
      { headers: NO_STORE_HEADERS }
    )
  } catch (error) {
    console.error('[Verification Status API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: NO_STORE_HEADERS }
    )
  }
}
