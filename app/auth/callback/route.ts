import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/matches'

  if (code) {
    const supabase = await createClient()
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/sign-in?error=auth_callback_error`)
      }
      
      // Check if user has completed onboarding
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, verification_status')
          .eq('user_id', user.id)
          .single()

        // Redirect based on user state
        if (!profile) {
          return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
        }

        if (profile.verification_status !== 'verified') {
          return NextResponse.redirect(`${requestUrl.origin}/verify`)
        }
      }
    } catch (error) {
      console.error('Unexpected auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/sign-in?error=unexpected_error`)
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}
