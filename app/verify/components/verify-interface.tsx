'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { 
  CheckCircle, 
  AlertCircle, 
  Shield, 
  Clock,
  UserCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react'

interface VerifyInterfaceProps {
  user: User
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

export function VerifyInterface({ user }: VerifyInterfaceProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [status, setStatus] = useState<VerificationStatus>('unverified')
  const [verification, setVerification] = useState<VerificationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  
  // Fetch verification status on mount
  useEffect(() => {
    fetchStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Poll status if pending
  useEffect(() => {
    if (status === 'pending') {
      const interval = setInterval(() => {
        fetchStatus()
      }, 5000) // Poll every 5 seconds
      setPollingInterval(interval)
      return () => clearInterval(interval)
    } else {
      if (pollingInterval) {
        clearInterval(pollingInterval)
        setPollingInterval(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/verification/status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data.status)
        setVerification(data.verification)
        
        // Redirect to matches if verified
        if (data.status === 'verified') {
          setTimeout(() => {
            router.push('/matches')
          }, 2000)
        }
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
      const response = await fetch('/api/verification/start', {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start verification')
      }

      // Redirect to provider-hosted flow
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else if (data.clientToken) {
        // For providers that return a token, redirect to their SDK
        // This would typically open an iframe or modal
        // For now, we'll show a message
        setError('Please check your email for verification instructions')
      }

      // Refresh status
      await fetchStatus()
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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading verification status...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Verify Your Identity
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          To ensure a safe and secure platform, we need to verify your identity using our secure verification partner.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'verified' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {status === 'pending' && <Clock className="h-5 w-5 text-blue-600" />}
            {status === 'failed' && <AlertCircle className="h-5 w-5 text-red-600" />}
            {status === 'unverified' && <Shield className="h-5 w-5" />}
            
            {status === 'verified' && 'Identity Verified'}
            {status === 'pending' && 'Verification Pending'}
            {status === 'failed' && 'Verification Failed'}
            {status === 'unverified' && 'Identity Not Verified'}
          </CardTitle>
          <CardDescription>
            {status === 'verified' && 'Your identity has been successfully verified.'}
            {status === 'pending' && 'Your verification is being processed. This may take a few minutes.'}
            {status === 'failed' && verification?.reviewReason && `Reason: ${verification.reviewReason}`}
            {status === 'unverified' && 'Start the verification process to access all platform features.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Verified State */}
          {status === 'verified' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-green-900 dark:text-green-200 mb-2">
                  Verification Complete!
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your identity has been verified. You now have full access to the platform.
                </p>
              </div>
              {verification && (
                <div className="text-sm text-gray-500">
                  Verified on {new Date(verification.updatedAt).toLocaleDateString()}
                </div>
              )}
              <Button onClick={() => router.push('/matches')} className="w-full">
                Continue to Matches
              </Button>
            </div>
          )}

          {/* Pending State */}
          {status === 'pending' && (
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <div>
                <h3 className="text-lg font-medium">Verification in Progress</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your verification is being processed. This page will update automatically when complete.
                </p>
              </div>
              {verification && (
                <div className="text-sm text-gray-500">
                  Started on {new Date(verification.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )}

          {/* Failed State */}
          {status === 'failed' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-red-900 dark:text-red-200 mb-2">
                  Verification Failed
                </h3>
                {verification?.reviewReason && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {verification.reviewReason}
                  </p>
                )}
                <p className="text-gray-600 dark:text-gray-300">
                  Please try again or contact support if you continue to experience issues.
                </p>
              </div>
              <Button onClick={retryVerification} disabled={isStarting} className="w-full">
                <RefreshCw className={`h-4 w-4 mr-2 ${isStarting ? 'animate-spin' : ''}`} />
                {isStarting ? 'Starting...' : 'Retry Verification'}
              </Button>
            </div>
          )}

          {/* Unverified State */}
          {status === 'unverified' && (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2">
                  Start Verification
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You'll be redirected to our secure verification partner to complete the process. 
                  This typically takes just a few minutes.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-left">
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                  What you'll need:
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Government-issued photo ID (passport, driver's license, or national ID)</li>
                  <li>• A device with a camera for a selfie</li>
                  <li>• Good lighting</li>
                </ul>
              </div>

              <Button 
                onClick={startVerification} 
                disabled={isStarting}
                size="lg"
                className="w-full"
              >
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
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                Your Privacy & Security
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Verification is handled by our trusted partner who complies with GDPR and Dutch privacy regulations. 
                We never store your raw documents - verification data is retained by the provider according to their 
                retention policy. Your information is encrypted and used solely for identity verification purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
