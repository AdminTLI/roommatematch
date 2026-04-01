'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, User, Lock, ArrowRight } from 'lucide-react'

export function AdminLoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const trimmedUsername = username.trim()
    const trimmedPassword = password.trim()

    if (!trimmedUsername || !trimmedPassword) {
      setError('Please enter both username and password.')
      setIsLoading(false)
      return
    }

    try {
      // For now, admins sign in with the same email/password credentials.
      // The username field should contain the work email used for their admin account.
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedUsername,
        password: trimmedPassword,
      })

      if (signInError || !data.session) {
        setError(
          'We couldn’t sign you in with those details. Please check your username and password or use the recovery options below.'
        )
        setIsLoading(false)
        return
      }

      // Successful sign-in – send admins to the admin home.
      router.push('/admin')
    } catch (err) {
      console.error('[AdminLogin] Unexpected error during sign-in:', err)
      setError('Something went wrong while signing you in. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full noise-overlay rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-black/30">
      <div className="px-6 pt-6 pb-4 text-left">
        <p className="text-xs font-semibold tracking-wide text-indigo-200/80 uppercase">
          Domu Match
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Admin & University portal
        </h1>
        <p className="mt-2 text-sm text-slate-300/90">
          Secure access for university housing teams and platform administrators.
        </p>
      </div>

      <div className="px-6 pb-6 space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm text-slate-100">
              Username
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300/70" />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="you@university.nl"
                className="pl-10 min-h-[44px] bg-slate-900/60 border-white/15 text-white placeholder:text-slate-400 focus-visible:ring-white/40"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-slate-100">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300/70" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="pl-10 min-h-[44px] bg-slate-900/60 border-white/15 text-white placeholder:text-slate-400 focus-visible:ring-white/40"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full min-h-[44px] text-base bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-lg shadow-indigo-500/40 hover:shadow-indigo-500/50 hover:scale-[1.01] transition-transform disabled:opacity-70 disabled:hover:scale-100"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>

        <div className="mt-3 flex flex-col gap-1.5 text-xs text-slate-300/90">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Link
              href="/auth/reset-password"
              className="text-xs text-indigo-200 hover:text-white hover:underline"
            >
              Forgot password?
            </Link>
            <a
              href="mailto:domumatch@gmail.com?subject=Admin%20portal:%20Forgot%20username"
              className="text-xs text-indigo-200 hover:text-white hover:underline"
            >
              Forgot username?
            </a>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
            Don’t share access to this portal. If you need a new admin or university account,
            contact your Domu Match representative.
          </p>
        </div>
      </div>
    </div>
  )
}

