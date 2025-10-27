'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProgrammeSelect } from '@/components/ui/programme-select'
import { getStudyYearOptions } from '@/lib/academic/graduation-year'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { getCampusesForUniversity } from '@/lib/loadCampuses'

interface BasicsStepProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  user: User
}

interface University {
  id: string
  name: string
  domain: string
  slug: string
}

export function BasicsStep({ data, onChange, user }: BasicsStepProps) {
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [campuses, setCampuses] = useState<Array<{value: string, label: string}>>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const { data: unis, error } = await supabase
          .from('universities')
          .select('id, name, domain, slug')
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
    
    // When university changes, update available campuses
    if (field === 'university_id') {
      const selectedUni = universities.find(uni => uni.id === value)
      if (selectedUni) {
        // Use the university slug directly
        const universitySlug = selectedUni.slug
        const availableCampuses = getCampusesForUniversity(universitySlug)

        // Always add a fallback option
        if (availableCampuses.length === 0) {
          setCampuses([
            { value: 'main-campus', label: 'Main Campus' },
            { value: 'other', label: 'Other Campus' }
          ])
        } else {
          setCampuses([
            ...availableCampuses.map(campus => ({
              value: campus.value,
              label: campus.label
            })),
            { value: 'other', label: 'Other Campus' }
          ])
        }
        
        // Clear campus selection when university changes
        onChange({
          ...data,
          [field]: value,
          campus: ''
        })
      } else {
        setCampuses([])
      }
    }
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
        <ProgrammeSelect
          institutionId={data.university_id}
          degreeLevel={data.degree_level}
          value={data.program_id || ''}
          onValueChange={(value) => handleChange('program_id', value)}
          onProgrammeSelect={(prog) => {
            handleChange('program', prog.name)
            handleChange('sector', prog.sector)
          }}
        />
        <p className="text-sm text-gray-500">
          What are you studying? This helps us find roommates with similar academic interests.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="campus">Campus *</Label>
        <Select 
          value={data.campus || ''} 
          onValueChange={(value) => handleChange('campus', value)}
          disabled={!data.university_id}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              !data.university_id ? "Select university first" :
              campuses.length === 0 ? "No campuses available" :
              "Select your campus"
            } />
          </SelectTrigger>
          <SelectContent>
            {campuses.map((campus) => (
              <SelectItem key={campus.value} value={campus.value}>
                {campus.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          {campuses.length === 2 && campuses[0].value === 'main-campus' 
            ? 'Campus information not available for this university. Select "Main Campus" or specify "Other".'
            : 'Which campus will you primarily study at?'}
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
            {getStudyYearOptions(data.sector).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          Optional: Helps match with students at similar academic stages.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="move_in_window">When do you want to move in? *</Label>
        <Select 
          value={data.move_in_window || ''} 
          onValueChange={(value) => handleChange('move_in_window', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select move-in timing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="immediate">Immediately</SelectItem>
            <SelectItem value="within_month">Within a month</SelectItem>
            <SelectItem value="within_3_months">Within 3 months</SelectItem>
            <SelectItem value="flexible">Flexible</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          This helps match you with people looking for similar timing.
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
