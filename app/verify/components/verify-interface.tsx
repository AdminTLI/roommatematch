'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { 
  CheckCircle, 
  AlertCircle, 
  Shield, 
  Clock,
  RefreshCw
} from 'lucide-react'

// Declare Persona types for TypeScript
declare global {
  interface Window {
    Persona: {
      Client: new (config: {
        templateId: string
        environmentId: string
        onReady: () => void
        onComplete: (data: { inquiryId: string; status: string; fields?: any }) => void
        onCancel?: () => void
        onError?: (error: any) => void
      }) => {
        open: () => void
        close: () => void
      }
    }
  }
}

interface VerifyInterfaceProps {
  user: User
}

type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'failed'

export function VerifyInterface({ user }: VerifyInterfaceProps) {
  const router = useRouter()
  const supabase = createClient()
  const personaClientRef = useRef<any>(null)
  const scriptLoadedRef = useRef(false)
  
  const [status, setStatus] = useState<VerificationStatus>('unverified')
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [isPersonaActive, setIsPersonaActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  
  // Load Persona script
  useEffect(() => {
    if (scriptLoadedRef.current) return

    const script = document.createElement('script')
    script.src = 'https://cdn.withpersona.com/dist/persona-v5.1.2.js'
    script.integrity = 'sha384-nuMfOsYXMwp5L13VJicJkSs8tObai/UtHEOg3f7tQuFWU5j6LAewJbjbF5ZkfoDo'
    script.crossOrigin = 'anonymous'
    script.async = true
    
    script.onload = () => {
      scriptLoadedRef.current = true
      initializePersona()
    }
    
    script.onerror = () => {
      setError('Failed to load verification service. Please refresh the page.')
      setIsLoading(false)
    }
    
    document.head.appendChild(script)
    
    return () => {
      // Cleanup: remove script if component unmounts
      const existingScript = document.querySelector('script[src*="persona"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

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

  const initializePersona = () => {
    const templateId = process.env.NEXT_PUBLIC_PERSONA_TEMPLATE_ID || 'itmpl_8XHCzE9HWCT7fFm2qwUie3fNicGw'
    const environmentId = process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID || 'env_xx8qopwH2mtfVV7ZHYxXFnjW1YDA'

    if (!window.Persona) {
      setError('Persona verification service not available. Please refresh the page.')
      setIsLoading(false)
      return
    }

    try {
      const client = new window.Persona.Client({
        templateId,
        environmentId,
        onReady: () => {
          // Auto-open Persona widget when ready (embedded flow)
          setIsLoading(false)
          // Auto-open immediately when ready, but only if user is unverified
          // This matches the Persona embedded flow pattern: onReady: () => client.open()
          if (status === 'unverified' || status === 'failed') {
            setIsStarting(true)
            setIsPersonaActive(true)
            client.open()
          }
        },
        onComplete: async ({ inquiryId, status: personaStatus }) => {
          console.log(`Completed inquiry ${inquiryId} with status ${personaStatus}`)
          
          setIsStarting(false)
          setIsPersonaActive(false)
          
          // Update verification status in our database
          try {
            const response = await fetch('/api/verification/persona-complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                inquiryId,
                status: personaStatus
              })
            })

            if (response.ok) {
              // Refresh status and redirect to onboarding if approved
              await fetchStatus()
              
              if (personaStatus === 'approved' || personaStatus === 'completed') {
                setTimeout(() => {
                  router.push('/onboarding/intro')
                }, 2000)
              }
            } else {
              setError('Failed to update verification status. Please contact support.')
            }
          } catch (err) {
            console.error('Failed to update verification status:', err)
            setError('Verification completed but failed to update status. Please contact support.')
          }
        },
        onCancel: () => {
          console.log('Persona verification cancelled by user')
          setIsStarting(false)
          setIsPersonaActive(false)
          setError(null)
        },
        onError: (error) => {
          console.error('Persona verification error:', error)
          setError('Verification failed. Please try again.')
          setIsStarting(false)
          setIsPersonaActive(false)
        }
      })
      
      // Store client reference
      personaClientRef.current = client
    } catch (err) {
      console.error('Failed to initialize Persona:', err)
      setError('Failed to initialize verification service. Please refresh the page.')
      setIsLoading(false)
    }
  }

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/verification/status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data.status)
        
        // Redirect to onboarding if verified
        if (data.status === 'verified') {
          setTimeout(() => {
            router.push('/onboarding/intro')
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startVerification = () => {
    setIsStarting(true)
    setIsPersonaActive(true)
    setError(null)

    if (!personaClientRef.current) {
      setError('Verification service not ready. Please wait a moment and try again.')
      setIsStarting(false)
      setIsPersonaActive(false)
      return
    }

    try {
      personaClientRef.current.open()
    } catch (err) {
      console.error('Failed to open Persona verification:', err)
      setError('Failed to start verification. Please try again.')
      setIsStarting(false)
      setIsPersonaActive(false)
    }
  }

  const retryVerification = () => {
    startVerification()
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading verification service...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Hide background content when Persona is active
  if (isPersonaActive) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Minimal UI when Persona is active - just show error if any */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {/* Persona popup will overlay everything */}
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
            {status === 'verified' && 'Your identity has been successfully verified. Redirecting to onboarding...'}
            {status === 'pending' && 'Your verification is being processed. This may take a few minutes.'}
            {status === 'failed' && 'Your verification was not successful. Please try again.'}
            {status === 'unverified' && 'Start the verification process to continue to your profile setup.'}
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
                  Your identity has been verified. Redirecting you to complete your profile...
                </p>
              </div>
              <Button onClick={() => router.push('/onboarding/intro')} className="w-full">
                Continue to Profile Setup
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
                  Complete identity verification to continue setting up your profile. 
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
                disabled={isStarting || !personaClientRef.current}
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
                Verification is handled by Persona, our trusted partner who complies with GDPR and Dutch privacy regulations. 
                We never store your raw documents - verification data is retained by Persona according to their 
                retention policy. Your information is encrypted and used solely for identity verification purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
