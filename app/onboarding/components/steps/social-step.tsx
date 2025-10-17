'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { User } from '@supabase/supabase-js'

interface SocialStepProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  user: User
}

export function SocialStep({ data, onChange, user }: SocialStepProps) {
  const handleChange = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    })
  }

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
      {/* Social Level */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Social Preferences</h3>
        
        <div className="space-y-3">
          <Label>How social are you? *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Very introverted</span>
              <span className="text-sm">Very extroverted</span>
            </div>
            <Slider
              value={[data.social_level || 5]}
              onValueChange={(value) => handleChange('social_level', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.social_level ? `${data.social_level}/10` : '5/10'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>How often do you have guests over? *</Label>
          <Select 
            value={data.guest_frequency || ''} 
            onValueChange={(value) => handleChange('guest_frequency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select guest frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="rarely">Rarely (once a month)</SelectItem>
              <SelectItem value="occasionally">Occasionally (1-2 times a week)</SelectItem>
              <SelectItem value="frequently">Frequently (3+ times a week)</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activities */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Activities & Interests</h3>
        
        <div className="space-y-3">
          <Label>What activities do you enjoy? (Select all that apply)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              'Sports/Fitness', 'Music', 'Gaming', 'Reading', 'Movies/TV',
              'Cooking', 'Art/Creative', 'Travel', 'Outdoor activities',
              'Parties/Social events', 'Study groups', 'Volunteering'
            ].map((activity) => (
              <div key={activity} className="flex items-center space-x-2">
                <Checkbox
                  id={`activity_${activity}`}
                  checked={(data.activities || []).includes(activity)}
                  onCheckedChange={(checked) => 
                    handleArrayChange('activities', activity, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`activity_${activity}`}
                  className="text-sm font-normal"
                >
                  {activity}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Noise Level */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Noise & Environment</h3>
        
        <div className="space-y-3">
          <Label>What noise level do you prefer? *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Very quiet</span>
              <span className="text-sm">Lively/noisy</span>
            </div>
            <Slider
              value={[data.noise_preference || 5]}
              onValueChange={(value) => handleChange('noise_preference', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.noise_preference ? `${data.noise_preference}/10` : '5/10'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Music preference when studying</Label>
          <Select 
            value={data.study_music || ''} 
            onValueChange={(value) => handleChange('study_music', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select music preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="silence">Complete silence</SelectItem>
              <SelectItem value="instrumental">Instrumental music only</SelectItem>
              <SelectItem value="quiet_music">Quiet music with vocals</SelectItem>
              <SelectItem value="any_music">Any music is fine</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Shared Spaces */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Shared Spaces</h3>
        
        <div className="space-y-3">
          <Label>How do you prefer to use shared spaces? *</Label>
          <Select 
            value={data.shared_space_usage || ''} 
            onValueChange={(value) => handleChange('shared_space_usage', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select shared space preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minimal">Minimal use (mostly in my room)</SelectItem>
              <SelectItem value="moderate">Moderate use (kitchen, living room)</SelectItem>
              <SelectItem value="frequent">Frequent use (love shared spaces)</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>How do you handle shared expenses? *</Label>
          <Select 
            value={data.shared_expenses || ''} 
            onValueChange={(value) => handleChange('shared_expenses', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select expense sharing preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="split_everything">Split everything equally</SelectItem>
              <SelectItem value="split_essentials">Split essentials only</SelectItem>
              <SelectItem value="separate">Keep most things separate</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
