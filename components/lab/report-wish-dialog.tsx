'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { showErrorToast, showSuccessToast } from '@/lib/toast'
import {
  LAB_REPORT_CATEGORIES,
  LAB_REPORT_CATEGORY_LABELS,
  type LabReportCategory,
} from '@/lib/lab/constants'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const FIELD_CLASS =
  'w-full rounded-xl border border-slate-200 bg-white text-sm text-[#0F172A] shadow-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 '

interface ReportWishDialogProps {
  wishId: string | null
  wishTitle?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportWishDialog({
  wishId,
  wishTitle,
  open,
  onOpenChange,
}: ReportWishDialogProps) {
  const [category, setCategory] = useState<LabReportCategory | ''>('')
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setCategory('')
      setDetails('')
      setIsSubmitting(false)
    }
  }, [open])

  const submit = async () => {
    if (!wishId || !category) return

    setIsSubmitting(true)
    try {
      const res = await fetchWithCSRF(`/api/lab/wishes/${wishId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          details: details.trim() || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Report failed')
      }
      showSuccessToast('Report submitted. Thank you.')
      onOpenChange(false)
    } catch (err) {
      showErrorToast(
        err instanceof Error ? err.message : 'Could not submit report'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report this wish</DialogTitle>
          <DialogDescription>
            {wishTitle
              ? `Tell us what is wrong with “${wishTitle}”.`
              : 'Tell us what is wrong with this wish.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="lab-report-category"
              className="text-sm font-semibold text-[#334155] dark:text-slate-300"
            >
              What are you reporting?
            </Label>
            <Select
              value={category}
              onValueChange={value => setCategory(value as LabReportCategory)}
            >
              <SelectTrigger
                id="lab-report-category"
                className={cn(
                  FIELD_CLASS,
                  'h-11',
                  '[&>span]:text-inherit [&_span]:text-inherit',
                  'dark:[&>span]:!text-slate-50 dark:[&_span]:!text-slate-50',
                  '[&>span[data-placeholder]]:text-slate-500 dark:[&>span[data-placeholder]]:!text-slate-400',
                  'dark:[&_svg]:text-slate-300'
                )}
              >
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {LAB_REPORT_CATEGORIES.map(key => (
                  <SelectItem key={key} value={key}>
                    {LAB_REPORT_CATEGORY_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="lab-report-details"
              className="text-sm font-semibold text-[#334155] dark:text-slate-300"
            >
              More details{' '}
              <span className="font-normal text-slate-500">(optional)</span>
            </Label>
            <Textarea
              id="lab-report-details"
              rows={3}
              maxLength={500}
              placeholder="Add anything else that would help us review this report..."
              value={details}
              onChange={e => setDetails(e.target.value)}
              className={cn(FIELD_CLASS, 'min-h-[96px] resize-y')}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {details.length}/500
            </p>
          </div>
        </div>

        <DialogFooter className="gap-4 sm:gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={!category || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit report'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
