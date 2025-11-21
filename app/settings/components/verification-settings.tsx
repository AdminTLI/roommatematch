'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Clock, Shield, RefreshCw, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface VerificationSettingsProps {
  userId: string
}

type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'failed'

interface VerificationData {
  id: string
  provider: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  reviewReason?: string
  createdAt: string
  updatedAt: string
}

export function VerificationSettings({ userId }: VerificationSettingsProps) {
  const router = useRouter()
  const [status, setStatus] = useState<VerificationStatus>('unverified')
  const [verification, setVerification] = useState<VerificationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/verification/status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data.status)
        setVerification(data.verification)
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startVerification = async () => {
    setIsStarting(true)
    setError(null)

    try {
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      const response = await fetchWithCSRF('/api/verification/start', {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start verification')
      }

      // Redirect to provider-hosted flow or verification page
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        router.push('/verify')
      }
    } catch (error) {
      console.error('Failed to start verification:', error)
      setError(error instanceof Error ? error.message : 'Failed to start verification')
    } finally {
      setIsStarting(false)
    }
  }

  const retryVerification = async () => {
    await startVerification()
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      case 'failed':
        return <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      default:
        return <Badge variant="outline">
          <Shield className="h-3 w-3 mr-1" />
          Not Verified
        </Badge>
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Identity Verification</span>
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          Verify your identity to access all platform features including matches and chat.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status === 'verified' && verification && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your identity has been successfully verified.
            </p>
            <div className="text-sm text-gray-500 dark:text-text-muted">
              <p>Provider: {verification.provider}</p>
              <p>Verified on: {new Date(verification.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your verification is being processed. This may take a few minutes.
            </p>
            {verification && (
              <div className="text-sm text-gray-500 dark:text-text-muted">
                <p>Started on: {new Date(verification.createdAt).toLocaleDateString()}</p>
              </div>
            )}
            <Button variant="outline" onClick={() => router.push('/verify')}>
              View Status
            </Button>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-4">
            {verification?.reviewReason && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{verification.reviewReason}</AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your verification was not successful. Please try again.
            </p>
            <Button onClick={retryVerification} disabled={isStarting}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isStarting ? 'animate-spin' : ''}`} />
              {isStarting ? 'Starting...' : 'Retry Verification'}
            </Button>
          </div>
        )}

        {status === 'unverified' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Start the verification process to access all platform features.
            </p>
            <Button onClick={startVerification} disabled={isStarting}>
              {isStarting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting...
                </>
              ) : (
                <>
                  Start Verification
                  <ExternalLink className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Verification is handled by our trusted partner who complies with GDPR and Dutch privacy regulations. 
            We never store your raw documents.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

