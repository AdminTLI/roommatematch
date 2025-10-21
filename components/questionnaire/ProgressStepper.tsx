'use client'

import { Progress } from '@/components/ui/progress'
import { useOnboardingStore } from '@/store/onboarding'

export function ProgressStepper() {
  const computeProgress = useOnboardingStore((s) => s.computeProgress)
  const value = computeProgress()
  return <Progress value={value} className="h-2" />
}


