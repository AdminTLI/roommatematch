'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Loader2, Mail, Lock, User } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { useApp } from '@/app/providers'

export function SignUpForm() {
  const { dictionary } = useApp()
  const t = dictionary.auth.signUp
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  // Magic-link flow removed: OTP-only signup verification
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const validateForm = () => {
    if (!firstName.trim()) {
      setError(t.errors.firstNameRequired)
      return false
    }
    if (!lastName.trim()) {
      setError(t.errors.lastNameRequired)
      return false
    }
    if (!email.trim()) {
      setError(t.errors.emailRequired)
      return false
    }
    if (password.length < 8) {
      setError(t.errors.passwordTooShort)
      return false
    }
    if (password !== confirmPassword) {
      setError(t.errors.passwordsDoNotMatch)
      return false
    }
    if (!acceptTerms) {
      setError(t.errors.termsRequired)
      return false
    }
    return true
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      })

      if (error) {
        setError(error.message)
        setIsLoading(false)
        return
      }

      // Store email for OTP verification
      sessionStorage.setItem('verification-email', email)
      
      // signUp() automatically sends OTP with type 'signup' when enable_confirmations = true
      // No need to call signInWithOtp here - it would send a different OTP type
      
      // Navigate to verification page
      router.push('/auth/verify-email')
    } catch (err) {
      setError(t.unexpectedError)
    } finally {
      setIsLoading(false)
    }
  }

  // Magic-link flow UI removed

  return (
    <Card className="w-full">
      <CardHeader className="text-center px-4 sm:px-6 pt-6 sm:pt-6">
        <CardTitle className="text-xl sm:text-2xl">{t.title}</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          {t.subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm sm:text-base">{t.firstName}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder={t.firstNamePlaceholder}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-10 min-h-[44px]"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm sm:text-base">{t.lastName}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lastName"
                  type="text"
                  placeholder={t.lastNamePlaceholder}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="pl-10 min-h-[44px]"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm sm:text-base">{t.email}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 min-h-[44px]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm sm:text-base">{t.password}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 min-h-[44px]"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t.passwordHint}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm sm:text-base">{t.confirmPassword}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t.confirmPasswordPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 min-h-[44px]"
                required
              />
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={setAcceptTerms}
              className="mt-1"
            />
            <Label htmlFor="terms" className="text-xs sm:text-sm leading-relaxed cursor-pointer">
              {t.agreeToTerms}{' '}
              <Link href="/terms" className="text-primary hover:underline">
                {t.termsOfService}
              </Link>{' '}
              {t.and}{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                {t.privacyPolicy}
              </Link>
            </Label>
          </div>

          <Button type="submit" className="w-full min-h-[44px] text-base" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t.signUpButton}
          </Button>
        </form>

        {/* Removed alternative magic-link option for OTP-only flow */}

        <p className="text-center text-xs sm:text-sm text-muted-foreground">
          {t.haveAccount}{' '}
          <Link href="/auth/sign-in" className="text-primary hover:underline">
            {t.signInLink}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
