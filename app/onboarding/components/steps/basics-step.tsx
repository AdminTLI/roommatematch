'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface BasicsStepProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  user: User
}

interface University {
  id: string
  name: string
  domain: string
}

export function BasicsStep({ data, onChange, user }: BasicsStepProps) {
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const { data: unis, error } = await supabase
          .from('universities')
          .select('id, name, domain')
          .order('name')

        if (error) throw error
        setUniversities(unis || [])
      } catch (error) {
        console.error('Failed to fetch universities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUniversities()
  }, [supabase])

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
          <Label htmlFor="university">University *</Label>
          <Select 
            value={data.university_id || ''} 
            onValueChange={(value) => handleChange('university_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your university" />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>Loading universities...</SelectItem>
              ) : (
                universities.map((uni) => (
                  <SelectItem key={uni.id} value={uni.id}>
                    {uni.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="degree_level">Degree Level *</Label>
          <Select 
            value={data.degree_level || ''} 
            onValueChange={(value) => handleChange('degree_level', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your degree level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bachelor">Bachelor's (BSc/BA)</SelectItem>
              <SelectItem value="master">Master's (MSc/MA)</SelectItem>
              <SelectItem value="phd">PhD</SelectItem>
              <SelectItem value="exchange">Exchange Student</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="program">Program of Study *</Label>
        <Input
          id="program"
          placeholder="e.g., Computer Science, Business Administration"
          value={data.program || ''}
          onChange={(e) => handleChange('program', e.target.value)}
          required
        />
        <p className="text-sm text-gray-500">
          What are you studying? This helps us find roommates with similar academic interests.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="year_of_study">Year of Study</Label>
        <Select 
          value={data.year_of_study || ''} 
          onValueChange={(value) => handleChange('year_of_study', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1st Year</SelectItem>
            <SelectItem value="2">2nd Year</SelectItem>
            <SelectItem value="3">3rd Year</SelectItem>
            <SelectItem value="4">4th Year</SelectItem>
            <SelectItem value="5+">5th Year or Higher</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          Optional: Helps match with students at similar academic stages.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email_verification">Email Verification</Label>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">Email verified</span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            {user.email} - Campus domain verified
          </p>
        </div>
      </div>
    </div>
  )
}
