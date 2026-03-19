'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { showSuccessToast, showErrorToast } from '@/lib/toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

const OTP_LENGTH = 6
const RESEND_COOLDOWN_SEC = 60

type Step = 'email' | 'otp'

export interface AcademicVerificationGateProps {
  onVerified?: () => void
  onBack?: () => void
  className?: string
}

export function AcademicVerificationGate({ onVerified, onBack, className }: AcademicVerificationGateProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [sendLoading, setSendLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const sendCode = useCallback(async () => {
    const trimmed = email.trim()
    if (!trimmed) {
      showErrorToast('Email required', 'Please enter your university email address.')
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
  }, [email])

  const verifyCode = useCallback(async () => {
    const token = otp.join('').trim()
    if (token.length !== OTP_LENGTH) {
      showErrorToast('Invalid code', 'Please enter all 6 digits.')
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
  }, [email, otp, onVerified])

  const resendCode = useCallback(async () => {
    if (resendCooldown > 0) return
    setSendLoading(true)
    try {
      const res = await fetchWithCSRF('/api/auth/verify-academic-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
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
  }, [resendCooldown, email])

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

  const inputBaseClass =
    'flex h-11 w-full rounded-xl border border-white/20 bg-white/5 backdrop-blur-xl px-3 py-2 text-body-sm text-slate-50 placeholder:text-slate-400/70 ring-offset-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:border-sky-300/50 transition-colors'

  return (
    <Card
      className={cn(
        'rounded-2xl border border-white/15 bg-white/5 backdrop-blur-2xl shadow-[0_24px_80px_rgba(15,23,42,0.85)]',
        'hover:border-white/30 hover:bg-white/8 transition-colors duration-300',
        className
      )}
    >
      <CardHeader className="space-y-1.5 p-6 pb-4">
        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.div
              key="email-header"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <CardTitle className="text-xl font-semibold tracking-tight text-slate-50">
                Verify your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  student status
                </span>
              </CardTitle>
              <CardDescription className="text-slate-300/90 mt-2">
                To keep our campus communities safe, please enter your university email address.
                We&apos;ll send you a quick 6-digit code.
              </CardDescription>
            </motion.div>
          ) : (
            <motion.div
              key="otp-header"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <CardTitle className="text-xl font-semibold text-slate-50">
                Enter Your Code
              </CardTitle>
              <CardDescription className="text-slate-300 mt-1">
                We sent a 6-digit code to <span className="font-medium text-slate-200">{email}</span>.
                It might take a minute to arrive.
              </CardDescription>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>
      <CardContent className="space-y-5 p-6 pt-0">
        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.div
              key="email-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <Input
                type="email"
                placeholder="e.g. you@university.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendCode()}
                className={cn(inputBaseClass, 'max-w-md')}
                disabled={sendLoading}
              />
              <div className="flex items-center justify-between gap-4">
                <Button
                  onClick={sendCode}
                  disabled={sendLoading}
                  className="min-h-[44px] rounded-xl bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-slate-50 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {sendLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    // Prefer returning to the onboarding step that opened this gate.
                    // Falling back to browser history keeps the component usable elsewhere.
                    if (onBack) {
                      onBack()
                      return
                    }
                    router.back()
                  }}
                  className="text-sm text-slate-400 underline underline-offset-2 hover:text-slate-200"
                >
                  Back
                </button>
              </div>
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
                    ref={(el) => { otpInputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={cn(
                      inputBaseClass,
                      'h-12 w-11 sm:w-12 px-0 py-0 text-center text-lg font-semibold tracking-[0.35em] tabular-nums'
                    )}
                  />
                ))}
              </div>
              <Button
                onClick={verifyCode}
                disabled={verifyLoading || otp.join('').length !== OTP_LENGTH}
                className="w-full min-h-[44px] rounded-xl bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-slate-50 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50"
              >
                {verifyLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>
              <p className="text-center text-sm text-slate-400">
                {resendCooldown > 0 ? (
                  <span>Resend code in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={resendCode}
                    className="text-sky-400 hover:text-sky-300 underline underline-offset-2"
                  >
                    Didn&apos;t receive it? Resend code.
                  </button>
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
