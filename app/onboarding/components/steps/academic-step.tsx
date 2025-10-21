'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { InstitutionSelect } from '@/components/questionnaire/InstitutionSelect'
import { ProgrammeSelect } from '@/components/questionnaire/ProgrammeSelect'
import { Checkbox } from '@/components/ui/checkbox'
import { User } from '@supabase/supabase-js'

interface AcademicStepProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  user: User
}


export function AcademicStep({ data, onChange, user }: AcademicStepProps) {
  const currentYear = new Date().getFullYear()
  const startYears = Array.from({ length: 8 }, (_, i) => currentYear - i)


  const handleChange = (field: string, value: any) => {
    const newData = { ...data, [field]: value }
    
    // Reset dependent fields when university, institution, or degree level changes
    if (field === 'university_id' || field === 'institution_slug' || field === 'degree_level') {
      newData.program_id = null
      newData.undecided_program = false
    }
    
    onChange(newData)
  }

  const calculateStudyYear = (startYear: number) => {
    const currentYear = new Date().getFullYear()
    return Math.max(1, currentYear - startYear + 1)
  }

  const studyYear = data.study_start_year ? calculateStudyYear(data.study_start_year) : null

  return (
    <div className="space-y-8">
      {/* University Selection */}
      <div className="space-y-2">
        <Label htmlFor="university">University *</Label>
        <InstitutionSelect
          value={data.institution_slug}
          onChange={async ({ institutionId, institutionOther, universityDbId }) => {
            const newData = { ...data }
            newData.institution_slug = institutionId
            
            if (institutionId === 'other') {
              newData.institution_other = institutionOther
              newData.university_id = null
            } else {
              newData.institution_other = undefined
              
              // If we don't have universityDbId, try to find it
              if (!universityDbId && institutionId) {
                try {
                  const { data: uniData, error } = await supabase
                    .from('universities')
                    .select('id, slug')
                    .eq('slug', institutionId)
                    .maybeSingle()
                  
                  if (!error && uniData) {
                    newData.university_id = uniData.id
                  }
                } catch (error) {
                  console.error('Error finding university ID:', error)
                }
              } else if (universityDbId) {
                newData.university_id = universityDbId
              }
            }
            
            onChange(newData)
          }}
        />
        <p className="text-sm text-gray-500">Choose your HBO or WO institution. Programs are loaded from our database.</p>
      </div>

      {/* Degree Level */}
      <div className="space-y-2">
        <Label htmlFor="degree_level">Degree Level *</Label>
        <RadioGroup 
          value={data.degree_level || ''} 
          onValueChange={(value) => handleChange('degree_level', value)}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bachelor" id="degree_bachelor" />
            <Label htmlFor="degree_bachelor">Bachelor's (BSc/BA)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="premaster" id="degree_premaster" />
            <Label htmlFor="degree_premaster">Pre-Master (Schakelprogramma)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="master" id="degree_master" />
            <Label htmlFor="degree_master">Master's (MSc/MA)</Label>
          </div>
        </RadioGroup>
        <p className="text-sm text-gray-500">
          Pre-Master is a bridging programme that prepares you for a Master's degree.
        </p>
      </div>

      {/* Undecided Program Toggle */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="undecided_program"
            checked={data.undecided_program || false}
            onCheckedChange={(checked) => handleChange('undecided_program', checked)}
          />
          <Label htmlFor="undecided_program" className="text-sm font-normal">
            I haven't decided on a specific programme yet
          </Label>
        </div>
      </div>

      {/* Programme Selection */}
      {!data.undecided_program && (
        <div className="space-y-2">
          <Label htmlFor="program">Programme *</Label>
          <ProgrammeSelect
            institutionId={data.institution_slug}
            level={data.degree_level as any}
            value={data.program_id}
            onChange={(programmeId) => handleChange('program_id', programmeId)}
            disabled={!data.institution_slug || !data.degree_level}
            placeholder="Select your programme"
          />
          <p className="text-sm text-gray-500">
            {data.institution_slug && data.degree_level
              ? `Select your ${data.degree_level} programme`
              : "Select your university and degree level to see available programmes"
            }
          </p>
        </div>
      )}

      {/* Study Start Year */}
      <div className="space-y-2">
        <Label htmlFor="study_start_year">Study Start Year *</Label>
        <Select 
          value={data.study_start_year?.toString() || ''} 
          onValueChange={(value) => handleChange('study_start_year', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select when you started/will start studying" />
          </SelectTrigger>
          <SelectContent>
            {startYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
                {year === currentYear && " (Current year)"}
                {year === currentYear - 1 && " (Last year)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Live Study Year Calculation */}
        {studyYear && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                You'll be: Year {studyYear}
              </span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
              {studyYear === 1 && "Starting your studies this year"}
              {studyYear === 2 && "In your second year"}
              {studyYear === 3 && "In your third year"}
              {studyYear === 4 && "In your fourth year"}
              {studyYear > 4 && `Advanced student (year ${studyYear})`}
            </p>
          </div>
        )}
        
        <p className="text-sm text-gray-500">
          When did you start or will you start your studies? This helps match you with students at similar academic stages.
        </p>
      </div>

      {/* Academic Summary */}
      {data.institution_slug && data.degree_level && (data.program_id || data.undecided_program) && data.study_start_year && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
            Academic Profile Summary
          </h4>
          <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <div><strong>Institution:</strong> {data.institution_slug}</div>
            <div><strong>Degree Level:</strong> {
              data.degree_level === 'bachelor' ? "Bachelor's" :
              data.degree_level === 'master' ? "Master's" :
              data.degree_level === 'premaster' ? "Pre-Master" : ''
            }</div>
            <div><strong>Programme:</strong> {
              data.undecided_program ? "Undecided" : "Selected"
            }</div>
            {studyYear && <div><strong>Study Year:</strong> Year {studyYear}</div>}
          </div>
        </div>
      )}
    </div>
  )
}
