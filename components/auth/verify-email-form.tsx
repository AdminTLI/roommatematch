'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, CheckCircle, ArrowRight } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function VerifyEmailForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleResendEmail = async () => {
    setIsResending(true)
    setError('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
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
    router.push('/dashboard')
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Verify your email</CardTitle>
        <CardDescription>
          We've sent a verification link to your email address
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
              Verification email sent successfully!
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Check your email inbox and click the verification link to activate your account. 
            The link will expire in 1 hour.
          </p>

          <div className="space-y-3">
            <Button 
              onClick={handleContinue} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue to dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button 
              variant="outline" 
              onClick={handleResendEmail}
              className="w-full"
              disabled={isResending}
            >
              {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resend verification email
            </Button>
          </div>

          <div className="text-center">
            <Link href="/auth/sign-in" className="text-sm text-primary hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
