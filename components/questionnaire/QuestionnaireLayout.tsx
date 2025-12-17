'use client'

import { ReactNode, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useOnboardingStore } from '@/store/onboarding'
import { useRouter } from 'next/navigation'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { showErrorToast, showSuccessToast } from '@/lib/toast'
import type { SectionKey } from '@/types/questionnaire'

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
  const sections = useOnboardingStore((s) => s.sections)
  const [isSavingAll, setIsSavingAll] = useState(false)

  // Save all sections before navigating to dashboard
  const handleSaveAndExit = async () => {
    setIsSavingAll(true)
    try {
      // Get all sections that have answers
      const allSections = Object.keys(sections) as SectionKey[]
      const sectionsWithAnswers = allSections.filter(sectionKey => {
        const sectionAnswers = sections[sectionKey]
        return sectionAnswers && Object.keys(sectionAnswers).length > 0
      })

      if (sectionsWithAnswers.length === 0) {
        // No sections to save, navigate directly
        router.push('/dashboard')
        return
      }

      // Save all sections that have answers and track results
      const saveResults = await Promise.allSettled(
        sectionsWithAnswers.map(async (sectionKey) => {
          const sectionAnswers = sections[sectionKey]
          const answersArray = Object.values(sectionAnswers)
          
          if (answersArray.length === 0) {
            return { sectionKey, success: true }
          }
          
          try {
            const res = await fetchWithCSRF('/api/onboarding/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ section: sectionKey, answers: answersArray }),
            })
            
            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}))
              throw new Error(errorData.error || `Failed to save ${sectionKey}`)
            }
            
            return { sectionKey, success: true }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to save ${sectionKey}`
            return { sectionKey, success: false, error: errorMessage }
          }
        })
      )
      
      // Process results: extract failures
      const failures: Array<{ section: string; error: string }> = []
      saveResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          failures.push({
            section: sectionsWithAnswers[index],
            error: result.reason?.message || 'Unknown error'
          })
        } else if (result.value && !result.value.success) {
          failures.push({
            section: result.value.sectionKey,
            error: result.value.error || 'Save failed'
          })
        }
      })
      
      // If any saves failed, show error and stay on page
      if (failures.length > 0) {
        const failedSections = failures.map(f => f.section).join(', ')
        showErrorToast(
          'Failed to save some sections',
          `Could not save: ${failedSections}. Please try again or contact support if the problem persists.`
        )
        setIsSavingAll(false)
        return // Don't navigate - keep user on page
      }
      
      // All saves succeeded
      showSuccessToast('All sections saved', 'Your progress has been saved successfully.')
      
      // Small delay to ensure database has processed the saves
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Navigate to dashboard only after all saves succeeded
      router.push('/dashboard')
    } catch (error) {
      // Unexpected error during save process
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      showErrorToast(
        'Failed to save progress',
        `${errorMessage}. Please try again or contact support if the problem persists.`
      )
      // Don't navigate - keep user on page to retry
    } finally {
      setIsSavingAll(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between mb-3 sm:mb-0">
            <div className="font-semibold text-sm sm:text-base">Domu Match</div>
            <button
              className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 underline disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSaveAndExit}
              disabled={isSavingAll}
            >
              {isSavingAll ? 'Saving...' : 'Save & exit'}
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Progress value={progress} className="h-2 flex-1" />
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
              Step {stepIndex + 1} of {totalSteps}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 flex-1 py-5 sm:py-6 lg:py-8">
        <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">{title}</h1>
            {subtitle && <p className="text-base sm:text-base text-gray-600 mt-2 sm:mt-1">{subtitle}</p>}
          </div>
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-5 sm:p-6 space-y-6 sm:space-y-6">{children}</CardContent>
          </Card>
        </div>
      </main>

      <div className="sticky bottom-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-t">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <Button variant="outline" onClick={onPrev} disabled={!onPrev} className="min-h-[44px] px-4 sm:px-6 rounded-xl text-sm sm:text-base">
              Previous
            </Button>
            <div className="flex items-center gap-2 sm:gap-4">
              {lastSavedAt && (
                <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">Last saved at {new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              )}
              <Button onClick={onNext} disabled={!!nextDisabled} className="min-h-[44px] px-4 sm:px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm sm:text-base">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


