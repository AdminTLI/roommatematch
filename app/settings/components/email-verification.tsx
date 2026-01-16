'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, CheckCircle, AlertCircle, Shield, ArrowRight } from 'lucide-react'

interface EmailVerificationProps {
  user: {
    id: string
    email: string
    email_confirmed_at?: string
  }
}

export function EmailVerification({ user }: EmailVerificationProps) {
  const router = useRouter()
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState('')
  const [verificationStatus, setVerificationStatus] = useState<{
    emailVerified: boolean
    personaVerified: boolean
    needsEmailVerification: boolean
    needsPersonaVerification: boolean
  } | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)

  // Fetch verification status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/auth/verification-status')
        if (response.ok) {
          const data = await response.json()
          setVerificationStatus(data)
        }
      } catch (error) {
        console.error('Failed to fetch verification status:', error)
      } finally {
        setIsLoadingStatus(false)
      }
    }
    fetchStatus()
  }, [])

  // More explicit check - only verified if we have a valid ISO timestamp
  const isEmailVerified = Boolean(
    user.email_confirmed_at &&
    typeof user.email_confirmed_at === 'string' &&
    user.email_confirmed_at.length > 0 &&
    !isNaN(Date.parse(user.email_confirmed_at))
  )

  const isPersonaVerified = verificationStatus?.personaVerified ?? false
  const needsEmailVerification = verificationStatus?.needsEmailVerification ?? !isEmailVerified
  const needsPersonaVerification = verificationStatus?.needsPersonaVerification ?? false

  const handleResendVerification = async () => {
    setIsResending(true)
    setMessage('')

    try {
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      const response = await fetchWithCSRF('/api/auth/resend-verification', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Verification email sent! Check your inbox.')
      } else {
        setMessage(data.error || 'Failed to send verification email')
      }
    } catch (error) {
      setMessage('Failed to send verification email')
    } finally {
      setIsResending(false)
    }
  }

  const handleCompleteEmailVerification = () => {
    // Store email for verification page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('verification-email', user.email)
    }
    router.push('/auth/verify-email')
  }

  const handleCompletePersonaVerification = () => {
    router.push('/verify')
  }

  return (
    <div className="space-y-6">
      {/* Email Verification Row */}
      <div className={`bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 transition-all duration-300 backdrop-blur-xl ${needsEmailVerification ? 'border-amber-500/30 bg-amber-50/80 dark:bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.05)]' : ''
        }`}>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className={`p-3 rounded-xl flex-shrink-0 ${isEmailVerified ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                }`}>
                <Mail className={`w-6 h-6 ${isEmailVerified ? 'text-emerald-600 dark:text-emerald-500' : 'text-amber-600 dark:text-amber-500'
                  }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Email Registration</p>
                <p className="text-base font-semibold text-zinc-900 dark:text-white break-all">{user.email}</p>
              </div>
            </div>
            {isEmailVerified ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                <CheckCircle className="w-3 h-3 mr-1.5" />
                Verified
              </Badge>
            ) : (
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                <AlertCircle className="w-3 h-3 mr-1.5" />
                Required
              </Badge>
            )}
          </div>

          {needsEmailVerification && (
            <div className="pt-6 border-t border-zinc-200 dark:border-white/5 space-y-4">
              <div className="bg-zinc-50 dark:bg-white/5 rounded-xl p-4 border border-zinc-200 dark:border-white/5">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  You must verify your email address to access all features of the platform. We've sent a verification link to your inbox.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleCompleteEmailVerification}
                  className="bg-blue-500 hover:bg-blue-600 text-white h-11 px-6 rounded-xl font-semibold shadow-lg shadow-blue-500/20"
                >
                  Verify Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  variant="ghost"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 h-11 px-6 rounded-xl"
                >
                  {isResending ? 'Sending...' : 'Resend Link'}
                </Button>
              </div>
              {message && (
                <div className={`p-3 rounded-xl text-xs font-medium border ${message.includes('sent')
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                  }`}>
                  {message}
                </div>
              )}
            </div>
          )}

          {!needsEmailVerification && !isEmailVerified && (
            <div className="pt-4 border-t border-zinc-200 dark:border-white/5">
              <Button
                onClick={handleResendVerification}
                disabled={isResending}
                variant="ghost"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 h-10 px-4 rounded-lg text-sm"
              >
                {isResending ? 'Sending Link...' : 'Resend Verification Email'}
              </Button>

              {message && (
                <div className={`mt-4 p-3 rounded-xl text-xs font-medium border ${message.includes('sent')
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                  }`}>
                  {message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Identity Verification Row */}
      {isEmailVerified && (
        <div className={`bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 transition-all duration-300 backdrop-blur-xl ${needsPersonaVerification ? 'border-amber-500/30 bg-amber-50/80 dark:bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.05)]' : ''
          }`}>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className={`p-3 rounded-xl flex-shrink-0 ${isPersonaVerified ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                  }`}>
                  <Shield className={`w-6 h-6 ${isPersonaVerified ? 'text-emerald-600 dark:text-emerald-500' : 'text-amber-600 dark:text-amber-500'
                    }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1">Identity Security</p>
                  <p className="text-base font-semibold text-zinc-900 dark:text-white">Persona Verification</p>
                </div>
              </div>
              {isPersonaVerified ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                  <CheckCircle className="w-3 h-3 mr-1.5" />
                  Verified
                </Badge>
              ) : (
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                  <AlertCircle className="w-3 h-3 mr-1.5" />
                  Required
                </Badge>
              )}
            </div>

            {needsPersonaVerification && (
              <div className="pt-6 border-t border-zinc-200 dark:border-white/5 space-y-4">
                <div className="bg-zinc-50 dark:bg-white/5 rounded-xl p-4 border border-zinc-200 dark:border-white/5">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Identity verification is required to build trust and security within the community. This process only takes 2 minutes.
                  </p>
                </div>
                <Button
                  onClick={handleCompletePersonaVerification}
                  className="bg-blue-500 hover:bg-blue-600 text-white h-11 px-8 rounded-xl font-semibold shadow-lg shadow-blue-500/20 w-full sm:w-auto"
                >
                  Start Verification
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
