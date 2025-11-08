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

    // Demo bypass for demo credentials
    if (email === 'demo@account.com' && password === 'Testing123') {
      // Simulate successful login for demo
      setError('Demo login successful! Redirecting...')
      setTimeout(() => {
        setIsLoading(false)
        router.push('/matches')
      }, 1500)
      return
    }

    try {
      const { error: signInError, data } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        setError(signInError.message)
        setIsLoading(false)
        return
      }

      // Check email verification directly from auth response first (most reliable)
      // This avoids race conditions with session cookies not being set yet
      const emailVerified = Boolean(
        data.user?.email_confirmed_at &&
        typeof data.user.email_confirmed_at === 'string' &&
        data.user.email_confirmed_at.length > 0 &&
        !isNaN(Date.parse(data.user.email_confirmed_at))
      )

      if (!emailVerified) {
        // Email not verified - redirect to email verification
        sessionStorage.setItem('verification-email', email)
        router.push('/auth/verify-email')
        return
      }

      // Email is verified, check Persona verification status
      // Wait a bit for session to be established, then check via API
      try {
        // Small delay to ensure session cookie is set
        await new Promise(resolve => setTimeout(resolve, 200))
        
        const response = await fetch('/api/auth/verification-status')
        if (response.ok) {
          const verificationStatus = await response.json()
          
          // DOUBLE CHECK: Make sure email is still verified (defense in depth)
          if (verificationStatus.needsEmailVerification) {
            sessionStorage.setItem('verification-email', email)
            router.push('/auth/verify-email')
            return
          }
          
          if (verificationStatus.needsPersonaVerification) {
            router.push('/verify')
            return
          }
          
          // Both verifications complete, proceed to matches
          router.push('/matches')
        } else {
          // If API fails, don't assume - redirect to email verification to be safe
          // This ensures we never skip email verification
          console.warn('Verification status API failed, redirecting to email verification for safety')
          sessionStorage.setItem('verification-email', email)
          router.push('/auth/verify-email')
        }
      } catch (verificationError) {
        console.error('Failed to check verification status:', verificationError)
        // If API fails, don't assume - redirect to email verification to be safe
        // This ensures we never skip email verification
        sessionStorage.setItem('verification-email', email)
        router.push('/auth/verify-email')
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
