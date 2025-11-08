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
      const response = await fetch('/api/settings/questionnaire/reset', {
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
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Questionnaire Progress
          </CardTitle>
          <CardDescription>
            Track your compatibility questionnaire completion status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Progress</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{completedSections.length}</span>
                  <span className="text-lg text-gray-500">/ {totalSections}</span>
                  <span className="text-sm text-gray-500">sections</span>
                </div>
              </div>
              <div>
                {isFullySubmitted ? (
                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 px-3 py-1.5">
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Completed
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="px-3 py-1.5">
                    <Clock className="w-4 h-4 mr-1.5" />
                    In Progress
                  </Badge>
                )}
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {/* Status Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Updated</p>
              <p className="text-sm font-semibold text-gray-900">{formatDate(lastUpdated)}</p>
            </div>
            {submittedAt && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Submitted</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(submittedAt)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completed Sections */}
      {completedSections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Sections</CardTitle>
            <CardDescription>
              Click on any section to edit your responses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {completedSections.map((section) => (
                <button
                  key={section}
                  onClick={() => handleEditSection(section)}
                  className="flex items-center justify-between gap-3 p-3 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 truncate">{getSectionDisplayName(section)}</span>
                  </div>
                  <Edit className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Questionnaire Actions</CardTitle>
          <CardDescription>
            Manage your questionnaire responses and completion status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleEditAnswers}
              variant="primary"
              className="flex items-center gap-2"
              size="lg"
            >
              <Edit className="w-4 h-4" />
              Edit My Answers
            </Button>
            
            <Button 
              onClick={handleRetakeQuestionnaire}
              variant="outline"
              disabled={isResetting}
              className="flex items-center gap-2"
            >
              {isResetting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Retake Questionnaire
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-gray-500 space-y-1">
            <p><strong>Edit My Answers:</strong> Modify your existing responses without losing progress.</p>
            <p><strong>Retake Questionnaire:</strong> Start fresh with a new questionnaire (clears submission status).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
