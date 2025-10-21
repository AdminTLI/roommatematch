'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useOnboardingStore } from '@/store/onboarding'
import { useRouter } from 'next/navigation'

interface Props {
  children: ReactNode
  stepIndex: number
  totalSteps: number
  onPrev?: () => void
  onNext?: () => void
  nextDisabled?: boolean
  title: string
  subtitle?: string
}

export function QuestionnaireLayout({
  children,
  stepIndex,
  totalSteps,
  onPrev,
  onNext,
  nextDisabled,
  title,
  subtitle,
}: Props) {
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100)
  const router = useRouter()
  const lastSavedAt = useOnboardingStore((s) => s.lastSavedAt)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">Roommate Match</div>
          <div className="flex items-center gap-3 w-1/2">
            <Progress value={progress} className="h-2 flex-1" />
            <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
              Step {stepIndex + 1} of {totalSteps}
            </div>
          </div>
          <button
            className="text-sm text-gray-600 hover:text-gray-900 underline"
            onClick={() => router.push('/dashboard')}
          >
            Save & exit
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 flex-1 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          </div>
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 space-y-6">{children}</CardContent>
          </Card>
        </div>
      </main>

      <div className="sticky bottom-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-t">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="outline" onClick={onPrev} disabled={!onPrev} className="h-11 px-6 rounded-xl">
            Previous
          </Button>
          <div className="flex items-center gap-4">
            {lastSavedAt && (
              <span className="text-sm text-gray-600">Last saved at {new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            )}
            <Button onClick={onNext} disabled={!!nextDisabled} className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


