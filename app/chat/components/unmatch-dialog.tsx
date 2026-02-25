'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { showErrorToast, showSuccessToast } from '@/lib/toast'

type ReasonCategory =
  | 'no_house'
  | 'incompatible_lifestyle'
  | 'unresponsive'
  | 'other'

interface UnmatchDialogProps {
  isOpen: boolean
  onClose: () => void
  targetUserId: string
  targetUserName?: string
}

const REASON_OPTIONS: { id: ReasonCategory; label: string; description?: string }[] = [
  {
    id: 'no_house',
    label: "We couldn't find a house together",
  },
  {
    id: 'incompatible_lifestyle',
    label: 'Incompatible lifestyle/vibes',
  },
  {
    id: 'unresponsive',
    label: 'They were unresponsive/ghosted',
  },
  {
    id: 'other',
    label: 'Other',
  },
]

export function UnmatchDialog({
  isOpen,
  onClose,
  targetUserId,
  targetUserName,
}: UnmatchDialogProps) {
  const router = useRouter()
  const [selectedReason, setSelectedReason] = useState<ReasonCategory | ''>('')
  const [otherReason, setOtherReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetState = () => {
    setSelectedReason('')
    setOtherReason('')
    setIsSubmitting(false)
  }

  const handleClose = () => {
    if (isSubmitting) return
    resetState()
    onClose()
  }

  const handleSubmit = async () => {
    if (!targetUserId) {
      showErrorToast('Unable to unmatch', 'Missing target user.')
      return
    }

    if (!selectedReason) {
      showErrorToast('Select a reason', 'Please choose a reason for unmatching.')
      return
    }

    if (selectedReason === 'other' && !otherReason.trim()) {
      showErrorToast('Reason required', 'Please provide a short explanation.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetchWithCSRF('/api/match/unmatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId,
          reason_category: selectedReason,
          reason_text: selectedReason === 'other' ? otherReason.trim() : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to unmatch user')
      }

      showSuccessToast(
        'Unmatched',
        targetUserName
          ? `You have unmatched from ${targetUserName}. This chat has been closed for both of you.`
          : 'You have unmatched. This chat has been closed for both of you.'
      )

      resetState()
      onClose()
      router.push('/chat')
    } catch (error: any) {
      showErrorToast(
        'Failed to unmatch',
        error?.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Unmatch from this person?</DialogTitle>
          <DialogDescription>
            This will permanently remove this match from your suggestions and close the chat for both of you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Why are you unmatching with this person?
            </Label>
            <RadioGroup
              value={selectedReason}
              onValueChange={(value) => setSelectedReason(value as ReasonCategory)}
              className="space-y-2"
            >
              {REASON_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  htmlFor={`unmatch-${option.id}`}
                  className="flex items-start gap-3 rounded-lg border border-border-subtle bg-bg-surface px-3 py-2 cursor-pointer hover:bg-bg-surface-alt transition-colors"
                >
                  <RadioGroupItem
                    id={`unmatch-${option.id}`}
                    value={option.id}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-text-primary">
                      {option.label}
                    </div>
                    {option.description && (
                      <p className="text-xs text-text-muted">{option.description}</p>
                    )}
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          {selectedReason === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="unmatch-other-reason">
                Please share a short reason (required)
              </Label>
              <Textarea
                id="unmatch-other-reason"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="e.g. Different expectations than I was looking for..."
                className="resize-none"
              />
              <p className="text-xs text-text-muted">
                {otherReason.length}/500 characters
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border-subtle">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedReason || (selectedReason === 'other' && !otherReason.trim())}
          >
            {isSubmitting ? 'Unmatching...' : 'Unmatch'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

