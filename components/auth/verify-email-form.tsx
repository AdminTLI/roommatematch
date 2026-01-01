'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { OTPInput } from './otp-input'
import { VerificationFeedback } from './verification-feedback'

export function VerifyEmailForm() {
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [resendSuccess, setResendSuccess] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get email from multiple sources in priority order:
  // 1. URL query parameter (?email=...)
  // 2. sessionStorage
  // 3. Authenticated Supabase user's email
  useEffect(() => {
    const resolveEmail = async () => {
      // Priority 1: Check URL query parameter
      const queryEmail = searchParams.get('email')
      if (queryEmail) {
        setEmail(queryEmail)
        // Also store in sessionStorage for consistency
        sessionStorage.setItem('verification-email', queryEmail)
        return
      }

      // Priority 2: Check sessionStorage
      const storedEmail = sessionStorage.getItem('verification-email')
      if (storedEmail) {
        setEmail(storedEmail)
        return
      }

      // Priority 3: Check authenticated Supabase user
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          setEmail(user.email)
          // Store in sessionStorage for consistency
          sessionStorage.setItem('verification-email', user.email)
          return
        }
      } catch (err) {
        // User not authenticated or error fetching user
        console.error('Error fetching user:', err)
      }

      // If no email found from any source, redirect to sign up
      router.push('/auth/sign-up')
    }

    resolveEmail()
  }, [router, searchParams, supabase])

  // Auto-resend when arriving with ?auto=1 and we have an email
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const shouldAuto = params.get('auto') === '1'
    
    if (shouldAuto && email) {
      console.log('[AutoResend] Auto-resending verification email to:', email)
      
      // Use API route for reliable OTP email delivery
      fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      .then(async (response) => {
        const result = await response.json()
        if (response.ok) {
          console.log('[AutoResend] Successfully sent verification email')
        } else {
          console.error('[AutoResend] Failed to send verification email:', result.error)
        }
      })
      .catch((err) => {
        console.error('[AutoResend] Failed to auto-resend:', err)
      })
    } else if (shouldAuto && !email) {
      console.warn('[AutoResend] Auto-resend requested but email not yet resolved')
    }
  }, [email, searchParams])

  const handleOTPComplete = async (otpCode: string) => {
    if (!email) {
      setError('Email not found. Please try signing up again.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Primary flow: resend({ type: 'signup' }) → verifyOtp with type 'signup'
      // This creates confirmation_token (not recovery_token)
      // Fallback: try 'email' type for any signInWithOtp flows (though we're not using those anymore)
      let verificationResult = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'signup' // Signup confirmation token (from resend() or signUp())
      })

      // If 'signup' type fails, try 'email' type as fallback
      if (verificationResult.error && !verificationResult.data?.user) {
        verificationResult = await supabase.auth.verifyOtp({
          email,
          token: otpCode,
          type: 'email' // Fallback for signInWithOtp flow (if any)
        })
      }

      const { data, error } = verificationResult

      if (error) {
        // Provide more user-friendly error messages
        if (error.message.includes('Invalid token') || error.message.includes('Token has expired')) {
          setError('Invalid or expired verification code. Please request a new code.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and enter the verification code.')
        } else if (error.message.includes('Too many requests')) {
          setError('Too many attempts. Please wait a few minutes before trying again.')
        } else {
          setError(error.message)
        }
      } else if (data.user) {
        setIsVerified(true)
        // Clear stored email
        sessionStorage.removeItem('verification-email')
        
        // Verify that email_confirmed_at is now set
        console.log('[VerifyEmail] After OTP verification:', {
          email_confirmed_at: data.user.email_confirmed_at,
          user_id: data.user.id
        })
        
        // Refresh the session to ensure email_confirmed_at is properly set
        await supabase.auth.refreshSession()
        
        // Get refreshed user to verify email_confirmed_at is set
        const { data: { user: refreshedUser } } = await supabase.auth.getUser()
        console.log('[VerifyEmail] After session refresh:', {
          email_confirmed_at: refreshedUser?.email_confirmed_at,
          user_id: refreshedUser?.id
        })
        
        // Verify email is actually confirmed before redirecting
        const emailConfirmed = Boolean(
          refreshedUser?.email_confirmed_at &&
          typeof refreshedUser.email_confirmed_at === 'string' &&
          refreshedUser.email_confirmed_at.length > 0 &&
          !isNaN(Date.parse(refreshedUser.email_confirmed_at))
        )
        
        if (!emailConfirmed) {
          setError('Email verification completed but confirmation status not updated. Please try logging in again.')
          setIsVerified(false)
          return
        }
        
        // Redirect to identity verification (Persona) after email verification
        // Use window.location for full page reload to ensure session is properly established
        setTimeout(() => {
          window.location.href = '/verify'
        }, 1500)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPInput = (otpCode: string) => {
    setOtp(otpCode)
    setError('') // Clear error when user starts typing
  }

  const handleResendOTP = async () => {
    if (!email) {
      setError('Email not found. Please try signing up again.')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Invalid email address. Please check your email and try again.')
      return
    }

    setIsResending(true)
    setError('')
    setResendSuccess(false)

    try {
      console.log('[ResendOTP] Attempting to resend verification code to:', email)
      
      // Use server-side API route which uses Admin API for more reliable email sending
      // This ensures we get OTP codes (not magic links) and works even if user isn't authenticated
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()
      console.log('[ResendOTP] API response:', result)

      if (!response.ok) {
        // API returned an error
        setError(result.error || 'Failed to resend verification code. Please try again.')
        return
      }

      // Success
      console.log('[ResendOTP] Successfully sent verification email via API')
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 5000)
    } catch (err) {
      console.error('[ResendOTP] Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const handleContinue = () => {
    router.push('/verify')
  }

  if (isVerified) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center px-4 sm:px-6 pt-6 sm:pt-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl sm:text-2xl text-green-800">Email Verified!</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Your account has been successfully verified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6 pb-6 sm:pb-6">
          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            Redirecting you to complete your profile setup...
          </p>
          <Button 
            onClick={handleContinue} 
            className="w-full min-h-[44px] text-base"
          >
            Continue to Identity Verification
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <VerificationFeedback />
      <Card className="w-full">
      <CardHeader className="text-center px-4 sm:px-6 pt-6 sm:pt-6">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-xl sm:text-2xl">Verify your email</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Enter the 6-digit code sent to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {resendSuccess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="space-y-1">
              <p className="font-medium">New verification code sent successfully!</p>
              <p className="text-xs text-muted-foreground">
                Please check your inbox and spam folder. If you don't receive the email within a few minutes, please try again or contact support.
              </p>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="space-y-4">
            <OTPInput
              onComplete={handleOTPComplete}
              onInput={handleOTPInput}
              disabled={isLoading}
              error={!!error}
            />
            
            <p className="text-sm text-muted-foreground text-center">
              Enter the 6-digit code from your email
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              onClick={handleResendOTP}
              className="w-full min-h-[44px] text-base"
              disabled={isResending || isLoading}
            >
              {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!isResending && <RefreshCw className="mr-2 h-4 w-4" />}
              Resend verification code
            </Button>

            <div className="text-center">
              <Link href="/auth/sign-in" className="text-xs sm:text-sm text-primary hover:underline py-2">
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  )
}