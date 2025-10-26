'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { User } from '@supabase/supabase-js'

interface DealBreakersStepProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  user: User
}

export function DealBreakersStep({ data, onChange, user }: DealBreakersStepProps) {
  const handleChange = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    })
  }

  return (
    <div className="space-y-8">
      {/* Hard Constraints */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Hard Constraints</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          These are absolute requirements that cannot be compromised.
        </p>
        
        <div className="space-y-2">
          <Label>Do you smoke? *</Label>
          <Select 
            value={data.smoking ? 'true' : data.smoking === false ? 'false' : ''} 
            onValueChange={(value) => handleChange('smoking', value === 'true')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select smoking preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Non-smoker (prefer no smoking)</SelectItem>
              <SelectItem value="true">Smoker</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Are you okay with pets in the house? *</Label>
          <Select 
            value={data.pets_allowed ? 'true' : data.pets_allowed === false ? 'false' : ''} 
            onValueChange={(value) => handleChange('pets_allowed', value === 'true')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select pet preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">No pets (allergic/prefer none)</SelectItem>
              <SelectItem value="true">Pets are okay</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Frequency Limits */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Frequency Limits</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Set maximum acceptable frequencies for social activities.
        </p>
        
        <div className="space-y-3">
          <Label>Maximum acceptable party frequency per month (0-10) *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">No parties (0)</span>
              <span className="text-sm">Very frequent (10)</span>
            </div>
            <Slider
              value={[data.parties_max || 5]}
              onValueChange={(value) => handleChange('parties_max', value[0])}
              max={10}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.parties_max ? `${data.parties_max}/10` : '5/10'}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Maximum acceptable guest frequency per week (0-10) *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">No guests (0)</span>
              <span className="text-sm">Very frequent (10)</span>
            </div>
            <Slider
              value={[data.guests_max || 5]}
              onValueChange={(value) => handleChange('guests_max', value[0])}
              max={10}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.guests_max ? `${data.guests_max}/10` : '5/10'}
            </div>
          </div>
        </div>
      </div>

      {/* Final Note */}
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <p className="text-sm text-green-800 dark:text-green-200">
          <strong>Great job!</strong> You've completed the questionnaire. Our algorithm will use your responses 
          to find compatible roommates and explain why you're a good match.
        </p>
      </div>
    </div>
  )
}
