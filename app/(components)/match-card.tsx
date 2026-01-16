'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useApp } from '@/app/providers'
import { showErrorToast, showSuccessToast } from '@/lib/toast'
import { Users, MessageCircle, Heart, X, AlertTriangle, CheckCircle, Award, MoreVertical, UserX, Shield, Flag, User, Sparkles, Home, GraduationCap, Info, ChevronDown, ChevronUp, Droplets, Volume2, Moon, Coffee, BookOpen, XCircle, UserPlus } from 'lucide-react'
import { ReputationPreview } from './reputation-profile'
import { getDemoReputationSummary } from '@/lib/reputation/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CompatibilityScore {
  personality: number
  schedule: number
  lifestyle: number
  social: number
  academic?: number
}

interface MatchCardProps {
  id: string
  name: string
  university: string
  program: string
  degreeLevel: string
  budgetBand: string
  compatibility: number
  compatibilityBreakdown: CompatibilityScore
  topAlignment: 'personality' | 'schedule' | 'lifestyle' | 'social' | 'academic'
  watchOut?: string
  houseRulesSuggestion?: string
  isGroup?: boolean
  groupMembers?: Array<{
    name: string
    avatar?: string
  }>
  academicBonuses?: {
    university_affinity: boolean
    program_affinity: boolean
    faculty_affinity: boolean
    study_year_gap?: number
  }
  // New fields from compatibility algorithm v1.0
  harmonyScore?: number | null
  contextScore?: number | null
  dimensionScores?: { [key: string]: number } | null
  isValidMatch?: boolean
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onViewProfile: (id: string) => void
  onStartChat: (id: string) => void
}

// Dimension labels, descriptions, and icons (same as compatibility panel)
const dimensionConfig: { [key: string]: { label: string; description: string; icon: any } } = {
  cleanliness: {
    label: 'Cleanliness',
    description: 'Measures how well your cleanliness standards align across shared spaces like kitchen, bathroom, and living areas.',
    icon: Droplets
  },
  noise: {
    label: 'Noise Tolerance',
    description: 'Assesses compatibility around noise sensitivity, including preferences for parties, music volume, and quiet hours.',
    icon: Volume2
  },
  guests: {
    label: 'Guest Frequency',
    description: 'Evaluates alignment on how often friends, partners, or visitors stay overnight and use shared spaces.',
    icon: Users
  },
  sleep: {
    label: 'Sleep Schedule',
    description: 'Compares sleep schedule compatibility, including wake-up times and bedtimes (early bird vs night owl preferences).',
    icon: Moon
  },
  shared_spaces: {
    label: 'Shared Spaces',
    description: 'Measures preferences for using common areas versus private spaces and how you like to utilize shared living areas.',
    icon: Home
  },
  substances: {
    label: 'Substances',
    description: 'Assesses comfort levels and boundaries around alcohol consumption or other substances within the home environment.',
    icon: Coffee
  },
  study_social: {
    label: 'Study/Social Balance',
    description: 'Evaluates the balance between study time and social activities, and how these priorities align in daily life.',
    icon: BookOpen
  },
  home_vibe: {
    label: 'Home Vibe',
    description: 'Compares home atmosphere preferences, whether you prefer a quiet retreat for focus or a social hub for interaction.',
    icon: Heart
  }
}

export function MatchCard({
  id,
  name,
  university,
  program,
  degreeLevel,
  budgetBand,
  compatibility,
  compatibilityBreakdown,
  topAlignment,
  watchOut,
  houseRulesSuggestion,
  isGroup = false,
  groupMembers = [],
  academicBonuses,
  harmonyScore,
  contextScore,
  dimensionScores,
  isValidMatch,
  onAccept,
  onReject,
  onViewProfile,
  onStartChat
}: MatchCardProps) {
  const [showUnmatchDialog, setShowUnmatchDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showDimensions, setShowDimensions] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  const handleUnmatch = async () => {
    setIsProcessing(true)
    try {
      // TODO: Implement unmatch API call
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      await fetchWithCSRF('/api/match/unmatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: id })
      })
      setShowUnmatchDialog(false)
      // Refresh or remove from list
    } catch (error) {
      console.error('Failed to unmatch:', error)
      showErrorToast('Failed to Unmatch', 'Failed to unmatch. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBlock = async () => {
    setIsProcessing(true)
    try {
      // TODO: Implement block API call
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      await fetchWithCSRF('/api/match/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id })
      })
      setShowBlockDialog(false)
      // Refresh or remove from list
    } catch (error) {
      console.error('Failed to block:', error)
      showErrorToast('Failed to Block User', 'Failed to block user. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReport = async () => {
    if (!reportReason.trim()) {
      showErrorToast('Validation Error', 'Please select a reason for reporting.')
      return
    }
    setIsProcessing(true)
    try {
      // TODO: Implement report API call
      const { fetchWithCSRF } = await import('@/lib/utils/fetch-with-csrf')
      await fetchWithCSRF('/api/match/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, reason: reportReason })
      })
      setShowReportDialog(false)
      setReportReason('')
      showSuccessToast('Report Submitted', 'Thank you for your report. We will review it shortly.')
    } catch (error) {
      console.error('Failed to report:', error)
      showErrorToast('Failed to Submit Report', 'Failed to submit report. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

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

  const getCompatibilityColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500'
    if (score >= 0.6) return 'bg-blue-500'
    if (score >= 0.4) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getCompatibilityLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent'
    if (score >= 0.6) return 'Good'
    if (score >= 0.4) return 'Fair'
    return 'Poor'
  }

  const formatCompatibilityScore = (score: number) => {
    return `${Math.round(score * 100)}%`
  }

  const formatTopAlignment = (alignment: string) => {
    return alignment
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const matchScore = Math.round(compatibility * 100)
  const harmonyScorePercent = harmonyScore !== null && harmonyScore !== undefined
    ? Math.round(harmonyScore * 100)
    : null
  const contextScorePercent = contextScore !== null && contextScore !== undefined
    ? Math.round(contextScore * 100)
    : null

  // Generate compatibility highlights from available data
  const generateCompatibilityHighlights = () => {
    const highlights: string[] = []
    
    if (topAlignment) {
      highlights.push(`Strong alignment on ${formatTopAlignment(topAlignment)}`)
    }
    
    if (harmonyScore !== null && harmonyScore !== undefined && harmonyScore >= 0.7) {
      highlights.push('Excellent day-to-day living compatibility')
    }
    
    if (contextScore !== null && contextScore !== undefined && contextScore >= 0.7) {
      highlights.push('Similar academic background and goals')
    }
    
    if (academicBonuses?.program_affinity) {
      highlights.push('Same study program')
    } else if (academicBonuses?.university_affinity) {
      highlights.push('Same university')
    }
    
    if (compatibilityBreakdown?.schedule >= 0.7) {
      highlights.push('Compatible daily schedules')
    }
    
    if (compatibilityBreakdown?.lifestyle >= 0.7) {
      highlights.push('Similar lifestyle preferences')
    }
    
    // Ensure we have at least 3 highlights, use defaults if needed
    while (highlights.length < 3) {
      if (highlights.length === 0) highlights.push('Compatible living preferences')
      else if (highlights.length === 1) highlights.push('Shared interests and values')
      else highlights.push('Good match potential')
    }
    
    return highlights.slice(0, 3)
  }

  const compatibilityHighlights = generateCompatibilityHighlights()

  // Helper functions matching DiscoveryCard style
  const getDiscoveryScoreColor = (score: number) => {
    const percent = Math.round(score * 100)
    if (percent >= 80) return 'text-emerald-400'
    if (percent >= 60) return 'text-indigo-400'
    if (percent >= 40) return 'text-amber-400'
    return 'text-slate-400'
  }

  const getDiscoveryScoreBarColor = (score: number) => {
    const percent = Math.round(score * 100)
    if (percent >= 80) return 'bg-emerald-500'
    if (percent >= 60) return 'bg-indigo-500'
    if (percent >= 40) return 'bg-amber-500'
    return 'bg-slate-500'
  }

  return (
    <div className="w-full" style={{ perspective: '1000px' }}>
      <div
        className="relative w-full h-full ease-in-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.6s ease-in-out'
        }}
      >
        {/* Front Face */}
        <div
          className="w-full"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          <div className="w-full overflow-hidden rounded-2xl bg-slate-800 border border-slate-700 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-slate-600">
            <div className="flex flex-col lg:flex-row">
        {/* Left Side - Match Score Section */}
        <div className="lg:w-1/3 xl:w-1/4 p-6 sm:p-8 text-center lg:text-left bg-gradient-to-b from-violet-600/20 to-transparent border-b lg:border-b-0 lg:border-r border-slate-700/50">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span className="text-sm font-medium text-slate-300 uppercase tracking-wider">Match Score</span>
          </div>
          
          {/* Large Match Percentage */}
          <div className="relative mb-4">
            <span className={`text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight ${getDiscoveryScoreColor(compatibility)}`}>
              {matchScore}%
            </span>
            <div className="mt-2">
              <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-slate-700/50 ${getDiscoveryScoreColor(compatibility)}`}>
                {getCompatibilityLabel(compatibility)} Match
              </span>
            </div>
          </div>

          {/* Harmony & Context Scores */}
          <div className="space-y-4 mt-6">
            {harmonyScorePercent !== null && (
              <div className="space-y-2">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span className="text-sm font-medium text-slate-300">Harmony</span>
                  <span className={`text-sm font-bold ml-auto ${getDiscoveryScoreColor(harmonyScore!)}`}>
                    {harmonyScorePercent}%
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getDiscoveryScoreBarColor(harmonyScore!)} transition-all duration-500`}
                    style={{ width: `${harmonyScorePercent}%` }}
                  />
                </div>
              </div>
            )}
            
            {contextScorePercent !== null && (
              <div className="space-y-2">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-slate-300">Context</span>
                  <span className={`text-sm font-bold ml-auto ${getDiscoveryScoreColor(contextScore!)}`}>
                    {contextScorePercent}%
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getDiscoveryScoreBarColor(contextScore!)} transition-all duration-500`}
                    style={{ width: `${contextScorePercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - User Info & Compatibility Details */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col">
          <div className="flex-1">
            {/* User Info Header */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                {isGroup ? (
                  <div className="flex -space-x-2">
                    {groupMembers.slice(0, 3).map((member, index) => (
                      <Avatar key={index} className="w-12 h-12 border-2 border-slate-700">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs bg-slate-700 text-slate-200">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {groupMembers.length > 3 && (
                      <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center">
                        <span className="text-xs font-semibold text-slate-300">
                          +{groupMembers.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <Avatar className="w-16 h-16 border-2 border-slate-700">
                    <AvatarImage src={`/avatars/${name.toLowerCase()}.jpg`} />
                    <AvatarFallback className="text-lg bg-slate-700 text-slate-200">
                      {name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div>
                  <h3 className="text-xl font-semibold text-slate-100 mb-1">
                    {isGroup ? `${groupMembers.length} compatible roommates` : name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-2">
                    {university} • {program} • {degreeLevel}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs border-slate-600 bg-slate-700/50 text-slate-200">
                      {budgetBand}/month
                    </Badge>
                    {isGroup && (
                      <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-200">
                        <Users className="w-3 h-3 mr-1" />
                        Group match
                      </Badge>
                    )}
                    
                    {/* Reputation Badge */}
                    <Badge variant="outline" className="text-xs bg-blue-950/30 text-blue-300 border-blue-800">
                      <Award className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                    
                    {/* Academic Affinity Badges */}
                    {academicBonuses && (
                      <>
                        {academicBonuses.program_affinity && (
                          <Badge variant="default" className="text-xs bg-blue-600 hover:bg-blue-700 text-white">
                            Same Programme
                          </Badge>
                        )}
                        {academicBonuses.university_affinity && !academicBonuses.program_affinity && (
                          <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700 text-white">
                            Same University
                          </Badge>
                        )}
                        {academicBonuses.faculty_affinity && !academicBonuses.program_affinity && (
                          <Badge variant="default" className="text-xs bg-purple-600 hover:bg-purple-700 text-white">
                            Same Faculty
                          </Badge>
                        )}
                        {academicBonuses.study_year_gap && academicBonuses.study_year_gap > 4 && (
                          <Badge variant="outline" className="text-xs border-orange-700 text-orange-300 bg-orange-950/30">
                            Different study stages ({academicBonuses.study_year_gap} year gap)
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dealbreaker Warning */}
            {isValidMatch === false && (
              <Alert variant="destructive" className="border-2 border-red-800/50 bg-red-950/40 mb-6">
                <XCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-xs font-medium">
                  <span className="font-bold text-red-100 block mb-1">
                    Dealbreaker Conflicts Detected
                  </span>
                  <span className="text-red-300 text-xs">
                    This match has dealbreaker conflicts and may not be suitable for rooming together.
                  </span>
                </AlertDescription>
              </Alert>
            )}


            {/* Detailed Dimension Scores - Collapsible */}
            {dimensionScores && typeof dimensionScores === 'object' && Object.keys(dimensionScores).length > 0 && (
              <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-700/30 mb-6">
                <button
                  onClick={() => setShowDimensions(!showDimensions)}
                  className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-sm font-semibold text-slate-100">
                      Detailed Dimension Scores
                    </h4>
                  </div>
                  {showDimensions ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                
                {showDimensions && (
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t border-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(dimensionScores).map(([key, score]) => {
                        const dimensionKey = key as string
                        const dimensionScore = typeof score === 'number' ? score : 0
                        const config = dimensionConfig[dimensionKey]
                        const Icon = config?.icon || Info
                        const label = config?.label || dimensionKey
                        const description = config?.description || ''
                        
                        return (
                          <div 
                            key={dimensionKey} 
                            className="p-3 rounded-lg border border-slate-700 bg-slate-900/30 hover:bg-slate-900/50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-1.5">
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span className="text-xs font-medium text-slate-100 truncate">
                                  {label}
                                </span>
                                {description && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="w-3 h-3 text-slate-500 cursor-help flex-shrink-0" />
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-slate-800 border-slate-700">
                                        <p className="text-xs max-w-xs text-slate-200">{description}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                              <span className={`text-xs font-bold ml-2 flex-shrink-0 ${getDiscoveryScoreColor(dimensionScore)}`}>
                                {Math.round(dimensionScore * 100)}%
                              </span>
                            </div>
                            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                              <div 
                                className={`h-full rounded-full ${getDiscoveryScoreBarColor(dimensionScore)} transition-all duration-500`}
                                style={{ width: `${dimensionScore * 100}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* View Details Button */}
            <div className="mb-6">
              <Button
                onClick={() => setIsFlipped(true)}
                className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-900/30 transition-all transform hover:scale-[1.02] active:scale-95"
              >
                View Details
              </Button>
            </div>

            {/* Compatibility Highlights - Why You Match */}
            <div className="border-t border-slate-700/50 pt-6 mb-6">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Why you match
              </h4>
              <ul className="space-y-2">
                {compatibilityHighlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span className="text-sm text-slate-300 leading-tight">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Score Breakdown - Compact Grid */}
            <div className="border-t border-slate-700/50 pt-6 mb-6">
              <h4 className="text-xs sm:text-sm font-semibold text-slate-300 mb-4">Score Breakdown</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {(() => {
                  // Standard order: Academic, Personality, Social, Lifestyle, Schedule
                  const orderMap: Record<string, number> = {
                    academic: 1,
                    personality: 2,
                    social: 3,
                    lifestyle: 4,
                    schedule: 5
                  }

                  // Sort entries by the standard order
                  const sortedEntries = Object.entries(compatibilityBreakdown).sort((a, b) => {
                    const orderA = orderMap[a[0].toLowerCase()] || 999
                    const orderB = orderMap[b[0].toLowerCase()] || 999
                    return orderA - orderB
                  })

                  return sortedEntries.map(([key, score]) => (
                    <div 
                      key={key} 
                      className="p-3 rounded-lg border border-slate-700 bg-slate-900/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-300 capitalize">
                          {key}
                        </span>
                        <span className={`text-xs font-bold ${getDiscoveryScoreColor(score)}`}>
                          {formatCompatibilityScore(score)}
                        </span>
                      </div>
                      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                        <div 
                          className={`h-full rounded-full ${getDiscoveryScoreBarColor(score)} transition-all duration-500`}
                          style={{ width: `${score * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </div>

            {/* House Rules Suggestion */}
            {houseRulesSuggestion && (
              <div className="bg-violet-950/30 border border-violet-800/50 rounded-lg p-3 sm:p-4 mb-6">
                <h5 className="text-sm font-semibold text-violet-300 mb-2">
                  Suggested house rules
                </h5>
                <p className="text-sm text-violet-300">
                  {houseRulesSuggestion}
                </p>
              </div>
            )}

            {/* Reputation Preview */}
            {!isGroup && (
              <div className="bg-slate-900/30 border border-slate-700 rounded-lg p-3 sm:p-4 mb-6">
                <h5 className="text-sm font-semibold text-slate-100 mb-2">
                  Reputation
                </h5>
                <ReputationPreview userReputation={getDemoReputationSummary()} />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-auto pt-6 border-t border-slate-700/50">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="ghost"
                size="sm" 
                onClick={() => onReject(id)}
                className="flex-1 sm:flex-initial h-11 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 font-semibold transition-all"
              >
                <X className="w-4 h-4 mr-2" />
                Skip
              </Button>
              
              <Button 
                size="sm" 
                onClick={() => onStartChat(id)}
                className="flex-1 h-11 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 font-semibold transition-all"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Chat
              </Button>
              
              <Button 
                size="sm" 
                onClick={() => onAccept(id)}
                className="flex-1 h-11 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-900/30 transition-all transform hover:scale-[1.02] active:scale-95"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {isGroup ? 'Accept Group' : 'Connect'}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="sm:flex-initial h-11 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                  <DropdownMenuItem onClick={() => onViewProfile(id)} className="text-slate-200 focus:bg-slate-700 focus:text-white">
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem onClick={() => setShowUnmatchDialog(true)} className="text-slate-200 focus:bg-slate-700 focus:text-white">
                    <UserX className="w-4 h-4 mr-2" />
                    Unmatch
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowBlockDialog(true)} className="text-slate-200 focus:bg-slate-700 focus:text-white">
                    <Shield className="w-4 h-4 mr-2" />
                    Block User
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="text-red-400 focus:bg-slate-700 focus:text-red-300">
                    <Flag className="w-4 h-4 mr-2" />
                    Report User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 w-full"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="w-full overflow-hidden rounded-2xl bg-slate-800 border border-slate-700 shadow-xl h-full flex flex-col p-5 sm:p-6">
            {/* User Details Heading */}
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-slate-100 mb-1">User Details</h3>
              <p className="text-sm text-slate-400">{name} • {university}</p>
            </div>

            {/* Harmony & Context Scores - Horizontal Layout */}
            {(harmonyScorePercent !== null || contextScorePercent !== null) && (
              <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-slate-700/50">
                {harmonyScorePercent !== null && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-400" />
                        <span className="text-sm font-medium text-slate-300">Harmony</span>
                      </div>
                      <span className={`text-sm font-semibold ${getDiscoveryScoreColor(harmonyScore!)}`}>
                        {harmonyScorePercent}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${getDiscoveryScoreBarColor(harmonyScore!)} transition-all duration-500`}
                        style={{ width: `${harmonyScorePercent}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {contextScorePercent !== null && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-slate-300">Context</span>
                      </div>
                      <span className={`text-sm font-semibold ${getDiscoveryScoreColor(contextScore!)}`}>
                        {contextScorePercent}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${getDiscoveryScoreBarColor(contextScore!)} transition-all duration-500`}
                        style={{ width: `${contextScorePercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dimension Scores - Single Column */}
            <div className="mb-4 flex-1 overflow-y-auto min-h-0">
              <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Detailed Dimension Scores
              </h4>
              <div className="space-y-2.5">
                {Object.entries(dimensionConfig).map(([dimensionKey, config]) => {
                  const Icon = config.icon
                  const label = config.label
                  const description = config.description
                  
                  // Get score from dimensionScores if available, otherwise 0
                  const dimensionScore = dimensionScores && typeof dimensionScores === 'object' && dimensionScores[dimensionKey]
                    ? (typeof dimensionScores[dimensionKey] === 'number' ? dimensionScores[dimensionKey] : 0)
                    : 0
                  const scorePercent = Math.round(dimensionScore * 100)
                  
                  return (
                    <div 
                      key={dimensionKey} 
                      className="p-3 rounded-lg border border-slate-700 bg-slate-900/30"
                    >
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="flex-shrink-0 cursor-help">
                                  <Icon className="w-4 h-4 text-slate-400 hover:text-slate-300 transition-colors" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-slate-800 border-slate-700 max-w-xs">
                                <p className="text-xs text-slate-200">{description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <span className="text-sm font-medium text-slate-100 truncate whitespace-nowrap">
                            {label}
                          </span>
                        </div>
                        <span className={`text-sm font-bold flex-shrink-0 ${getDiscoveryScoreColor(dimensionScore)}`}>
                          {scorePercent}%
                        </span>
                      </div>
                      <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-700 mt-1.5">
                        <div 
                          className={`h-full rounded-full ${getDiscoveryScoreBarColor(dimensionScore)} transition-all duration-500`}
                          style={{ width: `${scorePercent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Back to Profile Button */}
            <div className="mt-auto pt-4">
              <Button
                onClick={() => setIsFlipped(false)}
                className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-900/30 transition-all transform hover:scale-[1.02] active:scale-95"
              >
                Back to Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Unmatch Confirmation Dialog */}
      <Dialog open={showUnmatchDialog} onOpenChange={setShowUnmatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unmatch with {name}?</DialogTitle>
            <DialogDescription>
              This will remove this match from your list. You can still find them again through new suggestions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnmatchDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUnmatch} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Unmatch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Confirmation Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block {name}?</DialogTitle>
            <DialogDescription>
              This will block this user and prevent them from seeing your profile or matching with you in the future.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBlock} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Block User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Confirmation Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {name}?</DialogTitle>
            <DialogDescription>
              Please select the reason for reporting this user. Our team will review your report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {[
              'Inappropriate behavior',
              'Spam or fake profile',
              'Harassment',
              'Safety concerns',
              'Other'
            ].map((reason) => (
              <label key={reason} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="reportReason"
                  value={reason}
                  checked={reportReason === reason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{reason}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowReportDialog(false)
              setReportReason('')
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReport} disabled={isProcessing || !reportReason}>
              {isProcessing ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
