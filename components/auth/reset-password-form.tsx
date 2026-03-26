'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

const glassCardClass =
  'w-full'

export function ResetPasswordForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // IMPORTANT: Use the server-side callback route so it can
      // exchange the code for a session (avoids PKCE verifier issues),
      // then redirect to the confirm page.
      const redirectTo = `${window.location.origin}/auth/callback?redirect=/auth/reset-password/confirm`

      console.log('Attempting to send password reset email:', {
        email,
        redirectTo,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      })

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      console.log('Password reset response:', { data, error })

      if (error) {
        console.error('Password reset error:', error)
        setError(error.message || 'Failed to send reset email. Please check your email address and try again.')
      } else {
        console.log('Password reset email sent successfully (no error returned)')
        setSuccess(true)
      }
    } catch (err) {
      console.error('Unexpected error during password reset:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className={glassCardClass}>
        <div className="text-center px-4 sm:px-6 pt-6 sm:pt-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="h-6 w-6 text-emerald-700" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            Check your email
          </h2>
          <p className="mt-1 text-sm sm:text-base text-slate-700">
            We&apos;ve sent password reset instructions to <strong className="text-slate-900">{email}</strong>
          </p>
        </div>
        <div className="space-y-4 px-4 sm:px-6 pb-6 pt-6">
          <p className="text-sm text-slate-700 text-center">
            Click the link in the email to reset your password. The link will expire in 1 hour.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full min-h-[44px] bg-slate-900 text-white border-0 shadow-[0_12px_30px_rgba(15,23,42,0.16)] hover:bg-slate-900/90 transition-colors">
              <Link href="/auth/sign-in">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Link>
            </Button>
            <button
              type="button"
              className="w-full min-h-[44px] rounded-2xl border border-white/70 bg-white/60 text-slate-800 font-semibold hover:bg-white/75 transition-colors"
              onClick={() => {
                setSuccess(false)
                setEmail('')
              }}
            >
              Try different email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={glassCardClass}>
      <div className="text-center px-4 sm:px-6 pt-6 sm:pt-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
          Reset your password
        </h2>
        <p className="mt-1 text-sm sm:text-base text-slate-700">
          Enter your email and we&apos;ll send you a secure link to create a new password.
        </p>
      </div>
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 pt-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm sm:text-base text-slate-800">
              Email
            </Label>
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

          <Button
            type="submit"
            className="w-full min-h-[44px] text-base bg-slate-900 text-white border-0 shadow-[0_12px_30px_rgba(15,23,42,0.16)] hover:bg-slate-900/90 transition-colors disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send reset link
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
