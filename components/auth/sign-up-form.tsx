'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
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

const glassCardClass =
  'w-full noise-overlay rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-2xl shadow-black/20'
const inputClass =
  'pl-10 min-h-[44px] bg-white/10 border-white/15 text-white placeholder:text-white/45 focus-visible:ring-white/30'

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

      sessionStorage.setItem('verification-email', email)

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
        }
      } catch (resendErr) {
        console.error('[SignUp] Error sending backup email:', resendErr)
      }

      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}&auto=1`)
    } catch (err) {
      console.error('[SignUp] Unexpected error:', err)
      setError(t.unexpectedError || 'An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className={glassCardClass}>
        <div className="text-center px-4 sm:px-6 pt-6 sm:pt-6">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
            {t.title}
          </h2>
          <p className="mt-1 text-sm sm:text-base text-white/70">
            {t.subtitle}
          </p>
        </div>
        <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 pt-6">
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
                <Label htmlFor="firstName" className="text-sm sm:text-base text-white">{t.firstName}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder={t.firstNamePlaceholder}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm sm:text-base text-white">{t.lastName}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder={t.lastNamePlaceholder}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base text-white">{t.email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob" className="text-sm sm:text-base text-white">{t.dateOfBirth ?? 'Date of birth'}</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
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
                  className={inputClass}
                  required
                />
              </div>
              {ageError && (
                <p className="text-xs text-red-300">{ageError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm sm:text-base text-white">{t.password}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <p className="text-xs text-white/60">
                {t.passwordHint}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm sm:text-base text-white">{t.confirmPassword}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t.confirmPasswordPlaceholder}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
              <p className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-white/50 border-b border-white/10">
                Agreements
              </p>
              <div className="divide-y divide-white/10">
                <label
                  htmlFor="age-confirm"
                  className="flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors hover:bg-white/5"
                >
                  <Checkbox
                    id="age-confirm"
                    checked={confirmAge}
                    onCheckedChange={(checked) => {
                      setConfirmAge(!!checked)
                      setError('')
                    }}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/40 bg-white/5 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 focus-visible:ring-white/30"
                  />
                  <span className="text-sm leading-snug text-white/90">
                    {t.ageConfirmation ?? 'I confirm that I am at least 17 years old.'}
                  </span>
                </label>
                <label
                  htmlFor="terms"
                  className="flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors hover:bg-white/5"
                >
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => {
                      setAcceptTerms(!!checked)
                      setError('')
                    }}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/40 bg-white/5 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 focus-visible:ring-white/30"
                  />
                  <span className="text-sm leading-snug text-white/90">
                    {t.termsConfirmation ?? t.agreeToTerms}{' '}
                    <Link href="/terms" className="font-medium text-white underline decoration-white/40 underline-offset-2 hover:decoration-white">
                      {t.termsOfService}
                    </Link>
                    {' '}{t.and}{' '}
                    <Link href="/privacy" className="font-medium text-white underline decoration-white/40 underline-offset-2 hover:decoration-white">
                      {t.privacyPolicy}
                    </Link>
                  </span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full min-h-[44px] text-base bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-[1.01] transition-all disabled:opacity-70 disabled:hover:scale-100"
              disabled={isLoading || !!ageError}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.signUpButton}
            </Button>
          </form>

          <p className="text-center text-xs sm:text-sm text-white/70">
            {t.haveAccount}{' '}
            <Link href="/auth/sign-in" className="text-white hover:underline">
              {t.signInLink}
            </Link>
          </p>
        </div>
      </div>

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
    </>
  )
}
