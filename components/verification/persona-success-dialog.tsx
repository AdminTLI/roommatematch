'use client'

import { useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CenterBurstConfetti } from '@/components/celebration/center-burst-confetti'
import { Check, Loader2 } from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

type PersonaSuccessDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called after the celebrate CTA is saved to the DB (one-time). */
  onConfirmed: () => void
}

/**
 * Congrats dialog after a successful Persona ID check.
 * Confetti bursts from the dialog center (same style as module completion).
 * Closing via "Let's go" persists `persona_celebration_seen_at` so it never shows again.
 */
export function PersonaSuccessDialog({
  open,
  onOpenChange,
  onConfirmed,
}: PersonaSuccessDialogProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)

  const handleContinue = async () => {
    if (saving) return
    setSaving(true)
    try {
      await fetchWithCSRF('/api/verification/persona-celebration-seen', {
        method: 'POST',
      })
    } catch {
      // Still dismiss locally; next load may re-show until persist succeeds
    }
    setSaving(false)
    onOpenChange(false)
    onConfirmed()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Only the CTA dismisses (and records) this one-time celebration.
        if (!next) return
        onOpenChange(next)
      }}
    >
      <DialogContent
        className="max-w-md overflow-visible border-0 bg-transparent p-0 shadow-none sm:p-0 [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <CenterBurstConfetti
          originRef={cardRef}
          active={open}
          className="pointer-events-none fixed inset-0 z-[60]"
        />

        <div
          ref={cardRef}
          className="relative z-[70] rounded-2xl border border-border-subtle bg-card p-6 text-center shadow-elev-4 sm:p-8"
        >
          <DialogHeader className="space-y-3 text-center sm:text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]">
              <Check className="h-6 w-6" strokeWidth={2.75} aria-hidden />
            </div>
            <DialogTitle className="text-xl sm:text-2xl">You&apos;re verified. Nice one!</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-text-secondary dark:text-text-secondary">
              Congrats, your ID check passed. You can now use Domu Match fully: connect with
              matches, chat, and get the most out of the platform.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 sm:justify-center">
            <Button
              type="button"
              className="w-full sm:w-auto sm:min-w-[160px]"
              onClick={() => void handleContinue()}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Let's go"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
