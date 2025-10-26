'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { User } from '@supabase/supabase-js'

interface LifestyleStepProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  user: User
}

export function LifestyleStep({ data, onChange, user }: LifestyleStepProps) {
  const handleChange = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    })
  }

  return (
    <div className="space-y-8">
      {/* Sleep Schedule */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Sleep Schedule</h3>
        
        <div className="space-y-2">
          <Label>What time do you usually go to bed? *</Label>
          <Select 
            value={data.sleep_start || ''} 
            onValueChange={(value) => handleChange('sleep_start', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select bedtime" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">Before 10:00 PM (20:00)</SelectItem>
              <SelectItem value="21">10:00 PM - 11:00 PM (21:00)</SelectItem>
              <SelectItem value="22">11:00 PM - 12:00 AM (22:00)</SelectItem>
              <SelectItem value="23">12:00 AM - 1:00 AM (23:00)</SelectItem>
              <SelectItem value="24">1:00 AM - 2:00 AM (24:00)</SelectItem>
              <SelectItem value="1">After 2:00 AM (1:00)</SelectItem>
              <SelectItem value="2">Very late (2:00+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>What time do you usually wake up? *</Label>
          <Select 
            value={data.sleep_end || ''} 
            onValueChange={(value) => handleChange('sleep_end', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select wake time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">Before 6:00 AM</SelectItem>
              <SelectItem value="7">6:00 AM - 7:00 AM</SelectItem>
              <SelectItem value="8">7:00 AM - 8:00 AM</SelectItem>
              <SelectItem value="9">8:00 AM - 9:00 AM</SelectItem>
              <SelectItem value="10">9:00 AM - 10:00 AM</SelectItem>
              <SelectItem value="11">10:00 AM - 11:00 AM</SelectItem>
              <SelectItem value="12">After 11:00 AM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Study Habits */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Study Habits</h3>
        
        <div className="space-y-3">
          <Label>How intense is your study schedule? *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Very relaxed</span>
              <span className="text-sm">Very intense</span>
            </div>
            <Slider
              value={[data.study_intensity || 5]}
              onValueChange={(value) => handleChange('study_intensity', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.study_intensity ? `${data.study_intensity}/10` : '5/10'}
            </div>
          </div>
        </div>
      </div>

      {/* Cleanliness */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Cleanliness & Organization</h3>
        
        <div className="space-y-3">
          <Label>How clean do you keep your room? *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Very messy</span>
              <span className="text-sm">Very tidy</span>
            </div>
            <Slider
              value={[data.cleanliness_room || 5]}
              onValueChange={(value) => handleChange('cleanliness_room', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.cleanliness_room ? `${data.cleanliness_room}/10` : '5/10'}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>How clean do you keep shared spaces (kitchen, bathroom)? *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Very messy</span>
              <span className="text-sm">Very tidy</span>
            </div>
            <Slider
              value={[data.cleanliness_kitchen || 5]}
              onValueChange={(value) => handleChange('cleanliness_kitchen', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.cleanliness_kitchen ? `${data.cleanliness_kitchen}/10` : '5/10'}
            </div>
          </div>
        </div>
      </div>

      {/* Noise & Environment */}
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
              value={[data.noise_tolerance || 5]}
              onValueChange={(value) => handleChange('noise_tolerance', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.noise_tolerance ? `${data.noise_tolerance}/10` : '5/10'}
            </div>
          </div>
        </div>
      </div>

      {/* Social Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Social Preferences</h3>
        
        <div className="space-y-3">
          <Label>How often do you have guests over? *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Never</span>
              <span className="text-sm">Daily</span>
            </div>
            <Slider
              value={[data.guests_frequency || 5]}
              onValueChange={(value) => handleChange('guests_frequency', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.guests_frequency ? `${data.guests_frequency}/10` : '5/10'}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>How often do you attend or host parties? *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Never</span>
              <span className="text-sm">Very often</span>
            </div>
            <Slider
              value={[data.parties_frequency || 5]}
              onValueChange={(value) => handleChange('parties_frequency', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.parties_frequency ? `${data.parties_frequency}/10` : '5/10'}
            </div>
          </div>
        </div>
      </div>

      {/* Chores & Responsibilities */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Chores & Responsibilities</h3>
        
        <div className="space-y-3">
          <Label>How willing are you to do household chores? *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Avoid chores</span>
              <span className="text-sm">Love doing chores</span>
            </div>
            <Slider
              value={[data.chores_preference || 5]}
              onValueChange={(value) => handleChange('chores_preference', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.chores_preference ? `${data.chores_preference}/10` : '5/10'}
            </div>
          </div>
        </div>
      </div>

      {/* Lifestyle Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Lifestyle Preferences</h3>
        
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

        <div className="space-y-3">
          <Label>How comfortable are you with alcohol at home? *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">No alcohol</span>
              <span className="text-sm">Very comfortable</span>
            </div>
            <Slider
              value={[data.alcohol_at_home || 5]}
              onValueChange={(value) => handleChange('alcohol_at_home', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.alcohol_at_home ? `${data.alcohol_at_home}/10` : '5/10'}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>How comfortable are you with pets? *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Not comfortable</span>
              <span className="text-sm">Very comfortable</span>
            </div>
            <Slider
              value={[data.pets_tolerance || 5]}
              onValueChange={(value) => handleChange('pets_tolerance', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.pets_tolerance ? `${data.pets_tolerance}/10` : '5/10'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
