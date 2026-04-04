'use client'

import { useState, useCallback } from 'react'
import { Flag } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { showSuccessToast, showErrorToast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { CHAT_REPORT_CATEGORIES, type ChatReportCategory } from '@/lib/chat/report-categories'

const glassPanel =
  'rounded-2xl border border-white/40 bg-white/55 shadow-lg backdrop-blur-xl dark:border-white/15 dark:bg-zinc-900/55'

export interface ReportUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chatId: string
  targetUserId: string
  /** If set, must match the reported message sender; used for report context. */
  messageId?: string | null
  targetDisplayName: string
  /** "message" = bubble flow; "user" = header menu */
  variant?: 'message' | 'user'
  onSubmitted?: () => void
}

export function ReportUserDialog({
  open,
  onOpenChange,
  chatId,
  targetUserId,
  messageId,
  targetDisplayName,
  variant = 'user',
  onSubmitted,
}: ReportUserDialogProps) {
  const [category, setCategory] = useState<ChatReportCategory | ''>('')
  const [details, setDetails] = useState('')
  const [consent, setConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reset = useCallback(() => {
    setCategory('')
    setDetails('')
    setConsent(false)
  }, [])

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleSubmit = async () => {
    if (!category) {
      showErrorToast('Select a reason', 'Please choose why you are reporting.')
      return
    }
    if (!consent) {
      showErrorToast('Consent required', 'Please confirm that moderators may review recent messages.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetchWithCSRF('/api/chat/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_user_id: targetUserId,
          chat_id: chatId,
          message_id: messageId || undefined,
          category,
          details: details.trim() || undefined,
          consent_read_recent_messages: true,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit report')
      }

      showSuccessToast('Report submitted', 'Thank you — our team will review this.')
      handleOpenChange(false)
      onSubmitted?.()
    } catch (e: unknown) {
      const err = e as { message?: string }
      showErrorToast('Could not submit report', err.message || 'Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'max-h-[min(90dvh,720px)] overflow-y-auto border border-white/50 bg-white/70 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/75 sm:max-w-lg',
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Flag className="h-5 w-5 text-red-600 dark:text-red-400" />
            {variant === 'message' ? 'Report message' : 'Report user'}
          </DialogTitle>
          <DialogDescription className="text-left text-zinc-600 dark:text-zinc-400">
            {variant === 'message'
              ? `You are reporting a message from ${targetDisplayName}.`
              : `You are reporting ${targetDisplayName}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Reason</Label>
            <div className="grid max-h-[220px] gap-2 overflow-y-auto pr-1 sm:max-h-[280px]">
              {CHAT_REPORT_CATEGORIES.map((opt) => {
                const selected = category === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCategory(opt.value)}
                    className={cn(
                      'w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-all',
                      glassPanel,
                      selected
                        ? 'border-purple-400/80 bg-purple-500/15 ring-2 ring-purple-500/40 dark:border-purple-400/50 dark:bg-purple-500/20'
                        : 'hover:bg-white/70 dark:hover:bg-zinc-800/60',
                    )}
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className={cn('space-y-2 p-3', glassPanel)}>
            <Label htmlFor="report-details" className="text-sm text-zinc-800 dark:text-zinc-200">
              Additional details <span className="font-normal text-zinc-500">(optional)</span>
            </Label>
            <Textarea
              id="report-details"
              placeholder="Anything else we should know…"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              maxLength={500}
              className="resize-none border-white/50 bg-white/50 dark:border-white/10 dark:bg-zinc-950/40"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{details.length}/500</p>
          </div>

          <div
            className={cn(
              'flex gap-3 p-3',
              glassPanel,
              !consent && 'border-amber-200/60 dark:border-amber-500/25',
            )}
          >
            <Checkbox
              id="report-consent"
              checked={consent}
              onCheckedChange={(v) => setConsent(v === true)}
              className="mt-0.5 border-zinc-400 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            />
            <label htmlFor="report-consent" className="cursor-pointer text-sm leading-snug text-zinc-800 dark:text-zinc-200">
              I agree that Domu Match moderators may read the <strong>10 most recent messages</strong> in this
              chat — including my messages and those from others — to review this report. This consent is stored
              with my report.
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="backdrop-blur-sm">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !category || !consent}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
          >
            {isSubmitting ? 'Submitting…' : 'Submit report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
