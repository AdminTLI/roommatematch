'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { X, Star, ThumbsUp, Users } from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

type SuccessStatus = 'domu_match' | 'external' | 'still_looking'
type Step = 'success' | 'nps' | 'reason'

interface EligibilityResponse {
  shouldShow?: boolean
}

export function SuccessNpsWidget() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [step, setStep] = useState<Step>('success')
  const [successStatus, setSuccessStatus] = useState<SuccessStatus | null>(null)
  const [npsScore, setNpsScore] = useState<number | null>(null)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    const checkEligibility = async () => {
      try {
        const res = await fetch('/api/surveys/platform-feedback', {
          method: 'GET',
          credentials: 'include',
        })

        if (cancelled) return

        if (!res.ok) {
          setIsVisible(false)
          return
        }

        const data = (await res.json()) as EligibilityResponse
        if (data.shouldShow) {
          setIsVisible(true)
        } else {
          setIsVisible(false)
        }
      } catch {
        if (!cancelled) {
          setIsVisible(false)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    checkEligibility()

    return () => {
      cancelled = true
    }
  }, [])

  const resetState = useCallback(() => {
    setStep('success')
    setSuccessStatus(null)
    setNpsScore(null)
    setReason('')
  }, [])

  const handleDismiss = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      // Best-effort: record a dismissed exposure, but never block dismissal
      await fetchWithCSRF('/api/surveys/platform-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success_status: successStatus ?? null,
          nps_score: npsScore ?? null,
          reason: reason || null,
          status: 'dismissed',
        }),
      }).catch(() => {
        // Ignore network / CSRF failures for dismiss; this is non-blocking
      })
    } finally {
      setIsVisible(false)
      resetState()
      setIsSubmitting(false)
    }
  }, [isSubmitting, successStatus, npsScore, reason, resetState])

  const handleSubmit = useCallback(async () => {
    if (!successStatus || npsScore === null || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetchWithCSRF('/api/surveys/platform-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success_status: successStatus,
          nps_score: npsScore,
          reason: reason || null,
          status: 'completed',
        }),
      })

      if (!res.ok) {
        // Even on failure, hide the widget to avoid blocking the user
        // Error will be visible in console for debugging.
        // eslint-disable-next-line no-console
        console.error('[SuccessNpsWidget] Failed to submit feedback', await res.json().catch(() => ({})))
      }

      setIsVisible(false)
      resetState()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[SuccessNpsWidget] Submit error', error)
      setIsVisible(false)
      resetState()
    } finally {
      setIsSubmitting(false)
    }
  }, [successStatus, npsScore, reason, isSubmitting, resetState])

  const handleSelectSuccess = (value: SuccessStatus) => {
    if (isSubmitting) return
    setSuccessStatus(value)
    setStep('nps')
  }

  const handleSelectNps = (score: number) => {
    if (isSubmitting) return
    setNpsScore(score)
    setStep('reason')
  }

  if (isLoading || !isVisible) {
    return null
  }

  const canSubmit = !!successStatus && npsScore !== null && !isSubmitting

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-background">
        <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" />
              Platform check-in
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Help us understand how Domu Match is working for you.
            </CardDescription>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="ml-2 rounded-full p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Dismiss feedback survey"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>

        <CardContent className="pt-1 pb-3 space-y-3">
          {step === 'success' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Quick check-in: Have you found a roommate yet?
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  variant={successStatus === 'domu_match' ? 'default' : 'outline'}
                  size="sm"
                  className="justify-start text-left"
                  onClick={() => handleSelectSuccess('domu_match')}
                  disabled={isSubmitting}
                >
                  <span className="mr-1">🎉</span>
                  Yes, through Domu Match!
                </Button>
                <Button
                  variant={successStatus === 'external' ? 'default' : 'outline'}
                  size="sm"
                  className="justify-start text-left"
                  onClick={() => handleSelectSuccess('external')}
                  disabled={isSubmitting}
                >
                  <span className="mr-1">🏠</span>
                  Yes, but somewhere else.
                </Button>
                <Button
                  variant={successStatus === 'still_looking' ? 'default' : 'outline'}
                  size="sm"
                  className="justify-start text-left"
                  onClick={() => handleSelectSuccess('still_looking')}
                  disabled={isSubmitting}
                >
                  <span className="mr-1">🔍</span>
                  No, still looking.
                </Button>
              </div>
            </div>
          )}

          {step === 'nps' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                How likely are you to recommend Domu Match to a fellow student?
              </p>
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span>Not likely</span>
                <span>Extremely likely</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 11 }).map((_, i) => (
                  <Button
                    key={i}
                    type="button"
                    variant={npsScore === i ? 'default' : 'outline'}
                    size="icon"
                    className="h-7 w-7 text-xs"
                    onClick={() => handleSelectNps(i)}
                    disabled={isSubmitting}
                  >
                    {i}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step === 'reason' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  How likely are you to recommend Domu Match to a fellow student?
                </p>
                {npsScore !== null && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
                    <Star className="h-3 w-3" />
                    You selected {npsScore}/10
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  What&apos;s the main reason for your score?
                </p>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Optional, but very helpful for us to improve."
                  className="text-xs"
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full flex items-center justify-center gap-1"
              >
                <ThumbsUp className="h-4 w-4" />
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

