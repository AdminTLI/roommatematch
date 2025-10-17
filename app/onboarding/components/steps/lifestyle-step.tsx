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
            value={data.bedtime || ''} 
            onValueChange={(value) => handleChange('bedtime', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select bedtime" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="before_10pm">Before 10:00 PM</SelectItem>
              <SelectItem value="10pm_11pm">10:00 PM - 11:00 PM</SelectItem>
              <SelectItem value="11pm_12am">11:00 PM - 12:00 AM</SelectItem>
              <SelectItem value="12am_1am">12:00 AM - 1:00 AM</SelectItem>
              <SelectItem value="after_1am">After 1:00 AM</SelectItem>
              <SelectItem value="varies">Varies</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>What time do you usually wake up? *</Label>
          <Select 
            value={data.wake_time || ''} 
            onValueChange={(value) => handleChange('wake_time', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select wake time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="before_6am">Before 6:00 AM</SelectItem>
              <SelectItem value="6am_7am">6:00 AM - 7:00 AM</SelectItem>
              <SelectItem value="7am_8am">7:00 AM - 8:00 AM</SelectItem>
              <SelectItem value="8am_9am">8:00 AM - 9:00 AM</SelectItem>
              <SelectItem value="9am_10am">9:00 AM - 10:00 AM</SelectItem>
              <SelectItem value="after_10am">After 10:00 AM</SelectItem>
              <SelectItem value="varies">Varies</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Study Habits */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Study Habits</h3>
        
        <div className="space-y-2">
          <Label>Where do you prefer to study? *</Label>
          <Select 
            value={data.study_location || ''} 
            onValueChange={(value) => handleChange('study_location', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select study preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home_quiet">Home (quiet environment)</SelectItem>
              <SelectItem value="home_background">Home (with background noise)</SelectItem>
              <SelectItem value="library">Library</SelectItem>
              <SelectItem value="cafe">Café</SelectItem>
              <SelectItem value="campus">On campus</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Study schedule preference</Label>
          <Select 
            value={data.study_schedule || ''} 
            onValueChange={(value) => handleChange('study_schedule', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select study schedule" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning person</SelectItem>
              <SelectItem value="afternoon">Afternoon person</SelectItem>
              <SelectItem value="evening">Evening person</SelectItem>
              <SelectItem value="night">Night owl</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cleanliness */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Cleanliness & Organization</h3>
        
        <div className="space-y-3">
          <Label>How would you describe your cleanliness level? *</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Very messy</span>
              <span className="text-sm">Very tidy</span>
            </div>
            <Slider
              value={[data.cleanliness_level || 5]}
              onValueChange={(value) => handleChange('cleanliness_level', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500">
              {data.cleanliness_level ? `${data.cleanliness_level}/10` : '5/10'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>How often do you clean shared spaces? *</Label>
          <Select 
            value={data.cleaning_frequency || ''} 
            onValueChange={(value) => handleChange('cleaning_frequency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select cleaning frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="every_other_day">Every other day</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="when_needed">When needed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lifestyle Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Lifestyle Preferences</h3>
        
        <div className="space-y-2">
          <Label>Do you smoke? *</Label>
          <Select 
            value={data.smoking_preference || ''} 
            onValueChange={(value) => handleChange('smoking_preference', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select smoking preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="non_smoker">Non-smoker (prefer no smoking)</SelectItem>
              <SelectItem value="occasional_smoker">Occasional smoker</SelectItem>
              <SelectItem value="regular_smoker">Regular smoker</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Do you have pets or want pets? *</Label>
          <Select 
            value={data.pet_preference || ''} 
            onValueChange={(value) => handleChange('pet_preference', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select pet preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no_pets">No pets (allergic/prefer none)</SelectItem>
              <SelectItem value="have_pets">I have pets</SelectItem>
              <SelectItem value="want_pets">Want pets</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Do you drink alcohol? *</Label>
          <Select 
            value={data.alcohol_preference || ''} 
            onValueChange={(value) => handleChange('alcohol_preference', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select alcohol preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="non_drinker">Non-drinker</SelectItem>
              <SelectItem value="occasional_drinker">Occasional drinker</SelectItem>
              <SelectItem value="regular_drinker">Regular drinker</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
