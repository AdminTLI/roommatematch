'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CompatibilityScores {
  overall_score: number
  personality_score: number
  schedule_score: number
  lifestyle_score: number
  social_score: number
  academic_score: number
}

interface GroupCompatibilityDisplayProps {
  compatibility: CompatibilityScores
  compact?: boolean
  showOutliers?: boolean
  memberDeviations?: Array<{
    user_id: string
    is_outlier: boolean
    outlier_categories: string[]
  }>
}

const categoryLabels = {
  personality: 'Personality',
  schedule: 'Schedule',
  lifestyle: 'Lifestyle',
  social: 'Social',
  academic: 'Academic'
}

const categoryDescriptions = {
  personality: 'How well personalities align (communication style, values, conflict resolution)',
  schedule: 'Sleep patterns, study hours, and daily routines compatibility',
  lifestyle: 'Cleanliness preferences, noise tolerance, and home habits',
  social: 'Guest policies, party frequency, and social activity levels',
  academic: 'University, program, and study year alignment'
}

export function GroupCompatibilityDisplay({
  compatibility,
  compact = false,
  showOutliers = false,
  memberDeviations
}: GroupCompatibilityDisplayProps) {
  const categories = [
    { key: 'personality', score: compatibility.personality_score },
    { key: 'schedule', score: compatibility.schedule_score },
    { key: 'lifestyle', score: compatibility.lifestyle_score },
    { key: 'social', score: compatibility.social_score },
    { key: 'academic', score: compatibility.academic_score }
  ] as const

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-blue-600'
    if (score >= 0.4) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' => {
    if (score >= 0.8) return 'default'
    if (score >= 0.6) return 'secondary'
    return 'destructive'
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Group Compatibility</span>
          <Badge variant={getScoreBadgeVariant(compatibility.overall_score)}>
            {Math.round(compatibility.overall_score * 100)}%
          </Badge>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {categories.map(({ key, score }) => (
            <TooltipProvider key={key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center">
                    <div className={`text-xs font-semibold ${getScoreColor(score)}`}>
                      {Math.round(score * 100)}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">
                      {key.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{categoryLabels[key]}</p>
                  <p className="text-xs">{categoryDescriptions[key]}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Group Compatibility</CardTitle>
          <Badge variant={getScoreBadgeVariant(compatibility.overall_score)} className="text-lg px-3 py-1">
            {Math.round(compatibility.overall_score * 100)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map(({ key, score }) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {categoryLabels[key]}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{categoryDescriptions[key]}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                {Math.round(score * 100)}%
              </span>
            </div>
            <Progress value={score * 100} className="h-2" />
          </div>
        ))}

        {showOutliers && memberDeviations && memberDeviations.some(m => m.is_outlier) && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 mb-2">
              Compatibility Notes
            </p>
            <ul className="text-xs text-yellow-700 space-y-1">
              {memberDeviations
                .filter(m => m.is_outlier)
                .map((member, idx) => (
                  <li key={idx}>
                    One member has different preferences in:{' '}
                    {member.outlier_categories.map(c => categoryLabels[c as keyof typeof categoryLabels]).join(', ')}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


