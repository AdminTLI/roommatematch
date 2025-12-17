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
import { Users, MessageCircle, Heart, X, AlertTriangle, CheckCircle, Award, MoreVertical, UserX, Shield, Flag, User, Sparkles, Home, GraduationCap, Info, ChevronDown, ChevronUp, Droplets, Volume2, Moon, Coffee, BookOpen, XCircle } from 'lucide-react'
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
  const { t } = useApp()
  const [showUnmatchDialog, setShowUnmatchDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showDimensions, setShowDimensions] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

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

  return (
    <Card className="border-2 border-border-subtle hover:border-semantic-accent/20 transition-all duration-300 hover:shadow-lg overflow-hidden">
      <CardHeader className="pb-4 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {isGroup ? (
              <div className="flex -space-x-2">
                {groupMembers.slice(0, 3).map((member, index) => (
                  <Avatar key={index} className="w-12 h-12 border-2 border-white">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-xs">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {groupMembers.length > 3 && (
                  <div className="w-12 h-12 rounded-full bg-bg-surface-alt border-2 border-bg-surface flex items-center justify-center">
                    <span className="text-xs font-semibold text-text-secondary">
                      +{groupMembers.length - 3}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <Avatar className="w-16 h-16">
                <AvatarImage src={`/avatars/${name.toLowerCase()}.jpg`} />
                <AvatarFallback className="text-lg">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div>
              <CardTitle className="text-xl">
                {isGroup ? `${groupMembers.length} compatible roommates` : name}
              </CardTitle>
              <CardDescription className="text-base">
                {university} • {program} • {degreeLevel}
              </CardDescription>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {budgetBand}/month
                </Badge>
                {isGroup && (
                  <Badge variant="secondary" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    Group match
                  </Badge>
                )}
                
                {/* Reputation Badge */}
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  <Award className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
                
                {/* Academic Affinity Badges */}
                {academicBonuses && (
                  <>
                    {academicBonuses.program_affinity && (
                      <Badge variant="default" className="text-xs bg-blue-600 hover:bg-blue-700">
                        Same Programme
                      </Badge>
                    )}
                    {academicBonuses.university_affinity && !academicBonuses.program_affinity && (
                      <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                        Same University
                      </Badge>
                    )}
                    {academicBonuses.faculty_affinity && !academicBonuses.program_affinity && (
                      <Badge variant="default" className="text-xs bg-purple-600 hover:bg-purple-700">
                        Same Faculty
                      </Badge>
                    )}
                    {academicBonuses.study_year_gap && academicBonuses.study_year_gap > 4 && (
                      <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                        Different study stages ({academicBonuses.study_year_gap} year gap)
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 md:p-6 pt-0">
        {/* Main Score Card - Hero Section */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Large Score Circle */}
              <div className="relative flex-shrink-0">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${getScoreGradient(compatibility)} flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    {matchScore}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </div>
              </div>
              
              {/* Score Info */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {matchScore}% Match
                </h3>
                {topAlignment && (
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Best match on:</span>{' '}
                    <span className="capitalize">{formatTopAlignment(topAlignment)}</span>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dealbreaker Warning */}
        {isValidMatch === false && (
          <Alert variant="destructive" className="border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-xs font-medium">
              <span className="font-bold text-red-900 dark:text-red-100 block mb-1">
                Dealbreaker Conflicts Detected
              </span>
              <span className="text-red-700 dark:text-red-300 text-xs">
                This match has dealbreaker conflicts and may not be suitable for rooming together.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Harmony & Context Score Cards - Side by Side */}
        {(harmonyScorePercent !== null || contextScorePercent !== null) && (
          <div className="grid grid-cols-2 gap-3">
            {harmonyScorePercent !== null && (
              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                        <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100">Harmony</h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Day-to-day</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-xl font-bold ${getScoreColor(harmonyScore!)}`}>
                        {harmonyScorePercent}%
                      </span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(harmonyScore!)} transition-all duration-500`}
                        style={{ width: `${harmonyScorePercent}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {contextScorePercent !== null && (
              <Card className="border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                        <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100">Context</h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Academic</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-xl font-bold ${getScoreColor(contextScore!)}`}>
                        {contextScorePercent}%
                      </span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(contextScore!)} transition-all duration-500`}
                        style={{ width: `${contextScorePercent}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Detailed Dimension Scores - Collapsible */}
        {dimensionScores && typeof dimensionScores === 'object' && Object.keys(dimensionScores).length > 0 && (
          <Card className="border-2">
            <CardContent className="p-0">
              <button
                onClick={() => setShowDimensions(!showDimensions)}
                className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Detailed Dimension Scores
                  </h4>
                </div>
                {showDimensions ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              {showDimensions && (
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 border-t">
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
                          className="p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-900/40 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-1.5">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                                {label}
                              </span>
                              {description && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="w-3 h-3 text-gray-400 cursor-help flex-shrink-0" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs max-w-xs">{description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <span className={`text-xs font-bold ml-2 flex-shrink-0 ${getScoreColor(dimensionScore)}`}>
                              {Math.round(dimensionScore * 100)}%
                            </span>
                          </div>
                          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
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
          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Score Breakdown</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
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
                  className="p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {key}
                    </span>
                    <span className={`text-xs font-bold ${getScoreColor(score)}`}>
                      {formatCompatibilityScore(score)}
                    </span>
                  </div>
                  <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(score)} transition-all duration-500`}
                      style={{ width: `${score * 100}%` }}
                    />
                  </div>
                </div>
              ))
            })()}
          </div>
        </div>

        {/* Top Alignment & Watch Out */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-semantic-success/10 dark:bg-semantic-success/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-semantic-success" />
              <span className="text-sm font-semibold text-semantic-success">
                Best match on
              </span>
            </div>
            <div className="text-sm text-semantic-success capitalize">
              {topAlignment}
            </div>
          </div>

          {watchOut && (
            <div className="bg-semantic-warning/10 dark:bg-semantic-warning/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-semantic-warning" />
                <span className="text-sm font-semibold text-semantic-warning">
                  Watch out for
                </span>
              </div>
              <div className="text-sm text-semantic-warning">
                {watchOut}
              </div>
            </div>
          )}
        </div>

        {/* House Rules Suggestion */}
        {houseRulesSuggestion && (
          <div className="bg-semantic-accent-soft dark:bg-semantic-accent-soft rounded-lg p-3">
            <h5 className="text-sm font-semibold text-semantic-accent mb-2">
              Suggested house rules
            </h5>
            <p className="text-sm text-semantic-accent">
              {houseRulesSuggestion}
            </p>
          </div>
        )}

        {/* Reputation Preview */}
        {!isGroup && (
          <div className="bg-bg-surface-alt dark:bg-bg-surface-alt rounded-lg p-3">
            <h5 className="text-sm font-semibold text-text-primary mb-2">
              Reputation
            </h5>
            <ReputationPreview userReputation={getDemoReputationSummary()} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            size="sm" 
            onClick={() => onStartChat(id)}
            className="flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Start Chat
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewProfile(id)}>
                <User className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowUnmatchDialog(true)}>
                <UserX className="w-4 h-4 mr-2" />
                Unmatch
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowBlockDialog(true)}>
                <Shield className="w-4 h-4 mr-2" />
                Block User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="text-red-600">
                <Flag className="w-4 h-4 mr-2" />
                Report User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onReject(id)}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Not a fit
          </Button>
          
          <Button 
            size="sm" 
            onClick={() => onAccept(id)}
            className="flex-1"
          >
            <Heart className="w-4 h-4 mr-2" />
            {isGroup ? 'Accept Group' : 'Accept Match'}
          </Button>
        </div>
      </CardContent>

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
    </Card>
  )
}
