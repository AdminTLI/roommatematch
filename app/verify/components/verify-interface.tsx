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
import { VerificationFeedback } from '@/components/auth/verification-feedback'

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
  const shouldAutoOpenRef = useRef(true) // Track if we should auto-open when ready
  const statusFetchedRef = useRef(false) // Track if status has been fetched
  const statusRef = useRef<VerificationStatus>('unverified') // Track latest status in ref
  const hasOpenedPersonaRef = useRef(false) // Track if Persona has been opened to prevent multiple opens
  
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
    // Note: Integrity check may fail in some environments, but script will still load
    // If integrity fails, browser will still execute the script but log a warning
    script.integrity = 'sha384-nuMfOsYXMwp5L13VJicJkSs8tObai/UtHEOg3f7tQuFWU5j6LAewJbjbF5ZkfoDo'
    script.crossOrigin = 'anonymous'
    script.async = true
    
    let loadTimeout: NodeJS.Timeout | null = null
    
    script.onload = () => {
      if (loadTimeout) {
        clearTimeout(loadTimeout)
        loadTimeout = null
      }
      scriptLoadedRef.current = true
      // Wait a bit for Persona to be fully available, then initialize
      // Retry mechanism in case Persona isn't immediately available
      let retries = 0
      const maxRetries = 15 // Increased retries
      const checkPersona = () => {
        if (window.Persona && window.Persona.Client) {
          initializePersona()
        } else if (retries < maxRetries) {
          retries++
          setTimeout(checkPersona, 100)
        } else {
          console.error('[Verify] Persona not available after script load')
          setError('Persona verification service not available. Please refresh the page.')
          setIsLoading(false)
        }
      }
      // Start checking immediately, but also after a small delay
      checkPersona()
    }
    
    script.onerror = (error) => {
      if (loadTimeout) {
        clearTimeout(loadTimeout)
        loadTimeout = null
      }
      console.error('[Verify] Script load error:', error)
      setError('Failed to load verification service. Please refresh the page.')
      setIsLoading(false)
    }
    
    // Set a timeout in case script never loads or errors
    loadTimeout = setTimeout(() => {
      if (!scriptLoadedRef.current) {
        console.error('[Verify] Script load timeout')
        setError('Verification service is taking too long to load. Please refresh the page.')
        setIsLoading(false)
      }
    }, 10000) // 10 second timeout
    
    document.head.appendChild(script)
    
    return () => {
      // Cleanup: remove script if component unmounts
      const existingScript = document.querySelector('script[src*="persona"]')
      if (existingScript) {
        existingScript.remove()
      }
      if (loadTimeout) {
        clearTimeout(loadTimeout)
      }
    }
  }, [])

  // Update status ref whenever status changes
  useEffect(() => {
    statusRef.current = status
  }, [status])

  // Fetch verification status on mount
  useEffect(() => {
    fetchStatus().then(() => {
      statusFetchedRef.current = true
      // Don't auto-open here - let onReady handle it to avoid double-opening
      // This prevents rate limiting from Persona
    })
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

    // Debug logging to help identify environment issues (using warn so it shows in production)
    console.warn('[Verify] Persona initialization:', {
      templateId,
      environmentId,
      hasEnvVar: !!process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID,
      envVarValue: process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID || 'NOT SET (using fallback)',
      isFallback: !process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID
    })

    if (!window.Persona) {
      setError('Persona verification service not available. Please refresh the page.')
      setIsLoading(false)
      return
    }

    try {
      // Log the actual values being passed to Persona (using warn so it shows in production)
      console.warn('[Verify] Creating Persona client with:', {
        templateId,
        environmentId,
        environmentIdLength: environmentId?.length,
        environmentIdPrefix: environmentId?.substring(0, 10)
      })
      
      const client = new window.Persona.Client({
        templateId,
        environmentId,
        onReady: () => {
          // Auto-open Persona widget when ready (embedded flow)
          setIsLoading(false)
          // Store client reference immediately
          personaClientRef.current = client
          
          // Auto-open immediately when ready, but only if:
          // 1. We should auto-open (user hasn't manually started)
          // 2. Status has been fetched OR we'll wait for it
          // 3. User is unverified or failed
          // 4. Persona hasn't been opened yet (prevent multiple opens)
          const tryAutoOpen = () => {
            const currentStatus = statusRef.current
            
            // Prevent multiple opens that could cause rate limiting
            if (hasOpenedPersonaRef.current) {
              console.log('[Verify] Persona already opened, skipping auto-open')
              return
            }
            
            if (shouldAutoOpenRef.current && (currentStatus === 'unverified' || currentStatus === 'failed')) {
              setIsStarting(true)
              setIsPersonaActive(true)
              hasOpenedPersonaRef.current = true
              try {
                client.open()
              } catch (err) {
                console.error('Failed to open Persona on ready:', err)
                setIsStarting(false)
                setIsPersonaActive(false)
                hasOpenedPersonaRef.current = false // Reset on error so user can retry
                setError('Failed to start verification. Please try again.')
              }
            } else if (currentStatus === 'verified' || currentStatus === 'pending') {
              // Status is verified or pending, don't auto-open
              shouldAutoOpenRef.current = false
            }
          }
          
          // CRITICAL: Only auto-open if status has been fetched. Never open before API confirms -
          // otherwise verified users see Persona due to race (Persona loads before status API).
          if (statusFetchedRef.current) {
            tryAutoOpen()
          }
          // If not fetched yet: fetchStatus completion will open when it gets unverified/failed
        },
        onComplete: async ({ inquiryId, status: personaStatus }) => {
          console.log(`Completed inquiry ${inquiryId} with status ${personaStatus}`)
          
          setIsStarting(false)
          setIsPersonaActive(false)
          // Reset flag on completion so user can retry if verification fails
          hasOpenedPersonaRef.current = false
          
          // Update verification status in our database
          try {
            // Fetch CSRF token from authenticated API endpoint
            // This is more secure than reading from cookie (prevents XSS)
            let csrfToken: string | null = null
            try {
              const tokenResponse = await fetch('/api/csrf-token', {
                credentials: 'include',
                cache: 'no-store'
              })
              if (tokenResponse.ok) {
                const tokenData = await tokenResponse.json()
                csrfToken = tokenData.token
              }
            } catch (error) {
              console.error('[Verify] Failed to fetch CSRF token:', error)
            }

            const headers: HeadersInit = {
              'Content-Type': 'application/json',
            }
            
            // Add CSRF token if available
            if (csrfToken) {
              headers['x-csrf-token'] = csrfToken
            }

            const response = await fetch('/api/verification/persona-complete', {
              method: 'POST',
              headers,
              body: JSON.stringify({
                inquiryId,
                status: personaStatus
              })
            })

            if (response.ok) {
              const data = await response.json()
              console.warn('[Verification] Persona complete success:', data)
              
              // Force a fresh status check immediately after completion
              // Add a small delay to ensure database write has completed
              await new Promise(resolve => setTimeout(resolve, 500))
              await fetchStatus()
              
              // Check the updated status - don't auto-redirect to avoid loops
              // Let the user click the Continue button instead
              const currentStatus = statusRef.current
              console.warn('[Verification] Status after completion:', {
                personaStatus,
                apiStatus: data.status,
                currentStatus,
                userCanContinue: personaStatus === 'approved' || personaStatus === 'completed' || data.status === 'approved' || currentStatus === 'verified'
              })
              
              // Update status based on response
              if (personaStatus === 'approved' || personaStatus === 'completed' || data.status === 'approved') {
                // Status will be updated by fetchStatus, but ensure it's set to verified
                setStatus('verified')
              } else if (currentStatus === 'pending') {
                // If status is pending, the existing polling effect will handle it
                setStatus('pending')
              } else {
                // Status might not have updated yet, poll a few times to update UI
                let pollCount = 0
                const maxPolls = 5
                const pollInterval = setInterval(async () => {
                  pollCount++
                  await fetchStatus()
                  const latestStatus = statusRef.current
                  console.warn('[Verification] Polling status:', { pollCount, latestStatus })
                  if (latestStatus === 'verified' || pollCount >= maxPolls) {
                    clearInterval(pollInterval)
                    // Don't auto-redirect - let user click button
                  }
                }, 2000)
              }
            } else {
              // Get error message from response if available
              let errorMessage = 'Failed to update verification status. Please contact support.'
              try {
                const errorData = await response.json()
                if (errorData.error) {
                  errorMessage = `Failed to update verification status: ${errorData.error}`
                }
              } catch {
                // If response is not JSON, use status-based message
                if (response.status === 403) {
                  errorMessage = 'Access denied. Please refresh the page and try again.'
                } else if (response.status === 401) {
                  errorMessage = 'Session expired. Please refresh the page and try again.'
                } else if (response.status >= 500) {
                  errorMessage = 'Server error. Please try again in a moment or contact support.'
                }
              }
              console.error('[Verification] Persona complete failed:', {
                status: response.status,
                statusText: response.statusText,
                inquiryId,
                personaStatus
              })
              setError(errorMessage)
            }
          } catch (err) {
            console.error('[Verification] Failed to update verification status:', err)
            setError('Verification completed but failed to update status. Please refresh the page or contact support.')
          }
        },
        onCancel: () => {
          console.log('Persona verification cancelled by user')
          setIsStarting(false)
          setIsPersonaActive(false)
          setError(null)
          // Don't reset hasOpenedPersonaRef on cancel - user can retry manually
        },
        onError: (error) => {
          console.error('Persona verification error:', error)
          
          // Provide more specific error messages based on error type
          let errorMessage = 'Verification failed. Please try again.'
          
          if (error?.status === 429 || error?.code === 'rate_limit_exceeded') {
            errorMessage = 'Too many verification attempts. Please wait a few minutes and try again.'
          } else if (error?.status === 400 || error?.code === 'invalid_config') {
            errorMessage = 'Verification service configuration error. Please contact support if this persists.'
            console.error('[Verify] Persona config error - check environment variables:', {
              templateId: process.env.NEXT_PUBLIC_PERSONA_TEMPLATE_ID,
              environmentId: process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID,
              hasEnvVar: !!process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID
            })
          } else if (error?.message) {
            // Use Persona's error message if available
            errorMessage = `Verification error: ${error.message}. Please try again.`
          }
          
          setError(errorMessage)
          setIsStarting(false)
          setIsPersonaActive(false)
          // Reset flag on error so user can retry
          hasOpenedPersonaRef.current = false
        }
      })
      
      // Client reference is stored in onReady callback
    } catch (err) {
      console.error('Failed to initialize Persona:', err)
      setError('Failed to initialize verification service. Please refresh the page.')
      setIsLoading(false)
    }
  }

  const fetchStatus = async () => {
    try {
      console.log('[Verify] Fetching verification status...')
      // Add cache-busting timestamp to bypass any caching
      const timestamp = Date.now()
      const response = await fetch(`/api/verification/status?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      if (response.ok) {
        const data = await response.json()
        const newStatus = data.status
        console.log('[Verify] Status fetched:', { newStatus, fullData: data })
        setStatus(newStatus)
        statusRef.current = newStatus
        statusFetchedRef.current = true
        
        if (newStatus === 'verified' || newStatus === 'pending') {
          shouldAutoOpenRef.current = false
        }
        
        // If user needs verification AND Persona is ready, open now (Persona onReady may have fired before us)
        if ((newStatus === 'unverified' || newStatus === 'failed') && shouldAutoOpenRef.current && !hasOpenedPersonaRef.current && personaClientRef.current) {
          setIsStarting(true)
          setIsPersonaActive(true)
          hasOpenedPersonaRef.current = true
          try {
            personaClientRef.current.open()
          } catch (err) {
            console.error('Failed to open Persona after status fetch:', err)
            setIsStarting(false)
            setIsPersonaActive(false)
            hasOpenedPersonaRef.current = false
          }
        }
      } else if (response.status === 404) {
        // Profile doesn't exist yet - user is unverified
        console.log('[Verification] Status endpoint returned 404, treating as unverified')
        setStatus('unverified')
        statusFetchedRef.current = true
        // Keep shouldAutoOpen as true for unverified users
      } else if (response.status === 401) {
        // Unauthorized - session might have expired
        console.warn('[Verification] Status check unauthorized, redirecting to sign in')
        router.push('/auth/sign-in')
      } else {
        console.error('[Verification] Status check failed:', response.status, response.statusText)
        // Don't set error for status check failures - just log it
        statusFetchedRef.current = true
      }
    } catch (error) {
      console.error('[Verification] Failed to fetch verification status:', error)
      // Don't set error for status check failures - just log it
      statusFetchedRef.current = true
    } finally {
      setIsLoading(false)
    }
  }

  const startVerification = () => {
    // Prevent multiple opens
    if (hasOpenedPersonaRef.current && isPersonaActive) {
      console.log('[Verify] Persona already active, ignoring start request')
      return
    }
    
    setIsStarting(true)
    setIsPersonaActive(true)
    setError(null)
    shouldAutoOpenRef.current = false // User manually started, don't auto-open again

    if (!personaClientRef.current) {
      setError('Verification service not ready. Please wait a moment and try again.')
      setIsStarting(false)
      setIsPersonaActive(false)
      return
    }

    try {
      hasOpenedPersonaRef.current = true
      personaClientRef.current.open()
    } catch (err) {
      console.error('Failed to open Persona verification:', err)
      setError('Failed to start verification. Please try again.')
      setIsStarting(false)
      setIsPersonaActive(false)
      hasOpenedPersonaRef.current = false // Reset on error
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
    <>
      <VerificationFeedback />
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
          {(() => {
            if (status === 'verified') {
              console.log('[Verify] Rendering verified state, status:', status, 'statusRef:', statusRef.current)
            }
            return null
          })()}
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
                  Your identity has been verified. Click the button below to continue to your profile setup.
                </p>
              </div>
              <Button 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('[Verify] Continue button clicked, navigating to onboarding...', {
                    currentPath: window.location.pathname,
                    status: status,
                    statusRef: statusRef.current
                  })
                  
                  // Use window.location.href immediately to bypass Next.js router
                  // This avoids any caching or redirect loop issues
                  try {
                    console.log('[Verify] Setting window.location.href...')
                    window.location.href = '/onboarding/intro'
                    console.log('[Verify] window.location.href set, navigation should happen')
                  } catch (error) {
                    console.error('[Verify] Error setting window.location.href:', error)
                    // Fallback: try router.push
                    router.push('/onboarding/intro')
                  }
                }} 
                className="w-full"
                type="button"
              >
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

              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Already verified?{' '}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const tokenRes = await fetch('/api/csrf-token', { credentials: 'include' })
                      const { token } = tokenRes.ok ? await tokenRes.json() : {}
                      const headers: HeadersInit = { 'Content-Type': 'application/json' }
                      if (token) headers['x-csrf-token'] = token
                      const res = await fetch('/api/verification/sync', { method: 'POST', headers })
                      const data = await res.json()
                      if (data.synced) {
                        window.location.href = '/onboarding/intro'
                      } else {
                        setError(data.message || 'No verified record found.')
                      }
                    } catch (e) {
                      setError('Failed to sync. Please try again.')
                    }
                  }}
                  className="underline hover:no-underline text-brand-primary"
                >
                  Sync my verification status
                </button>
              </p>

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
    </>
  )
}
