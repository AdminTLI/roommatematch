'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { SectionScores } from './section-scores'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { Clock, Ban, Sparkles, Home, GraduationCap, Info, ChevronDown, ChevronUp, Droplets, Volume2, Moon, Coffee, BookOpen, Heart, XCircle, MessageCircle, UserPlus, X, Users } from 'lucide-react'
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
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 70) return 'text-indigo-600 dark:text-indigo-400'
    if (score >= 55) return 'text-violet-600 dark:text-violet-400'
    return 'text-amber-600 dark:text-amber-400'
  }

  const getScoreBarColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500 dark:bg-emerald-400'
    if (score >= 70) return 'bg-indigo-500 dark:bg-indigo-400'
    if (score >= 55) return 'bg-violet-500 dark:bg-violet-400'
    return 'bg-amber-500 dark:bg-amber-400'
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
          <span className="px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 text-xs font-medium">
            Pending
          </span>
        )
      case 'accepted':
        // Find which users haven't accepted yet
        const notAccepted = suggestion.memberIds.filter(id => !suggestion.acceptedBy?.includes(id))
        const waitingForCurrentUser = notAccepted.includes(currentUserId)

        if (waitingForCurrentUser) {
          return (
            <span className="px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 text-xs font-medium flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Waiting for your response
            </span>
          )
        } else {
          return (
            <span className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 text-xs font-medium flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Waiting for {pendingCount > 1 ? `${pendingCount} others` : 'other person'}
            </span>
          )
        }
      case 'confirmed':
        return (
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 text-xs font-medium">
            Confirmed 🎉
          </span>
        )
      case 'declined':
        return (
          <span className="px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50 text-xs font-medium">
            Declined
          </span>
        )
      default:
        return null
    }
  }

  // Generate compatibility highlights
  const generateCompatibilityHighlights = () => {
    const highlights: string[] = []
    
    if (compatibilityData?.top_alignment) {
      highlights.push(`Strong alignment on ${formatTopAlignment(compatibilityData.top_alignment)}`)
    }
    
    if (harmonyScore !== null && harmonyScore >= 70) {
      highlights.push('Excellent day-to-day living compatibility')
    }
    
    if (contextScore !== null && contextScore >= 70) {
      highlights.push('Similar academic background and goals')
    }
    
    if (suggestion.reasons && suggestion.reasons.length > 0) {
      suggestion.reasons.slice(0, 2).forEach(reason => {
        if (!highlights.includes(reason)) {
          highlights.push(reason)
        }
      })
    }
    
    // Ensure we have at least 3 highlights
    while (highlights.length < 3) {
      if (highlights.length === 0) highlights.push('Compatible living preferences')
      else if (highlights.length === 1) highlights.push('Shared interests and values')
      else highlights.push('Good match potential')
    }
    
    return highlights.slice(0, 3)
  }

  const compatibilityHighlights = generateCompatibilityHighlights()

  const getCompatibilityLabel = (score: number | null) => {
    if (!score) return 'Loading'
    if (score >= 85) return 'Amazing'
    if (score >= 70) return 'Great'
    if (score >= 55) return 'Good'
    return 'Low'
  }

  // Helper to convert decimal score to percentage for color matching
  const getScoreForColor = (score: number | null) => {
    if (score === null) return 0
    // If score is already a percentage (0-100), return as is
    if (score > 1) return score
    // Otherwise convert from decimal (0-1) to percentage
    return score * 100
  }

  return (
    <div
      className={`group relative w-full overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all duration-300 hover:shadow-lg ${isSelected
        ? 'ring-2 ring-indigo-500/50 shadow-lg'
        : 'shadow-sm hover:shadow-md'
        } ${isSelectable ? 'cursor-pointer' : ''}`}
      onClick={isSelectable && suggestion.status === 'confirmed' ? onToggleSelection : undefined}
    >
      <div className="p-6 lg:p-8">
        {/* Header Row - Match Score + Status */}
        <div className="flex items-start justify-between mb-6">
          {/* Match Score */}
          <div className="flex items-baseline gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Match Score</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl lg:text-6xl font-bold tracking-tight ${getScoreColor(matchScore || 0)}`}>
                  {matchScore !== null ? matchScore : '...'}
                </span>
                <span className={`text-2xl lg:text-3xl font-medium ${getScoreColor(matchScore || 0)} opacity-60`}>%</span>
              </div>
              <span className={`text-xs font-medium mt-1 inline-block ${getScoreColor(matchScore || 0)}`}>
                {getCompatibilityLabel(matchScore)} Match
              </span>
            </div>
          </div>

          {/* Status Badge + Select Checkbox */}
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            {isSelectable && suggestion.status === 'confirmed' && (
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected
                  ? 'bg-indigo-500 border-indigo-500'
                  : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-400'
                  }`}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleSelection?.()
                }}
              >
                {isSelected && <Sparkles className="w-3 h-3 text-white" />}
              </div>
            )}
          </div>
        </div>

        {/* Harmony & Context Scores - Horizontal Layout */}
        {(harmonyScore !== null || contextScore !== null) && (
          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            {harmonyScore !== null && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-nowrap items-center gap-2 min-w-0">
                    <Heart className="w-4 h-4 text-pink-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">Harmony</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="flex-shrink-0 cursor-help rounded-full p-0.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                            <Info className="h-3.5 w-3.5" aria-hidden />
                            <span className="sr-only">What is Harmony Score?</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs bg-zinc-900 dark:bg-zinc-800 border-zinc-700 text-zinc-100 text-xs">
                          <p>Measures how well your day-to-day living preferences align - cleanliness, sleep, noise, guests, shared spaces, substances, study/social balance, and home vibe.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className={`text-sm font-semibold flex-shrink-0 ${getScoreColor(harmonyScore)}`}>
                    {harmonyScore}%
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getScoreBarColor(harmonyScore)} transition-all duration-700`}
                    style={{ width: `${harmonyScore}%` }}
                  />
                </div>
              </div>
            )}
            
            {contextScore !== null && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-nowrap items-center gap-2 min-w-0">
                    <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">Context</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="flex-shrink-0 cursor-help rounded-full p-0.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                            <Info className="h-3.5 w-3.5" aria-hidden />
                            <span className="sr-only">What is Context Score?</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs bg-zinc-900 dark:bg-zinc-800 border-zinc-700 text-zinc-100 text-xs">
                          <p>Measures how similar your academic context is - university, programme, and study year.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className={`text-sm font-semibold flex-shrink-0 ${getScoreColor(contextScore)}`}>
                    {contextScore}%
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getScoreBarColor(contextScore)} transition-all duration-700`}
                    style={{ width: `${contextScore}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dealbreaker Warning */}
        {compatibilityData?.is_valid_match === false && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-red-900 dark:text-red-100 block mb-1 text-sm">Dealbreaker Conflicts</span>
              <p className="text-red-700 dark:text-red-300 text-sm">This match has conflicts that may affect compatibility.</p>
            </div>
          </div>
        )}

        {/* Compatibility Highlights */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
            Why you match
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {compatibilityHighlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-2.5">
                <span className="text-emerald-500 dark:text-emerald-400 mt-0.5 text-lg leading-none">✓</span>
                <span className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Personalized Explanation */}
        {(suggestion.personalizedExplanation || suggestion.reasons) && (
          <div className="mb-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {suggestion.personalizedExplanation || "You share similar values and lifestyle preferences."}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          {suggestion.status === 'pending' && (
            <>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeclineDialog(true);
                }}
                variant="outline"
                className="flex-1 h-11 rounded-xl border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium transition-all"
                disabled={isResponding || isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Skip
              </Button>
              <Button
                onClick={() => handleRespond('accept')}
                className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium shadow-sm hover:shadow transition-all"
                disabled={isResponding || isLoading}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {isResponding ? 'Connecting...' : 'Connect'}
              </Button>
            </>
          )}

          {suggestion.status === 'confirmed' && !isSelectable && (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                handleChatNow()
              }}
              disabled={isOpeningChat}
              className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium shadow-sm hover:shadow transition-all"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowDetails(!showDetails)
            }}
            className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex items-center justify-center gap-1.5"
          >
            {showDetails ? 'Hide details' : 'View analysis'}
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Details - Collapsible Section */}
      {showDetails && (
        <div className="px-6 lg:px-8 pb-6 pt-4 space-y-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 animate-in fade-in slide-in-from-top-1">
          {/* Dimension Scores if available */}
          {compatibilityData?.dimension_scores_json && typeof compatibilityData.dimension_scores_json === 'object' && Object.keys(compatibilityData.dimension_scores_json).length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-4">Detailed Dimension Scores</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(compatibilityData.dimension_scores_json).map(([key, score]) => {
                  const dimensionKey = key as string
                  const dimensionScore = typeof score === 'number' ? score : 0
                  const dimensionScorePercent = Math.round(dimensionScore * 100)
                  const config = dimensionConfig[dimensionKey]
                  const Icon = config?.icon || Info
                  const label = config?.label || dimensionKey
                  const description = config?.description || ''
                  
                  return (
                    <div 
                      key={dimensionKey} 
                      className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Icon className="w-4 h-4 text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
                            {label}
                          </span>
                          {description && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 cursor-help flex-shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs max-w-xs">{description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <span className={`text-sm font-semibold ml-2 flex-shrink-0 ${getScoreColor(dimensionScorePercent)}`}>
                          {dimensionScorePercent}%
                        </span>
                      </div>
                      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div 
                          className={`h-full rounded-full ${getScoreBarColor(dimensionScorePercent)} transition-all duration-700`}
                          style={{ width: `${dimensionScorePercent}%` }}
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

      {/* Dialogs */}
      {showDeclineDialog && (
        <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
          <DialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-zinc-900 dark:text-zinc-100">Decline Match?</DialogTitle>
              <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                Are you sure you want to decline this match? This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeclineDialog(false)} className="border-zinc-300 dark:border-zinc-700">Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                try {
                  await handleRespond('decline')
                  setShowDeclineDialog(false)
                  showSuccessToast('Match declined', 'This match has been removed.')
                } catch (error) {
                  const errorMessage = error instanceof Error ? error.message : 'Failed to decline match. Please try again.'
                  showErrorToast('Failed to decline match', errorMessage)
                }
              }}>Decline</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Block Dialog */}
      {showBlockDialog && (
        <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
          <DialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-zinc-900 dark:text-zinc-100">Block User?</DialogTitle>
              <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                They will not be able to message you or see your profile.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBlockDialog(false)} className="border-zinc-300 dark:border-zinc-700">Cancel</Button>
              <Button variant="destructive" onClick={handleBlockUser} disabled={isBlocking}>Block</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  )
}
