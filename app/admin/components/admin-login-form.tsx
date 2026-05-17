'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signOutOtherSessions } from '@/lib/auth/sign-out-other-sessions'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export function AdminLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const supabase = createClient()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please enter both email and password.')
      setIsLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid work email address.')
      setIsLoading(false)
      return
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      })

      if (signInError || !data.session) {
        setError(
          'We couldn’t sign you in with those details. Please check your email and password or use the recovery options below.'
        )
        setIsLoading(false)
        return
      }

      await signOutOtherSessions(supabase)

      router.push('/admin')
    } catch (err) {
      console.error('[AdminLogin] Unexpected error during sign-in:', err)
      setError('Something went wrong while signing you in. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="text-center px-4 sm:px-6 pt-6 sm:pt-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
          Admin sign in
        </h2>
        <p className="mt-1 text-sm sm:text-base text-slate-700">
          University housing teams and platform administrators
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-6 pt-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email" className="text-sm sm:text-base text-slate-800">
              Work email
            </Label>
            <div className="relative group">
              <Mail className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-slate-800 transition-colors" />
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@university.nl"
                className="pl-10 min-h-[44px] bg-white/60 border-white/70 text-slate-900 placeholder:text-slate-500 focus-visible:ring-slate-900/20"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-sm sm:text-base text-slate-800">
              Password
            </Label>
            <div className="relative group">
              <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-slate-800 transition-colors" />
              <Input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="pl-10 pr-10 min-h-[44px] bg-white/60 border-white/70 text-slate-900 placeholder:text-slate-500 focus-visible:ring-slate-900/20"
                autoComplete="current-password"
                required
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

          <div className="flex items-center justify-between flex-wrap gap-2">
            <Link
              href="/auth/reset-password"
              className="text-xs sm:text-sm text-slate-700 hover:text-slate-900 hover:underline py-2"
            >
              Forgot password?
            </Link>
            <a
              href="mailto:domumatch@gmail.com?subject=Admin%20portal:%20Forgot%20username"
              className="text-xs sm:text-sm text-slate-700 hover:text-slate-900 hover:underline py-2"
            >
              Forgot email?
            </a>
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

        <p className="text-center text-[11px] sm:text-xs leading-relaxed text-slate-600">
          Don’t share access to this portal. If you need a new admin or university account,
          contact your Domu Match representative.
        </p>
      </div>
    </div>
  )
}
