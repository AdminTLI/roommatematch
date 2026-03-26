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
import type { UserType } from '@/types/profile'

const glassCardClass =
  'w-full'
const inputClass =
  'pl-10 min-h-[44px] bg-white/60 border-white/70 text-slate-900 placeholder:text-slate-500 focus-visible:ring-slate-900/20'

export function SignUpForm({ userType }: { userType?: UserType | null }) {
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
        // AuthApiError "Error sending confirmation email" = Supabase SMTP not configured (Dashboard → Auth → SMTP)
        const isEmailSendError =
          error.message?.toLowerCase().includes('confirmation email') ||
          error.message?.toLowerCase().includes('sending email')
        setError(
          isEmailSendError
            ? 'We couldn\'t send the confirmation email. This is usually a server configuration issue - please try again later or contact support.'
            : error.message
        )
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

      if (userType === 'student' || userType === 'professional') {
        const { error: updateError } = await supabase
          .from('users')
          .update({ user_type: userType, updated_at: new Date().toISOString() })
          .eq('id', data.user.id)
        if (updateError) {
          console.error('[SignUp] Failed to save user_type:', updateError)
        } else {
          console.log('[SignUp] Saved user_type:', userType)
        }
      }

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
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            {t.title}
          </h2>
          <p className="mt-1 text-sm sm:text-base text-slate-700">
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
                <Label htmlFor="firstName" className="text-sm sm:text-base text-slate-800">{t.firstName}</Label>
                <div className="relative group">
                  <User className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-slate-800 transition-colors" />
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
                <Label htmlFor="lastName" className="text-sm sm:text-base text-slate-800">{t.lastName}</Label>
                <div className="relative group">
                  <User className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-slate-800 transition-colors" />
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
              <Label htmlFor="email" className="text-sm sm:text-base text-slate-800">{t.email}</Label>
              <div className="relative group">
                <Mail className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-slate-800 transition-colors" />
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
              <Label htmlFor="dob" className="text-sm sm:text-base text-slate-800">{t.dateOfBirth ?? 'Date of birth'}</Label>
              <div className="relative group">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-slate-800 transition-colors" />
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
                <p className="text-xs text-red-600">{ageError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm sm:text-base text-slate-800">{t.password}</Label>
              <div className="relative group">
                <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-slate-800 transition-colors" />
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
              <p className="text-xs text-slate-600">
                {t.passwordHint}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm sm:text-base text-slate-800">{t.confirmPassword}</Label>
              <div className="relative group">
                <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-slate-800 transition-colors" />
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

            <div className="rounded-2xl border border-white/70 bg-white/60 backdrop-blur-sm overflow-hidden">
              <p className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-600 border-b border-white/70">
                Agreements
              </p>
              <div className="divide-y divide-white/70">
                <label
                  htmlFor="age-confirm"
                  className="flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors hover:bg-white/70"
                >
                  <Checkbox
                    id="age-confirm"
                    checked={confirmAge}
                    onCheckedChange={(checked) => {
                      setConfirmAge(!!checked)
                      setError('')
                    }}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-900/30 bg-white/60 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 focus-visible:ring-slate-900/20"
                  />
                  <span className="text-sm leading-snug text-slate-800">
                    {t.ageConfirmation ?? 'I confirm that I am at least 17 years old.'}
                  </span>
                </label>
                <label
                  htmlFor="terms"
                  className="flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors hover:bg-white/70"
                >
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => {
                      setAcceptTerms(!!checked)
                      setError('')
                    }}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-900/30 bg-white/60 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 focus-visible:ring-slate-900/20"
                  />
                  <span className="text-sm leading-snug text-slate-800">
                    {t.termsConfirmation ?? t.agreeToTerms}{' '}
                    <Link href="/terms" className="font-semibold text-blue-700 underline decoration-blue-400/40 underline-offset-2 hover:text-blue-800">
                      {t.termsOfService}
                    </Link>
                    {' '}{t.and}{' '}
                    <Link href="/privacy" className="font-semibold text-blue-700 underline decoration-blue-400/40 underline-offset-2 hover:text-blue-800">
                      {t.privacyPolicy}
                    </Link>
                  </span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full min-h-[44px] text-base bg-slate-900 text-white border-0 shadow-[0_12px_30px_rgba(15,23,42,0.16)] hover:bg-slate-900/90 transition-colors disabled:opacity-70"
              disabled={isLoading || !!ageError}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.signUpButton}
            </Button>
          </form>

          <p className="text-center text-xs sm:text-sm text-slate-700">
            {t.haveAccount}{' '}
            <Link href="/auth/sign-in" className="text-blue-700 font-semibold hover:underline">
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
