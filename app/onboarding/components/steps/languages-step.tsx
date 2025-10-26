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
          <Label>What languages do you speak daily? (Select all that apply) *</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: 'English', code: 'en' },
              { label: 'Dutch', code: 'nl' },
              { label: 'German', code: 'de' },
              { label: 'French', code: 'fr' },
              { label: 'Spanish', code: 'es' },
              { label: 'Italian', code: 'it' },
              { label: 'Portuguese', code: 'pt' },
              { label: 'Russian', code: 'ru' },
              { label: 'Chinese (Mandarin)', code: 'zh' },
              { label: 'Japanese', code: 'ja' },
              { label: 'Korean', code: 'ko' },
              { label: 'Arabic', code: 'ar' },
              { label: 'Hindi', code: 'hi' },
              { label: 'Turkish', code: 'tr' },
              { label: 'Polish', code: 'pl' },
              { label: 'Other', code: 'other' }
            ].map((language) => (
              <div key={language.code} className="flex items-center space-x-2">
                <Checkbox
                  id={`lang_${language.code}`}
                  checked={(data.languages_daily || []).includes(language.code)}
                  onCheckedChange={(checked) => 
                    handleArrayChange('languages_daily', language.code, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`lang_${language.code}`}
                  className="text-sm font-normal"
                >
                  {language.label}
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
