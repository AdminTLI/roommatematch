'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import { signOutOtherSessions } from '@/lib/auth/sign-out-other-sessions'
import {
  SESSION_TERMINATED_ERROR_PARAM,
  SESSION_TERMINATED_MESSAGE,
} from '@/lib/auth/session-terminated'

export function SignInForm({ initialErrorCode }: { initialErrorCode?: string | null }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (initialErrorCode !== SESSION_TERMINATED_ERROR_PARAM) return
    toast.error(SESSION_TERMINATED_MESSAGE)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/auth/sign-in')
    }
  }, [initialErrorCode])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Trim email and password to remove any accidental whitespace
      const trimmedEmail = email.trim()
      const trimmedPassword = password.trim()

      // Validate that we have non-empty values after trimming
      if (!trimmedEmail || !trimmedPassword) {
        setError('Please enter both email and password')
        setIsLoading(false)
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmedEmail)) {
        setError('Please enter a valid email address')
        setIsLoading(false)
        return
      }

      // Log the attempt (sanitized) for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('[SignIn] Attempting login with email:', trimmedEmail.substring(0, 3) + '***@' + trimmedEmail.split('@')[1])
        console.log('[SignIn] Email length:', trimmedEmail.length, 'Password length:', trimmedPassword.length)
      }

      let signInError, signInData
      try {
        const result = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        })
        signInError = result.error
        signInData = result.data
      } catch (authException) {
        console.error('[SignIn] Exception during signInWithPassword:', authException)
        setError('An error occurred during authentication. Please try again.')
        setIsLoading(false)
        return
      }

      if (signInError) {
        // Log the full error for debugging - including all properties
        console.error('[SignIn] Sign-in error (full object):', signInError)
        console.error('[SignIn] Sign-in error details:', {
          message: signInError.message,
          status: signInError.status,
          name: signInError.name,
          statusCode: (signInError as any).statusCode,
          // Check for Supabase-specific error properties
          error: (signInError as any).error,
          errorDescription: (signInError as any).error_description,
        })
        // Only log response data if it contains meaningful information
        if (signInData && Object.keys(signInData).length > 0) {
          console.error('[SignIn] Response data:', signInData)
        }

        // Check for specific error types
        const errorMsgLower = signInError.message.toLowerCase()
        const errorDescLower = ((signInError as any).error_description ?? '').toString().toLowerCase()
        
        // Email not confirmed
        const isEmailNotConfirmed = 
          errorMsgLower.includes('email not confirmed') ||
          errorMsgLower.includes('email_not_confirmed') ||
          errorMsgLower.includes('email confirmation') ||
          errorDescLower.includes('email not confirmed') ||
          errorDescLower.includes('email_not_confirmed') ||
          errorDescLower.includes('email confirmation') ||
          (errorDescLower.includes('not confirmed') && errorDescLower.includes('email'))

        if (isEmailNotConfirmed) {
          // Clear any existing session/cookies to prevent stale sessions
          await supabase.auth.signOut()
          
          // Store email for OTP screen
          sessionStorage.setItem('verification-email', trimmedEmail)
          
          // Auto-resend confirmation email (not signInWithOtp which triggers recovery)
          try {
            await supabase.auth.resend({
              type: 'signup',
              email: trimmedEmail
            })
          } catch (otpError) {
            // Log but don't block redirect - user can resend manually
            console.error('Error resending confirmation:', otpError)
          }
          
          // Redirect to verify-email page with email query param
          router.push(`/auth/verify-email?email=${encodeURIComponent(trimmedEmail)}&auto=1`)
          return
        }
        
        // Rate limiting / too many requests
        if (errorMsgLower.includes('too many') || 
            errorMsgLower.includes('rate limit') ||
            errorMsgLower.includes('429')) {
          setError('Too many login attempts. Please try again later.')
          setIsLoading(false)
          return
        }
        
        // Account disabled or locked
        if (errorMsgLower.includes('disabled') || 
            errorMsgLower.includes('locked') ||
            errorMsgLower.includes('suspended')) {
          setError('Your account has been disabled. Please contact support.')
          setIsLoading(false)
          return
        }
        
        // For authentication errors (wrong password/email), show user-friendly message with helpful suggestion
        if (errorMsgLower.includes('invalid') || 
            errorMsgLower.includes('credentials') ||
            errorMsgLower.includes('password')) {
          setError('Incorrect email or password. If you\'ve forgotten your password, you can reset it using the link below.')
        } else {
          // For other errors, show the error message
          setError(signInError.message || 'An error occurred during sign in. Please try again.')
        }
        setIsLoading(false)
        return
      }

      await signOutOtherSessions(supabase)

      // Sign-in successful - check verification status as backup
      const { data: { user } } = await supabase.auth.getUser()
      if (user && !user.email_confirmed_at) {
        // This shouldn't happen with enable_confirmations = true, but handle it anyway
        sessionStorage.setItem('verification-email', trimmedEmail)
        try {
          await supabase.auth.signInWithOtp({
            email: trimmedEmail,
            options: { shouldCreateUser: false }
          })
        } catch {}
        router.push(`/auth/verify-email?email=${encodeURIComponent(trimmedEmail)}&auto=1`)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('[SignIn] Unexpected error during sign-in:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="text-center px-4 sm:px-6 pt-6 sm:pt-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
          Welcome back
        </h2>
        <p className="mt-1 text-sm sm:text-base text-slate-700">
          Sign in to your Domu Match account
        </p>
      </div>
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-6 pt-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm sm:text-base text-slate-800">Email</Label>
            <div className="relative group">
              <Mail className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-slate-800 transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 min-h-[44px] bg-white/60 border-white/70 text-slate-900 placeholder:text-slate-500 focus-visible:ring-slate-900/20"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm sm:text-base text-slate-800">Password</Label>
            <div className="relative group">
              <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-slate-800 transition-colors" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 min-h-[44px] bg-white/60 border-white/70 text-slate-900 placeholder:text-slate-500 focus-visible:ring-slate-900/20"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/auth/reset-password"
              className="text-xs sm:text-sm text-slate-700 hover:text-slate-900 hover:underline py-2"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full min-h-[44px] text-base bg-slate-900 text-white border-0 shadow-[0_12px_30px_rgba(15,23,42,0.16)] hover:bg-slate-900/90 transition-colors disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>

        <p className="text-center text-xs sm:text-sm text-slate-700">
          Don't have an account?{' '}
          <Link href="/auth/sign-up" className="text-blue-700 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
