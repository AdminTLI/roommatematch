'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { showSuccessToast, showErrorToast } from '@/lib/toast'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { createClient } from '@/lib/supabase/client'
import { markIntentionalSignOut } from '@/lib/auth/intentional-sign-out'
import { UNIVERSITY_EMAIL_RECOVERY_TAG } from '@/lib/university-email/constants'

const OTP_LENGTH = 6
const RESEND_COOLDOWN_SEC = 60

type Step = 'email' | 'otp' | 'in-use' | 'lost-access'

export interface AcademicVerificationGateProps {
  onVerified?: () => void
  onBack?: () => void
  className?: string
  /** Skip real email/OTP APIs so the UI can be reviewed without auth. */
  preview?: boolean
}

const fieldClass =
  'h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-[#0F172A] shadow-none placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus-visible:ring-indigo-400/30'

const primaryButtonClass =
  'inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all bg-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:bg-indigo-600 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] disabled:cursor-not-allowed disabled:bg-indigo-500/40 disabled:shadow-none dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:disabled:bg-indigo-500/40'

const linkClass =
  'font-semibold text-[#6366F1] underline underline-offset-2 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300'

function isPreviewTakenEmail(email: string) {
  const value = email.toLowerCase()
  return value.includes('taken') || value.includes('already-used')
}

export function AcademicVerificationGate({
  onVerified,
  onBack,
  className,
  preview = false,
}: AcademicVerificationGateProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [sendLoading, setSendLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [supportName, setSupportName] = useState('')
  const [supportReplyEmail, setSupportReplyEmail] = useState('')
  const [supportDetails, setSupportDetails] = useState('')
  const [supportSubmitting, setSupportSubmitting] = useState(false)
  const [supportSent, setSupportSent] = useState(false)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (step !== 'lost-access' || supportReplyEmail) return
    try {
      const supabase = createClient()
      void supabase.auth.getUser().then(({ data }) => {
        if (data.user?.email) setSupportReplyEmail(data.user.email)
      })
    } catch {
      // Preview or missing client config – leave the field blank.
    }
  }, [step, supportReplyEmail])

  const showEmailInUse = useCallback((universityEmail: string) => {
    setEmail(universityEmail)
    setStep('in-use')
    setSupportSent(false)
    setSupportDetails('')
  }, [])

  const sendCode = useCallback(async () => {
    const trimmed = email.trim()
    if (!trimmed) {
      showErrorToast('Email required', 'Please enter your university email address.')
      return
    }
    if (preview) {
      if (isPreviewTakenEmail(trimmed)) {
        showEmailInUse(trimmed)
        return
      }
      setEmail(trimmed)
      setStep('otp')
      setOtp(Array(OTP_LENGTH).fill(''))
      showSuccessToast('Preview', 'No email is sent in preview. Enter any 6 digits to see the next step.')
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100)
      return
    }
    setSendLoading(true)
    try {
      const res = await fetchWithCSRF('/api/auth/verify-academic-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 409) {
          showEmailInUse(trimmed)
          return
        }
        showErrorToast(
          'Could not send code',
          (data?.error as string) || 'Please use a valid university email (e.g. ending in .nl or .edu).'
        )
        return
      }
      setEmail(trimmed)
      setStep('otp')
      setOtp(Array(OTP_LENGTH).fill(''))
      setResendCooldown(RESEND_COOLDOWN_SEC)
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      showSuccessToast('Code sent', 'Check your university inbox for the 6-digit code.')
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100)
    } finally {
      setSendLoading(false)
    }
  }, [email, preview, showEmailInUse])

  const verifyCode = useCallback(async () => {
    const token = otp.join('').trim()
    if (token.length !== OTP_LENGTH) {
      showErrorToast('Invalid code', 'Please enter all 6 digits.')
      return
    }
    if (preview) {
      showSuccessToast('Preview', 'Student verification would continue to the welcome page.')
      onVerified?.()
      return
    }
    setVerifyLoading(true)
    try {
      const res = await fetchWithCSRF('/api/auth/confirm-academic-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), token }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 409) {
          showEmailInUse(email.trim())
          return
        }
        showErrorToast(
          'Verification failed',
          (data?.error as string) || 'Invalid or expired code. Please try again.'
        )
        return
      }
      showSuccessToast('Student status verified! 🎉', 'You can continue to the next step.')
      onVerified?.()
    } finally {
      setVerifyLoading(false)
    }
  }, [email, otp, onVerified, preview, showEmailInUse])

  const resendCode = useCallback(async () => {
    if (resendCooldown > 0) return
    if (preview) {
      showSuccessToast('Preview', 'No email is resent in preview.')
      return
    }
    setSendLoading(true)
    try {
      const res = await fetchWithCSRF('/api/auth/verify-academic-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 409) {
          showEmailInUse(email.trim())
          return
        }
        showErrorToast('Could not resend', (data?.error as string) || 'Please try again.')
        return
      }
      setResendCooldown(RESEND_COOLDOWN_SEC)
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      showSuccessToast('Code sent again', 'Check your inbox for the new code.')
    } finally {
      setSendLoading(false)
    }
  }, [resendCooldown, email, preview, showEmailInUse])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('')
      const next = [...otp]
      digits.forEach((d, i) => {
        if (index + i < OTP_LENGTH) next[index + i] = d
      })
      setOtp(next)
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1)
      otpInputRefs.current[nextIndex]?.focus()
      return
    }
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < OTP_LENGTH - 1) otpInputRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
      const next = [...otp]
      next[index - 1] = ''
      setOtp(next)
    }
  }

  const signInToLinkedAccount = async () => {
    if (preview) {
      showSuccessToast(
        'Preview',
        'You would be signed out and taken to sign in with the login email for that existing account.'
      )
      return
    }
    try {
      markIntentionalSignOut()
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // Still send them to sign-in if sign-out fails.
    }
    router.push('/auth/sign-in?reason=university-email-reuse')
    router.refresh()
  }

  const submitSupportForm = async (event: React.FormEvent) => {
    event.preventDefault()
    const name = supportName.trim()
    const replyTo = supportReplyEmail.trim()
    const details = supportDetails.trim()
    if (name.length < 2 || !replyTo || details.length < 10) {
      showErrorToast('Please complete the form', 'Add your name, a reply email, and a short description of what happened.')
      return
    }
    if (preview) {
      setSupportSent(true)
      showSuccessToast('Preview', 'This message would be sent to support. Nothing was submitted.')
      return
    }
    setSupportSubmitting(true)
    try {
      const res = await fetchWithCSRF('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `Cannot access account for ${email}`,
          category: 'account',
          priority: 'high',
          tags: [UNIVERSITY_EMAIL_RECOVERY_TAG],
          metadata: {
            type: 'university_email_recovery',
            university_email: email,
            reply_email: replyTo,
            requester_name: name,
          },
          description: [
            `University email: ${email}`,
            `Reply email: ${replyTo}`,
            `Name: ${name}`,
            '',
            'I do not have access to the original login email for the account that already uses this campus address (or I forgot which email I used).',
            '',
            details,
          ].join('\n'),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data?.error as string) || 'Failed to send message')
      }
      setSupportSent(true)
      showSuccessToast('Request sent', 'Support will follow up at the email you entered.')
    } catch (error) {
      showErrorToast(
        'Could not send the form',
        error instanceof Error ? error.message : 'Please try again in a moment.'
      )
    } finally {
      setSupportSubmitting(false)
    }
  }

  const handleBack = () => {
    if (step === 'lost-access') {
      setStep('in-use')
      return
    }
    if (step === 'in-use' || step === 'otp') {
      setStep('email')
      return
    }
    if (onBack) {
      onBack()
      return
    }
    router.back()
  }

  const header =
    step === 'in-use'
      ? {
          title: 'This university email is already in use',
          body: (
            <>
              <span className="font-semibold text-[#0F172A] dark:text-slate-50">{email}</span> is
              already linked to another Domu Match account. Choose how you want to continue.
            </>
          ),
        }
      : step === 'lost-access'
        ? {
            title: 'Recover this campus email',
            body: (
              <>
                If you no longer have the original login email, or you forgot which one you used,
                fill out the form below.
              </>
            ),
          }
        : step === 'otp'
          ? {
              title: 'Enter your code',
              body: (
                <>
                  We sent a 6-digit code to{' '}
                  <span className="font-semibold text-[#0F172A] dark:text-slate-50">{email}</span>. It
                  might take a minute to arrive.
                </>
              ),
            }
          : {
              title: 'Verify your student status',
              body: (
                <>
                  Enter your university email and we&apos;ll send a 6-digit code to keep campus
                  communities safe.
                </>
              ),
            }

  return (
    <div className={cn('flex flex-col gap-5 sm:gap-6', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step === 'otp' ? 'otp-header' : step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-2.5 text-center"
        >
          <h1 className="text-[1.65rem] font-extrabold leading-tight tracking-tight text-[#0F172A] dark:text-slate-50 sm:text-[2rem]">
            {header.title}
          </h1>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-[15px]">
            {header.body}
          </p>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 'email' ? (
          <motion.div
            key="email-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3.5"
          >
            <input
              type="email"
              placeholder="e.g. you@university.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendCode()}
              className={fieldClass}
              disabled={sendLoading}
              autoComplete="email"
              aria-label="University email"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
                Back
              </button>
              <button
                type="button"
                onClick={sendCode}
                disabled={sendLoading}
                className={primaryButtonClass}
              >
                {sendLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send code
                    <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : step === 'in-use' ? (
          <motion.div
            key="in-use"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="space-y-3 rounded-xl bg-slate-50 px-4 py-3.5 text-sm leading-relaxed text-slate-700 ring-1 ring-slate-200/80 dark:bg-slate-900/50 dark:text-slate-200 dark:ring-slate-700">
              <p>
                Sign in with the{' '}
                <button type="button" onClick={() => void signInToLinkedAccount()} className={linkClass}>
                  login email linked to that account
                </button>
                . That is often a personal email, not this university address.
              </p>
              <p>
                Don&apos;t have access to that email, or forgot which one you used?{' '}
                <button type="button" onClick={() => setStep('lost-access')} className={linkClass}>
                  Contact support
                </button>
                .
              </p>
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
              Try a different university email
            </button>
          </motion.div>
        ) : step === 'lost-access' ? (
          <motion.div
            key="lost-access"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {supportSent ? (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 ring-1 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-800/70">
                Thanks – support has your request for {email}.
              </p>
            ) : (
              <form className="space-y-3" onSubmit={submitSupportForm}>
                <input
                  type="text"
                  placeholder="Your name"
                  value={supportName}
                  onChange={(e) => setSupportName(e.target.value)}
                  className={fieldClass}
                  autoComplete="name"
                  aria-label="Your name"
                />
                <input
                  type="email"
                  placeholder="Email we can reply to"
                  value={supportReplyEmail}
                  onChange={(e) => setSupportReplyEmail(e.target.value)}
                  className={fieldClass}
                  autoComplete="email"
                  aria-label="Reply email"
                />
                <textarea
                  placeholder="What happened? For example: I no longer have the Gmail I used to sign up."
                  value={supportDetails}
                  onChange={(e) => setSupportDetails(e.target.value)}
                  className={cn(fieldClass, 'h-28 resize-none py-3')}
                  aria-label="What happened"
                />
                <button type="submit" disabled={supportSubmitting} className={cn(primaryButtonClass, 'w-full')}>
                  {supportSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    'Send to support'
                  )}
                </button>
              </form>
            )}
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
              Back
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="otp-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpInputRefs.current[i] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  aria-label={`Digit ${i + 1}`}
                  className={cn(
                    fieldClass,
                    'h-12 w-11 px-0 text-center text-lg font-semibold tabular-nums sm:w-12'
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
                Back
              </button>
              <button
                type="button"
                onClick={verifyCode}
                disabled={verifyLoading || otp.join('').length !== OTP_LENGTH}
                className={primaryButtonClass}
              >
                {verifyLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    Verify code
                    <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
                  </>
                )}
              </button>
            </div>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              {resendCooldown > 0 ? (
                <span>Resend code in {resendCooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={resendCode}
                  className={linkClass}
                >
                  Didn&apos;t receive it? Resend code.
                </button>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
