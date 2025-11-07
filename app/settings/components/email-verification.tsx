'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'

interface EmailVerificationProps {
  user: {
    id: string
    email: string
    email_confirmed_at?: string
  }
}

export function EmailVerification({ user }: EmailVerificationProps) {
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState('')

  // Debug: Log the entire user object to see what we're getting
  console.log('[EmailVerification] Full user object:', JSON.stringify(user, null, 2))
  console.log('[EmailVerification] email_confirmed_at value:', user.email_confirmed_at)
  console.log('[EmailVerification] email_confirmed_at type:', typeof user.email_confirmed_at)

  // More explicit check - only verified if we have a valid ISO timestamp
  const isVerified = Boolean(
    user.email_confirmed_at && 
    typeof user.email_confirmed_at === 'string' &&
    user.email_confirmed_at.length > 0 &&
    !isNaN(Date.parse(user.email_confirmed_at))
  )

  console.log('[EmailVerification] isVerified:', isVerified)

  const handleResendVerification = async () => {
    setIsResending(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/resend-verification', {
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

  return (
    <Card className="border-2 shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                isVerified ? 'bg-green-100' : 'bg-amber-100'
              }`}>
                <Mail className={`w-5 h-5 ${
                  isVerified ? 'text-green-600' : 'text-amber-600'
                }`} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email Address</p>
                <p className="text-base font-semibold text-gray-900">{user.email}</p>
              </div>
            </div>
            {isVerified ? (
              <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1.5 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span className="font-semibold">Verified</span>
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-3 py-1.5 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span className="font-semibold">Not Verified</span>
              </Badge>
            )}
          </div>
          
          {!isVerified && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <p className="text-sm text-gray-600">
                Please verify your email address to submit the questionnaire and access all features.
              </p>

              <Button 
                onClick={handleResendVerification}
                disabled={isResending}
                variant="default"
                className="w-full sm:w-auto"
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
  )
}
