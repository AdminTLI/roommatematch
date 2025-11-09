'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Check if error is due to unconfirmed email
        const isEmailNotConfirmed = 
          error.message.toLowerCase().includes('email not confirmed') ||
          error.message.toLowerCase().includes('email_not_confirmed') ||
          error.message.toLowerCase().includes('email confirmation')

        if (isEmailNotConfirmed) {
          // Clear any existing session/cookies to prevent stale sessions
          await supabase.auth.signOut()
          
          // Store email for OTP screen
          sessionStorage.setItem('verification-email', email)
          
          // Auto-resend confirmation email (not signInWithOtp which triggers recovery)
          try {
            await supabase.auth.resend({
              type: 'signup',
              email: email
            })
          } catch (otpError) {
            // Log but don't block redirect - user can resend manually
            console.error('Error resending confirmation:', otpError)
          }
          
          // Redirect to verify-email page with email query param
          router.push(`/auth/verify-email?email=${encodeURIComponent(email)}&auto=1`)
          return
        }
        
        // For other errors, show the error message
        setError(error.message)
      } else {
        // Sign-in successful - check verification status as backup
        const { data: { user } } = await supabase.auth.getUser()
        if (user && !user.email_confirmed_at) {
          // This shouldn't happen with enable_confirmations = true, but handle it anyway
          sessionStorage.setItem('verification-email', email)
          try {
            await supabase.auth.signInWithOtp({
              email,
              options: { shouldCreateUser: false }
            })
          } catch {}
          router.push(`/auth/verify-email?email=${encodeURIComponent(email)}&auto=1`)
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your Roommate Match account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/auth/reset-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/auth/sign-up" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
