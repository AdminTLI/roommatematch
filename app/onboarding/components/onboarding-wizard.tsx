'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
// Removed useApp import - using default locale
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { showSuccessToast, showErrorToast } from '@/lib/toast'
import { 
  BasicsStep, 
  AcademicStep,
  LogisticsStep, 
  LifestyleStep, 
  SocialStep, 
  PersonalityStep, 
  CommunicationStep, 
  LanguagesStep, 
  DealBreakersStep 
} from './steps'
import { ArrowLeft, ArrowRight, CheckCircle, Save } from 'lucide-react'

interface OnboardingWizardProps {
  user: User
}

interface WizardStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<any>
  required: boolean
}

export function OnboardingWizard({ user }: OnboardingWizardProps) {
  // Using default English text instead of i18n
  const t = (key: string) => key // Simple fallback for translation keys
  const router = useRouter()
  const supabase = createClient()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const steps: WizardStep[] = [
    {
      id: 'basics',
      title: 'Basics',
      description: 'Tell us about your personal information',
      component: BasicsStep,
      required: true
    },
    {
      id: 'academic',
      title: 'Academic',
      description: 'Your university and programme details',
      component: AcademicStep,
      required: true
    },
    {
      id: 'logistics',
      title: 'Logistics',
      description: 'Housing preferences and budget',
      component: LogisticsStep,
      required: true
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle',
      description: 'Daily routines and habits',
      component: LifestyleStep,
      required: true
    },
    {
      id: 'social',
      title: 'Social',
      description: 'Social preferences and activities',
      component: SocialStep,
      required: true
    },
    {
      id: 'personality',
      title: 'Personality',
      description: 'Communication style and preferences',
      component: PersonalityStep,
      required: true
    },
    {
      id: 'communication',
      title: 'Communication',
      description: 'How you prefer to communicate',
      component: CommunicationStep,
      required: true
    },
    {
      id: 'languages',
      title: 'Languages',
      description: 'Languages you speak',
      component: LanguagesStep,
      required: false
    },
    {
      id: 'dealbreakers',
      title: 'Deal Breakers',
      description: 'Things that are important to you',
      component: DealBreakersStep,
      required: true
    }
  ]

  // Auto-save functionality
  useEffect(() => {
    const autoSave = async () => {
      if (Object.keys(formData).length > 0) {
        setIsSaving(true)
        try {
          await saveProgress()
          setLastSaved(new Date())
        } catch (error) {
          console.error('Auto-save failed:', error)
        } finally {
          setIsSaving(false)
        }
      }
    }

    const timer = setTimeout(autoSave, 5000) // Auto-save every 5 seconds
    return () => clearTimeout(timer)
  }, [formData])

  const saveProgress = async () => {
    // This would save to a temporary storage or database
    // For now, we'll just store in localStorage
    localStorage.setItem('onboarding_progress', JSON.stringify({
      currentStep,
      formData,
      timestamp: new Date().toISOString()
    }))
  }

  const loadProgress = () => {
    const saved = localStorage.getItem('onboarding_progress')
    if (saved) {
      try {
        const { currentStep: savedStep, formData: savedData } = JSON.parse(saved)
        setCurrentStep(savedStep || 0)
        setFormData(savedData || {})
      } catch (error) {
        console.error('Failed to load progress:', error)
      }
    }
  }

  useEffect(() => {
    loadProgress()
  }, [])

  const updateFormData = (stepData: Record<string, any>) => {
    setFormData(prev => ({ ...prev, ...stepData }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const submitOnboarding = async () => {
    setIsLoading(true)
    
    try {
      // Check if user already has an onboarding submission
      const { data: existingSubmission } = await supabase
        .from('onboarding_submissions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingSubmission) {
        console.warn('User already has onboarding submission, skipping')
        router.push('/matches')
        return
      }

      // Get first name from formData
      const firstName = formData.first_name || formData.name || 'User'

      // Start transaction by creating all records
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          university_id: formData.university_id,
          first_name: firstName,
          degree_level: formData.degree_level,
          program: formData.program_id,
          campus: formData.campus_city,
          languages: formData.languages_daily || [],
          verification_status: 'unverified'
        })
        .select()
        .single()

      if (profileError) {
        console.error('Profile creation failed:', profileError)
        throw new Error(`Failed to create profile: ${profileError.message}`)
      }

      // Create user academic record
      const { error: academicError } = await supabase
        .from('user_academic')
        .insert({
          user_id: user.id,
          university_id: formData.university_id,
          degree_level: formData.degree_level,
          program_id: formData.undecided_program ? null : formData.program_id,
          undecided_program: formData.undecided_program || false,
          study_start_year: formData.study_start_year
        })

      if (academicError) {
        console.error('Academic record creation failed:', academicError)
        throw new Error(`Failed to create academic record: ${academicError.message}`)
      }

      // Map form data to valid question_keys only (no profile/academic fields)
      const questionnaireMappings = [
        // Sleep schedule transformations
        { from: 'bedtime', to: 'sleep_start', transform: (v) => {
          const timeMap = {
            'before_10pm': 21, '10pm_11pm': 22, '11pm_12am': 23, 
            '12am_1am': 24, 'after_1am': 25, 'varies': 23
          }
          return timeMap[v] || 23
        }},
        { from: 'wake_time', to: 'sleep_end', transform: (v) => {
          const timeMap = {
            'before_6am': 6, '6am_7am': 7, '7am_8am': 8,
            '8am_9am': 9, '9am_10am': 10, 'after_10am': 11, 'varies': 8
          }
          return timeMap[v] || 8
        }},
        
        // Study preferences
        { from: 'study_location', to: 'study_intensity', transform: (v) => {
          const intensityMap = {
            'home_quiet': 8, 'home_background': 6, 'library': 9,
            'cafe': 4, 'campus': 7, 'flexible': 6
          }
          return intensityMap[v] || 6
        }},
        
        // Cleanliness preferences
        { from: 'cleanliness_level', to: 'cleanliness_room', transform: (v) => v },
        { from: 'cleaning_frequency', to: 'cleanliness_kitchen', transform: (v) => {
          const freqMap = {
            'daily': 9, 'every_other_day': 8, 'weekly': 6,
            'biweekly': 4, 'monthly': 2, 'when_needed': 3
          }
          return freqMap[v] || 6
        }},
        
        // Social preferences
        { from: 'social_level', to: 'social_level', transform: (v) => v },
        { from: 'guest_frequency', to: 'guests_frequency', transform: (v) => {
          const freqMap = {
            'never': 1, 'rarely': 3, 'occasionally': 6,
            'frequently': 8, 'daily': 10
          }
          return freqMap[v] || 5
        }},
        { from: 'activities', to: 'parties_frequency', transform: (v) => {
          // Map activities array to party frequency score
          if (!Array.isArray(v)) return 5
          const partyActivities = ['Parties/Social events', 'Gaming', 'Music']
          const partyCount = v.filter(activity => partyActivities.includes(activity)).length
          return Math.min(10, Math.max(1, partyCount * 3))
        }},
        
        // Noise and environment
        { from: 'noise_preference', to: 'noise_tolerance', transform: (v) => v },
        
        // Shared space usage
        { from: 'shared_space_usage', to: 'food_sharing', transform: (v) => {
          const sharingMap = {
            'minimal': 2, 'moderate': 5, 'frequent': 8, 'flexible': 6
          }
          return sharingMap[v] || 5
        }},
        { from: 'shared_expenses', to: 'utensils_sharing', transform: (v) => {
          const sharingMap = {
            'split_everything': 9, 'split_essentials': 6, 'separate': 2, 'flexible': 5
          }
          return sharingMap[v] || 5
        }},
        
        // Deal breakers
        { from: 'smoking_preference', to: 'smoking', transform: (v) => {
          return v === 'non_smoker' ? false : true
        }},
        { from: 'pet_preference', to: 'pets_allowed', transform: (v) => {
          return v === 'no_pets' ? false : true
        }},
        { from: 'alcohol_preference', to: 'alcohol_at_home', transform: (v) => {
          const alcoholMap = {
            'non_drinker': 1, 'occasional_drinker': 4, 'regular_drinker': 8, 'flexible': 5
          }
          return alcoholMap[v] || 5
        }},
        
        // Personality traits (Big Five) - direct pass-through
        { from: 'extraversion', to: 'extraversion', transform: (v) => v },
        { from: 'agreeableness', to: 'agreeableness', transform: (v) => v },
        { from: 'conscientiousness', to: 'conscientiousness', transform: (v) => v },
        { from: 'neuroticism', to: 'neuroticism', transform: (v) => v },
        { from: 'openness', to: 'openness', transform: (v) => v },
        
        // Communication preferences
        { from: 'conflict_style', to: 'conflict_style', transform: (v) => v },
        { from: 'communication_preference', to: 'communication_preference', transform: (v) => v },
        
        // Chores preference (from deal breakers step)
        { from: 'chores_preference', to: 'chores_preference', transform: (v) => v }
      ]

      // Build responses array with only valid question_keys
      const responses = []
      
      for (const mapping of questionnaireMappings) {
        const value = formData[mapping.from]
        if (value !== undefined && value !== null && value !== '') {
          const transformedValue = mapping.transform(value)
          responses.push({
            user_id: user.id,
            question_key: mapping.to,
            value: transformedValue
          })
        }
      }

      // Save questionnaire responses
      if (responses.length > 0) {
        const { error: responsesError } = await supabase
          .from('responses')
          .upsert(responses, { onConflict: 'user_id,question_key' })

        if (responsesError) {
          console.error('Responses save failed:', responsesError)
          throw new Error(`Failed to save responses: ${responsesError.message}`)
        }
      }

      // Create onboarding submission record
      const { error: submissionError } = await supabase
        .from('onboarding_submissions')
        .insert({
          user_id: user.id,
          completed_at: new Date().toISOString()
        })

      if (submissionError) {
        console.error('Submission record creation failed:', submissionError)
        throw new Error(`Failed to create submission record: ${submissionError.message}`)
      }

      // Create user vector from responses
      const { error: vectorError } = await supabase
        .rpc('compute_user_vector_and_store', { p_user_id: user.id })

      if (vectorError) {
        console.error('Vector generation failed:', vectorError)
        // Don't block onboarding, but log the error
        // In production, you might want to retry or queue this
      }

      // Clear saved progress
      localStorage.removeItem('onboarding_progress')
      
            // Show success message
            showSuccessToast(
              'Onboarding completed!',
              'Your profile has been created and you can now find matches.'
            )
            
            // Redirect to matches (skip verification for now)
            router.push('/matches')
      
    } catch (error) {
      console.error('Failed to submit onboarding:', error)
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      showErrorToast(
        'Onboarding failed',
        `Failed to complete onboarding: ${errorMessage}`
      )
      
    } finally {
      setIsLoading(false)
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100
  const CurrentStepComponent = steps[currentStep].component
  const canProceed = steps[currentStep].required ? 
    Object.keys(formData).some(key => key.includes(steps[currentStep].id)) : true

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to Roommate Match
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Let's get to know you better to find your perfect roommate match
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {lastSaved && `Last saved: ${lastSaved.toLocaleTimeString()}`}
            </div>
          </div>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`flex items-center gap-1 ${
                index <= currentStep ? 'text-primary' : 'text-gray-400'
              }`}
            >
              {index < currentStep ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <div className={`w-3 h-3 rounded-full border ${
                  index === currentStep ? 'border-primary bg-primary' : 'border-gray-300'
                }`} />
              )}
              <span className="hidden sm:inline">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
          <CardDescription className="text-base">
            {steps[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CurrentStepComponent
            data={formData}
            onChange={updateFormData}
            user={user}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-3">
          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Save className="h-4 w-4 animate-pulse" />
              Saving...
            </div>
          )}
          
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={submitOnboarding}
              disabled={isLoading || !canProceed}
              className="px-8"
            >
              {isLoading ? (
                'Completing...'
              ) : (
                <>
                  Complete Setup
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Need help?</strong> Your responses are automatically saved as you go. 
          You can always come back later to complete your profile.
        </p>
      </div>
    </div>
  )
}
