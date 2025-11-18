import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkUserVerificationStatus } from '@/lib/auth/verification-check'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const verificationStatus = await checkUserVerificationStatus(user)

    return NextResponse.json({
      ...verificationStatus,
      userId: user.id,
      email: user.email,
    })
  } catch (error) {
    console.error('[Verification Status API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}







