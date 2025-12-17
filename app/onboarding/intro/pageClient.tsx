'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout'
import { AcademicStep } from '../components/steps/academic-step'
import { AutosaveToaster } from '@/components/questionnaire/AutosaveToaster'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { createClient } from '@/lib/supabase/client'
import { SuspenseWrapper } from '@/components/questionnaire/SuspenseWrapper'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { showErrorToast } from '@/lib/toast'

function IntroClientContent() {
  const [academicData, setAcademicData] = useState<Record<string, any>>({})
  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()

  // Check edit mode using React hook for proper reactivity
  const isEditMode = searchParams.get('mode') === 'edit'

  console.log('[IntroClient] Edit mode:', isEditMode, 'URL:', searchParams.toString())

  // Load saved data and check progress on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Check overall progress first (SKIP ALL REDIRECT LOGIC in edit mode)
        if (!isEditMode) {
          const progressResponse = await fetch('/api/onboarding/progress')
          if (progressResponse.ok) {
            const progress = await progressResponse.json()
            
            // If questionnaire is fully submitted, redirect to dashboard
            if (progress.isFullySubmitted) {
              router.push('/dashboard')
              return
            }
            
            // If user has submission but incomplete responses, show update mode
            if (progress.submittedAt && !progress.isFullySubmitted && progress.missingKeys?.length > 0) {
              console.log('User has incomplete submission, allowing re-onboarding')
              // Continue to show onboarding in "update" mode
            }
            
            // If there's partial progress and we're not on the next section, redirect
            if (progress.hasPartialProgress && progress.nextSection && progress.nextSection !== 'intro') {
              // Map section names to routes
              const sectionRoutes: Record<string, string> = {
                'location-commute': '/onboarding/location-commute',
                'personality-values': '/onboarding/personality-values',
                'sleep-circadian': '/onboarding/sleep-circadian',
                'noise-sensory': '/onboarding/noise-sensory',
                'home-operations': '/onboarding/home-operations',
                'social-hosting-language': '/onboarding/social-hosting-language',
                'communication-conflict': '/onboarding/communication-conflict',
                'privacy-territoriality': '/onboarding/privacy-territoriality',
                'reliability-logistics': '/onboarding/reliability-logistics'
              }
              
              const nextRoute = sectionRoutes[progress.nextSection]
              if (nextRoute) {
                router.push(nextRoute)
                return
              }
            }
          }
        }

        // Load intro section data - always load if available
        // This ensures data persistence across page refreshes
        const response = await fetch(`/api/onboarding/load?section=intro`)
        if (response.ok) {
          const { answers } = await response.json()
          if (answers && answers.length > 0) {
            // Convert answers array back to object format
            const savedData = answers.reduce((acc: any, answer: any) => {
              acc[answer.itemId] = answer.value
              return acc
            }, {})
            setAcademicData(savedData)
            
            // Re-validate with loaded data
            const hasUniversity = savedData.institution_slug || savedData.institution_other
            const hasDegreeLevel = savedData.degree_level
            const hasProgram = savedData.program_id || savedData.undecided_program
            const hasGraduationYear = savedData.expected_graduation_year
            const hasStudyStartMonth = savedData.study_start_month !== null && savedData.study_start_month !== undefined
            const hasGraduationMonth = savedData.graduation_month !== null && savedData.graduation_month !== undefined
            
            setIsValid(hasUniversity && hasDegreeLevel && hasProgram && hasGraduationYear && hasStudyStartMonth && hasGraduationMonth)
          }
        }
      } catch (error) {
        console.error('Failed to load saved data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSavedData()
  }, [supabase, router, isEditMode])

  // Validate a specific field
  const validateField = (field: string, value: any, allData: Record<string, any>): string => {
    switch (field) {
      case 'institution_slug':
      case 'institution_other':
        if (!allData.institution_slug && !allData.institution_other) {
          return 'University is required'
        }
        if (allData.institution_slug === 'other' && !allData.institution_other?.trim()) {
          return 'Please specify your university'
        }
        return ''
      case 'degree_level':
        if (!value) return 'Degree level is required'
        return ''
      case 'program_id':
      case 'undecided_program':
        if (!allData.program_id && !allData.undecided_program) {
          return 'Programme selection is required'
        }
        return ''
      case 'expected_graduation_year':
        if (!value) return 'Expected graduation year is required'
        return ''
      case 'study_start_month':
        if (value === null || value === undefined) {
          return 'Study start month is required'
        }
        return ''
      case 'graduation_month':
        if (value === null || value === undefined) {
          return 'Graduation month is required'
        }
        return ''
      default:
        return ''
    }
  }

  const handleAcademicChange = (data: Record<string, any>) => {
    setAcademicData(data)
    
    // Update errors for all fields when data changes
    const newErrors: Record<string, string> = {}
    const fieldsToValidate = [
      'institution_slug',
      'degree_level',
      'program_id',
      'expected_graduation_year',
      'study_start_month',
      'graduation_month'
    ]
    
    fieldsToValidate.forEach(field => {
      const error = validateField(field, data[field], data)
      if (error) {
        newErrors[field] = error
      }
    })
    
    setErrors(newErrors)
    
    // Strict validation - check if required fields are present
    // CRITICAL: university_id MUST be present (not just institution_slug) for submission to work
    const hasUniversityId = data.university_id && typeof data.university_id === 'string' && data.university_id.trim() !== ''
    const hasInstitutionSlug = data.institution_slug && data.institution_slug !== 'other'
    const hasUniversity = hasUniversityId || (hasInstitutionSlug && !data.institution_other) || (data.institution_slug === 'other' && data.institution_other?.trim())
    const hasDegreeLevel = data.degree_level
    const hasProgram = data.program_id || data.undecided_program
    const hasGraduationYear = data.expected_graduation_year
    const hasStudyStartMonth = data.study_start_month !== null && data.study_start_month !== undefined
    const hasGraduationMonth = data.graduation_month !== null && data.graduation_month !== undefined
    
    setIsValid(hasUniversity && hasDegreeLevel && hasProgram && hasGraduationYear && hasStudyStartMonth && hasGraduationMonth)
  }

  const handleNext = async () => {
    // Mark all fields as touched when user tries to submit
    const allFields = ['institution_slug', 'degree_level', 'program_id', 'expected_graduation_year', 'study_start_month', 'graduation_month']
    setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}))
    
    // Re-validate all fields
    const newErrors: Record<string, string> = {}
    allFields.forEach(field => {
      const error = validateField(field, academicData[field], academicData)
      if (error) {
        newErrors[field] = error
      }
    })
    setErrors(newErrors)
    
    // Validate required fields before proceeding
    if (!isValid || Object.keys(newErrors).length > 0) {
      // Check which fields are missing
      const missing = []
      if (!academicData.institution_slug && !academicData.institution_other) missing.push('University')
      if (!academicData.degree_level) missing.push('Degree Level')
      if (!academicData.program_id && !academicData.undecided_program) missing.push('Programme')
      if (!academicData.expected_graduation_year) missing.push('Expected Graduation Year')
      if (!academicData.study_start_month) missing.push('Study Start Month')
      if (!academicData.graduation_month) missing.push('Graduation Month')
      
      showErrorToast('Validation Error', `Please complete all required fields: ${missing.join(', ')}`)
      return
    }
    
    if (isValid && !isSaving) {
      setIsSaving(true)
      
      try {
        // Convert data to the format expected by the API
        const answers = Object.entries(academicData).map(([itemId, value]) => ({
          itemId,
          value
        }))

        const response = await fetchWithCSRF('/api/onboarding/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            section: 'intro',
            answers
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save data')
        }

        // Navigate based on mode
        if (isEditMode) {
          // In edit mode, continue to next section with edit mode preserved
          router.push('/onboarding/location-commute?mode=edit')
        } else {
          // Normal flow, go to next section
          router.push('/onboarding/location-commute')
        }
      } catch (error) {
        console.error('Failed to save academic data:', error)
        showErrorToast('Save Failed', error instanceof Error ? error.message : 'Failed to save data. Please try again.')
        // Don't navigate if save fails - keep user on page to fix issues
      } finally {
        setIsSaving(false)
      }
    }
  }

  if (isLoading) {
    return (
      <ErrorBoundary>
        <QuestionnaireLayout
          stepIndex={0}
          totalSteps={11}
          title={isEditMode ? "Edit Your Academic Information" : "Tell us about yourself"}
          subtitle={isEditMode ? "Update your university and programme details" : "Your university and programme details plus consent to begin"}
          onNext={handleNext}
          nextDisabled={true}
        >
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your saved data...</p>
            </div>
          </div>
        </QuestionnaireLayout>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <QuestionnaireLayout
        stepIndex={0}
        totalSteps={11}
        title={isEditMode ? "Edit Your Academic Information" : "Tell us about yourself"}
        subtitle={isEditMode ? "Update your university and programme details" : "Your university and programme details plus consent to begin"}
        onNext={handleNext}
        nextDisabled={!isValid || isSaving}
      >
        <AutosaveToaster show={false} />
        <AcademicStep 
          data={academicData} 
          onChange={handleAcademicChange} 
          user={{} as any}
          errors={errors}
          onFieldBlur={(field) => {
            setTouched(prev => ({ ...prev, [field]: true }))
          }}
        />
      </QuestionnaireLayout>
    </ErrorBoundary>
  )
}

export default function IntroClient() {
  return (
    <SuspenseWrapper>
      <IntroClientContent />
    </SuspenseWrapper>
  )
}
