'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

const glassCardClass =
  'w-full noise-overlay rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-2xl shadow-black/20'

export function ResetPasswordConfirmForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const router = useRouter()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Check if there's a code or token in the URL (from password reset email)
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const token = urlParams.get('token')
    const type = urlParams.get('type')
    
    const checkSession = async () => {
      // If there's a token parameter, we need to go through Supabase's verify endpoint first
      // This happens when Supabase redirects directly to our page
      if (token && !code) {
        console.log('[Reset Password] Found token in URL, need to verify through Supabase first...')
        // Redirect to Supabase's verify endpoint, which will then redirect back with a code
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const verifyUrl = `${supabaseUrl}/auth/v1/verify?token=${token}&type=${type || 'recovery'}&redirect_to=${encodeURIComponent(window.location.origin + window.location.pathname)}`
        console.log('[Reset Password] Redirecting to Supabase verify endpoint:', verifyUrl)
        window.location.href = verifyUrl
        return
      }
      
      // If there's a code parameter, exchange it for a session
      if (code) {
        console.log('[Reset Password] Found code in URL, exchanging for session...', { code: code.substring(0, 10) + '...', type })
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
          console.error('[Reset Password] Error exchanging code:', error)
          setError('Invalid or expired reset link. Please request a new password reset.')
          setTimeout(() => {
            router.push('/auth/reset-password')
          }, 3000)
          return
        }
        
        console.log('[Reset Password] Code exchanged successfully, session created')
        // Clear the code from URL
        window.history.replaceState({}, '', window.location.pathname)
      }
      
      // Check if user has a valid recovery session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        console.log('[Reset Password] Valid session found')
        setIsValidSession(true)
      } else {
        // If no code and no session, show error
        if (!code && !token) {
          console.log('[Reset Password] No code, token, or session found')
          setError('Invalid or expired reset link. Please request a new password reset.')
          setTimeout(() => {
            router.push('/auth/reset-password')
          }, 3000)
        }
      }
    }
    checkSession()
  }, [supabase, router])

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/\d/.test(pwd)) {
      return 'Password must contain at least one number'
    }
    return null
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate password strength
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setIsLoading(false)
      return
    }

    try {
      console.log('Attempting to update password...')
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      console.log('Password update response:', { updateError })

      if (updateError) {
        console.error('Password update error:', updateError)
        setError(updateError.message || 'Failed to update password. Please try again.')
      } else {
        console.log('Password updated successfully')
        setSuccess(true)
        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          router.push('/auth/sign-in')
        }, 3000)
      }
    } catch (err) {
      console.error('Unexpected error during password update:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidSession) {
    return (
      <div className={glassCardClass}>
        <div className="text-center px-4 sm:px-6 pt-6 sm:pt-6">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
            Invalid Reset Link
          </h2>
          <p className="mt-1 text-sm sm:text-base text-white/70">
            This password reset link is invalid or has expired.
          </p>
        </div>
        <div className="space-y-4 px-4 sm:px-6 pb-6 pt-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button asChild className="w-full min-h-[44px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-[1.01] transition-all">
            <a href="/auth/reset-password">Request New Reset Link</a>
          </Button>
          <p className="text-center text-xs sm:text-sm text-white/70">
            <Link href="/auth/sign-in" className="inline-flex items-center gap-1 text-white hover:underline">
              <ArrowLeft className="h-3 w-3" />
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className={glassCardClass}>
        <div className="text-center px-4 sm:px-6 pt-6 sm:pt-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/30">
            <CheckCircle className="h-6 w-6 text-emerald-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
            Password Updated
          </h2>
          <p className="mt-1 text-sm sm:text-base text-white/70">
            Your password has been successfully updated.
          </p>
        </div>
        <div className="space-y-4 px-4 sm:px-6 pb-6 pt-6">
          <p className="text-sm text-white/70 text-center">
            Redirecting you to sign in...
          </p>
          <Button asChild className="w-full min-h-[44px] rounded-2xl border border-white/30 bg-transparent text-white font-medium hover:bg-white/10 transition-all">
            <Link href="/auth/sign-in">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Sign in now
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={glassCardClass}>
      <div className="text-center px-4 sm:px-6 pt-6 sm:pt-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
          Set New Password
        </h2>
        <p className="mt-1 text-sm sm:text-base text-white/70">
          Enter your new password below
        </p>
      </div>
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-6 pt-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm sm:text-base text-white">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 min-h-[44px] bg-white/10 border-white/15 text-white placeholder:text-white/45 focus-visible:ring-white/30"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl p-2 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-white/60">
              Must be at least 8 characters with uppercase, lowercase, and a number
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm sm:text-base text-white">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10 min-h-[44px] bg-white/10 border-white/15 text-white placeholder:text-white/45 focus-visible:ring-white/30"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl p-2 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full min-h-[44px] text-base bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-[1.01] transition-all disabled:opacity-70 disabled:hover:scale-100"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </form>

        <p className="text-center text-xs sm:text-sm text-white/70">
          <Link href="/auth/sign-in" className="inline-flex items-center gap-1 text-white hover:underline">
            <ArrowLeft className="h-3 w-3" />
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}


