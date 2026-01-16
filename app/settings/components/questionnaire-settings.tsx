'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Edit,
  RotateCcw,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

interface QuestionnaireSettingsProps {
  progressData: {
    completedSections: string[]
    totalSections: number
    isFullySubmitted: boolean
    lastUpdated: string | null
    submittedAt: string | null
  }
}

export function QuestionnaireSettings({ progressData }: QuestionnaireSettingsProps) {
  const router = useRouter()
  const [isResetting, setIsResetting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { completedSections, totalSections, isFullySubmitted, lastUpdated, submittedAt } = progressData
  const progressPercentage = Math.round((completedSections.length / totalSections) * 100)

  const handleEditAnswers = () => {
    router.push('/onboarding/intro?mode=edit')
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
        router.push('/onboarding')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsResetting(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSectionDisplayName = (section: string) => {
    const names: Record<string, string> = {
      'intro': 'Introduction',
      'location-commute': 'Location & Commute',
      'personality-values': 'Personality & Values',
      'sleep-circadian': 'Sleep & Circadian',
      'noise-sensory': 'Noise & Sensory',
      'home-operations': 'Home Operations',
      'social-hosting-language': 'Social & Hosting',
      'communication-conflict': 'Communication',
      'privacy-territoriality': 'Privacy & Territory',
      'reliability-logistics': 'Reliability & Logistics'
    }
    return names[section] || section
  }

  const getSectionRoute = (section: string) => {
    const routes: Record<string, string> = {
      'intro': '/onboarding/intro',
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
    return routes[section] || '/onboarding'
  }

  const handleEditSection = (section: string) => {
    const route = getSectionRoute(section)
    router.push(`${route}?mode=edit`)
  }

  return (
    <div className="space-y-10">
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

      {/* Progress Overview Group */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider px-1">Progress Overview</h3>
        <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden p-6 space-y-6 backdrop-blur-xl">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Overall Completion</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-zinc-900 dark:text-white">{progressPercentage}%</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-semibold pb-1">
                  {completedSections.length} / {totalSections} Sections
                </span>
              </div>
            </div>
            {isFullySubmitted ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                Completed
              </Badge>
            ) : (
              <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                In Progress
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2 bg-zinc-200 dark:bg-white/5 overflow-hidden">
              {/* Note: In a real app, the inner div would have bg-blue-500 */}
            </Progress>
            <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-tighter">
              <span>Start</span>
              <span>Submit</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-zinc-200 dark:border-white/5">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Last Updated</p>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">{formatDate(lastUpdated)}</p>
            </div>
            {submittedAt && (
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Submitted</p>
                <p className="text-sm text-zinc-900 dark:text-zinc-100">{formatDate(submittedAt)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completed Sections Group */}
      {completedSections.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider px-1">Completed Sections</h3>
          <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-zinc-200 dark:divide-white/5 backdrop-blur-xl">
            {completedSections.map((section) => (
              <button
                key={section}
                onClick={() => handleEditSection(section)}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all duration-300 group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-zinc-900 dark:text-zinc-100 text-sm font-medium block">{getSectionDisplayName(section)}</span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-tighter">Section Completed</span>
                  </div>
                </div>
                <Edit className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions Group */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider px-1">Quick Actions</h3>
        <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 space-y-6 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleEditAnswers}
              className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 font-semibold"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Responses
            </Button>

            <Button
              onClick={handleRetakeQuestionnaire}
              variant="outline"
              disabled={isResetting}
              className="flex-1 h-12 border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-900 dark:text-zinc-100 rounded-xl"
            >
              {isResetting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake All
                </>
              )}
            </Button>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200 dark:border-white/5 space-y-3">
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              <strong className="text-zinc-900 dark:text-zinc-100">Edit Responses:</strong> Modify specific sections without clearing your progress. Your current matches will be updated automatically.
            </p>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              <strong className="text-zinc-900 dark:text-zinc-100">Retake All:</strong> This will archive your current responses and start the matching process from scratch.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
