'use client'

import { useState } from 'react'
import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout'
import { AcademicStep } from '../components/steps/academic-step'
import { AutosaveToaster } from '@/components/questionnaire/AutosaveToaster'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function IntroClient() {
  const [academicData, setAcademicData] = useState<Record<string, any>>({})
  const [isValid, setIsValid] = useState(false)
  const router = useRouter()

  const handleAcademicChange = (data: Record<string, any>) => {
    setAcademicData(data)
    
    // Simple validation - check if required fields are present
    const hasUniversity = data.institution_slug || data.institution_other
    const hasDegreeLevel = data.degree_level
    const hasProgram = data.program_id || data.undecided_program
    const hasStartYear = data.study_start_year
    
    setIsValid(hasUniversity && hasDegreeLevel && hasProgram && hasStartYear)
  }

  const handleNext = () => {
    if (isValid) {
      // TODO: Save academic data to store or API
      router.push('/onboarding/location-commute')
    }
  }

  return (
    <QuestionnaireLayout
      stepIndex={0}
      totalSteps={11}
      title="Tell us about yourself"
      subtitle="Your university and programme details plus consent to begin"
      onNext={handleNext}
      nextDisabled={!isValid}
    >
      <AutosaveToaster show={false} />
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>About your studies</CardTitle>
          <CardDescription>We use this to match you within your university community.</CardDescription>
        </CardHeader>
        <CardContent>
          <AcademicStep 
            data={academicData} 
            onChange={handleAcademicChange} 
            user={{} as any} 
          />
        </CardContent>
      </Card>
    </QuestionnaireLayout>
  )
}


