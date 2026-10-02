'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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
  RefreshCw,
  Sparkles,
  Loader2
} from 'lucide-react'
import { VerificationFeedback } from '@/components/auth/verification-feedback'
import { cn } from '@/lib/utils'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as const }
}

const verifyCardClass =
  'bg-background/40 dark:bg-white/5 backdrop-blur-lg border-border/50 shadow-xl overflow-hidden'

// Declare Persona types for TypeScript
declare global {
  interface Window {
    Persona: {
      Client: new (config: {
        templateId?: string
        inquiryId?: string
        sessionToken?: string
        environmentId: string
        referenceId?: string
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
  redirectTo?: string
}

type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'failed'

export function VerifyInterface({ user, redirectTo = '/dashboard' }: VerifyInterfaceProps) {
  const router = useRouter()
  const supabase = createClient()
  const personaClientRef = useRef<any>(null)
  const scriptLoadedRef = useRef(false)
  const statusRef = useRef<VerificationStatus>('unverified') // Track latest status in ref
  const hasOpenedPersonaRef = useRef(false) // Track if Persona has been opened to prevent multiple opens
  
  const [status, setStatus] = useState<VerificationStatus>('unverified')
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [isPersonaReady, setIsPersonaReady] = useState(false)
  const [isPersonaActive, setIsPersonaActive] = useState(false)
  const [awaitingReview, setAwaitingReview] = useState(false)
  const [canContinue, setCanContinue] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  const personaOpenWatchdogRef = useRef<NodeJS.Timeout | null>(null)
  
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
    fetchStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Poll status if pending (faster when awaiting review; still useful if canContinue)
  useEffect(() => {
    if (status === 'pending') {
      const interval = setInterval(() => {
        fetchStatus()
      }, awaitingReview ? 5000 : 15000)
      setPollingInterval(interval)
      return () => clearInterval(interval)
    } else {
      if (pollingInterval) {
        clearInterval(pollingInterval)
        setPollingInterval(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, awaitingReview])

  useEffect(() => {
    return () => {
      if (personaOpenWatchdogRef.current) {
        clearTimeout(personaOpenWatchdogRef.current)
        personaOpenWatchdogRef.current = null
      }
    }
  }, [])

  const handlePersonaComplete = async (inquiryId: string, personaStatus: string) => {
    setIsStarting(false)
    setIsPersonaActive(false)
    hasOpenedPersonaRef.current = false

    try {
      let csrfToken: string | null = null
      try {
        const tokenResponse = await fetch('/api/csrf-token', {
          credentials: 'include',
          cache: 'no-store',
        })
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json()
          csrfToken = tokenData.token
        }
      } catch (error) {
        console.error('[Verify] Failed to fetch CSRF token:', error)
      }

      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (csrfToken) headers['x-csrf-token'] = csrfToken

      const response = await fetch('/api/verification/persona-complete', {
        method: 'POST',
        headers,
        body: JSON.stringify({ inquiryId, status: personaStatus }),
      })

      if (response.ok) {
        const data = await response.json()
        await new Promise((resolve) => setTimeout(resolve, 500))
        await fetchStatus()

        if (
          personaStatus === 'approved' ||
          personaStatus === 'completed' ||
          data.status === 'approved'
        ) {
          setStatus('verified')
        } else if (data.status === 'rejected' || !data.approved) {
          setStatus('failed')
          setError(
            data.reasons?.includes('underage')
              ? 'You must be at least 18 years old to use this platform.'
              : data.reasons?.includes('name_mismatch')
                ? 'The name on your ID does not match your signup name.'
                : 'Identity verification could not be confirmed. Please try again or contact support.'
          )
        } else {
          setStatus('pending')
        }
      } else {
        let errorMessage = 'Failed to update verification status. Please contact support.'
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = `Failed to update verification status: ${errorData.error}`
          }
        } catch {
          if (response.status === 403) {
            errorMessage = 'Access denied. Please refresh the page and try again.'
          } else if (response.status === 401) {
            errorMessage = 'Session expired. Please refresh the page and try again.'
          }
        }
        setError(errorMessage)
      }
    } catch (err) {
      console.error('[Verification] Failed to update verification status:', err)
      setError(
        'Verification completed but failed to update status. Please refresh the page or contact support.'
      )
    }
  }

  const initializePersona = () => {
    const environmentId = process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID
    const templateId = process.env.NEXT_PUBLIC_PERSONA_TEMPLATE_ID

    if (!environmentId || !templateId) {
      setError(
        'Identity verification is not configured. Set NEXT_PUBLIC_PERSONA_TEMPLATE_ID and NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID.'
      )
      setIsLoading(false)
      return
    }

    if (!window.Persona) {
      setError('Persona verification service not available. Please refresh the page.')
      setIsLoading(false)
      return
    }

    // Script is ready; inquiry is created on Start via /api/verification/start
    setIsPersonaReady(true)
    setIsLoading(false)
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
        setAwaitingReview(Boolean(data.awaitingReview))
        // Default: pending sessions are resumable unless awaiting Persona review
        setCanContinue(
          newStatus === 'pending'
            ? data.canContinue !== false && !data.awaitingReview
            : false
        )

        // Already verified: leave /verify immediately (fixes login redirect loops / white screens)
        if (newStatus === 'verified') {
          window.location.replace(redirectTo)
          return
        }
      } else if (response.status === 404) {
        // Profile doesn't exist yet - user is unverified
        console.log('[Verification] Status endpoint returned 404, treating as unverified')
        setStatus('unverified')
        setAwaitingReview(false)
        setCanContinue(false)
      } else if (response.status === 401) {
        // Unauthorized - session might have expired
        console.warn('[Verification] Status check unauthorized, redirecting to sign in')
        router.push('/auth/sign-in')
      } else {
        console.error('[Verification] Status check failed:', response.status, response.statusText)
        // Don't set error for status check failures - just log it
      }
    } catch (error) {
      console.error('[Verification] Failed to fetch verification status:', error)
      // Don't set error for status check failures - just log it
    } finally {
      setIsLoading(false)
    }
  }

  const clearPersonaOpenWatchdog = () => {
    if (personaOpenWatchdogRef.current) {
      clearTimeout(personaOpenWatchdogRef.current)
      personaOpenWatchdogRef.current = null
    }
  }

  const resetPersonaOverlay = () => {
    clearPersonaOpenWatchdog()
    setIsStarting(false)
    setIsPersonaActive(false)
    hasOpenedPersonaRef.current = false
  }

  const startVerification = async () => {
    if (hasOpenedPersonaRef.current && isPersonaActive) {
      return
    }

    const environmentId = process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID
    if (!environmentId || !window.Persona?.Client) {
      setError('Verification service not ready. Please wait a moment and try again.')
      return
    }

    setIsStarting(true)
    setIsPersonaActive(true)
    setError(null)
    setStatus('pending')
    setCanContinue(true)
    setAwaitingReview(false)

    try {
      let csrfToken: string | null = null
      try {
        const tokenResponse = await fetch('/api/csrf-token', {
          credentials: 'include',
          cache: 'no-store',
        })
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json()
          csrfToken = tokenData.token
        }
      } catch {
        // continue; CSRF may be optional depending on middleware
      }

      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (csrfToken) headers['x-csrf-token'] = csrfToken

      const startRes = await fetch('/api/verification/start', {
        method: 'POST',
        headers,
        credentials: 'include',
      })
      const startData = await startRes.json().catch(() => ({}))

      if (!startRes.ok) {
        setError(
          startData?.error ||
            'Could not start verification. Please complete your profile name and date of birth, then try again.'
        )
        resetPersonaOverlay()
        await fetchStatus()
        return
      }

      if (startData.status === 'verified') {
        setStatus('verified')
        resetPersonaOverlay()
        window.location.replace(redirectTo)
        return
      }

      // Submitted to Persona and waiting on review — do not open the widget again
      if (startData.awaitingReview) {
        setAwaitingReview(true)
        setCanContinue(false)
        setStatus('pending')
        resetPersonaOverlay()
        return
      }

      const inquiryId = startData.inquiryId || startData.sessionId
      const sessionToken = startData.clientToken as string | undefined
      if (!inquiryId) {
        setError('Could not create verification session. Please try again.')
        resetPersonaOverlay()
        return
      }

      // Pending Persona inquiries require a fresh session token to open the embedded flow
      if (!sessionToken) {
        setError(
          'Could not open verification securely. Please try again in a moment, or contact support if this keeps happening.'
        )
        resetPersonaOverlay()
        setCanContinue(true)
        return
      }

      hasOpenedPersonaRef.current = true

      let client: InstanceType<typeof window.Persona.Client> | null = null
      let personaDidOpen = false

      clearPersonaOpenWatchdog()
      // If the Persona modal never becomes ready (blocker, CSP, browser quirks),
      // return the user to a recoverable state instead of an endless spinner.
      personaOpenWatchdogRef.current = setTimeout(() => {
        if (!personaDidOpen) {
          console.error('[Verify] Persona widget failed to open within timeout')
          setError(
            'The verification window did not open. Disable ad blockers for this site, try another browser, then continue verification.'
          )
          resetPersonaOverlay()
          setCanContinue(true)
          setStatus('pending')
        }
      }, 20000)

      const clientConfig: ConstructorParameters<typeof window.Persona.Client>[0] = {
        environmentId,
        inquiryId,
        sessionToken,
        referenceId: user.id,
        onReady: () => {
          personaDidOpen = true
          clearPersonaOpenWatchdog()
          client?.open()
        },
        onComplete: ({ inquiryId: completedId, status: personaStatus }) => {
          clearPersonaOpenWatchdog()
          void handlePersonaComplete(completedId, personaStatus)
        },
        onCancel: () => {
          resetPersonaOverlay()
          setError(null)
          setStatus('pending')
          setCanContinue(true)
          void fetchStatus()
        },
        onError: (error: any) => {
          let errorMessage = 'Verification failed. Please try again.'
          if (error?.status === 429 || error?.code === 'rate_limit_exceeded') {
            errorMessage =
              'Too many verification attempts. Please wait a few minutes and try again.'
          } else if (error?.message) {
            errorMessage = `Verification error: ${error.message}. Please try again.`
          }
          setError(errorMessage)
          resetPersonaOverlay()
          setCanContinue(true)
          setStatus('pending')
        },
      }

      client = new window.Persona.Client(clientConfig)
      personaClientRef.current = client
    } catch (err) {
      console.error('Failed to open Persona verification:', err)
      setError('Failed to start verification. Please try again.')
      resetPersonaOverlay()
      setCanContinue(true)
    }
  }

  const retryVerification = () => {
    startVerification()
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto w-full space-y-8 pb-24 md:pb-6">
        <Card className={cn(verifyCardClass)}>
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-500" aria-hidden />
              <p className="text-zinc-600 dark:text-zinc-400 font-medium">
                Loading verification service...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Hide background content when Persona is active — keep a visible fallback so
  // CSP/widget failures never leave users on a blank white screen.
  if (isPersonaActive) {
    return (
      <div className="max-w-3xl mx-auto w-full space-y-8 pb-24 md:pb-6">
        <Card className={cn(verifyCardClass)}>
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-500" aria-hidden />
              <p className="text-zinc-600 dark:text-zinc-400 font-medium">
                Identity verification is open in the Persona window.
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 max-w-md">
                If nothing appears, disable blockers for this site and refresh, or use the button below.
              </p>
              {error && (
                <Alert className="rounded-2xl border-destructive/50 text-left" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetPersonaOverlay()
                  setCanContinue(true)
                  setStatus('pending')
                }}
              >
                Back to verification page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <VerificationFeedback />
      <div className="max-w-3xl mx-auto w-full space-y-8 pb-24 md:pb-6">
        <motion.div {...fadeInUp} className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Sparkles className="w-5 h-5" aria-hidden />
            <span className="text-sm font-medium uppercase tracking-wider">Identity verification</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Verify your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400">
              identity
            </span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-lg text-lg font-medium">
            Complete a quick check so everyone on Domu Match can trust they are connecting with real people.
          </p>
        </motion.div>

        {error && (
          <Alert className="rounded-2xl border-destructive/50" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <motion.div {...fadeInUp}>
          <Card className={cn(verifyCardClass)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-zinc-900 dark:text-white">
                {status === 'verified' && (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </span>
                )}
                {status === 'pending' && (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </span>
                )}
                {status === 'failed' && (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </span>
                )}
                {status === 'unverified' && (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </span>
                )}
                <span>
                  {status === 'verified' && 'Identity verified'}
                  {status === 'pending' &&
                    (awaitingReview ? 'Verification pending' : 'Verification incomplete')}
                  {status === 'failed' && 'Verification failed'}
                  {status === 'unverified' && 'Not verified yet'}
                </span>
              </CardTitle>
              <CardDescription className="text-base text-zinc-500 dark:text-zinc-400 pt-1">
                {status === 'verified' &&
                  'Your identity has been confirmed. You can continue to profile setup when you are ready.'}
                {status === 'pending' &&
                  (awaitingReview
                    ? 'We are processing your verification. This usually takes a few minutes.'
                    : 'You still need to finish the identity check with Persona.')}
                {status === 'failed' && 'Something did not pass the check. You can try again below.'}
                {status === 'unverified' &&
                  'Complete a quick identity check to unlock chat and accept matches.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {status === 'verified' && (
                <div className="text-center space-y-5">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                    <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                      You are all set
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Your identity is verified. Continue to finish setting up your profile.
                    </p>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      try {
                        window.location.href = redirectTo
                      } catch (error) {
                        console.error('[Verify] Error setting window.location.href:', error)
                        router.push(redirectTo)
                      }
                    }}
                    className="w-full"
                    type="button"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {status === 'pending' && (
                <div className="text-center space-y-5 py-2">
                  {awaitingReview ? (
                    <Loader2 className="h-14 w-14 animate-spin text-indigo-500 mx-auto" aria-hidden />
                  ) : (
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
                      <Shield className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                      {awaitingReview
                        ? 'Verification in progress'
                        : 'Finish identity verification'}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                      {awaitingReview
                        ? 'This page updates automatically when your check is complete.'
                        : 'Your session is ready, but you have not completed the Persona check yet. Continue below to submit your ID.'}
                    </p>
                  </div>
                  {(canContinue || !awaitingReview) && (
                    <Button
                      onClick={startVerification}
                      disabled={isStarting || !isPersonaReady}
                      size="lg"
                      className="w-full"
                    >
                      {isStarting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Opening Persona...
                        </>
                      ) : !isPersonaReady ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Preparing verification...
                        </>
                      ) : (
                        'Continue with Persona'
                      )}
                    </Button>
                  )}
                  {awaitingReview && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void fetchStatus()}
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh status
                    </Button>
                  )}
                </div>
              )}

              {status === 'failed' && (
                <div className="text-center space-y-5">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                    <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                      Could not verify
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Try again or contact support if this keeps happening.
                    </p>
                  </div>
                  <Button onClick={retryVerification} disabled={isStarting || !isPersonaReady} className="w-full">
                    <RefreshCw className={cn('h-4 w-4 mr-2', (isStarting || !isPersonaReady) && 'animate-spin')} />
                    {isStarting ? 'Starting...' : !isPersonaReady ? 'Preparing verification...' : 'Retry verification'}
                  </Button>
                </div>
              )}

              {status === 'unverified' && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
                      <Shield className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                        Verify with Persona
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
                        Persona is a trusted identity check used by OpenAI, LinkedIn, Reddit, DoorDash,
                        and Coursera. Domu Match does not keep your ID photos after the check — we only
                        store that you passed.
                      </p>
                    </div>
                  </div>

                  <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
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
                            window.location.href = '/dashboard'
                          } else {
                            setError(data.message || 'No verified record found.')
                          }
                        } catch (e) {
                          setError('Failed to sync. Please try again.')
                        }
                      }}
                      className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
                    >
                      Sync my verification status
                    </button>
                  </p>

                  <Button
                    onClick={startVerification}
                    disabled={isStarting || !isPersonaReady}
                    size="lg"
                    className="w-full"
                  >
                    {isStarting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Starting...
                      </>
                    ) : !isPersonaReady ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Preparing verification...
                      </>
                    ) : (
                      'Continue with Persona'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeInUp}>
          <Card className={cn(verifyCardClass, 'border-zinc-200/80 dark:border-white/10')}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-2">
                    Privacy and security
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Verification is handled by Persona, our trusted partner, in line with GDPR and Dutch privacy
                    rules. We do not store your raw documents; Persona retains verification data under their policy.
                    Your information is encrypted and used only for identity verification.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  )
}
