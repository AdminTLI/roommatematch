'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  FileDown,
  Edit,
  RotateCcw,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { downloadBlob } from '@/lib/pdf/download-blob'
import { SettingsSection } from '@/components/settings/settings-section'

interface QuestionnaireSettingsProps {
  progressData: {
    completedSections: string[]
    /** Canonical module order for the active questionnaire version (v2 or legacy). */
    requiredSections?: string[]
    totalSections: number
    isFullySubmitted: boolean
    lastUpdated: string | null
    submittedAt: string | null
  }
  /** 'student' | 'professional' | null - used for edit/retake routes (professional → onboarding-professional) */
  userType?: 'student' | 'professional' | null
}

export function QuestionnaireSettings({ progressData, userType }: QuestionnaireSettingsProps) {
  const router = useRouter()
  const [isResetting, setIsResetting] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    completedSections,
    requiredSections,
    totalSections,
    isFullySubmitted,
    lastUpdated,
    submittedAt,
  } = progressData
  const completedSectionSet = new Set(completedSections)
  const moduleSections =
    requiredSections && requiredSections.length > 0 ? requiredSections : completedSections
  // "Last updated" should reflect whichever happened more recently:
  // - last save & exit (lastUpdated)
  // - final submission (submittedAt)
  const getMostRecentDateString = (a: string | null, b: string | null) => {
    if (!a && !b) return null
    if (!a) return b
    if (!b) return a
    const aMs = new Date(a).getTime()
    const bMs = new Date(b).getTime()
    if (Number.isNaN(aMs)) return b
    if (Number.isNaN(bMs)) return a
    return bMs >= aMs ? b : a
  }

  const lastUpdatedMostRecent = getMostRecentDateString(lastUpdated, submittedAt)
  const progressPercentage = totalSections > 0 ? Math.round((completedSections.length / totalSections) * 100) : 0
  const isProfessional = userType === 'professional'
  const onboardingBase = isProfessional ? '/onboarding-professional' : '/onboarding'

  const handleEditAnswers = () => {
    router.push(`${onboardingBase}/review?mode=edit`)
  }

  const handleRetakeQuestionnaire = async () => {
    setIsResetting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetchWithCSRF('/api/settings/questionnaire/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reset questionnaire')
      }

      setSuccess('Questionnaire reset successfully! You can now retake it.')
      setTimeout(() => {
        router.push(isProfessional ? '/onboarding-professional' : '/onboarding')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsResetting(false)
    }
  }

  const handleDownloadResponsesPdf = async () => {
    setIsDownloadingPdf(true)
    setError(null)
    setSuccess(null)

    try {
      // The endpoint will generate a PDF from saved onboarding sections.
      const response = await fetchWithCSRF('/api/pdf/generate-onboarding-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage =
          errorData?.error ||
          errorData?.details ||
          (response.status === 429 ? 'Too many PDF requests. Please try again in a few minutes.' : 'Failed to generate PDF')
        throw new Error(errorMessage)
      }

      const blob = await response.blob()
      await downloadBlob(
        blob,
        `domu-match-responses-${new Date().toISOString().split('T')[0]}.pdf`,
      )
      setSuccess('Responses PDF downloaded successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to download PDF')
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    // Use toLocaleString (not toLocaleDateString) so we can reliably control time output (24h vs 12h).
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const getSectionDisplayName = (section: string) => {
    const names: Record<string, string> = {
      // v2 modules (current onboarding)
      'logistics-context': 'Logistics and Context',
      'environment-rhythms': 'Environment and Rhythms',
      'cleanliness-operations': 'Cleanliness and Operations',
      'communication-resolution': 'Talking things through',
      'social-spaces': 'Social Life and Spaces',
      // setup + legacy v1
      'intro': 'Introduction',
      'location-commute': 'Location & Commute',
      'professional-context': 'Professional Context',
      'personality-values': 'Personality & Values',
      'sleep-circadian': 'Sleep & schedule',
      'noise-sensory': 'Noise & Sensory',
      'home-operations': 'Chores & shared space',
      'social-hosting-language': 'Guests, hanging out & language',
      'communication-conflict': 'Talking things through',
      'privacy-territoriality': 'Privacy & personal space',
      'reliability-logistics': 'Reliability & Logistics',
    }
    return names[section] || section
  }

  const getSectionRoute = (section: string) => {
    const base = onboardingBase
    const routes: Record<string, string> = {
      // v2 modules
      'logistics-context': `${base}/logistics-context`,
      'environment-rhythms': `${base}/environment-rhythms`,
      'cleanliness-operations': `${base}/cleanliness-operations`,
      'communication-resolution': `${base}/communication-resolution`,
      'social-spaces': `${base}/social-spaces`,
      // setup + legacy v1
      'intro': `${base}/intro`,
      'location-commute': `${base}/location-commute`,
      'professional-context': `${base}/professional-context`,
      'personality-values': `${base}/personality-values`,
      'sleep-circadian': `${base}/sleep-circadian`,
      'noise-sensory': `${base}/noise-sensory`,
      'home-operations': `${base}/home-operations`,
      'social-hosting-language': `${base}/social-hosting-language`,
      'communication-conflict': `${base}/communication-conflict`,
      'privacy-territoriality': `${base}/privacy-territoriality`,
      'reliability-logistics': `${base}/reliability-logistics`,
    }
    return routes[section] || base
  }

  const handleEditSection = (section: string) => {
    const route = getSectionRoute(section)
    router.push(`${route}?mode=edit`)
  }

  return (
    <div className="divide-y divide-zinc-200/80 dark:divide-white/[0.06]">
      {(error || success) && (
        <div className="space-y-3 py-6">
          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <SettingsSection
        title="Progress overview"
        description="How far you are through the living-together questionnaire."
      >
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="min-w-0 space-y-1.5">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Overall completion</p>
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">{progressPercentage}%</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {completedSections.length} of {totalSections} modules
                </span>
              </div>
            </div>
            <div className="flex shrink-0 self-start sm:self-auto">
              {isFullySubmitted ? (
                <Badge className="whitespace-nowrap rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Completed
                </Badge>
              ) : (
                <Badge className="whitespace-nowrap rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  In Progress
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2 bg-zinc-200 dark:bg-white/5 overflow-hidden" />
            <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
              <span>Start</span>
              <span>Submit</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 border-t border-zinc-200/70 pt-5 dark:border-white/[0.06]">
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Last updated</p>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">{formatDate(lastUpdatedMostRecent)}</p>
            </div>
            {submittedAt && (
              <div className="space-y-1 text-right">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Submitted</p>
                <p className="text-sm text-zinc-900 dark:text-zinc-100">{formatDate(submittedAt)}</p>
              </div>
            )}
          </div>
        </div>
      </SettingsSection>

      {moduleSections.length > 0 && (
        <SettingsSection
          title="Questionnaire modules"
          description="Jump into any module to review or edit your answers."
        >
          <div className="divide-y divide-zinc-200/70 dark:divide-white/[0.06]">
            {moduleSections.map((section) => {
              const isComplete = completedSectionSet.has(section)
              return (
                <button
                  key={section}
                  onClick={() => handleEditSection(section)}
                  className="group flex w-full items-center justify-between py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isComplete
                          ? 'bg-emerald-500/10'
                          : 'bg-zinc-100 dark:bg-white/5'
                      }`}
                      aria-label={isComplete ? 'Completed' : 'Not completed'}
                    >
                      {isComplete ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Clock className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {getSectionDisplayName(section)}
                    </span>
                  </div>
                  <Edit className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-zinc-700 dark:text-zinc-500 dark:group-hover:text-zinc-200" />
                </button>
              )
            })}
          </div>
        </SettingsSection>
      )}

      <SettingsSection
        title="Quick actions"
        description="Edit answers, export a PDF, or start the questionnaire over."
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Button
              onClick={handleEditAnswers}
              className="h-11 rounded-xl bg-indigo-500 text-sm font-semibold text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:bg-indigo-600"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit responses
            </Button>

            <Button
              onClick={handleDownloadResponsesPdf}
              variant="outline"
              disabled={isDownloadingPdf}
              className="h-11 rounded-xl border-zinc-200 text-sm text-zinc-900 hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-100 dark:hover:bg-white/5"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Download responses PDF
                </>
              )}
            </Button>

            <Button
              onClick={handleRetakeQuestionnaire}
              variant="outline"
              disabled={isResetting}
              className="h-11 rounded-xl border-zinc-200 text-sm text-zinc-900 hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-100 dark:hover:bg-white/5"
            >
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retake all
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3 border-t border-zinc-200/70 pt-6 dark:border-white/[0.06]">
            <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              <span className="font-medium text-zinc-800 dark:text-zinc-200">Edit responses:</span> Open the review page to see all your answers, then jump into any module to change one. Your current matches will be updated automatically.
            </p>
            <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              <span className="font-medium text-zinc-800 dark:text-zinc-200">Retake all:</span> Archives your current responses and starts the matching process from scratch.
            </p>
            <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              <span className="font-medium text-zinc-800 dark:text-zinc-200">Download responses PDF:</span> Export your latest questionnaire answers as a PDF.
            </p>
          </div>
        </div>
      </SettingsSection>
    </div>
  )
}
