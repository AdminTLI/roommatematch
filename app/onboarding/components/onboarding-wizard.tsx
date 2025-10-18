'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
// Removed useApp import - using default locale
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
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
      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          budget_min: formData.budget_min,
          budget_max: formData.budget_max,
          move_in_date: formData.move_in_date,
          location_preference: formData.location_preference,
          verification_status: 'pending'
        })
        .select()
        .single()

      if (profileError) throw profileError

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

      if (academicError) throw academicError

      // Save questionnaire responses
      const responses = []
      for (const [stepId, stepData] of Object.entries(formData)) {
        if (stepId.startsWith('question_')) {
          const questionId = stepId.replace('question_', '')
          responses.push({
            user_id: user.id,
            question_id: questionId,
            response_value: stepData
          })
        }
      }

      if (responses.length > 0) {
        const { error: responsesError } = await supabase
          .from('responses')
          .insert(responses)

        if (responsesError) throw responsesError
      }

      // Clear saved progress
      localStorage.removeItem('onboarding_progress')
      
      // Redirect to verification
      router.push('/verify')
      
    } catch (error) {
      console.error('Failed to submit onboarding:', error)
      // Handle error (show toast, etc.)
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
