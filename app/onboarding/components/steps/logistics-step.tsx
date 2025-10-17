'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

  return (
    <div className="space-y-6">
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

      <div className="space-y-2">
        <Label htmlFor="move_in_date">Preferred Move-in Date *</Label>
        <Input
          id="move_in_date"
          type="date"
          value={data.move_in_date || ''}
          onChange={(e) => handleChange('move_in_date', e.target.value)}
          required
        />
        <p className="text-sm text-gray-500">
          When would you like to move in? This helps match you with people looking for similar timing.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location_preference">Location Preference *</Label>
        <Select 
          value={data.location_preference || ''} 
          onValueChange={(value) => handleChange('location_preference', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select preferred location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="city_center">City Center</SelectItem>
            <SelectItem value="near_campus">Near Campus</SelectItem>
            <SelectItem value="suburbs">Suburbs</SelectItem>
            <SelectItem value="student_area">Student Area</SelectItem>
            <SelectItem value="flexible">Flexible</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          Where would you prefer to live? This helps find roommates with similar location preferences.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="housing_type">Preferred Housing Type</Label>
        <Select 
          value={data.housing_type || ''} 
          onValueChange={(value) => handleChange('housing_type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select housing type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="studio">Studio</SelectItem>
            <SelectItem value="shared_room">Shared Room</SelectItem>
            <SelectItem value="private_room">Private Room</SelectItem>
            <SelectItem value="flexible">Flexible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lease_duration">Preferred Lease Duration</Label>
        <Select 
          value={data.lease_duration || ''} 
          onValueChange={(value) => handleChange('lease_duration', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select lease duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6_months">6 Months</SelectItem>
            <SelectItem value="12_months">12 Months</SelectItem>
            <SelectItem value="academic_year">Academic Year</SelectItem>
            <SelectItem value="flexible">Flexible</SelectItem>
          </SelectContent>
        </Select>
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
