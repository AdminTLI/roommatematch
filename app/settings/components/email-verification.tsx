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
      {/* Email Verification Card */}
      <Card className={`border-2 ${needsEmailVerification ? 'border-amber-300 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-border-subtle shadow-sm'}`}>
        <CardContent className="p-6 sm:p-8">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className={`p-3 rounded-xl flex-shrink-0 ${
                  isEmailVerified ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                }`}>
                  <Mail className={`w-6 h-6 ${
                    isEmailVerified ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-text-muted uppercase tracking-wide mb-2">Email Address</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-text-primary break-all">{user.email}</p>
                </div>
              </div>
              {isEmailVerified ? (
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700 px-4 py-2 flex items-center gap-2 flex-shrink-0">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-semibold text-sm whitespace-nowrap">Verified</span>
                </Badge>
              ) : (
                <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700 px-4 py-2 flex items-center gap-2 flex-shrink-0">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-semibold text-sm whitespace-nowrap">Not Verified</span>
                </Badge>
              )}
            </div>
            
            {needsEmailVerification && (
              <Alert variant="destructive" className="border-amber-300 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-900">
                  <div className="space-y-3">
                    <p className="font-semibold">Email verification required</p>
                    <p className="text-sm">
                      You must verify your email address to access all features of the platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={handleCompleteEmailVerification}
                        className="bg-amber-600 hover:bg-amber-700 text-white h-11 text-base min-w-[200px]"
                      >
                        Complete Email Verification
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={handleResendVerification}
                        disabled={isResending}
                        variant="outline"
                        className="border-amber-300 text-amber-700 hover:bg-amber-100 h-11 text-base min-w-[200px]"
                      >
                        {isResending ? 'Sending...' : 'Resend Verification Email'}
                      </Button>
                    </div>
                    {message && (
                      <div className={`p-3 rounded-lg text-sm mt-2 ${
                        message.includes('sent') 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {message}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {!needsEmailVerification && !isEmailVerified && (
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <Button 
                  onClick={handleResendVerification}
                  disabled={isResending}
                  variant="outline"
                  className="w-full sm:w-auto min-w-[200px] h-11 text-base"
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </Button>

                {message && (
                  <div className={`p-3 rounded-lg text-sm ${
                    message.includes('sent') 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {message}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Persona Verification Card */}
      {isEmailVerified && (
        <Card className={`border-2 ${needsPersonaVerification ? 'border-amber-300 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-border-subtle shadow-sm'}`}>
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${
                    isPersonaVerified ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                  }`}>
                    <Shield className={`w-6 h-6 ${
                      isPersonaVerified ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-text-muted uppercase tracking-wide mb-2">Identity Verification</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-text-primary">Persona Verification</p>
                  </div>
                </div>
                {isPersonaVerified ? (
                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700 px-4 py-2 flex items-center gap-2 flex-shrink-0">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-semibold text-sm whitespace-nowrap">Verified</span>
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700 px-4 py-2 flex items-center gap-2 flex-shrink-0">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-semibold text-sm whitespace-nowrap">Not Verified</span>
                  </Badge>
                )}
              </div>
              
              {needsPersonaVerification && (
                <Alert variant="destructive" className="border-amber-300 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-900">
                    <div className="space-y-3">
                      <p className="font-semibold">Identity verification required</p>
                      <p className="text-sm">
                        You must complete identity verification to access all features of the platform.
                      </p>
                      <Button 
                        onClick={handleCompletePersonaVerification}
                        className="bg-amber-600 hover:bg-amber-700 text-white h-11 text-base min-w-[220px]"
                      >
                        Complete Identity Verification
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
