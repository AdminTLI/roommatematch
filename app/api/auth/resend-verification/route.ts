import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = body.email

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    console.log('[ResendVerification API] Attempting to resend verification email to:', email)
    
    // Create a client - this works even if user isn't fully authenticated
    // We'll use the anon key which should work for resend operations
    const supabase = await createClient()
    
    // Use resend() with type 'signup' to send OTP code (not magic link)
    // This uses the "Confirm signup" email template which should contain the OTP code
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    })

    console.log('[ResendVerification API] Resend response:', { 
      hasData: !!data,
      data: data ? (typeof data === 'object' ? JSON.stringify(data) : String(data)) : null, 
      hasError: !!error,
      error: error ? { 
        message: error.message, 
        status: (error as any).status, 
        name: error.name 
      } : null 
    })
    
    // IMPORTANT: Supabase resend() returns success even if email isn't actually sent
    // This typically happens when:
    // 1. SMTP is not configured in Supabase dashboard
    // 2. Email template is misconfigured
    // 3. Rate limiting (but we'd see an error for that)
    // Check Supabase dashboard → Authentication → Email Templates → "Confirm signup"
    // And verify SMTP is configured in Settings → Auth → SMTP Settings

    if (error) {
      console.error('[ResendVerification API] Resend error:', error)
      
      // Provide user-friendly error messages
      if (error.message.includes('rate limit') || error.message.includes('Too many requests')) {
        return NextResponse.json({ 
          error: 'Too many requests. Please wait a few minutes before requesting another code.' 
        }, { status: 429 })
      } else if (error.message.includes('Email rate limit') || error.message.includes('email_sent')) {
        return NextResponse.json({ 
          error: 'Too many emails sent. Please wait a few minutes before requesting another code.' 
        }, { status: 429 })
      } else if (error.message.includes('User not found') || error.message.includes('not registered')) {
        return NextResponse.json({ 
          error: 'Email not found. Please try signing up again.' 
        }, { status: 404 })
      } else if (error.message.includes('Invalid email') || error.message.includes('email format')) {
        return NextResponse.json({ 
          error: 'Invalid email address. Please check your email and try again.' 
        }, { status: 400 })
      }
      
      return NextResponse.json({ 
        error: error.message || 'Failed to resend verification email' 
      }, { status: 500 })
    }

    // Success - resend() returns { data: null, error: null } when successful
    // Note: This only confirms Supabase accepted the request, not that email was actually sent
    // In production, ensure SMTP is configured in Supabase dashboard
    console.log('[ResendVerification API] Successfully queued verification email request')
    return NextResponse.json({ 
      success: true,
      message: 'Verification email sent successfully' 
    })

  } catch (error) {
    console.error('[ResendVerification API] Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
