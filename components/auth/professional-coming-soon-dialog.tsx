'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Bell, CheckCircle2, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ProfessionalComingSoonDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfessionalComingSoonDialog({
  open,
  onOpenChange,
}: ProfessionalComingSoonDialogProps) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setEmail('')
      setSubmitted(false)
      setSubmitting(false)
    }
    onOpenChange(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) {
      toast.error('Please enter your email address')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, feature: 'professional_signup' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Something went wrong')
      }
      setSubmitted(true)
      toast.success("You're on the list. We'll email you when professionals launch.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
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
        aria-describedby="professional-waitlist-description"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -left-16 -top-16 h-36 w-36 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-500/15" />
          <div className="absolute -bottom-14 -right-12 h-32 w-32 rounded-full bg-indigo-100/40 blur-3xl dark:bg-indigo-400/10" />
        </div>

        <div className="relative z-10">
          <DialogHeader className="border-b border-slate-100 px-5 py-4 text-left dark:border-slate-700">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#6366F1] ring-1 ring-indigo-200/80 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-800/80">
                {submitted ? (
                  <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                ) : (
                  <Bell className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Coming soon
                </p>
                <DialogTitle className="text-base font-extrabold leading-tight tracking-tight text-[#0F172A] dark:text-slate-50">
                  {submitted ? "You're on the list" : 'Young professionals'}
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

          {submitted ? (
            <>
              <div className="space-y-3 px-5 py-4">
                <DialogDescription
                  id="professional-waitlist-description"
                  className="text-left text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300"
                >
                  We&apos;ll email you when young professional matching is ready.
                </DialogDescription>
              </div>
              <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] transition-all hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                >
                  Done
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 px-5 py-4">
                <DialogDescription
                  id="professional-waitlist-description"
                  className="text-left text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300"
                >
                  Young professional matching isn&apos;t available yet. Leave your email and
                  we&apos;ll notify you as soon as it launches.
                </DialogDescription>

                <div className="space-y-2">
                  <Label
                    htmlFor="professional-waitlist-email"
                    className="text-sm font-semibold text-[#0F172A] dark:text-slate-100"
                  >
                    Email
                  </Label>
                  <Input
                    id="professional-waitlist-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-11 rounded-xl border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-900"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  disabled={submitting}
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={cn(
                    'inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all',
                    !submitting
                      ? 'bg-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400'
                      : 'cursor-not-allowed bg-indigo-500/40 dark:bg-indigo-500/40'
                  )}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Saving…
                    </>
                  ) : (
                    'Notify me'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
