'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { User } from '@supabase/supabase-js'

interface DealBreakersStepProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  user: User
}

export function DealBreakersStep({ data, onChange, user }: DealBreakersStepProps) {
  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    const currentArray = data[field] || []
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter((item: string) => item !== value)
    
    onChange({
      ...data,
      [field]: newArray
    })
  }

  return (
    <div className="space-y-8">
      {/* Absolute Deal Breakers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Absolute Deal Breakers</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          These are things that would make you not want to live with someone.
        </p>
        
        <div className="space-y-3">
          <Label>Select your absolute deal breakers: *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Smoking indoors', 'Having pets', 'Loud parties frequently',
              'Very messy living', 'Incompatible sleep schedule',
              'Very different noise tolerance', 'Unwilling to clean',
              'Different smoking preferences', 'Very different social needs',
              'Incompatible study habits', 'Different cleanliness standards',
              'Unwilling to communicate', 'Very different values'
            ].map((dealbreaker) => (
              <div key={dealbreaker} className="flex items-center space-x-2">
                <Checkbox
                  id={`dealbreaker_${dealbreaker}`}
                  checked={(data.deal_breakers || []).includes(dealbreaker)}
                  onCheckedChange={(checked) => 
                    handleArrayChange('deal_breakers', dealbreaker, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`dealbreaker_${dealbreaker}`}
                  className="text-sm font-normal"
                >
                  {dealbreaker}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Important Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Important Preferences</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          These are things that would strongly influence your decision but aren't absolute deal breakers.
        </p>
        
        <div className="space-y-2">
          <Label>How important is it that your roommate shares your study schedule? *</Label>
          <Select 
            value={data.study_schedule_importance || ''} 
            onValueChange={(value) => onChange({...data, study_schedule_importance: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select importance level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="very_important">Very important</SelectItem>
              <SelectItem value="somewhat_important">Somewhat important</SelectItem>
              <SelectItem value="not_important">Not important</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>How important is it that your roommate has similar social preferences? *</Label>
          <Select 
            value={data.social_importance || ''} 
            onValueChange={(value) => onChange({...data, social_importance: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select importance level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="very_important">Very important</SelectItem>
              <SelectItem value="somewhat_important">Somewhat important</SelectItem>
              <SelectItem value="not_important">Not important</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Additional Requirements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Additional Requirements</h3>
        
        <div className="space-y-2">
          <Label htmlFor="additional_requirements">Any other important requirements or preferences?</Label>
          <Textarea
            id="additional_requirements"
            placeholder="e.g., Must be vegetarian, prefer morning people, need quiet study environment..."
            value={data.additional_requirements || ''}
            onChange={(e) => onChange({...data, additional_requirements: e.target.value})}
            rows={4}
          />
          <p className="text-sm text-gray-500">
            Optional: Any other things that are important to you in a living situation.
          </p>
        </div>
      </div>

      {/* Flexibility */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Flexibility</h3>
        
        <div className="space-y-2">
          <Label>How flexible are you overall? *</Label>
          <Select 
            value={data.overall_flexibility || ''} 
            onValueChange={(value) => onChange({...data, overall_flexibility: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select flexibility level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="very_flexible">Very flexible - I can adapt to most situations</SelectItem>
              <SelectItem value="somewhat_flexible">Somewhat flexible - I can adapt within reason</SelectItem>
              <SelectItem value="not_very_flexible">Not very flexible - I have strong preferences</SelectItem>
              <SelectItem value="inflexible">Inflexible - I need things to be a certain way</SelectItem>
            </SelectContent>
          </Select>
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
