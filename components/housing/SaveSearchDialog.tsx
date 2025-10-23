// Save Search Dialog Component
// Dialog for saving search criteria with notifications

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FiltersState } from '@/types/housing'
import { generateSearchName } from '@/lib/housing/search-utils'

interface SaveSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: FiltersState
  onSave: () => void
}

export function SaveSearchDialog({
  open,
  onOpenChange,
  filters,
  onSave
}: SaveSearchDialogProps) {
  const [name, setName] = useState(generateSearchName(filters))
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyPush, setNotifyPush] = useState(false)
  const [frequency, setFrequency] = useState<'instant' | 'daily' | 'weekly'>('daily')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // TODO: Call API to save search
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      onSave()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save search:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Search</DialogTitle>
          <DialogDescription>
            Get notified when new listings match your criteria
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search name */}
          <div className="space-y-2">
            <Label htmlFor="searchName">Search Name</Label>
            <Input
              id="searchName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Amsterdam Studio Under €1000"
            />
          </div>

          {/* Notification preferences */}
          <div className="space-y-3">
            <Label>Notifications</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifyEmail"
                  checked={notifyEmail}
                  onCheckedChange={setNotifyEmail}
                />
                <Label htmlFor="notifyEmail" className="text-sm">
                  Email notifications
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifyPush"
                  checked={notifyPush}
                  onCheckedChange={setNotifyPush}
                />
                <Label htmlFor="notifyPush" className="text-sm">
                  Push notifications
                </Label>
              </div>
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-3">
            <Label>Frequency</Label>
            <RadioGroup value={frequency} onValueChange={(value: any) => setFrequency(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="instant" id="instant" />
                <Label htmlFor="instant" className="text-sm">Instant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily" className="text-sm">Daily digest</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly" className="text-sm">Weekly digest</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Search summary */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <div className="font-medium mb-2">Search Criteria:</div>
            <div className="space-y-1 text-gray-600">
              {filters.city && <div>• City: {filters.city}</div>}
              {filters.priceMin && <div>• Min price: €{filters.priceMin}</div>}
              {filters.priceMax && <div>• Max price: €{filters.priceMax}</div>}
              {filters.universityVerifiedOnly && <div>• University-verified only</div>}
              {filters.minCompatibility && <div>• Min compatibility: {filters.minCompatibility}%</div>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !name.trim()} className="flex-1">
            {isLoading ? 'Saving...' : 'Save Search'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
