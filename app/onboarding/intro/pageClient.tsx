'use client'

import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout'
import { AcademicStep } from '../components/steps/academic-step'
import { AutosaveToaster } from '@/components/questionnaire/AutosaveToaster'
import { useAutosave } from '@/components/questionnaire/useAutosave'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function IntroClient() {
  // Keep intro as non-autosaved for now; academic data saved on submit of legacy flow
  return (
    <QuestionnaireLayout
      stepIndex={0}
      totalSteps={11}
      title="Tell us about yourself"
      subtitle="Your university and programme details plus consent to begin"
      onNext={() => (window.location.href = '/onboarding/location-commute')}
    >
      <AutosaveToaster show={false} />
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>About your studies</CardTitle>
          <CardDescription>We use this to match you within your university community.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Reuse existing academic step UI */}
          <AcademicStep data={{}} onChange={() => {}} user={{} as any} />
        </CardContent>
      </Card>
    </QuestionnaireLayout>
  )
}


