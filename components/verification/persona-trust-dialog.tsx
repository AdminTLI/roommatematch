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
import { Camera, IdCard, Loader2, ShieldCheck } from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { ID_VERIFICATION_PRIVACY_HELP_HREF } from '@/lib/verification/privacy-help'

export { ID_VERIFICATION_PRIVACY_HELP_HREF } from '@/lib/verification/privacy-help'

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
  const clientRef = useRef<PersonaClient | null>(null)
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
        onOpenChange(false)
        onVerified()
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
      clientRef.current = client
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
      <DialogContent className="max-w-md gap-5 sm:gap-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 text-center sm:text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/15">
            <ShieldCheck className="h-6 w-6 text-indigo-500 dark:text-indigo-400" aria-hidden />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-xl">Quick check before you connect</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-text-secondary dark:text-text-secondary">
              Before you message matches, we need a quick ID check. It helps keep roommate matching
              safer for everyone on campus - real people only, fewer scams.
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
              <span className="leading-snug pt-1">
                Show a government ID (passport, driver&apos;s licence, etc.)
              </span>
            </li>
          </ul>
        </div>

        <div className="space-y-2.5 rounded-2xl border border-emerald-200/70 bg-emerald-50/50 px-4 py-3.5 dark:border-emerald-500/25 dark:bg-emerald-500/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
            Your ID stays private
          </p>
          <ul className="space-y-2 text-sm leading-snug text-text-primary dark:text-text-primary">
            <li>
              <span className="font-medium">We never keep your ID photos or selfie.</span> Persona
              runs that scan - other users never see it.
            </li>
            <li>
              We mainly store that you <span className="font-medium">passed</span>, so only real
              people can chat.
            </li>
            <li>
              Limited check details (like name/age match) are scrubbed after about{' '}
              <span className="font-medium">4 weeks</span>. That also helps stop banned people from
              coming back with a new account.
            </li>
          </ul>
          <p className="text-xs leading-relaxed text-text-muted pt-0.5">
            Not sure yet?{' '}
            <Link
              href={ID_VERIFICATION_PRIVACY_HELP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              onClick={() => onOpenChange(false)}
            >
              Read the full plain-language explanation
            </Link>{' '}
            in Help Center - then come back when you feel ready.
          </p>
        </div>

        <p className="text-center text-xs leading-relaxed text-text-muted">
          Powered by Persona - the same kind of ID check LinkedIn and Coursera use.
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
