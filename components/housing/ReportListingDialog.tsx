// Report Listing Dialog Component
// Dialog for reporting inappropriate or problematic listings

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Flag, AlertTriangle } from 'lucide-react'

interface ReportListingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listingId: string
  listingTitle: string
}

const REPORT_REASONS = [
  { value: 'inaccurate_info', label: 'Inaccurate information' },
  { value: 'scam', label: 'Scam or fraudulent listing' },
  { value: 'discriminatory', label: 'Discriminatory content' },
  { value: 'already_rented', label: 'Already rented/unavailable' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'spam', label: 'Spam or duplicate' },
  { value: 'other', label: 'Other' }
]

export function ReportListingDialog({
  open,
  onOpenChange,
  listingId,
  listingTitle
}: ReportListingDialogProps) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!reason || !details.trim()) return

    setIsLoading(true)
    try {
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      const response = await fetchWithCSRF(`/api/housing/listings/${listingId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason,
          details: details.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit report')
      }

      // Success - close dialog and show toast
      onOpenChange(false)
      setReason('')
      setDetails('')
      
      // TODO: Show success toast
      console.log('Report submitted successfully')
    } catch (error) {
      console.error('Failed to submit report:', error)
      // TODO: Show error toast
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false)
      setReason('')
      setDetails('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-600" />
            Report Listing
          </DialogTitle>
          <DialogDescription>
            Help us keep the platform safe by reporting this listing: <strong>{listingTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Reason selection */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for reporting</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <Label htmlFor="details">Additional details (required)</Label>
            <Textarea
              id="details"
              placeholder="Please provide specific details about why you're reporting this listing..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="text-xs text-gray-500">
              {details.length}/500 characters
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Important:</p>
                <p>False reports may result in account restrictions. Please only report listings that violate our terms of service.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !reason || !details.trim()}
            className="flex-1"
          >
            {isLoading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
