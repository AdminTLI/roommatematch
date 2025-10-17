'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface AcademicStepProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  user: User
}

interface University {
  id: string
  slug: string
  official_name: string
  common_name: string
  abbrev: string
}

interface Program {
  id: string
  name: string
  name_en?: string
  degree_level: string
  faculty?: string
}

export function AcademicStep({ data, onChange, user }: AcademicStepProps) {
  const [universities, setUniversities] = useState<University[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loadingUniversities, setLoadingUniversities] = useState(true)
  const [loadingPrograms, setLoadingPrograms] = useState(false)
  const supabase = createClient()

  const currentYear = new Date().getFullYear()
  const startYears = Array.from({ length: 8 }, (_, i) => currentYear - i)

  useEffect(() => {
    loadUniversities()
  }, [])

  useEffect(() => {
    if (data.university_id && data.degree_level) {
      loadPrograms(data.university_id, data.degree_level)
    } else {
      setPrograms([])
    }
  }, [data.university_id, data.degree_level])

  const loadUniversities = async () => {
    try {
      const { data: unis, error } = await supabase
        .from('universities')
        .select('id, slug, official_name, common_name, abbrev')
        .order('common_name')

      if (error) throw error
      setUniversities(unis || [])
    } catch (error) {
      console.error('Failed to load universities:', error)
    } finally {
      setLoadingUniversities(false)
    }
  }

  const loadPrograms = async (universityId: string, degreeLevel: string) => {
    setLoadingPrograms(true)
    try {
      const { data: progs, error } = await supabase
        .from('programs')
        .select('id, name, name_en, degree_level, faculty')
        .eq('university_id', universityId)
        .eq('degree_level', degreeLevel)
        .eq('active', true)
        .order('name')

      if (error) throw error
      setPrograms(progs || [])
    } catch (error) {
      console.error('Failed to load programs:', error)
    } finally {
      setLoadingPrograms(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    const newData = { ...data, [field]: value }
    
    // Reset dependent fields when university or degree level changes
    if (field === 'university_id' || field === 'degree_level') {
      newData.program_id = null
      newData.undecided_program = false
    }
    
    onChange(newData)
  }

  const calculateStudyYear = (startYear: number) => {
    const currentYear = new Date().getFullYear()
    return Math.max(1, currentYear - startYear + 1)
  }

  const selectedUniversity = universities.find(u => u.id === data.university_id)
  const selectedProgram = programs.find(p => p.id === data.program_id)
  const studyYear = data.study_start_year ? calculateStudyYear(data.study_start_year) : null

  return (
    <div className="space-y-8">
      {/* University Selection */}
      <div className="space-y-2">
        <Label htmlFor="university">University *</Label>
        <Select 
          value={data.university_id || ''} 
          onValueChange={(value) => handleChange('university_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingUniversities ? "Loading universities..." : "Select your university"} />
          </SelectTrigger>
          <SelectContent>
            {universities.map((uni) => (
              <SelectItem key={uni.id} value={uni.id}>
                {uni.common_name} ({uni.abbrev})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          Select the research university where you are or will be studying.
        </p>
      </div>

      {/* Degree Level */}
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
            <SelectItem value="premaster">Pre-Master/Schakelprogramma</SelectItem>
          </SelectContent>
        </Select>
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
          <Select 
            value={data.program_id || ''} 
            onValueChange={(value) => handleChange('program_id', value)}
            disabled={loadingPrograms || !data.university_id || !data.degree_level}
          >
            <SelectTrigger>
              <SelectValue 
                placeholder={
                  loadingPrograms 
                    ? "Loading programmes..." 
                    : !data.university_id || !data.degree_level
                    ? "Select university and degree level first"
                    : "Select your programme"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.name}
                  {program.faculty && (
                    <span className="text-gray-500 ml-2">({program.faculty})</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500">
            {programs.length > 0 
              ? `Found ${programs.length} ${data.degree_level} programmes at ${selectedUniversity?.common_name}`
              : data.university_id && data.degree_level 
              ? `No programmes found for ${data.degree_level} at ${selectedUniversity?.common_name}`
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
      {(selectedUniversity || data.university_id) && (selectedProgram || data.undecided_program) && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
            Academic Profile Summary
          </h4>
          <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <div><strong>University:</strong> {selectedUniversity?.common_name}</div>
            <div><strong>Degree Level:</strong> {
              data.degree_level === 'bachelor' ? "Bachelor's" :
              data.degree_level === 'master' ? "Master's" :
              data.degree_level === 'premaster' ? "Pre-Master" : ''
            }</div>
            <div><strong>Programme:</strong> {
              data.undecided_program ? "Undecided" : selectedProgram?.name || "Not selected"
            }</div>
            {studyYear && <div><strong>Study Year:</strong> Year {studyYear}</div>}
          </div>
        </div>
      )}
    </div>
  )
}
