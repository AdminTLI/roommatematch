'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { OTPInput } from './otp-input'

export function VerifyEmailForm() {
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [resendSuccess, setResendSuccess] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get email from sessionStorage on mount
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('verification-email')
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      // If no email in storage, redirect to sign up
      router.push('/auth/sign-up')
    }
  }, [router])

  const handleOTPComplete = async (otpCode: string) => {
    if (!email) {
      setError('Email not found. Please try signing up again.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'signup'
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        setIsVerified(true)
        // Clear stored email
        sessionStorage.removeItem('verification-email')
        
        // Redirect to onboarding after a short delay
        setTimeout(() => {
          router.push('/onboarding/intro')
        }, 2000)
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

    setIsResending(true)
    setError('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      })

      if (error) {
        setError(error.message)
      } else {
        setResendSuccess(true)
        setTimeout(() => setResendSuccess(false), 5000)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const handleContinue = () => {
    router.push('/onboarding/intro')
  }

  if (isVerified) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Email Verified!</CardTitle>
          <CardDescription>
            Your account has been successfully verified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Redirecting you to complete your profile setup...
          </p>
          <Button 
            onClick={handleContinue} 
            className="w-full"
          >
            Continue to Profile Setup
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Verify your email</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {resendSuccess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              New verification code sent successfully!
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
              className="w-full"
              disabled={isResending || isLoading}
            >
              {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!isResending && <RefreshCw className="mr-2 h-4 w-4" />}
              Resend verification code
            </Button>

            <div className="text-center">
              <Link href="/auth/sign-in" className="text-sm text-primary hover:underline">
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}