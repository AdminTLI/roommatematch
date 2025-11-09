'use client'

import { useState, useEffect } from 'react'
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
import { calculateStudyYearWithMonths, getStudyYearStatus } from '@/lib/academic/calculateStudyYear'

interface AcademicStepProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  user: User
}


export function AcademicStep({ data, onChange, user }: AcademicStepProps) {
  const currentYear = new Date().getFullYear()
  const graduationYears = Array.from({ length: 11 }, (_, i) => currentYear + i)
  const supabase = createClient()
  const [universityName, setUniversityName] = useState<string | null>(null)
  const [hasUniversityFromBasics, setHasUniversityFromBasics] = useState(false)
  
  // Check if university was already selected in basics step
  useEffect(() => {
    const checkExistingUniversity = async () => {
      // Check if we have university_id or institution_slug from basics step
      if (data.university_id && !data.institution_slug && !data.university_slug) {
        // Look up slug from university_id
        try {
          const { data: uniData, error } = await supabase
            .from('universities')
            .select('id, slug, name')
            .eq('id', data.university_id)
            .maybeSingle()
          
          if (!error && uniData) {
            setUniversityName(uniData.name)
            setHasUniversityFromBasics(true)
            // Set institution_slug for compatibility (only update if missing)
            onChange({
              ...data,
              institution_slug: uniData.slug,
              university_slug: uniData.slug
            })
          }
        } catch (error) {
          console.error('Error looking up university:', error)
        }
      } else if ((data.institution_slug || data.university_slug) && !universityName) {
        // We have slug, look up name (only if we don't have it yet)
        const slug = data.institution_slug || data.university_slug
        try {
          const { data: uniData, error } = await supabase
            .from('universities')
            .select('id, slug, name')
            .eq('slug', slug)
            .maybeSingle()
          
          if (!error && uniData) {
            setUniversityName(uniData.name)
            setHasUniversityFromBasics(true)
            // Ensure university_id is set (only if not already set)
            if (!data.university_id) {
              onChange({
                ...data,
                university_id: uniData.id
              })
            }
          }
        } catch (error) {
          console.error('Error looking up university:', error)
        }
      } else if ((data.university_id || data.institution_slug || data.university_slug) && !hasUniversityFromBasics) {
        // We have university data, mark as from basics
        setHasUniversityFromBasics(true)
        // Look up name if we don't have it
        if (!universityName) {
          const slug = data.institution_slug || data.university_slug
          if (slug) {
            try {
              const { data: uniData } = await supabase
                .from('universities')
                .select('name')
                .eq('slug', slug)
                .maybeSingle()
              if (uniData) setUniversityName(uniData.name)
            } catch (error) {
              // Ignore errors
            }
          }
        }
      }
    }
    
    checkExistingUniversity()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.university_id, data.institution_slug, data.university_slug]) // Run when university data changes

  // Calculate current year status using month-aware helper
  const calculateCurrentYearStatus = () => {
    if (!data.expected_graduation_year || !data.institution_slug || !data.degree_level) return null
    
    const institutionType = getInstitutionType(data.institution_slug) as 'wo' | 'hbo'
    if (!institutionType) return null
    
    return getStudyYearStatus({
      studyStartYear: data.study_start_year || (data.expected_graduation_year - (institutionType === 'wo' ? 3 : 4)),
      studyStartMonth: data.study_start_month || null,
      expectedGraduationYear: data.expected_graduation_year,
      graduationMonth: data.graduation_month || null,
      institutionType,
      degreeLevel: data.degree_level as 'bachelor' | 'master' | 'premaster'
    })
  }

  const currentYearStatus = calculateCurrentYearStatus()

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
      {hasUniversityFromBasics ? (
        <div className="space-y-2">
          <Label htmlFor="university">University *</Label>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Already selected: {universityName || 'Your university'}
              </span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
              University was selected in the previous step. You can change it below if needed.
            </p>
          </div>
          <InstitutionSelect
            value={data.institution_slug}
            onChange={async ({ institutionId, institutionOther, universityDbId }) => {
              const newData = { ...data }
              newData.institution_slug = institutionId
              
              if (institutionId === 'other') {
                newData.institution_other = institutionOther
                newData.university_id = null
                setHasUniversityFromBasics(false)
                setUniversityName(null)
              } else {
                newData.institution_other = undefined
                
                // If we don't have universityDbId, try to find it
                if (!universityDbId && institutionId) {
                  try {
                    const { data: uniData, error } = await supabase
                      .from('universities')
                      .select('id, slug, name')
                      .eq('slug', institutionId)
                      .maybeSingle()
                    
                    if (!error && uniData) {
                      newData.university_id = uniData.id
                      setUniversityName(uniData.name)
                    }
                  } catch (error) {
                    console.error('Error finding university ID:', error)
                  }
                } else if (universityDbId) {
                  newData.university_id = universityDbId
                  // Look up name
                  try {
                    const { data: uniData } = await supabase
                      .from('universities')
                      .select('name')
                      .eq('id', universityDbId)
                      .maybeSingle()
                    if (uniData) setUniversityName(uniData.name)
                  } catch (error) {
                    console.error('Error looking up university name:', error)
                  }
                }
              }
              
              onChange(newData)
            }}
          />
          <p className="text-sm text-gray-500">Choose your HBO or WO institution. Programs are loaded from our database.</p>
        </div>
      ) : (
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
                      .select('id, slug, name')
                      .eq('slug', institutionId)
                      .maybeSingle()
                    
                    if (!error && uniData) {
                      newData.university_id = uniData.id
                      setUniversityName(uniData.name)
                    }
                  } catch (error) {
                    console.error('Error finding university ID:', error)
                  }
                } else if (universityDbId) {
                  newData.university_id = universityDbId
                  // Look up name
                  try {
                    const { data: uniData } = await supabase
                      .from('universities')
                      .select('name')
                      .eq('id', universityDbId)
                      .maybeSingle()
                    if (uniData) setUniversityName(uniData.name)
                  } catch (error) {
                    console.error('Error looking up university name:', error)
                  }
                }
              }
              
              onChange(newData)
            }}
          />
          <p className="text-sm text-gray-500">Choose your HBO or WO institution. Programs are loaded from our database.</p>
        </div>
      )}

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

      {/* Study Start Month */}
      <div className="space-y-2">
        <Label htmlFor="study_start_month">Study Start Month</Label>
        <Select 
          value={data.study_start_month?.toString() || ''} 
          onValueChange={(value) => handleChange('study_start_month', value ? parseInt(value) : null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="When did/will you start your studies?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="9">September/Fall</SelectItem>
            <SelectItem value="2">February/Spring</SelectItem>
            <SelectItem value="1">January</SelectItem>
            <SelectItem value="3">March</SelectItem>
            <SelectItem value="4">April</SelectItem>
            <SelectItem value="5">May</SelectItem>
            <SelectItem value="6">June</SelectItem>
            <SelectItem value="7">July</SelectItem>
            <SelectItem value="8">August</SelectItem>
            <SelectItem value="10">October</SelectItem>
            <SelectItem value="11">November</SelectItem>
            <SelectItem value="12">December</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          When did or will you start your studies? This helps calculate your current academic year more accurately.
        </p>
      </div>

      {/* Graduation Month */}
      <div className="space-y-2">
        <Label htmlFor="graduation_month">Expected Graduation Month</Label>
        <Select 
          value={data.graduation_month?.toString() || '6'} 
          onValueChange={(value) => handleChange('graduation_month', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="When do you expect to graduate?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">June (Summer)</SelectItem>
            <SelectItem value="7">July</SelectItem>
            <SelectItem value="8">August</SelectItem>
            <SelectItem value="5">May</SelectItem>
            <SelectItem value="4">April</SelectItem>
            <SelectItem value="3">March</SelectItem>
            <SelectItem value="2">February</SelectItem>
            <SelectItem value="1">January</SelectItem>
            <SelectItem value="9">September</SelectItem>
            <SelectItem value="10">October</SelectItem>
            <SelectItem value="11">November</SelectItem>
            <SelectItem value="12">December</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          In which month do you expect to graduate? Defaults to June for summer graduation.
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
