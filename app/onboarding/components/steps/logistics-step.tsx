'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { User } from '@supabase/supabase-js'

interface LogisticsStepProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  user: User
}

export function LogisticsStep({ data, onChange, user }: LogisticsStepProps) {
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
    <div className="space-y-6">
      {/* Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="budget_min">Minimum Budget (€/month) *</Label>
          <Input
            id="budget_min"
            type="number"
            placeholder="e.g., 400"
            value={data.budget_min || ''}
            onChange={(e) => handleChange('budget_min', parseInt(e.target.value) || 0)}
            min="0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget_max">Maximum Budget (€/month) *</Label>
          <Input
            id="budget_max"
            type="number"
            placeholder="e.g., 800"
            value={data.budget_max || ''}
            onChange={(e) => handleChange('budget_max', parseInt(e.target.value) || 0)}
            min="0"
            required
          />
        </div>
      </div>

      {/* Commute */}
      <div className="space-y-2">
        <Label htmlFor="commute_max">Maximum Commute Time (minutes) *</Label>
        <Select 
          value={data.commute_max || ''} 
          onValueChange={(value) => handleChange('commute_max', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select maximum commute time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">15 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="45">45 minutes</SelectItem>
            <SelectItem value="60">60 minutes</SelectItem>
            <SelectItem value="90">90 minutes</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          How long are you willing to commute to campus?
        </p>
      </div>

      {/* Lease Length */}
      <div className="space-y-2">
        <Label htmlFor="lease_length">Preferred Lease Length *</Label>
        <Select 
          value={data.lease_length || ''} 
          onValueChange={(value) => handleChange('lease_length', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select lease length" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3_months">3 months</SelectItem>
            <SelectItem value="6_months">6 months</SelectItem>
            <SelectItem value="12_months">12 months</SelectItem>
            <SelectItem value="flexible">Flexible</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          How long do you want to commit to a lease?
        </p>
      </div>

      {/* Room Type */}
      <div className="space-y-3">
        <Label>Preferred Room Type *</Label>
        <p className="text-sm text-gray-500">Select all that apply</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'single', label: 'Single Room' },
            { value: 'shared', label: 'Shared Room' },
            { value: 'studio', label: 'Studio' },
            { value: 'flexible', label: 'Flexible' }
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`room_type_${option.value}`}
                checked={(data.room_type || []).includes(option.value)}
                onCheckedChange={(checked) => 
                  handleArrayChange('room_type', option.value, checked as boolean)
                }
              />
              <Label 
                htmlFor={`room_type_${option.value}`}
                className="text-sm font-normal"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Helper */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          💡 Budget Tips
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Average student housing in Dutch cities: €400-€800/month</li>
          <li>• Include utilities (usually €50-€100/month extra)</li>
          <li>• Consider transportation costs to campus</li>
          <li>• Look for housing with good public transport connections</li>
        </ul>
      </div>
    </div>
  )
}
