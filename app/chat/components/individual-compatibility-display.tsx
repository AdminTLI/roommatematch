'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  GraduationCap, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Home,
  Users,
  Clock,
  Droplets,
  Volume2,
  Moon,
  Coffee,
  BookOpen,
  Heart
} from 'lucide-react'
import { useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface IndividualCompatibilityData {
  compatibility_score: number
  personality_score: number
  schedule_score: number
  lifestyle_score: number
  social_score: number
  academic_bonus: number
  penalty?: number
  top_alignment?: string | null
  watch_out?: string | null
  house_rules_suggestion?: string | null
  academic_details?: any
  personalized_explanation?: string
  // New fields from compatibility algorithm v1.0
  harmony_score?: number | null
  context_score?: number | null
  dimension_scores_json?: { [key: string]: number } | null
  is_valid_match?: boolean
  algorithm_version?: string
}

interface IndividualCompatibilityDisplayProps {
  compatibility: IndividualCompatibilityData
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

// Dimension labels, descriptions, and icons
const dimensionConfig: { [key: string]: { label: string; description: string; icon: any } } = {
  cleanliness: {
    label: 'Cleanliness',
    description: 'How well your cleanliness standards align (kitchen, bathroom, living areas)',
    icon: Droplets
  },
  noise: {
    label: 'Noise Tolerance',
    description: 'Compatibility around noise sensitivity, parties, and music volume',
    icon: Volume2
  },
  guests: {
    label: 'Guest Frequency',
    description: 'Alignment on how often friends or partners stay over',
    icon: Users
  },
  sleep: {
    label: 'Sleep Schedule',
    description: 'Sleep schedule compatibility (early bird vs night owl)',
    icon: Moon
  },
  shared_spaces: {
    label: 'Shared Spaces',
    description: 'Preferences for using common areas vs private spaces',
    icon: Home
  },
  substances: {
    label: 'Substances',
    description: 'Comfort levels around alcohol or other substances at home',
    icon: Coffee
  },
  study_social: {
    label: 'Study/Social Balance',
    description: 'Balance between study time and social activities',
    icon: BookOpen
  },
  home_vibe: {
    label: 'Home Vibe',
    description: 'Home atmosphere preference (quiet retreat vs social hub)',
    icon: Heart
  }
}

export function IndividualCompatibilityDisplay({
  compatibility
}: IndividualCompatibilityDisplayProps) {
  const [showDimensions, setShowDimensions] = useState(false)
  
  const categories = [
    { key: 'personality', score: compatibility.personality_score },
    { key: 'schedule', score: compatibility.schedule_score },
    { key: 'lifestyle', score: compatibility.lifestyle_score },
    { key: 'social', score: compatibility.social_score },
    { key: 'academic', score: compatibility.academic_bonus }
  ] as const
  
  // Parse watch_out messages (may be concatenated string)
  const watchOutMessages = compatibility.watch_out 
    ? compatibility.watch_out.split(/[.!?]\s+/).filter(msg => msg.trim().length > 0)
    : []

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 0.6) return 'text-blue-600 dark:text-blue-400'
    if (score >= 0.4) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 0.8) return 'bg-emerald-500'
    if (score >= 0.6) return 'bg-blue-500'
    if (score >= 0.4) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 0.8) return 'from-emerald-500 to-emerald-600'
    if (score >= 0.6) return 'from-blue-500 to-blue-600'
    if (score >= 0.4) return 'from-amber-500 to-amber-600'
    return 'from-red-500 to-red-600'
  }

  // Find strengths (high-scoring categories)
  const strengths = categories.filter(cat => cat.score >= 0.7)

  // Format top alignment
  const formatTopAlignment = (alignment: string | null | undefined) => {
    if (!alignment) return null
    return alignment
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const matchScore = Math.round(compatibility.compatibility_score * 100)
  const harmonyScore = compatibility.harmony_score !== null && compatibility.harmony_score !== undefined
    ? Math.round(compatibility.harmony_score * 100)
    : null
  const contextScore = compatibility.context_score !== null && compatibility.context_score !== undefined
    ? Math.round(compatibility.context_score * 100)
    : null

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Main Score Card - Hero Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
            {/* Large Score Circle */}
            <div className="relative flex-shrink-0">
              <div className={`w-28 h-28 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br ${getScoreGradient(compatibility.compatibility_score)} flex items-center justify-center shadow-lg`}>
                <span className="text-4xl sm:text-4xl font-bold text-white">
                  {matchScore}
                </span>
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-7 h-7 sm:w-6 sm:h-6 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
            
            {/* Score Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {matchScore}% Match
              </h2>
              {compatibility.top_alignment && (
                <p className="text-base sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  <span className="font-semibold">Best match on:</span>{' '}
                  <span className="capitalize">{formatTopAlignment(compatibility.top_alignment)}</span>
                </p>
              )}
            </div>
        </div>
        </CardContent>
      </Card>

      {/* Dealbreaker Warning */}
      {compatibility.is_valid_match === false && (
        <Alert variant="destructive" className="border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40">
          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-sm font-medium">
            <span className="font-bold text-red-900 dark:text-red-100 block mb-2 sm:mb-1">
              Dealbreaker Conflicts Detected
            </span>
            <span className="text-red-700 dark:text-red-300 leading-relaxed">
              This match has dealbreaker conflicts (smoking, pets, budget, lease length, or gender preferences) 
              and may not be suitable for rooming together.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Harmony & Context Score Cards - Side by Side */}
      {(harmonyScore !== null || contextScore !== null) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {harmonyScore !== null && (
            <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
              <CardContent className="p-5 sm:p-5">
                <div className="flex items-start justify-between mb-4 sm:mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                      <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-base font-semibold text-gray-900 dark:text-gray-100">Harmony</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Day-to-day living</p>
                    </div>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-5 h-5 sm:w-4 sm:h-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Compatibility across 8 lifestyle dimensions</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-3 sm:space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl sm:text-3xl font-bold ${getScoreColor(compatibility.harmony_score!)}`}>
                      {harmonyScore}%
                </span>
              </div>
                  <div className="relative h-3 sm:h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(compatibility.harmony_score!)} transition-all duration-500`}
                      style={{ width: `${harmonyScore}%` }}
              />
            </div>
        </div>
              </CardContent>
            </Card>
          )}
          
          {contextScore !== null && (
            <Card className="border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
              <CardContent className="p-5 sm:p-5">
                <div className="flex items-start justify-between mb-4 sm:mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                      <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-base font-semibold text-gray-900 dark:text-gray-100">Context</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Academic similarity</p>
          </div>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-5 h-5 sm:w-4 sm:h-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">University, program, and study year alignment</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-3 sm:space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl sm:text-3xl font-bold ${getScoreColor(compatibility.context_score!)}`}>
                      {contextScore}%
              </span>
                  </div>
                  <div className="relative h-3 sm:h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(compatibility.context_score!)} transition-all duration-500`}
                      style={{ width: `${contextScore}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        )}

      {/* Strengths - Compact Pills */}
        {strengths.length > 0 && (
        <div>
          <h3 className="text-base sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 sm:mb-3">Strengths</h3>
            <div className="flex flex-wrap gap-3 sm:gap-2">
              {strengths.map(({ key }) => (
                <Badge 
                  key={key} 
                variant="secondary"
                className="px-4 py-2 sm:px-3 sm:py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-medium text-sm sm:text-sm"
                >
                  {categoryLabels[key]}
                </Badge>
              ))}
            </div>
          </div>
        )}

      {/* Detailed Dimension Scores - Grid Layout */}
      {compatibility.dimension_scores_json && typeof compatibility.dimension_scores_json === 'object' && (
        <Card className="border-2">
          <CardContent className="p-0">
            <button
              onClick={() => setShowDimensions(!showDimensions)}
              className="w-full flex items-center justify-between p-5 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors touch-manipulation min-h-[60px] sm:min-h-0"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                  Detailed Dimension Scores
                </h3>
              </div>
              {showDimensions ? (
                <ChevronUp className="w-6 h-6 sm:w-5 sm:h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-6 h-6 sm:w-5 sm:h-5 text-gray-400" />
              )}
            </button>
            
            {showDimensions && (
              <div className="px-5 pb-5 sm:pb-5 pt-3 sm:pt-2 border-t">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(compatibility.dimension_scores_json).map(([key, score]) => {
                    const dimensionKey = key as string
                    const dimensionScore = typeof score === 'number' ? score : 0
                    const config = dimensionConfig[dimensionKey]
                    const Icon = config?.icon || Info
                    const label = config?.label || dimensionKey
                    const description = config?.description || ''
                    
                    return (
                      <div 
                        key={dimensionKey} 
                        className="p-4 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-900/40 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3 sm:mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Icon className="w-5 h-5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <span className="text-base sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {label}
                            </span>
                            {description && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="w-4 h-4 sm:w-3 sm:h-3 text-gray-400 cursor-help flex-shrink-0" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs max-w-xs">{description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <span className={`text-base sm:text-sm font-bold ml-2 flex-shrink-0 ${getScoreColor(dimensionScore)}`}>
                            {Math.round(dimensionScore * 100)}%
                          </span>
                        </div>
                        <div className="relative h-2 sm:h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                          <div 
                            className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(dimensionScore)} transition-all duration-500`}
                            style={{ width: `${dimensionScore * 100}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Score Breakdown - Compact Grid */}
      <div>
        <h3 className="text-base sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Score Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-3">
          {categories.map(({ key, score }) => (
            <div 
              key={key} 
              className="p-4 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-2">
                <span className="text-base sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  {categoryLabels[key]}
              </span>
                <span className={`text-base sm:text-sm font-bold ${getScoreColor(score)}`}>
                  {Math.round(score * 100)}%
              </span>
              </div>
              <div className="relative h-2.5 sm:h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(score)} transition-all duration-500`}
                  style={{ width: `${score * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized Explanation */}
      {compatibility.personalized_explanation && (
        <Card className="border-2 border-gray-200 dark:border-gray-800">
          <CardContent className="p-5 sm:p-5">
            <h3 className="text-base sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 sm:mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" />
              Why You're Compatible
            </h3>
            <p className="text-base sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {compatibility.personalized_explanation}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Watch Out Messages */}
      {watchOutMessages.length > 0 && (
        <div className="space-y-4 sm:space-y-3">
          <h3 className="text-base sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />
            Watch Out For
          </h3>
          {watchOutMessages.map((message, index) => (
            <Alert 
              key={index}
              className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
            >
              <AlertTriangle className="h-5 w-5 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-base sm:text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                {message.trim()}
            </AlertDescription>
          </Alert>
          ))}
        </div>
        )}

      {/* House Rules & Academic - Side by Side Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* House Rules Suggestion */}
        {compatibility.house_rules_suggestion && (
          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="p-5 sm:p-5">
              <h3 className="text-base sm:text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 sm:mb-2 flex items-center gap-2">
                <Home className="w-5 h-5 sm:w-4 sm:h-4" />
              Suggested House Rules
            </h3>
              <p className="text-base sm:text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
              {compatibility.house_rules_suggestion}
            </p>
            </CardContent>
          </Card>
        )}

        {/* Academic Details */}
        {compatibility.academic_details && typeof compatibility.academic_details === 'object' && (
          <Card className="border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
            <CardContent className="p-5 sm:p-5">
              <h3 className="text-base sm:text-sm font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 sm:w-4 sm:h-4" />
                Academic Alignment
              </h3>
          <div className="space-y-3 sm:space-y-2">
              {compatibility.academic_details.university_affinity && (
                  <div className="flex items-center gap-2 text-base sm:text-sm">
                    <CheckCircle className="h-5 w-5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="text-purple-700 dark:text-purple-300">Same university</span>
                </div>
              )}
              {compatibility.academic_details.program_affinity && (
                  <div className="flex items-center gap-2 text-base sm:text-sm">
                    <CheckCircle className="h-5 w-5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="text-purple-700 dark:text-purple-300">Same program</span>
                </div>
              )}
              {compatibility.academic_details.faculty_affinity && (
                  <div className="flex items-center gap-2 text-base sm:text-sm">
                    <CheckCircle className="h-5 w-5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="text-purple-700 dark:text-purple-300">Same faculty</span>
                </div>
              )}
            </div>
      </CardContent>
    </Card>
        )}
      </div>

      {/* Algorithm Version Badge - Subtle Footer */}
      {compatibility.algorithm_version && (
        <div className="text-center pt-4 border-t">
          <Badge variant="outline" className="text-xs text-gray-500 dark:text-gray-400">
            Algorithm: {compatibility.algorithm_version}
          </Badge>
        </div>
      )}
    </div>
  )
}
