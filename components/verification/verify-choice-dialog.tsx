'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Camera,
  GraduationCap,
  IdCard,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { ID_VERIFICATION_PRIVACY_HELP_HREF } from '@/lib/verification/privacy-help'
import { AcademicVerificationGate } from '@/app/(components)/academic-verification-gate'
import { cn } from '@/lib/utils'

type PersonaClient = {
  open: () => void
  close: () => void
}

type PersonaNamespace = {
  Client: new (config: {
    templateId?: string
    inquiryId?: string
    sessionToken?: string
    environmentId: string
    referenceId?: string
    onReady: () => void
    onComplete: (data: { inquiryId: string; status: string }) => void
    onCancel?: () => void
    onError?: (error: unknown) => void
  }) => PersonaClient
}

function getPersona(): PersonaNamespace | undefined {
  return (window as Window & { Persona?: PersonaNamespace }).Persona
}

type Step = 'choice' | 'university' | 'persona'

type VerifyChoiceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  /** Called after skip is recorded, or after successful verification */
  onContinue: (result: 'skipped' | 'verified_uni' | 'verified_persona') => void
}

async function postNudge(
  action: 'shown' | 'skipped' | 'verified_uni' | 'verified_persona'
) {
  await fetchWithCSRF('/api/verification/nudge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  })
}

/**
 * Soft-nudge dialog on match accept: university email, Persona ID, or skip.
 * Cadence is recorded server-side via /api/verification/nudge.
 */
export function VerifyChoiceDialog({
  open,
  onOpenChange,
  userId,
  onContinue,
}: VerifyChoiceDialogProps) {
  const [step, setStep] = useState<Step>('choice')
  const [starting, setStarting] = useState(false)
  const [skipping, setSkipping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const shownRecordedRef = useRef(false)
  const continuedRef = useRef(false)
  const clientRef = useRef<PersonaClient | null>(null)
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    if (!open) {
      setStep('choice')
      setError(null)
      setStarting(false)
      setSkipping(false)
      // Closing without Skip/Verify still advances cadence so accept isn't spammed
      if (shownRecordedRef.current && !continuedRef.current) {
        void postNudge('skipped').catch(() => undefined)
      }
      shownRecordedRef.current = false
      continuedRef.current = false
      return
    }
    if (shownRecordedRef.current) return
    shownRecordedRef.current = true
    continuedRef.current = false
    void postNudge('shown').catch(() => {
      // Non-fatal: skip still works; next GET may re-prompt
    })
  }, [open])

  const loadScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (getPersona()?.Client) {
        resolve()
        return
      }
      if (scriptLoadedRef.current) {
        const wait = setInterval(() => {
          if (getPersona()?.Client) {
            clearInterval(wait)
            resolve()
          }
        }, 100)
        setTimeout(() => {
          clearInterval(wait)
          reject(new Error('Persona script timeout'))
        }, 10000)
        return
      }
      const existing = document.querySelector('script[src*="withpersona.com"]')
      if (existing) {
        scriptLoadedRef.current = true
        existing.addEventListener('load', () => resolve())
        return
      }
      const script = document.createElement('script')
      script.src = 'https://cdn.withpersona.com/dist/persona-v5.1.2.js'
      script.async = true
      script.onload = () => {
        scriptLoadedRef.current = true
        resolve()
      }
      script.onerror = () => reject(new Error('Failed to load Persona'))
      document.body.appendChild(script)
    })
  }, [])

  const handleSkip = useCallback(async () => {
    setSkipping(true)
    setError(null)
    try {
      continuedRef.current = true
      await postNudge('skipped')
      onOpenChange(false)
      onContinue('skipped')
    } catch {
      setError('Could not save your choice. Please try again.')
    } finally {
      setSkipping(false)
    }
  }, [onContinue, onOpenChange])

  const handleUniversityVerified = useCallback(async () => {
    continuedRef.current = true
    try {
      await postNudge('verified_uni')
    } catch {
      // still continue — attach already succeeded
    }
    onOpenChange(false)
    onContinue('verified_uni')
  }, [onContinue, onOpenChange])

  const startPersona = useCallback(async () => {
    setStarting(true)
    setError(null)
    setStep('persona')
    try {
      const environmentId = process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID
      if (!environmentId) {
        throw new Error('Verification is not configured')
      }

      const startRes = await fetchWithCSRF('/api/verification/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const startData = await startRes.json().catch(() => ({}))
      if (!startRes.ok) {
        throw new Error(
          startData?.error ||
            'Could not start verification. Complete your name and date of birth first.'
        )
      }

      if (startData.status === 'verified') {
        continuedRef.current = true
        await postNudge('verified_persona').catch(() => undefined)
        onOpenChange(false)
        onContinue('verified_persona')
        return
      }

      const inquiryId = startData.inquiryId || startData.sessionId
      if (!inquiryId) {
        throw new Error('Could not create verification session')
      }

      await loadScript()
      const Persona = getPersona()
      if (!Persona?.Client) {
        throw new Error('Persona is unavailable')
      }

      // Closing the dialog to open Persona must not count as a skip
      continuedRef.current = true

      let client: PersonaClient | null = null
      client = new Persona.Client({
        environmentId,
        inquiryId,
        sessionToken: startData.clientToken,
        referenceId: userId,
        onReady: () => {
          setStarting(false)
          onOpenChange(false)
          window.setTimeout(() => {
            client?.open()
          }, 0)
        },
        onComplete: async ({ inquiryId: completedId, status }) => {
          const passed = status === 'approved' || status === 'completed'
          try {
            const completeRes = await fetchWithCSRF('/api/verification/persona-complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ inquiryId: completedId, status }),
            })
            const completeData = await completeRes.json().catch(() => ({}))
            if (completeRes.ok && completeData.approved === false) {
              setError(
                completeData.reasons?.includes('name_mismatch')
                  ? 'The name on your ID does not match your signup name.'
                  : 'Identity verification could not be confirmed.'
              )
              setStarting(false)
              setStep('choice')
              onOpenChange(true)
              return
            }
          } catch {
            // webhook / sync may still confirm
          }
          try {
            await fetch('/api/verification/sync', {
              method: 'POST',
              credentials: 'include',
              cache: 'no-store',
            })
          } catch {
            // non-fatal
          }
          if (passed) {
            continuedRef.current = true
            await postNudge('verified_persona').catch(() => undefined)
            onContinue('verified_persona')
          } else {
            setStep('choice')
            onOpenChange(true)
            setStarting(false)
          }
        },
        onCancel: () => {
          setStarting(false)
          setStep('choice')
          onOpenChange(true)
        },
        onError: () => {
          setError('Verification failed to open. Please try again.')
          setStarting(false)
          setStep('choice')
          onOpenChange(true)
        },
      })
      clientRef.current = client
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start verification')
      setStarting(false)
      setStep('choice')
    }
  }, [loadScript, onContinue, onOpenChange, userId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-h-[90vh] gap-5 overflow-y-auto sm:gap-6',
          step === 'university' ? 'max-w-lg' : 'max-w-md'
        )}
      >
        {step === 'university' ? (
          <>
            <button
              type="button"
              onClick={() => setStep('choice')}
              className="absolute left-4 top-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back
            </button>
            <div className="pt-6">
              <AcademicVerificationGate
                onVerified={handleUniversityVerified}
                onBack={() => setStep('choice')}
              />
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="space-y-3 text-center sm:text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/15">
                <ShieldCheck
                  className="h-6 w-6 text-indigo-500 dark:text-indigo-400"
                  aria-hidden
                />
              </div>
              <div className="space-y-2">
                <DialogTitle className="text-xl">Verify your profile?</DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-text-secondary dark:text-text-secondary">
                  Optional — you can connect either way. Verified profiles show a badge to
                  others.
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setStep('university')}
                disabled={starting || skipping}
                className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-indigo-400/40 dark:hover:bg-indigo-500/10"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                  <GraduationCap className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 space-y-0.5">
                  <span className="block text-sm font-semibold text-slate-900 dark:text-slate-50">
                    University email
                  </span>
                  <span className="block text-xs leading-snug text-slate-600 dark:text-slate-300">
                    Confirm a .edu / .nl email with a code. Unlocks the verified badge.
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => void startPersona()}
                disabled={starting || skipping}
                className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-indigo-400/40 dark:hover:bg-indigo-500/10"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                  {starting ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <IdCard className="h-4 w-4" aria-hidden />
                  )}
                </span>
                <span className="min-w-0 space-y-0.5">
                  <span className="block text-sm font-semibold text-slate-900 dark:text-slate-50">
                    ID check
                  </span>
                  <span className="block text-xs leading-snug text-slate-600 dark:text-slate-300">
                    Quick selfie + government ID. Domu doesn&apos;t keep your ID photos.
                    Unlocks the verified badge.
                  </span>
                </span>
              </button>

              <div className="flex items-start gap-2 rounded-xl bg-muted/40 px-3 py-2.5 text-xs text-text-muted dark:bg-muted/20">
                <Camera className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <p>
                  ID check is powered by Persona.{' '}
                  <Link
                    href={ID_VERIFICATION_PRIVACY_HELP_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    Privacy details
                  </Link>
                </p>
              </div>
            </div>

            {error && (
              <p className="text-center text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}

            <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => void handleSkip()}
                disabled={starting || skipping}
              >
                {skipping ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Continuing…
                  </>
                ) : (
                  'Skip for now'
                )}
              </Button>
              <p className="text-center text-[11px] leading-relaxed text-text-muted">
                Continue without a badge. We&apos;ll remind you later.
              </p>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
