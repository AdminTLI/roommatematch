'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Camera, IdCard, Loader2, ShieldCheck } from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

type PersonaClient = {
  open: () => void
  close: () => void
}

type PersonaNamespace = {
  Client: new (config: {
    templateId: string
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

type PersonaTrustDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onVerified: () => void
}

/**
 * Short trust explainer before opening the Persona widget.
 * Domu Match does not keep ID documents after the check.
 */
export function PersonaTrustDialog({
  open,
  onOpenChange,
  userId,
  onVerified,
}: PersonaTrustDialogProps) {
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const clientRef = useRef<{ open: () => void; close: () => void } | null>(null)
  const scriptLoadedRef = useRef(false)

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

  const startVerification = useCallback(async () => {
    setStarting(true)
    setError(null)
    try {
      const templateId = process.env.NEXT_PUBLIC_PERSONA_TEMPLATE_ID
      const environmentId = process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID
      if (!templateId || !environmentId) {
        throw new Error('Verification is not configured')
      }

      await loadScript()
      const Persona = getPersona()
      if (!Persona?.Client) {
        throw new Error('Persona is unavailable')
      }

      clientRef.current = new Persona.Client({
        templateId,
        environmentId,
        referenceId: userId,
        onReady: () => {
          // Close our dialog first so its overlay/focus trap does not block Persona.
          setStarting(false)
          onOpenChange(false)
          window.setTimeout(() => {
            clientRef.current?.open()
          }, 0)
        },
        onComplete: async ({ inquiryId, status }) => {
          const passed = status === 'approved' || status === 'completed'
          try {
            await fetchWithCSRF('/api/verification/persona-complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ inquiryId, status }),
            })
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
            onVerified()
          }
        },
        onCancel: () => {
          setStarting(false)
        },
        onError: () => {
          setError('Verification failed to open. Please try again.')
          setStarting(false)
        },
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start verification')
      setStarting(false)
    }
  }, [loadScript, onOpenChange, onVerified, userId])

  useEffect(() => {
    if (!open) {
      setError(null)
      setStarting(false)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-5 sm:gap-6">
        <DialogHeader className="space-y-3 text-center sm:text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/15">
            <ShieldCheck className="h-6 w-6 text-indigo-500 dark:text-indigo-400" aria-hidden />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-xl">Quick check before you connect</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-text-secondary dark:text-text-secondary">
              Before you message matches, we need a quick ID check. It helps keep roommate matching
              safer for everyone on campus.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-3 rounded-2xl border border-border-subtle bg-muted/40 px-4 py-3.5 dark:bg-muted/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            What you&apos;ll do
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-text-primary dark:text-text-primary">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                <Camera className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="leading-snug pt-1">Take a quick selfie</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-text-primary dark:text-text-primary">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                <IdCard className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="leading-snug pt-1">Show a government ID (passport, driver&apos;s licence, etc.)</span>
            </li>
          </ul>
        </div>

        <p className="text-center text-xs leading-relaxed text-text-muted">
          Powered by Persona, the same kind of ID check LinkedIn and Coursera use. We never keep
          your ID photos; we only store that you passed.
        </p>

        {error && (
          <p className="text-center text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        <DialogFooter className="gap-2 sm:justify-stretch sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="sm:flex-1"
            onClick={() => onOpenChange(false)}
            disabled={starting}
          >
            Not now
          </Button>
          <Button
            type="button"
            className="sm:flex-1"
            onClick={startVerification}
            disabled={starting}
          >
            {starting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opening…
              </>
            ) : (
              "Let's go"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
