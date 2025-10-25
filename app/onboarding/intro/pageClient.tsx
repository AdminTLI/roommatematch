'use client'

import { useState, useEffect } from 'react'
import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout'
import { AcademicStep } from '../components/steps/academic-step'
import { AutosaveToaster } from '@/components/questionnaire/AutosaveToaster'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { createClient } from '@/lib/supabase/client'

export default function IntroClient() {
  const [academicData, setAcademicData] = useState<Record<string, any>>({})
  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Check for edit mode from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const mode = urlParams.get('mode')
    setIsEditMode(mode === 'edit')
  }, [])

  // Load saved data and check progress on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Check overall progress first (skip in edit mode)
        if (!isEditMode) {
          const progressResponse = await fetch('/api/onboarding/progress')
          if (progressResponse.ok) {
            const progress = await progressResponse.json()
            
            // If questionnaire is fully submitted, redirect to dashboard
            if (progress.isFullySubmitted) {
              router.push('/dashboard')
              return
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

        // Load intro section data
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
            
            setIsValid(hasUniversity && hasDegreeLevel && hasProgram && hasGraduationYear)
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

  const handleAcademicChange = (data: Record<string, any>) => {
    setAcademicData(data)
    
    // Simple validation - check if required fields are present
    const hasUniversity = data.institution_slug || data.institution_other
    const hasDegreeLevel = data.degree_level
    const hasProgram = data.program_id || data.undecided_program
    const hasGraduationYear = data.expected_graduation_year
    
    setIsValid(hasUniversity && hasDegreeLevel && hasProgram && hasGraduationYear)
  }

  const handleNext = async () => {
    if (isValid && !isSaving) {
      setIsSaving(true)
      
      try {
        // Convert data to the format expected by the API
        const answers = Object.entries(academicData).map(([itemId, value]) => ({
          itemId,
          value
        }))

        const response = await fetch('/api/onboarding/save', {
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
          throw new Error('Failed to save data')
        }

        // Navigate based on mode
        if (isEditMode) {
          // In edit mode, go back to settings
          router.push('/settings')
        } else {
          // Normal flow, go to next section
          router.push('/onboarding/location-commute')
        }
      } catch (error) {
        console.error('Failed to save academic data:', error)
        // Still navigate even if save fails to not block user progress
        router.push('/onboarding/location-commute')
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
        nextText={isSaving ? "Saving..." : (isEditMode ? "Save Changes" : "Next")}
      >
        <AutosaveToaster show={false} />
        <AcademicStep 
          data={academicData} 
          onChange={handleAcademicChange} 
          user={{} as any} 
        />
      </QuestionnaireLayout>
    </ErrorBoundary>
  )
}


