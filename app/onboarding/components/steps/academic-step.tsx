'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { InstitutionSelect } from '@/components/questionnaire/InstitutionSelect'
import { ProgrammeSelect } from '@/components/questionnaire/ProgrammeSelect'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { User } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { getInstitutionType } from '@/lib/getInstitutionType'
import { getInstitutionLabel } from '@/lib/loadInstitutions'
import { calculateStudyYearWithMonths, getStudyYearStatus } from '@/lib/academic/calculateStudyYear'
import { GraduationCap, Sparkles } from 'lucide-react'

interface AcademicStepProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  user: User
  errors?: Record<string, string>
  onFieldBlur?: (field: string) => void
}


export function AcademicStep({ data, onChange, user, errors = {}, onFieldBlur }: AcademicStepProps) {
  const currentYear = new Date().getFullYear()
  const graduationYears = Array.from({ length: 11 }, (_, i) => currentYear + i)
  const supabase = createClient()
  const [universityName, setUniversityName] = useState<string | null>(null)
  const [hasUniversityFromBasics, setHasUniversityFromBasics] = useState(false)
  const [selectedProgrammeName, setSelectedProgrammeName] = useState<string | null>(null)
  
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
  
  const institutionLabel =
    getInstitutionLabel(data.institution_slug) ??
    universityName ??
    (data.institution_slug && data.institution_slug !== 'other'
      ? data.institution_slug
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase())
      : data.institution_other) ??
    'Not specified'

  const degreeLevelLabel =
    data.degree_level === 'bachelor'
      ? "Bachelor's"
      : data.degree_level === 'master'
        ? "Master's"
        : data.degree_level === 'premaster'
          ? 'Pre-Master'
          : 'Not specified'

  const graduationMonthLabel =
    data.graduation_month === 6 ? 'June' : `Month ${data.graduation_month}`

  const studyStartMonthLabel =
    data.study_start_month === 9 ? 'September' : `Month ${data.study_start_month}`

  const handleChange = (field: string, value: any) => {
    const newData = { ...data, [field]: value }
    
    // Reset dependent fields when university, institution, or degree level changes
    if (field === 'university_id' || field === 'institution_slug' || field === 'degree_level') {
      newData.program_id = null
      newData.undecided_program = false
    }
    
    onChange(newData)
  }

  // Programme summary is stored as an id (UUID), but the UI displays the programme name.
  // We fetch the programme list and resolve the id -> name for the summary card.
  useEffect(() => {
    const instSlug = data.institution_slug || data.university_slug

    if (!instSlug || !data.degree_level || !data.program_id || data.undecided_program) {
      setSelectedProgrammeName(null)
      return
    }

    const controller = new AbortController()

    const resolveProgrammeName = async () => {
      try {
        const res = await fetch(`/api/programmes?inst=${instSlug}&level=${data.degree_level}`, {
          signal: controller.signal,
        })
        if (!res.ok) return
        const payload = await res.json()
        const programmes = payload?.programmes || []
        const match = programmes.find((p: { id: string }) => p.id === data.program_id)
        setSelectedProgrammeName(match?.name || null)
      } catch {
        // Ignore resolution failures; we can still show the id as a fallback.
      }
    }

    resolveProgrammeName()
    return () => controller.abort()
  }, [data.institution_slug, data.university_slug, data.degree_level, data.program_id, data.undecided_program])


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
          <Label htmlFor="university" className="text-base font-semibold text-text-primary">
            University *
          </Label>
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
          <p className="text-sm text-text-secondary">
            Choose your HBO or WO institution. Programs are loaded from our database.
          </p>
          {(errors.institution_slug || errors.institution_other) && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.institution_slug || errors.institution_other}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="university" className="text-base font-semibold text-text-primary">
            University *
          </Label>
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
          <p className="text-sm text-text-secondary">
            Choose your HBO or WO institution. Programs are loaded from our database.
          </p>
          {(errors.institution_slug || errors.institution_other) && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.institution_slug || errors.institution_other}
            </p>
          )}
        </div>
      )}

      {/* Degree Level */}
      <div className="space-y-3">
        <Label
          htmlFor="degree_level"
          className="text-base font-semibold text-text-primary"
        >
          Degree Level *
        </Label>
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
              <Label
                htmlFor="degree_bachelor"
                className={cn(
                  "text-base font-semibold cursor-pointer",
                  data.degree_level === 'bachelor' ? "text-text-primary" : "text-text-primary"
                )}
              >
                Bachelor's Degree (BSc/BA)
              </Label>
              <p
                className={cn(
                  "text-sm mt-1",
                  data.degree_level === 'bachelor' ? "text-text-secondary" : "text-text-secondary"
                )}
              >
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
              <Label
                htmlFor="degree_premaster"
                className={cn(
                  "text-base font-semibold cursor-pointer",
                  data.degree_level === 'premaster' ? "text-text-primary" : "text-text-primary"
                )}
              >
                Pre-Master (Schakelprogramma)
              </Label>
              <p
                className={cn(
                  "text-sm mt-1",
                  data.degree_level === 'premaster' ? "text-text-secondary" : "text-text-secondary"
                )}
              >
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
              <Label
                htmlFor="degree_master"
                className={cn(
                  "text-base font-semibold cursor-pointer",
                  data.degree_level === 'master' ? "text-text-primary" : "text-text-primary"
                )}
              >
                Master's Degree (MSc/MA)
              </Label>
              <p
                className={cn(
                  "text-sm mt-1",
                  data.degree_level === 'master' ? "text-text-secondary" : "text-text-secondary"
                )}
              >
                Graduate degree, typically 1-2 years
              </p>
            </div>
          </div>
        </RadioGroup>
        {errors.degree_level && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.degree_level}
          </p>
        )}
      </div>

      {/* Undecided Program Toggle */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="undecided_program"
            checked={data.undecided_program || false}
            onCheckedChange={(checked) => handleChange('undecided_program', checked)}
          />
          <Label
            htmlFor="undecided_program"
            className="text-sm font-normal text-text-primary"
          >
            I haven't decided on a specific programme yet
          </Label>
        </div>
      </div>

      {/* Programme Selection */}
      {!data.undecided_program && (
        <div className="space-y-2">
          <Label
            htmlFor="program"
            className="text-base font-semibold text-text-primary"
          >
            Programme *
          </Label>
          <ProgrammeSelect
            institutionId={data.institution_slug}
            level={data.degree_level as any}
            value={data.program_id}
            onChange={(programmeId, programmeName) => {
              // Store both the program_id (for DB resolution) and the display name (for profile rendering)
              onChange({
                ...data,
                program_id: programmeId,
                program: programmeName ?? data.program,
                undecided_program: false,
              })
            }}
            disabled={!data.institution_slug || !data.degree_level}
            placeholder="Select your programme"
          />
          <p className="text-sm text-text-secondary">
            {data.institution_slug && data.degree_level
              ? `Select your ${data.degree_level} programme`
              : "Select your university and degree level to see available programmes"
            }
          </p>
          {errors.program_id && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.program_id}
            </p>
          )}
        </div>
      )}

      {/* Expected Graduation Year */}
      <div className="space-y-2">
        <Label
          htmlFor="expected_graduation_year"
          className="text-base font-semibold text-text-primary"
        >
          Expected Graduation Year *
        </Label>
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
        
        <p className="text-sm text-text-secondary">
          When do you expect to finish your studies? This helps match you with students at similar academic stages.
        </p>
        {errors.expected_graduation_year && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.expected_graduation_year}
          </p>
        )}
      </div>

      {/* Study Start Month */}
      <div className="space-y-2">
        <Label
          htmlFor="study_start_month"
          className="text-base font-semibold text-text-primary"
        >
          Study Start Month *
        </Label>
        <Select 
          value={data.study_start_month?.toString() || ''} 
          onValueChange={(value) => handleChange('study_start_month', value ? parseInt(value) : null)}
          required
        >
          <SelectTrigger className={!data.study_start_month ? 'border-red-300' : ''}>
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
        {errors.study_start_month && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.study_start_month}
          </p>
        )}
        {!data.study_start_month && !errors.study_start_month && (
          <p className="text-sm text-amber-300">
            Study start month is required for accurate academic year calculation.
          </p>
        )}
        <p className="text-sm text-text-secondary">
          When did or will you start your studies? This helps calculate your current academic year more accurately. Academic year typically starts in September (month 9).
        </p>
      </div>

      {/* Graduation Month */}
      <div className="space-y-2">
        <Label
          htmlFor="graduation_month"
          className="text-base font-semibold text-text-primary"
        >
          Expected Graduation Month *
        </Label>
        <Select 
          value={data.graduation_month?.toString() || ''} 
          onValueChange={(value) => handleChange('graduation_month', value ? parseInt(value) : null)}
          required
        >
          <SelectTrigger className={!data.graduation_month ? 'border-red-300' : ''}>
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
        {errors.graduation_month && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.graduation_month}
          </p>
        )}
        {!data.graduation_month && !errors.graduation_month && (
          <p className="text-sm text-amber-300">
            Graduation month is required for accurate academic year calculation.
          </p>
        )}
        <p className="text-sm text-text-secondary">
          In which month do you expect to graduate? This helps us calculate your academic stage accurately. Most students graduate in June (summer).
        </p>
      </div>

      {/* Validation Error */}
      {data.expected_graduation_year && (!data.study_start_month || !data.graduation_month) && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5">⚠️</div>
            <div className="text-sm">
              <p className="text-red-800 dark:text-red-200 font-medium mb-1">
                Missing Required Information
              </p>
              <p className="text-red-700 dark:text-red-300">
                Please provide both your study start month and graduation month to proceed. This information is required for accurate academic year calculation and matching.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Academic Summary */}
      {data.institution_slug && data.degree_level && (data.program_id || data.undecided_program) && 
       data.expected_graduation_year && data.study_start_month && data.graduation_month && (
        <div className="relative overflow-hidden rounded-2xl border border-green-200/70 dark:border-green-800/70 bg-gradient-to-br from-green-50/70 via-green-50/30 to-transparent dark:from-green-900/40 dark:via-green-900/10 shadow-elev-1">
          <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-green-200/60 dark:bg-green-800/30 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-14 -left-10 h-56 w-56 rounded-full bg-green-100/50 dark:bg-green-800/20 blur-2xl" />

          <div className="relative p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-xl border border-green-200/70 bg-green-100/60 dark:border-green-800/70 dark:bg-green-900/30">
                  <GraduationCap className="h-5 w-5 text-green-700 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-green-800/80 dark:text-green-200/80">
                    Academic Profile
                  </p>
                  <h4 className="text-lg sm:text-xl font-semibold text-text-primary">
                    Summary
                  </h4>
                  <p className="text-sm text-text-secondary mt-1">
                    Used to match you with students at a similar stage.
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 self-start rounded-full border border-green-200/70 bg-green-50/60 px-3 py-1 text-xs font-medium text-green-800 dark:border-green-800/70 dark:bg-green-900/30 dark:text-green-200">
                <Sparkles className="h-3.5 w-3.5" />
                Ready for matching
              </div>
            </div>

            <Separator className="mt-4 bg-green-200/70 dark:bg-green-800/60" />

            <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 mt-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-text-secondary">Institution</div>
                  <div className="text-sm font-semibold text-text-primary truncate">
                    {institutionLabel}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-text-secondary">Degree level</div>
                  <div className="text-sm font-semibold text-text-primary">
                    {degreeLevelLabel}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-text-secondary">Programme</div>
                  <div className="text-sm font-semibold text-text-primary">
                    {data.undecided_program
                      ? 'Undecided'
                      : (selectedProgrammeName || data.program_id || 'Selected')}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-text-secondary">Expected graduation</div>
                  <div className="text-sm font-semibold text-text-primary">
                    {data.expected_graduation_year} ({graduationMonthLabel})
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-text-secondary">Study start</div>
                  <div className="text-sm font-semibold text-text-primary">
                    {studyStartMonthLabel}{' '}
                    {data.study_start_year ? `(${data.study_start_year})` : ''}
                  </div>
                </div>
              </div>

              {currentYearStatus ? (
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-text-secondary">Current status</div>
                    <div className="text-sm font-semibold text-text-primary">
                      {currentYearStatus}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
