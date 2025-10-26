'use client'

import { Label } from '@/components/ui/label'
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
      {/* Big Five Personality Traits */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Personality Traits (Big Five)</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Rate yourself on these personality dimensions. Be honest - this helps us find compatible roommates!
        </p>
        
        {/* Extraversion */}
        <div className="space-y-3">
          <Label>How outgoing and energetic are you? (Extraversion) *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Very introverted</span>
              <span className="text-sm">Very extroverted</span>
            </div>
            <Slider
              value={[data.extraversion || 5]}
              onValueChange={(value) => handleChange('extraversion', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.extraversion ? `${data.extraversion}/10` : '5/10'}
            </div>
          </div>
        </div>

        {/* Agreeableness */}
        <div className="space-y-3">
          <Label>How cooperative and compassionate are you? (Agreeableness) *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Very competitive</span>
              <span className="text-sm">Very cooperative</span>
            </div>
            <Slider
              value={[data.agreeableness || 5]}
              onValueChange={(value) => handleChange('agreeableness', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.agreeableness ? `${data.agreeableness}/10` : '5/10'}
            </div>
          </div>
        </div>

        {/* Conscientiousness */}
        <div className="space-y-3">
          <Label>How organized and dependable are you? (Conscientiousness) *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Very disorganized</span>
              <span className="text-sm">Very organized</span>
            </div>
            <Slider
              value={[data.conscientiousness || 5]}
              onValueChange={(value) => handleChange('conscientiousness', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.conscientiousness ? `${data.conscientiousness}/10` : '5/10'}
            </div>
          </div>
        </div>

        {/* Neuroticism */}
        <div className="space-y-3">
          <Label>How emotionally stable are you? (Neuroticism) *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Very stable (0)</span>
              <span className="text-sm">Very anxious (10)</span>
            </div>
            <Slider
              value={[data.neuroticism || 5]}
              onValueChange={(value) => handleChange('neuroticism', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.neuroticism ? `${data.neuroticism}/10` : '5/10'}
            </div>
          </div>
        </div>

        {/* Openness */}
        <div className="space-y-3">
          <Label>How open to new experiences are you? (Openness) *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Very traditional</span>
              <span className="text-sm">Very open</span>
            </div>
            <Slider
              value={[data.openness || 5]}
              onValueChange={(value) => handleChange('openness', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.openness ? `${data.openness}/10` : '5/10'}
            </div>
          </div>
        </div>
      </div>

      {/* Communication Style */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Communication & Conflict Resolution</h3>
        
        <div className="space-y-3">
          <Label>How do you handle conflicts? *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Avoid conflicts</span>
              <span className="text-sm">Confront directly</span>
            </div>
            <Slider
              value={[data.conflict_style || 5]}
              onValueChange={(value) => handleChange('conflict_style', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.conflict_style ? `${data.conflict_style}/10` : '5/10'}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>How do you prefer to communicate? *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Written messages</span>
              <span className="text-sm">Face-to-face</span>
            </div>
            <Slider
              value={[data.communication_preference || 5]}
              onValueChange={(value) => handleChange('communication_preference', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.communication_preference ? `${data.communication_preference}/10` : '5/10'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
