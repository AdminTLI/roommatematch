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
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{completedSections.length}</span>
                <span className="text-gray-500">/ {totalSections} sections</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
            </div>
            <div className="text-right">
              {isFullySubmitted ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Clock className="w-3 h-3 mr-1" />
                  In Progress
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Last updated:</span>
              <span className="ml-2 font-medium">{formatDate(lastUpdated)}</span>
            </div>
            {submittedAt && (
              <div>
                <span className="text-gray-500">Submitted:</span>
                <span className="ml-2 font-medium">{formatDate(submittedAt)}</span>
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
              Sections you have already filled out.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {completedSections.map((section) => (
                <div key={section} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">{getSectionDisplayName(section)}</span>
                </div>
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
