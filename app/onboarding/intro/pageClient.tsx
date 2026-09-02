'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AcademicStep } from '../components/steps/academic-step'
import { OnboardingModuleShell } from '@/components/questionnaire/OnboardingModuleShell'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { createClient } from '@/lib/supabase/client'
import { SuspenseWrapper } from '@/components/questionnaire/SuspenseWrapper'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { showErrorToast } from '@/lib/toast'
import { useOnboardingStore } from '@/store/onboarding'

function IntroClientContent() {
  const [academicData, setAcademicData] = useState<Record<string, any>>({})
  const [welcomeContextAnswers, setWelcomeContextAnswers] = useState<
    Array<{ itemId: string; value: any }>
  >([])
  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()
  const setLastSavedAt = useOnboardingStore((s) => s.setLastSavedAt)

  const isEditMode = searchParams.get('edit') === '1' || searchParams.get('mode') === 'edit'

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        if (!isEditMode) {
          const progressResponse = await fetch('/api/onboarding/progress')
          if (progressResponse.ok) {
            const progress = await progressResponse.json()

            if (progress.isFullySubmitted) {
              router.push('/dashboard')
              return
            }

            if (progress.hasPartialProgress && progress.nextSection && progress.nextSection !== 'intro') {
              const sectionRoutes: Record<string, string> = {
                'logistics-context': '/onboarding/logistics-context',
                'environment-rhythms': '/onboarding/environment-rhythms',
                'cleanliness-operations': '/onboarding/cleanliness-operations',
                'communication-resolution': '/onboarding/communication-resolution',
                'social-spaces': '/onboarding/social-spaces',
                'location-commute': '/onboarding/location-commute',
                'personality-values': '/onboarding/personality-values',
                'sleep-circadian': '/onboarding/sleep-circadian',
                'noise-sensory': '/onboarding/noise-sensory',
                'home-operations': '/onboarding/home-operations',
                'social-hosting-language': '/onboarding/social-hosting-language',
                'communication-conflict': '/onboarding/communication-conflict',
                'privacy-territoriality': '/onboarding/privacy-territoriality',
                'reliability-logistics': '/onboarding/reliability-logistics',
              }

              const nextRoute = sectionRoutes[progress.nextSection]
              if (nextRoute) {
                router.push(nextRoute)
                return
              }
            }
          }
        }

        const response = await fetch(`/api/onboarding/load?section=intro`)
        if (response.ok) {
          const { answers, platformDefaults } = await response.json()
          if (answers && answers.length > 0) {
            const welcomeContextIds = new Set([
              'student_origin',
              'study_program_type',
              'accepted_terms_and_privacy',
              'accepted_dealbreaker_consent',
              'accepted_special_category_consent',
            ])
            const preservedWelcomeAnswers = answers.filter(
              (answer: any) => answer?.itemId && welcomeContextIds.has(String(answer.itemId))
            )
            setWelcomeContextAnswers(preservedWelcomeAnswers)

            const savedData = answers.reduce((acc: any, answer: any) => {
              acc[answer.itemId] = answer.value
              return acc
            }, {})

            // Ensure graduation month default for older incomplete drafts
            if (savedData.expected_graduation_year && !savedData.graduation_month) {
              savedData.graduation_month = 6
            }
            if (
              savedData.student_origin &&
              !savedData.study_program_type
            ) {
              savedData.study_program_type =
                savedData.student_origin === 'international'
                  ? 'english_taught'
                  : 'dutch_taught'
            }

            setAcademicData(savedData)
            setIsValid(computeIsValid(savedData))
          } else if (platformDefaults?.defaultUniversityId) {
            setAcademicData((prev) => ({
              ...prev,
              university_id: platformDefaults.defaultUniversityId,
            }))
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

  const validateField = (field: string, value: any, allData: Record<string, any>): string => {
    switch (field) {
      case 'student_origin':
        if (value !== 'dutch' && value !== 'international') {
          return 'Student status is required'
        }
        return ''
      case 'study_program_type':
        if (value !== 'dutch_taught' && value !== 'english_taught') {
          return 'Study programme language is required'
        }
        return ''
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

  function computeIsValid(data: Record<string, any>) {
    const hasStudentOrigin =
      data.student_origin === 'dutch' || data.student_origin === 'international'
    const hasStudyProgramType =
      data.study_program_type === 'dutch_taught' || data.study_program_type === 'english_taught'
    const hasUniversityId =
      data.university_id && typeof data.university_id === 'string' && data.university_id.trim() !== ''
    const hasInstitutionSlug = data.institution_slug && data.institution_slug !== 'other'
    const hasUniversity =
      hasUniversityId ||
      (hasInstitutionSlug && !data.institution_other) ||
      (data.institution_slug === 'other' && data.institution_other?.trim())
    const hasDegreeLevel = !!data.degree_level
    const hasProgram = !!(data.program_id || data.undecided_program)
    const hasGraduationYear = !!data.expected_graduation_year
    const hasStudyStartMonth =
      data.study_start_month !== null && data.study_start_month !== undefined
    const hasGraduationMonth =
      data.graduation_month !== null && data.graduation_month !== undefined

    return (
      hasStudentOrigin &&
      hasStudyProgramType &&
      !!hasUniversity &&
      hasDegreeLevel &&
      hasProgram &&
      hasGraduationYear &&
      hasStudyStartMonth &&
      hasGraduationMonth
    )
  }

  const handleAcademicChange = (data: Record<string, any>) => {
    setAcademicData(data)

    const newErrors: Record<string, string> = {}
    const fieldsToValidate = [
      'student_origin',
      'study_program_type',
      'institution_slug',
      'degree_level',
      'program_id',
      'expected_graduation_year',
      'study_start_month',
      'graduation_month',
    ]

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, data[field], data)
      if (error) newErrors[field] = error
    })

    setErrors(newErrors)
    setIsValid(computeIsValid(data))
  }

  const handleNext = async () => {
    const allFields = [
      'student_origin',
      'study_program_type',
      'institution_slug',
      'degree_level',
      'program_id',
      'expected_graduation_year',
      'study_start_month',
      'graduation_month',
    ]

    const newErrors: Record<string, string> = {}
    allFields.forEach((field) => {
      const error = validateField(field, academicData[field], academicData)
      if (error) newErrors[field] = error
    })
    setErrors(newErrors)

    if (!isValid || Object.keys(newErrors).length > 0) {
      const missing: string[] = []
      if (academicData.student_origin !== 'dutch' && academicData.student_origin !== 'international') {
        missing.push('Student Status')
      }
      if (!academicData.institution_slug && !academicData.institution_other) missing.push('University')
      if (!academicData.degree_level) missing.push('Degree Level')
      if (!academicData.program_id && !academicData.undecided_program) missing.push('Programme')
      if (!academicData.expected_graduation_year) missing.push('Graduation Year')
      if (!academicData.study_start_month) missing.push('Start Month')

      showErrorToast(
        'Almost there',
        `Please complete: ${missing.join(', ') || 'all required fields'}`
      )
      return
    }

    if (isValid && !isSaving) {
      setIsSaving(true)

      try {
        const payload: Record<string, any> = {
          ...academicData,
          graduation_month: academicData.graduation_month ?? 6,
          study_program_type:
            academicData.study_program_type ??
            (academicData.student_origin === 'international'
              ? 'english_taught'
              : 'dutch_taught'),
        }

        const answers = Object.entries(payload).map(([itemId, value]) => ({
          itemId,
          value,
        }))
        const answerIds = new Set(answers.map((a) => a.itemId))
        for (const preserved of welcomeContextAnswers) {
          if (!answerIds.has(preserved.itemId)) {
            answers.push(preserved)
          }
        }

        const response = await fetchWithCSRF('/api/onboarding/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section: 'intro',
            answers,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save data')
        }

        setLastSavedAt(new Date().toISOString())

        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          await supabase.from('app_events').insert({
            user_id: user?.id ?? null,
            name: 'onboarding_demographics_set',
            props: {
              student_origin: payload.student_origin,
              study_program_type: payload.study_program_type,
              source: 'intro_page',
            },
            created_at: new Date().toISOString(),
          })
        } catch (analyticsError) {
          console.error('[IntroClient] Failed to log demographics event', analyticsError)
        }

        router.push(
          isEditMode
            ? '/onboarding/logistics-context?mode=edit'
            : '/onboarding/logistics-context'
        )
      } catch (error) {
        console.error('Failed to save academic data:', error)
        showErrorToast(
          'Save Failed',
          error instanceof Error ? error.message : 'Failed to save data. Please try again.'
        )
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handlePrev = () => {
    router.push(isEditMode ? '/onboarding/welcome?mode=edit' : '/onboarding/welcome')
  }

  if (isLoading) {
    return (
      <ErrorBoundary>
        <OnboardingModuleShell
          moduleIndex={0}
          moduleLabel="Setup"
          title={isEditMode ? 'Edit your studies' : 'Tell us about your studies'}
          subtitle="We use this to match you with students at a similar stage."
          onBack={handlePrev}
        >
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#6366F1] dark:border-slate-700 dark:border-t-indigo-400" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading your saved data…</p>
            </div>
          </div>
        </OnboardingModuleShell>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <OnboardingModuleShell
        moduleIndex={0}
        moduleLabel="Setup"
        title={isEditMode ? 'Edit your studies' : 'Tell us about your studies'}
        subtitle="A few details so we can place you with compatible classmates."
        onBack={handlePrev}
        onContinue={handleNext}
        continueDisabled={!isValid || isSaving}
        continueLabel="Continue"
        isContinuing={isSaving}
      >
        <AcademicStep
          data={academicData}
          onChange={handleAcademicChange}
          user={{} as any}
          errors={errors}
        />
      </OnboardingModuleShell>
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
