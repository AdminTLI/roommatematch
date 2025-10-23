'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { InstitutionSelect } from '@/components/questionnaire/InstitutionSelect'
import { ProgrammeSelect } from '@/components/questionnaire/ProgrammeSelect'
import { Checkbox } from '@/components/ui/checkbox'
import { User } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { getInstitutionType } from '@/lib/getInstitutionType'

interface AcademicStepProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  user: User
}


export function AcademicStep({ data, onChange, user }: AcademicStepProps) {
  const currentYear = new Date().getFullYear()
  const graduationYears = Array.from({ length: 11 }, (_, i) => currentYear + i)
  const supabase = createClient()

  // Calculate current year status based on expected graduation year
  const calculateCurrentYearStatus = (graduationYear: number, institutionSlug: string, degreeLevel: string) => {
    if (!graduationYear || !institutionSlug || !degreeLevel) return null
    
    // For pre-master and master students
    if (degreeLevel === 'premaster') return 'Pre-Master Student'
    if (degreeLevel === 'master') return "Master's Student"
    
    // Determine institution type and programme duration
    const institutionType = getInstitutionType(institutionSlug)
    const programDuration = institutionType === 'wo' ? 3 : 4
    
    const yearsUntilGraduation = graduationYear - currentYear
    const currentYearNumber = programDuration - yearsUntilGraduation
    
    if (currentYearNumber < 1) return 'Not yet started'
    if (currentYearNumber > programDuration) return 'Graduated'
    
    return `Year ${currentYearNumber}`
  }

  const currentYearStatus = calculateCurrentYearStatus(
    data.expected_graduation_year, 
    data.institution_slug, 
    data.degree_level
  )

  const handleChange = (field: string, value: any) => {
    const newData = { ...data, [field]: value }
    
    // Reset dependent fields when university, institution, or degree level changes
    if (field === 'university_id' || field === 'institution_slug' || field === 'degree_level') {
      newData.program_id = null
      newData.undecided_program = false
    }
    
    onChange(newData)
  }


  return (
    <div className="space-y-8">
      {/* Programme Data Notice */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5">ℹ️</div>
          <div className="text-sm">
            <p className="text-amber-800 dark:text-amber-200 font-medium mb-1">
              Programme Data Availability
            </p>
            <p className="text-amber-700 dark:text-amber-300">
              Programme data is only available for some institutions in our database. If you don't see programmes for your university, you can select "Undecided Program" below and still complete your profile.
            </p>
          </div>
        </div>
      </div>

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
      <div className="space-y-3">
        <Label htmlFor="degree_level" className="text-base font-medium">Degree Level *</Label>
        <RadioGroup 
          value={data.degree_level || ''} 
          onValueChange={(value) => handleChange('degree_level', value)}
          className="space-y-3"
        >
          <div 
            className={cn(
              "flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors",
              data.degree_level === 'bachelor' 
                ? "border-purple-600 bg-purple-50 dark:bg-purple-950" 
                : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
            )}
            onClick={() => handleChange('degree_level', 'bachelor')}
          >
            <RadioGroupItem value="bachelor" id="degree_bachelor" className="shrink-0" />
            <div className="flex-1">
              <Label htmlFor="degree_bachelor" className="text-base font-medium cursor-pointer">
                Bachelor's Degree (BSc/BA)
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Undergraduate degree, typically 3-4 years
              </p>
            </div>
          </div>
          
          <div 
            className={cn(
              "flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors",
              data.degree_level === 'premaster' 
                ? "border-purple-600 bg-purple-50 dark:bg-purple-950" 
                : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
            )}
            onClick={() => handleChange('degree_level', 'premaster')}
          >
            <RadioGroupItem value="premaster" id="degree_premaster" className="shrink-0" />
            <div className="flex-1">
              <Label htmlFor="degree_premaster" className="text-base font-medium cursor-pointer">
                Pre-Master (Schakelprogramma)
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Bridging programme to prepare for Master's degree
              </p>
            </div>
          </div>
          
          <div 
            className={cn(
              "flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors",
              data.degree_level === 'master' 
                ? "border-purple-600 bg-purple-50 dark:bg-purple-950" 
                : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
            )}
            onClick={() => handleChange('degree_level', 'master')}
          >
            <RadioGroupItem value="master" id="degree_master" className="shrink-0" />
            <div className="flex-1">
              <Label htmlFor="degree_master" className="text-base font-medium cursor-pointer">
                Master's Degree (MSc/MA)
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Graduate degree, typically 1-2 years
              </p>
            </div>
          </div>
        </RadioGroup>
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

      {/* Expected Graduation Year */}
      <div className="space-y-2">
        <Label htmlFor="expected_graduation_year">Expected Graduation Year *</Label>
        <Select 
          value={data.expected_graduation_year?.toString() || ''} 
          onValueChange={(value) => handleChange('expected_graduation_year', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="When do you expect to graduate?" />
          </SelectTrigger>
          <SelectContent>
            {graduationYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
                {year === currentYear && " (This year)"}
                {year === currentYear + 1 && " (Next year)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Live Current Year Display */}
        {currentYearStatus && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Current Status: {currentYearStatus}
              </span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
              {currentYearStatus === 'Year 1' && "Starting your bachelor programme"}
              {currentYearStatus === 'Year 2' && "Second year student"}
              {currentYearStatus === 'Year 3' && "Third year student"}
              {currentYearStatus === 'Year 4' && "Final year student"}
              {currentYearStatus === "Pre-Master Student" && "Preparing for master's degree"}
              {currentYearStatus === "Master's Student" && "Graduate student"}
              {currentYearStatus === 'Not yet started' && "Programme hasn't started yet"}
              {currentYearStatus === 'Graduated' && "Already graduated"}
            </p>
          </div>
        )}
        
        <p className="text-sm text-gray-500">
          When do you expect to finish your studies? This helps match you with students at similar academic stages.
        </p>
      </div>

      {/* Academic Summary */}
      {data.institution_slug && data.degree_level && (data.program_id || data.undecided_program) && data.expected_graduation_year && (
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
            <div><strong>Expected Graduation:</strong> {data.expected_graduation_year}</div>
            {currentYearStatus && <div><strong>Current Status:</strong> {currentYearStatus}</div>}
          </div>
        </div>
      )}
    </div>
  )
}
