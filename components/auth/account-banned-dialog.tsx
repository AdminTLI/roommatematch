'use client'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ShieldOff, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const SUPPORT_APPEAL_EMAIL = 'contact@domumatch.com'

type AccountBannedDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When true, primary CTA navigates home */
  goHomeOnClose?: boolean
}

/**
 * Shown when signup/sign-in is blocked due to a ban denylist hit or suspended account.
 * Copy is intentionally generic — no ban reason or matched attribute is disclosed.
 */
export function AccountBannedDialog({
  open,
  onOpenChange,
  goHomeOnClose = true,
}: AccountBannedDialogProps) {
  const router = useRouter()

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next && goHomeOnClose) {
      router.push('/')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'max-w-md gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0',
          'shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/80',
          'dark:bg-slate-800 dark:shadow-black/50 dark:ring-slate-700',
          '[&>button]:hidden'
        )}
        aria-describedby="account-banned-description"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -left-16 -top-16 h-36 w-36 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-500/15" />
          <div className="absolute -bottom-14 -right-12 h-32 w-32 rounded-full bg-indigo-100/40 blur-3xl dark:bg-indigo-400/10" />
        </div>

        <div className="relative z-10">
          <DialogHeader className="border-b border-slate-100 px-5 py-4 text-left dark:border-slate-700">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#6366F1] ring-1 ring-indigo-200/80 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-800/80">
                <ShieldOff className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Access restricted
                </p>
                <DialogTitle className="text-base font-extrabold leading-tight tracking-tight text-[#0F172A] dark:text-slate-50">
                  Account not allowed
                </DialogTitle>
              </div>
              <DialogClose
                type="button"
                aria-label="Close"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50 hover:text-[#0F172A] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-50"
              >
                <X className="h-4 w-4" strokeWidth={2.25} />
              </DialogClose>
            </div>
          </DialogHeader>

          <div className="space-y-3 px-5 py-4">
            <DialogDescription
              id="account-banned-description"
              className="text-left text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300"
            >
              This signup or sign-in attempt is associated with an account that was banned for
              violating Domu Match&apos;s Terms of Service, Community Guidelines, and/or Privacy
              Policy. You cannot create a new account with these details.
            </DialogDescription>
            <p className="text-left text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
              If you believe this was a mistake, you can appeal by emailing{' '}
              <a
                href={`mailto:${SUPPORT_APPEAL_EMAIL}`}
                className="font-semibold text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
              >
                {SUPPORT_APPEAL_EMAIL}
              </a>
              .
            </p>
          </div>

          <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] transition-all hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              Go to homepage
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
