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

  const isVerified = !!user.email_confirmed_at

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isVerified ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span>Your email is verified</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <span>Your email is not verified</span>
            </div>
            
            <p className="text-sm text-gray-600">
              Please verify your email address ({user.email}) to submit the questionnaire and access all features.
            </p>

            <Button 
              onClick={handleResendVerification}
              disabled={isResending}
              variant="default"
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
      </CardContent>
    </Card>
  )
}
