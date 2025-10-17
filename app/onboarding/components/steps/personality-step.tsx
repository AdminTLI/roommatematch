'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { User } from '@supabase/supabase-js'

interface PersonalityStepProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  user: User
}

export function PersonalityStep({ data, onChange, user }: PersonalityStepProps) {
  const handleChange = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    })
  }

  return (
    <div className="space-y-8">
      {/* Communication Style */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Communication Style</h3>
        
        <div className="space-y-3">
          <Label>How do you prefer to communicate issues? *</Label>
          <Select 
            value={data.conflict_resolution || ''} 
            onValueChange={(value) => handleChange('conflict_resolution', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select communication style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="direct">Direct and upfront</SelectItem>
              <SelectItem value="diplomatic">Diplomatic and gentle</SelectItem>
              <SelectItem value="written">Written messages</SelectItem>
              <SelectItem value="group_discussion">Group discussion</SelectItem>
              <SelectItem value="flexible">Flexible approach</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>How organized are you? *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Very disorganized</span>
              <span className="text-sm">Very organized</span>
            </div>
            <Slider
              value={[data.organization_level || 5]}
              onValueChange={(value) => handleChange('organization_level', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.organization_level ? `${data.organization_level}/10` : '5/10'}
            </div>
          </div>
        </div>
      </div>

      {/* Personality Traits */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Personality Traits</h3>
        
        <div className="space-y-3">
          <Label>How spontaneous are you? *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Very planned</span>
              <span className="text-sm">Very spontaneous</span>
            </div>
            <Slider
              value={[data.spontaneity_level || 5]}
              onValueChange={(value) => handleChange('spontaneity_level', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.spontaneity_level ? `${data.spontaneity_level}/10` : '5/10'}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>How much do you value personal space? *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Love company</span>
              <span className="text-sm">Need lots of space</span>
            </div>
            <Slider
              value={[data.personal_space_need || 5]}
              onValueChange={(value) => handleChange('personal_space_need', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.personal_space_need ? `${data.personal_space_need}/10` : '5/10'}
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Values & Priorities</h3>
        
        <div className="space-y-2">
          <Label>What's most important to you in a living situation? *</Label>
          <Select 
            value={data.living_priority || ''} 
            onValueChange={(value) => handleChange('living_priority', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select top priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="peace_quiet">Peace and quiet</SelectItem>
              <SelectItem value="social_connection">Social connection</SelectItem>
              <SelectItem value="academic_focus">Academic focus</SelectItem>
              <SelectItem value="independence">Independence</SelectItem>
              <SelectItem value="shared_responsibilities">Shared responsibilities</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>How important is having similar values? *</Label>
          <Select 
            value={data.values_importance || ''} 
            onValueChange={(value) => handleChange('values_importance', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select importance level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="very_important">Very important</SelectItem>
              <SelectItem value="somewhat_important">Somewhat important</SelectItem>
              <SelectItem value="not_important">Not very important</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
