'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

interface GroupFeedbackFormProps {
  chatId: string
  feedbackType: 'left' | 'reassigned' | 'discomfort'
  isOpen: boolean
  onClose: () => void
  onSubmit?: () => void
}

const categoryOptions = [
  { id: 'personality', label: 'Personality differences' },
  { id: 'schedule', label: 'Schedule conflicts' },
  { id: 'lifestyle', label: 'Lifestyle mismatches' },
  { id: 'social', label: 'Social preferences' },
  { id: 'academic', label: 'Academic differences' }
]

export function GroupFeedbackForm({
  chatId,
  feedbackType,
  isOpen,
  onClose,
  onSubmit
}: GroupFeedbackFormProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetchWithCSRF('/api/chat/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          feedback_type: feedbackType,
          reason: reason || undefined,
          category_issues: selectedCategories.length > 0 ? selectedCategories : undefined
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit feedback')
      }

      if (onSubmit) {
        onSubmit()
      }
      onClose()
      
      // Reset form
      setSelectedCategories([])
      setReason('')
    } catch (error: any) {
      console.error('Failed to submit feedback:', error)
      alert(error.message || 'Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTitle = () => {
    switch (feedbackType) {
      case 'left':
        return 'Why did you leave this group?'
      case 'reassigned':
        return 'Request Group Reassignment'
      case 'discomfort':
        return 'Report Discomfort'
      default:
        return 'Group Feedback'
    }
  }

  const getDescription = () => {
    switch (feedbackType) {
      case 'left':
        return 'Your feedback helps us improve group matching. This information is anonymized.'
      case 'reassigned':
        return 'Let us know why you\'d like to be reassigned to a different group.'
      case 'discomfort':
        return 'Please share what made you uncomfortable. We take this seriously and will review your feedback.'
      default:
        return 'Share your feedback about this group.'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Category Selection */}
          <div>
            <Label className="mb-3 block">What areas caused issues? (optional)</Label>
            <div className="space-y-2">
              {categoryOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={selectedCategories.includes(option.id)}
                    onCheckedChange={() => handleCategoryToggle(option.id)}
                  />
                  <label
                    htmlFor={option.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Reason Text */}
          <div>
            <Label htmlFor="reason">Additional details (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Share any additional context..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={1000}
              rows={4}
              className="mt-2 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {reason.length}/1000 characters
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


