import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    // Resend verification email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email!
    })

    if (error) {
      console.error('Resend verification error:', error)
      return NextResponse.json({ 
        error: 'Failed to resend verification email' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Verification email sent successfully' 
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
