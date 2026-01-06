'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { SectionScores } from './section-scores'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { Clock, Ban, Sparkles, Home, GraduationCap, Info, ChevronDown, ChevronUp, Droplets, Volume2, Moon, Coffee, BookOpen, Heart, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { showErrorToast, showSuccessToast } from '@/lib/toast'
import type { MatchSuggestion } from '@/lib/matching/types'

interface SuggestionCardProps {
  suggestion: MatchSuggestion
  onRespond: (id: string, action: 'accept' | 'decline') => Promise<void>
  isLoading?: boolean
  currentUserId: string
  isSelectable?: boolean
  isSelected?: boolean
  onToggleSelection?: () => void
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
    icon: Clock
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

interface CompatibilityData {
  compatibility_score: number
  harmony_score?: number | null
  context_score?: number | null
  dimension_scores_json?: { [key: string]: number } | null
  is_valid_match?: boolean
  top_alignment?: string | null
  watch_out?: string | null
}

export function SuggestionCard({ 
  suggestion, 
  onRespond, 
  isLoading = false, 
  currentUserId,
  isSelectable = false,
  isSelected = false,
  onToggleSelection
}: SuggestionCardProps) {
  const [isResponding, setIsResponding] = useState(false)
  const [isOpeningChat, setIsOpeningChat] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showDeclineDialog, setShowDeclineDialog] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)
  const [showDimensions, setShowDimensions] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [compatibilityData, setCompatibilityData] = useState<CompatibilityData | null>(null)
  const [isLoadingCompatibility, setIsLoadingCompatibility] = useState(true)
  const router = useRouter()
  
  // Track if we've already logged a warning for this suggestion to prevent spam
  const loggedWarningRef = useRef<string | null>(null)
  
  // Fetch compatibility data when component mounts or suggestion/user changes
  useEffect(() => {
    const fetchCompatibility = async () => {
      const otherUserId = suggestion.memberIds.find(id => id !== currentUserId)
      if (!otherUserId) {
        setIsLoadingCompatibility(false)
        return
      }
      
      try {
        setIsLoadingCompatibility(true)
        const response = await fetch(`/api/chat/compatibility?otherUserId=${otherUserId}`)
        if (response.ok) {
          const data = await response.json()
          const apiScore = Math.round((data.compatibility_score || 0) * 100)
          const fitIndexScore = suggestion.fitIndex
          const scoreDiff = Math.abs(apiScore - fitIndexScore)
          
          console.log('[SuggestionCard] Compatibility data received:', {
            suggestionId: suggestion.id,
            otherUserId,
            compatibility_score: data.compatibility_score,
            apiScorePercent: apiScore,
            fitIndexPercent: fitIndexScore,
            scoreDifference: scoreDiff,
            harmony_score: data.harmony_score,
            context_score: data.context_score,
            dimension_scores: data.dimension_scores_json,
            usingApiScore: true
          })
          
          // Warn if scores differ significantly (only log once per suggestion ID)
          if (scoreDiff > 5 && loggedWarningRef.current !== suggestion.id) {
            console.warn('[SuggestionCard] Score mismatch detected:', {
              suggestionId: suggestion.id,
              apiScore,
              fitIndexScore,
              difference: scoreDiff,
              message: 'API score differs significantly from stored fitIndex'
            })
            loggedWarningRef.current = suggestion.id
          }
          
          setCompatibilityData(data)
        } else {
          // API call failed - we'll fall back to suggestion.fitIndex in the render
          const errorText = await response.text().catch(() => 'Unknown error')
          console.warn('[SuggestionCard] Failed to fetch compatibility data:', {
            suggestionId: suggestion.id,
            otherUserId,
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            fallbackToFitIndex: suggestion.fitIndex
          })
        }
      } catch (error) {
        // Network or other error - we'll fall back to suggestion.fitIndex in the render
        console.error('[SuggestionCard] Error fetching compatibility data:', {
          suggestionId: suggestion.id,
          otherUserId,
          error: error instanceof Error ? error.message : String(error),
          fallbackToFitIndex: suggestion.fitIndex
        })
      } finally {
        setIsLoadingCompatibility(false)
      }
    }
    
    fetchCompatibility()
    // Only re-fetch when suggestion ID or current user changes
    // Removed suggestion.fitIndex to prevent unnecessary refetches
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestion.id, currentUserId])
  
  const handleRespond = async (action: 'accept' | 'decline') => {
    setIsResponding(true)
    try {
      await onRespond(suggestion.id, action)
    } finally {
      setIsResponding(false)
    }
  }

  const handleChatNow = async () => {
    setIsOpeningChat(true)
    try {
      // Find the other user ID
      const otherUserId = suggestion.memberIds.find(id => id !== currentUserId)
      if (!otherUserId) {
        console.error('Could not find other user ID')
        return
      }

      // Get or create chat
      const response = await fetchWithCSRF('/api/chat/get-or-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otherUserId }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to get or create chat:', error)
        alert('Failed to open chat. Please try again.')
        return
      }

      const { chatId } = await response.json()
      router.push(`/chat/${chatId}`)
    } catch (error) {
      console.error('Error opening chat:', error)
      alert('Failed to open chat. Please try again.')
    } finally {
      setIsOpeningChat(false)
    }
  }

  const handleBlockUser = async () => {
    setIsBlocking(true)
    try {
      // Find the other user ID
      const otherUserId = suggestion.memberIds.find(id => id !== currentUserId)
      if (!otherUserId) {
        showErrorToast('Error', 'Could not identify user to block')
        return
      }

      const response = await fetchWithCSRF('/api/match/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blocked_user_id: otherUserId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to block user')
      }

      showSuccessToast('User blocked', 'This user has been blocked and will not appear in future matches.')
      setShowBlockDialog(false)
      // Remove this suggestion from the UI by calling onRespond with decline
      await onRespond(suggestion.id, 'decline')
    } catch (error: any) {
      console.error('Failed to block user:', error)
      showErrorToast('Failed to block user', error.message || 'Please try again.')
    } finally {
      setIsBlocking(false)
    }
  }
  
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 0.6) return 'text-blue-600 dark:text-blue-400'
    if (score >= 0.4) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 0.8) return 'from-emerald-500 to-emerald-600'
    if (score >= 0.6) return 'from-blue-500 to-blue-600'
    if (score >= 0.4) return 'from-amber-500 to-amber-600'
    return 'from-red-500 to-red-600'
  }

  const formatTopAlignment = (alignment: string | null | undefined) => {
    if (!alignment) return null
    return alignment
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Calculate match score - avoid showing incorrect values by only using compatibility data once loaded
  // This prevents the flash of wrong percentage (e.g., 89% -> 72%)
  const matchScore = (() => {
    // If we have compatibility data (fresh from API), use it
    if (compatibilityData?.compatibility_score !== null && compatibilityData?.compatibility_score !== undefined) {
      const score = Math.round(compatibilityData.compatibility_score * 100)
      console.log('[SuggestionCard] Using compatibility score from API:', {
        suggestionId: suggestion.id,
        compatibility_score: compatibilityData.compatibility_score,
        roundedScore: score,
        fitIndex: suggestion.fitIndex
      })
      return score
    }
    // While loading, return null to show loading placeholder (prevents showing stale fitIndex)
    if (isLoadingCompatibility) {
      return null
    }
    // Loading complete but no data - fall back to fitIndex only after loading attempt is done
    // This ensures we don't show fitIndex and then immediately replace it (which causes the flash)
    console.log('[SuggestionCard] Falling back to fitIndex:', {
      suggestionId: suggestion.id,
      fitIndex: suggestion.fitIndex,
      hasCompatibilityData: !!compatibilityData
    })
    return suggestion.fitIndex
  })()
  const harmonyScore = compatibilityData?.harmony_score !== null && compatibilityData?.harmony_score !== undefined
    ? Math.round(compatibilityData.harmony_score * 100)
    : null
  const contextScore = compatibilityData?.context_score !== null && compatibilityData?.context_score !== undefined
    ? Math.round(compatibilityData.context_score * 100)
    : null

  const getStatusBadge = () => {
    // Check how many users still need to accept
    const acceptedCount = (suggestion.acceptedBy || []).length
    const totalMembers = suggestion.memberIds.length
    const pendingCount = totalMembers - acceptedCount
    
    switch (suggestion.status) {
      case 'pending':
        return (
          <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
            Pending
          </span>
        )
      case 'accepted':
        // Find which users haven't accepted yet
        const notAccepted = suggestion.memberIds.filter(id => !suggestion.acceptedBy?.includes(id))
        const waitingForCurrentUser = notAccepted.includes(currentUserId)
        
        if (waitingForCurrentUser) {
          return (
            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Waiting for your response
            </span>
          )
        } else {
          return (
            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Waiting for {pendingCount > 1 ? `${pendingCount} others` : 'other person'} to accept
            </span>
          )
        }
      case 'confirmed':
        return (
          <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
            Confirmed 🎉
          </span>
        )
      case 'declined':
        return (
          <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
            Declined
          </span>
        )
      default:
        return null
    }
  }
  
  return (
    <div 
      className={`bg-white dark:bg-card rounded-xl border p-4 sm:p-6 shadow-sm hover:shadow-md transition-all ${
        isSelected 
          ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-950/30' 
          : 'border-gray-200 dark:border-border'
      } ${isSelectable ? 'hover:border-blue-300 dark:hover:border-blue-600' : ''}`}
      onClick={isSelectable && suggestion.status === 'confirmed' ? onToggleSelection : undefined}
    >
      {/* Status Badge at top */}
      <div className="flex items-center justify-between mb-4 sm:mb-4">
        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>
        {/* Selection checkbox */}
        {isSelectable && suggestion.status === 'confirmed' && (
          <div 
            className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 border-2 rounded border-gray-300 dark:border-border flex items-center justify-center cursor-pointer touch-manipulation"
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelection?.()
            }}
          >
            {isSelected && (
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Score Card - Hero Section */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 overflow-hidden mb-4 sm:mb-4">
        <CardContent className="p-5 sm:p-6">
          {isLoadingCompatibility ? (
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-4">
              {/* Loading placeholder */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 sm:w-24 sm:h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-lg animate-pulse">
                  <span className="text-3xl sm:text-3xl font-bold text-transparent">
                    --
                  </span>
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-6 h-6 sm:w-5 sm:h-5 text-gray-300 dark:text-gray-600" />
                </div>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl sm:text-2xl font-bold text-gray-400 dark:text-gray-500 mb-2 sm:mb-1 animate-pulse">
                  Loading...
                </h3>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-4">
              {/* Large Score Circle */}
              <div className="relative flex-shrink-0">
                <div className={`w-24 h-24 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${getScoreGradient(compatibilityData?.compatibility_score ?? (matchScore / 100))} flex items-center justify-center shadow-lg`}>
                  <span className="text-3xl sm:text-3xl font-bold text-white">
                    {matchScore}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-6 h-6 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400" />
                </div>
              </div>
              
              {/* Score Info */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-1">
                  {matchScore}% Match
                </h3>
                {compatibilityData?.top_alignment && (
                  <p className="text-sm sm:text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Best match on:</span>{' '}
                    <span className="capitalize">{formatTopAlignment(compatibilityData.top_alignment)}</span>
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* View Details Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowDetails(!showDetails)
            }}
            className="mt-5 sm:mt-4 w-full px-5 py-3 sm:px-4 sm:py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors border border-blue-200 dark:border-blue-800 touch-manipulation min-h-[48px] sm:min-h-0"
          >
            {showDetails ? (
              <span className="flex items-center justify-center gap-2">
                Hide details
                <ChevronUp className="w-5 h-5 sm:w-4 sm:h-4" />
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                View details
                <ChevronDown className="w-5 h-5 sm:w-4 sm:h-4" />
              </span>
            )}
          </button>
        </CardContent>
      </Card>

      {/* Dealbreaker Warning */}
      {compatibilityData?.is_valid_match === false && (
        <Alert variant="destructive" className="border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 mb-4 sm:mb-4">
          <XCircle className="h-5 w-5 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-sm sm:text-xs font-medium">
            <span className="font-bold text-red-900 dark:text-red-100 block mb-2 sm:mb-1">
              Dealbreaker Conflicts Detected
            </span>
            <span className="text-red-700 dark:text-red-300 text-sm sm:text-xs leading-relaxed">
              This match has dealbreaker conflicts and may not be suitable for rooming together.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Expanded Details Section */}
      {showDetails && (
        <>
          {/* Harmony & Context Score Cards - Side by Side */}
          {(harmonyScore !== null || contextScore !== null) && (
            <div className="grid grid-cols-2 gap-3 sm:gap-3 mb-4 sm:mb-4">
          {harmonyScore !== null && (
            <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
              <CardContent className="p-4 sm:p-4">
                <div className="flex items-start justify-between mb-3 sm:mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 sm:p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                      <Home className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-xs font-semibold text-gray-900 dark:text-gray-100">Harmony</h4>
                      <p className="text-xs sm:text-[10px] text-gray-500 dark:text-gray-400">Day-to-day</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-1.5">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl sm:text-xl font-bold ${getScoreColor(compatibilityData?.harmony_score || 0)}`}>
                      {harmonyScore}%
                    </span>
                  </div>
                  <div className="relative h-2.5 sm:h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(compatibilityData?.harmony_score || 0)} transition-all duration-500`}
                      style={{ width: `${harmonyScore}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {contextScore !== null && (
            <Card className="border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
              <CardContent className="p-4 sm:p-4">
                <div className="flex items-start justify-between mb-3 sm:mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 sm:p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                      <GraduationCap className="w-5 h-5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-xs font-semibold text-gray-900 dark:text-gray-100">Context</h4>
                      <p className="text-xs sm:text-[10px] text-gray-500 dark:text-gray-400">Academic</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-1.5">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl sm:text-xl font-bold ${getScoreColor(compatibilityData?.context_score || 0)}`}>
                      {contextScore}%
                    </span>
                  </div>
                  <div className="relative h-2.5 sm:h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(compatibilityData?.context_score || 0)} transition-all duration-500`}
                      style={{ width: `${contextScore}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
            </div>
          )}

          {/* Detailed Dimension Scores - Collapsible */}
          {compatibilityData?.dimension_scores_json && typeof compatibilityData.dimension_scores_json === 'object' && Object.keys(compatibilityData.dimension_scores_json).length > 0 && (
            <Card className="border-2 mb-4 sm:mb-4">
          <CardContent className="p-0">
            <button
              onClick={() => setShowDimensions(!showDimensions)}
              className="w-full flex items-center justify-between p-4 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors touch-manipulation min-h-[56px] sm:min-h-0"
            >
              <div className="flex items-center gap-3 sm:gap-2">
                <Sparkles className="w-5 h-5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-base sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Detailed Dimension Scores
                </h4>
              </div>
              {showDimensions ? (
                <ChevronUp className="w-5 h-5 sm:w-4 sm:h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 sm:w-4 sm:h-4 text-gray-400" />
              )}
            </button>
            
            {showDimensions && (
              <div className="px-4 sm:px-4 pb-4 sm:pb-4 pt-3 sm:pt-2 border-t">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
                  {Object.entries(compatibilityData.dimension_scores_json).map(([key, score]) => {
                    const dimensionKey = key as string
                    const dimensionScore = typeof score === 'number' ? score : 0
                    const config = dimensionConfig[dimensionKey]
                    const Icon = config?.icon || Info
                    const label = config?.label || dimensionKey
                    const description = config?.description || ''
                    
                    return (
                      <div 
                        key={dimensionKey} 
                        className="p-4 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-900/40 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2 sm:mb-1.5">
                          <div className="flex items-center gap-2 sm:gap-1.5 flex-1 min-w-0">
                            <Icon className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <span className="text-sm sm:text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
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
                          <span className={`text-sm sm:text-xs font-bold ml-2 flex-shrink-0 ${getScoreColor(dimensionScore)}`}>
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
          {suggestion.sectionScores && (
            <div className="mb-4 sm:mb-4">
              <h4 className="text-sm sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 sm:mb-2">Score Breakdown</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3">
                {(() => {
                  const orderMap: Record<string, number> = {
                    academic: 1,
                    personality: 2,
                    social: 3,
                    lifestyle: 4,
                    schedule: 5
                  }
                  const sortedEntries = Object.entries(suggestion.sectionScores).sort((a, b) => {
                    const orderA = orderMap[a[0].toLowerCase()] || 999
                    const orderB = orderMap[b[0].toLowerCase()] || 999
                    return orderA - orderB
                  })
                  return sortedEntries.map(([key, score]) => (
                    <div 
                      key={key} 
                      className="p-3 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50"
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-1.5">
                        <span className="text-sm sm:text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {key}
                        </span>
                        <span className={`text-sm sm:text-xs font-bold ${getScoreColor(score)}`}>
                          {Math.round(score * 100)}%
                        </span>
                      </div>
                      <div className="relative h-2 sm:h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
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
          )}
        </>
      )}
      
      {/* Match Explanation */}
      {(suggestion.personalizedExplanation || (suggestion.reasons && suggestion.reasons.length > 0)) && (
        <div className="mb-4 sm:mb-4">
          <div className="text-sm sm:text-sm font-medium text-text-secondary mb-2 sm:mb-1">Why this match works:</div>
          <div className="text-sm sm:text-sm text-text-primary leading-relaxed">
            {suggestion.personalizedExplanation || (() => {
              // Fallback to basic explanation if personalized one isn't available
              const reasons = suggestion.reasons || []
              const scores = suggestion.sectionScores || {}
              
              // Get top strengths
              const academicScore = scores.academic || 0
              const personalityScore = scores.personality || 0
              const socialScore = scores.social || 0
              const lifestyleScore = scores.lifestyle || 0
              const scheduleScore = scores.schedule || 0
              
              // Build explanation sentences
              const strengths: string[] = []
              const concerns: string[] = []
              
              // First sentence: Main strengths
              if (reasons.length > 0) {
                const mainReasons = reasons.slice(0, 2).join(' and ')
                strengths.push(`You two seem like a great fit because ${mainReasons.toLowerCase()}.`)
              } else {
                strengths.push(`Based on your profiles, you both share similar values and lifestyle preferences that should make living together comfortable.`)
              }
              
              // Second sentence: Specific compatibility highlights
              const topScores: string[] = []
              if (academicScore > 0.7) topScores.push('academic backgrounds')
              if (personalityScore > 0.7) topScores.push('personality traits')
              if (socialScore > 0.7) topScores.push('social preferences')
              if (lifestyleScore > 0.7) topScores.push('lifestyle habits')
              
              if (topScores.length > 0) {
                strengths.push(`Your ${topScores.slice(0, 2).join(' and ')} align really well, which should help you both feel at home and understand each other's routines.`)
              } else {
                strengths.push(`You both seem to value similar things when it comes to shared living spaces, which is always a good foundation for a roommate relationship.`)
              }
              
              // Third sentence: Constructive feedback/things to watch out for
              if (scheduleScore < 0.5) {
                concerns.push(`One thing to keep in mind is that your schedules might be quite different, so it'd be worth discussing quiet hours and study times early on to make sure you're both comfortable.`)
              } else if (lifestyleScore < 0.5) {
                concerns.push(`You might want to chat about cleanliness expectations and how you both like to keep shared spaces, since those small differences can sometimes cause friction if not discussed upfront.`)
              } else if (socialScore < 0.5) {
                concerns.push(`Since you have different preferences around guests and socializing at home, having an open conversation about boundaries and house rules would help you both feel respected.`)
              } else {
                concerns.push(`Like with any roommate situation, communication is key - make sure you're both on the same page about the important stuff like bills, shared responsibilities, and what happens if plans change.`)
              }
              
              return [...strengths, ...concerns].join(' ')
            })()}
          </div>
        </div>
      )}
      
      {/* Actions for pending/suggested matches */}
      {suggestion.status === 'pending' && (
        <div className="flex flex-col gap-2">
          {/* Accept button on top */}
          <button
            onClick={() => handleRespond('accept')}
            disabled={isResponding || isLoading}
            className="w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium touch-manipulation min-h-[44px]"
          >
            {isResponding ? 'Accepting...' : 'Accept'}
          </button>
          {/* Decline button on bottom */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowDeclineDialog(true)
            }}
            disabled={isResponding || isLoading}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-border text-text-primary hover:bg-gray-50 dark:hover:bg-bg-surface-alt active:bg-gray-100 dark:active:bg-bg-surface-alt disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium touch-manipulation min-h-[44px]"
          >
            Decline
          </button>
        </div>
      )}

      {/* Block button for accepted matches (not for pending) */}
      {suggestion.status === 'accepted' && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowBlockDialog(true)
            }}
            className="flex-1 px-4 py-2.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors font-medium text-sm flex items-center justify-center gap-2 touch-manipulation min-h-[44px]"
          >
            <Ban className="h-4 w-4" />
            Block User
          </button>
        </div>
      )}
      
      {/* Actions for confirmed matches */}
      {suggestion.status === 'confirmed' && !isSelectable && (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleChatNow()
            }}
            disabled={isOpeningChat}
            className="flex-1 px-4 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base touch-manipulation min-h-[44px]"
          >
            {isOpeningChat ? 'Opening chat...' : '💬 Chat Now'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowBlockDialog(true)
            }}
            className="px-4 py-2.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors font-medium text-sm sm:text-base touch-manipulation min-h-[44px] min-w-[44px]"
            title="Block user"
          >
            <Ban className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Decline Confirmation Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent className="rounded-2xl bg-white dark:bg-white">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-black text-h2-mobile sm:text-h2-desktop font-semibold mb-4">
              Decline Match?
            </DialogTitle>
            <DialogDescription className="text-gray-900">
              This match will be removed and you will never be able to match with this user again. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-4">
            <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={async () => {
                try {
                  await handleRespond('decline')
                  // Close dialog after successful decline
                  setShowDeclineDialog(false)
                } catch (error) {
                  // Dialog stays open on error so user can try again
                  console.error('Failed to decline match:', error)
                }
              }}
              disabled={isResponding || isLoading}
            >
              {isResponding ? 'Declining...' : 'Yes, Decline Match'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block User Confirmation Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block User?</DialogTitle>
            <DialogDescription>
              Are you sure you want to block this user? You will not be matched with them again, 
              and any existing matches will be declined. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBlockUser} disabled={isBlocking}>
              {isBlocking ? 'Blocking...' : 'Block User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Run Info (debug only) */}
      {process.env.NEXT_PUBLIC_DEBUG_MATCHES === 'true' && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-border">
          <div className="text-xs text-text-muted">
            Run ID: {suggestion.runId}
          </div>
        </div>
      )}
    </div>
  )
}
