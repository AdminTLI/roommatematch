'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { User } from '@supabase/supabase-js'

interface LanguagesStepProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  user: User
}

export function LanguagesStep({ data, onChange, user }: LanguagesStepProps) {
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
      {/* Languages Spoken */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Languages You Speak</h3>
        
        <div className="space-y-3">
          <Label>What languages do you speak? (Select all that apply)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              'English', 'Dutch', 'German', 'French', 'Spanish', 'Italian',
              'Portuguese', 'Russian', 'Chinese (Mandarin)', 'Japanese',
              'Korean', 'Arabic', 'Hindi', 'Turkish', 'Polish', 'Other'
            ].map((language) => (
              <div key={language} className="flex items-center space-x-2">
                <Checkbox
                  id={`lang_${language}`}
                  checked={(data.spoken_languages || []).includes(language)}
                  onCheckedChange={(checked) => 
                    handleArrayChange('spoken_languages', language, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`lang_${language}`}
                  className="text-sm font-normal"
                >
                  {language}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Language Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Language Preferences</h3>
        
        <div className="space-y-2">
          <Label>What language would you prefer for house communication? *</Label>
          <Select 
            value={data.house_communication_language || ''} 
            onValueChange={(value) => onChange({...data, house_communication_language: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select preferred language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="dutch">Dutch</SelectItem>
              <SelectItem value="mixed">Mixed (use multiple languages)</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>How comfortable are you with non-native speakers? *</Label>
          <Select 
            value={data.non_native_comfort || ''} 
            onValueChange={(value) => onChange({...data, non_native_comfort: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select comfort level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="very_comfortable">Very comfortable</SelectItem>
              <SelectItem value="comfortable">Comfortable</SelectItem>
              <SelectItem value="somewhat_comfortable">Somewhat comfortable</SelectItem>
              <SelectItem value="not_comfortable">Not comfortable</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cultural Considerations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Cultural Considerations</h3>
        
        <div className="space-y-2">
          <Label>How important is cultural similarity? *</Label>
          <Select 
            value={data.cultural_importance || ''} 
            onValueChange={(value) => onChange({...data, cultural_importance: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select importance level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="very_important">Very important</SelectItem>
              <SelectItem value="somewhat_important">Somewhat important</SelectItem>
              <SelectItem value="not_important">Not very important</SelectItem>
              <SelectItem value="prefer_diversity">Prefer cultural diversity</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>What cultural aspects are important to you? (Select all that apply)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Similar religious background', 'Similar food preferences',
              'Similar holidays/traditions', 'Similar study habits',
              'Similar social customs', 'Similar family values',
              'Similar lifestyle choices', 'Open to all cultures'
            ].map((aspect) => (
              <div key={aspect} className="flex items-center space-x-2">
                <Checkbox
                  id={`culture_${aspect}`}
                  checked={(data.cultural_aspects || []).includes(aspect)}
                  onCheckedChange={(checked) => 
                    handleArrayChange('cultural_aspects', aspect, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`culture_${aspect}`}
                  className="text-sm font-normal"
                >
                  {aspect}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Note about optional step */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> This step is optional. You can skip questions you prefer not to answer.
        </p>
      </div>
    </div>
  )
}
