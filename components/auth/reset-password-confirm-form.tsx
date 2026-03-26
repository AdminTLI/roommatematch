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
  'w-full'

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
    const checkSession = async () => {
      // At this point the /auth/callback route should already have
      // exchanged the code for a session and set cookies.
      // We just need to confirm a session exists.
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        console.log('[Reset Password] Valid session found')
        setIsValidSession(true)
      } else {
        console.log('[Reset Password] No valid session found on confirm page')
        setError('Invalid or expired reset link. Please request a new password reset.')
        setTimeout(() => {
          router.push('/auth/reset-password')
        }, 3000)
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
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            Invalid Reset Link
          </h2>
          <p className="mt-1 text-sm sm:text-base text-slate-700">
            This password reset link is invalid or has expired.
          </p>
        </div>
        <div className="space-y-4 px-4 sm:px-6 pb-6 pt-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button asChild className="w-full min-h-[44px] bg-slate-900 text-white border-0 shadow-[0_12px_30px_rgba(15,23,42,0.16)] hover:bg-slate-900/90 transition-colors">
            <a href="/auth/reset-password">Request New Reset Link</a>
          </Button>
          <p className="text-center text-xs sm:text-sm text-slate-700">
            <Link href="/auth/sign-in" className="inline-flex items-center gap-1 text-blue-700 font-semibold hover:underline">
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
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
            <CheckCircle className="h-6 w-6 text-emerald-700" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            Password Updated
          </h2>
          <p className="mt-1 text-sm sm:text-base text-slate-700">
            Your password has been successfully updated.
          </p>
        </div>
        <div className="space-y-4 px-4 sm:px-6 pb-6 pt-6">
          <p className="text-sm text-slate-700 text-center">
            Redirecting you to sign in...
          </p>
          <Button asChild className="w-full min-h-[44px] rounded-2xl border border-white/70 bg-white/60 text-slate-800 font-semibold hover:bg-white/75 transition-colors">
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
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
          Set New Password
        </h2>
        <p className="mt-1 text-sm sm:text-base text-slate-700">
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
            <Label htmlFor="password" className="text-sm sm:text-base text-slate-800">New Password</Label>
            <div className="relative group">
              <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-slate-800 transition-colors" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 min-h-[44px] bg-white/60 border-white/70 text-slate-900 placeholder:text-slate-500 focus-visible:ring-slate-900/20"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Must be at least 8 characters with uppercase, lowercase, and a number
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm sm:text-base text-slate-800">Confirm Password</Label>
            <div className="relative group">
              <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-slate-800 transition-colors" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10 min-h-[44px] bg-white/60 border-white/70 text-slate-900 placeholder:text-slate-500 focus-visible:ring-slate-900/20"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full min-h-[44px] text-base bg-slate-900 text-white border-0 shadow-[0_12px_30px_rgba(15,23,42,0.16)] hover:bg-slate-900/90 transition-colors disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </form>

        <p className="text-center text-xs sm:text-sm text-slate-700">
          <Link href="/auth/sign-in" className="inline-flex items-center gap-1 text-blue-700 font-semibold hover:underline">
            <ArrowLeft className="h-3 w-3" />
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}


