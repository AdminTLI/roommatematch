'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { error: signInError, data } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        // For authentication errors (wrong password/email), show user-friendly message
        if (signInError.message.toLowerCase().includes('invalid') || 
            signInError.message.toLowerCase().includes('credentials') ||
            signInError.message.toLowerCase().includes('password')) {
          setError('Incorrect email or password')
        } else {
          // For other errors, show the error message
          setError(signInError.message)
        }
        setIsLoading(false)
        return
      }

      // CRITICAL: Check email verification directly from auth response first
      // Since Supabase has enable_confirmations = false, users can log in without email verification
      // We MUST enforce email verification at application level
      // Note: Email is sanitized in logs for security
      if (process.env.NODE_ENV === 'development') {
        console.log('[SignIn] User object after login:', {
          id: data.user?.id?.substring(0, 8) + '...',
          email: data.user?.email ? `${data.user.email[0]}***@${data.user.email.split('@')[1]}` : '[no email]',
          email_confirmed_at: data.user?.email_confirmed_at ? '[present]' : '[missing]',
          email_confirmed_at_type: typeof data.user?.email_confirmed_at
        })
      }

      // STRICT check: email_confirmed_at must be a valid date string
      const emailVerified = Boolean(
        data.user?.email_confirmed_at &&
        typeof data.user.email_confirmed_at === 'string' &&
        data.user.email_confirmed_at.length > 0 &&
        !isNaN(Date.parse(data.user.email_confirmed_at)) &&
        new Date(data.user.email_confirmed_at).getTime() > 0
      )

      console.log('[SignIn] Email verified check result:', emailVerified)

      if (!emailVerified) {
        // Email not verified - CRITICAL: redirect to email verification IMMEDIATELY
        console.log('[SignIn] Email not verified, redirecting to email verification')
        sessionStorage.setItem('verification-email', email)
        // Use window.location.href for immediate redirect (no client-side navigation delay)
        window.location.href = `/auth/verify-email?email=${encodeURIComponent(email)}&auto=1`
        return
      }

      // Email is verified, now check Persona verification status
      // Refresh user session to get latest data before checking
      try {
        // Refresh the session to ensure we have latest user data
        const { data: { user: refreshedUser } } = await supabase.auth.getUser()
        
        console.log('[SignIn] Refreshed user after login:', {
          id: refreshedUser?.id,
          email: refreshedUser?.email,
          email_confirmed_at: refreshedUser?.email_confirmed_at,
          email_confirmed_at_type: typeof refreshedUser?.email_confirmed_at
        })

        // TRIPLE CHECK: Verify email_confirmed_at again after refresh
        const emailStillVerified = Boolean(
          refreshedUser?.email_confirmed_at &&
          typeof refreshedUser.email_confirmed_at === 'string' &&
          refreshedUser.email_confirmed_at.length > 0 &&
          !isNaN(Date.parse(refreshedUser.email_confirmed_at)) &&
          new Date(refreshedUser.email_confirmed_at).getTime() > 0
        )

        if (!emailStillVerified) {
          console.log('[SignIn] Email verification lost after refresh, redirecting to email verification')
          sessionStorage.setItem('verification-email', email)
          window.location.href = `/auth/verify-email?email=${encodeURIComponent(email)}&auto=1`
          return
        }

        // Small delay to ensure session cookie is set for API calls
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const response = await fetch('/api/auth/verification-status', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        if (response.ok) {
          const verificationStatus = await response.json()
          console.log('[SignIn] Verification status from API:', verificationStatus)
          
          // QUADRUPLE CHECK: Make sure email is still verified (defense in depth)
          if (verificationStatus.needsEmailVerification || !verificationStatus.emailVerified) {
            console.log('[SignIn] API reports email not verified, redirecting to email verification')
            sessionStorage.setItem('verification-email', email)
            window.location.href = `/auth/verify-email?email=${encodeURIComponent(email)}&auto=1`
            return
          }
          
          if (verificationStatus.needsPersonaVerification) {
            console.log('[SignIn] Email verified, redirecting to Persona verification')
            router.push('/verify')
            return
          }
          
          // Both verifications complete, proceed to matches
          console.log('[SignIn] Both verifications complete, redirecting to matches')
          router.push('/matches')
        } else {
          // If API fails, don't assume - redirect to email verification to be safe
          console.warn('[SignIn] Verification status API failed, redirecting to email verification for safety')
          sessionStorage.setItem('verification-email', email)
          window.location.href = `/auth/verify-email?email=${encodeURIComponent(email)}&auto=1`
        }
      } catch (verificationError) {
        console.error('[SignIn] Failed to check verification status:', verificationError)
        // If API fails, don't assume - redirect to email verification to be safe
        sessionStorage.setItem('verification-email', email)
        window.location.href = `/auth/verify-email?email=${encodeURIComponent(email)}&auto=1`
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border border-line shadow-elev-1">
      <CardHeader>
        <CardTitle className="text-h2 text-center text-ink-900">Sign In</CardTitle>
        <CardDescription className="text-center text-ink-700">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-6" variant={error.includes('Check your email') ? 'default' : 'destructive'}>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleEmailSignIn} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-line focus:border-brand-600 focus:ring-brand-600"
                  required
                  autoComplete="email"
                  aria-describedby={error ? 'error-message' : undefined}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  inputMode="text"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 border-line focus:border-brand-600 focus:ring-brand-600"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-brand-600 hover:bg-brand-700" 
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <a 
            href="/auth/forgot-password" 
            className="text-body-sm text-brand-600 hover:text-brand-700 transition-colors"
          >
            Forgot your password?
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
