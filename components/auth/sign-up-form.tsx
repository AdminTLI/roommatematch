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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Loader2, Mail, Lock, User, Calendar } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { useApp } from '@/app/providers'
import { validateDateOfBirth, getAgeVerificationError } from '@/lib/auth/age-verification'

export function SignUpForm() {
  const { dictionary } = useApp()
  const t = dictionary.auth.signUp
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [confirmAge, setConfirmAge] = useState(false)
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [ageError, setAgeError] = useState('')
  const [showUnderageModal, setShowUnderageModal] = useState(false)
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
    if (!dateOfBirth) {
      setAgeError(t.errors.dobRequired ?? 'Date of birth is required')
      return false
    }

    const ageValidation = validateDateOfBirth(dateOfBirth)
    if (!ageValidation.valid) {
      setAgeError(ageValidation.error || getAgeVerificationError(ageValidation.age))
      if (ageValidation.reason === 'underage') {
        setShowUnderageModal(true)
      }
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
    if (!confirmAge) {
      setError(t.errors.ageConfirmationRequired ?? 'Please confirm you are at least 17 years old.')
      return false
    }
    if (!acceptTerms) {
      setError(t.errors.termsRequired || t.errors.termsConfirmationRequired || 'You must accept the terms and conditions.')
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
      console.log('[SignUp] Attempting to sign up user with email:', email)
      
      // Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dateOfBirth,
          },
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      })

      console.log('[SignUp] Signup response:', { 
        data: data ? { user: data.user ? { id: data.user.id, email: data.user.email } : null, session: !!data.session } : null,
        error 
      })

      if (error) {
        console.error('[SignUp] Signup error:', error)
        setError(error.message)
        setIsLoading(false)
        return
      }

      // Check if user was created
      if (!data.user) {
        console.error('[SignUp] No user returned from signup')
        setError('Failed to create account. Please try again.')
        setIsLoading(false)
        return
      }

      console.log('[SignUp] User created successfully:', {
        userId: data.user.id,
        email: data.user.email,
        emailConfirmed: data.user.email_confirmed_at
      })

      // Store email for OTP verification
      sessionStorage.setItem('verification-email', email)
      
      // signUp() should automatically send OTP with type 'signup' when enable_confirmations = true
      // However, Supabase signUp() may return success even if email sending fails
      // So we'll manually trigger email send via API route as a backup
      // This ensures the email is actually sent even if Supabase's automatic sending fails
      console.log('[SignUp] Manually triggering verification email send as backup')
      try {
        const resendResponse = await fetch('/api/auth/resend-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        })
        const resendResult = await resendResponse.json()
        if (resendResponse.ok) {
          console.log('[SignUp] Backup email send successful')
        } else {
          console.warn('[SignUp] Backup email send failed:', resendResult.error)
          // Don't block navigation - auto-resend on verify-email page will try again
        }
      } catch (resendErr) {
        console.error('[SignUp] Error sending backup email:', resendErr)
        // Don't block navigation - auto-resend on verify-email page will try again
      }
      
      // Navigate to verification page with auto-resend flag (as additional backup)
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}&auto=1`)
    } catch (err) {
      console.error('[SignUp] Unexpected error:', err)
      setError(t.unexpectedError || 'An unexpected error occurred. Please try again.')
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
        {ageError && !error && (
          <Alert variant="destructive">
            <AlertDescription>{ageError}</AlertDescription>
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
            <Label htmlFor="dob" className="text-sm sm:text-base">{t.dateOfBirth ?? 'Date of birth'}</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="dob"
                type="date"
                placeholder={t.dateOfBirthPlaceholder ?? 'YYYY-MM-DD'}
                value={dateOfBirth}
                onChange={(e) => {
                  setDateOfBirth(e.target.value)
                  setAgeError('')
                  setError('')
                  if (e.target.value) {
                    const validation = validateDateOfBirth(e.target.value)
                    if (!validation.valid) {
                      setAgeError(validation.error || getAgeVerificationError(validation.age))
                    }
                  }
                }}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 17)).toISOString().split('T')[0]}
                className="pl-10 min-h-[44px]"
                required
              />
            </div>
            {ageError && (
              <p className="text-xs text-red-600">{ageError}</p>
            )}
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

          <div className="space-y-3 rounded-lg border border-gray-100 p-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="age-confirm"
                checked={confirmAge}
                onCheckedChange={(checked) => {
                  setConfirmAge(!!checked)
                  setError('')
                }}
                className="mt-1"
              />
              <Label htmlFor="age-confirm" className="text-xs sm:text-sm leading-relaxed cursor-pointer">
                {t.ageConfirmation ?? 'I confirm that I am at least 17 years old.'}
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => {
                  setAcceptTerms(!!checked)
                  setError('')
                }}
                className="mt-1"
              />
              <Label htmlFor="terms" className="text-xs sm:text-sm leading-relaxed cursor-pointer">
                {t.termsConfirmation ?? t.agreeToTerms}{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  {t.termsOfService}
                </Link>{' '}
                {t.and}{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  {t.privacyPolicy}
                </Link>
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full min-h-[44px] text-base"
            disabled={isLoading || !!ageError}
          >
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

      <Dialog open={showUnderageModal} onOpenChange={(open) => {
        setShowUnderageModal(open)
        if (!open) {
          router.push('/')
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t?.modalTitle ?? 'Minimum age requirement'}</DialogTitle>
            <DialogDescription>
              {t?.dobUnderage ?? 'You must be at least 17 years old to create an account.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setShowUnderageModal(false)}>
              {t?.goHome ?? 'Go to homepage'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
