'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          <span className="font-medium">Email: {user.email}</span>
        </div>
        {isVerified ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Verified</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Not Verified</span>
          </div>
        )}
      </div>
      
      {!isVerified && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Please verify your email address to submit the questionnaire and access all features.
          </p>

          <Button 
            onClick={handleResendVerification}
            disabled={isResending}
            variant="default"
            size="sm"
          >
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </Button>

          {message && (
            <p className={`text-sm ${message.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
