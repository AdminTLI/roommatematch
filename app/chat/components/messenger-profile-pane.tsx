'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronDown, ChevronUp, Droplets, Volume2, Moon, Home, Coffee, BookOpen, Heart, Info, Users, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadgeList } from '@/components/ui/status-badge'
import { safeLogger } from '@/lib/utils/logger'
import { cn } from '@/lib/utils'
import { type HousingStatusKey } from '@/lib/constants/housing-status'
import { createClient } from '@/lib/supabase/client'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CompatibilityData {
  compatibility_score: number
  harmony_score?: number | null
  context_score?: number | null
  dimension_scores_json?: { [key: string]: number } | null
}

interface UserInfoData {
  first_name: string | null
  last_name: string | null
  bio: string | null
  interests: string[]
  housing_status?: HousingStatusKey[]
  university_name: string | null
  programme_name: string | null
  degree_level: string | null
  study_year: number | null
  location?: string | null
}

interface MessengerProfilePaneProps {
  chatId: string
  isOpen: boolean
  onClose?: () => void
}

const getScoreGradient = (score: number) => {
  if (score >= 0.85) return 'from-emerald-500 to-green-600'
  if (score >= 0.7) return 'from-blue-500 to-indigo-600'
  if (score >= 0.55) return 'from-violet-500 to-purple-600'
  return 'from-amber-500 to-orange-500'
}

const getCompatibilityLabel = (score: number) => {
  if (score >= 0.85) return 'Amazing'
  if (score >= 0.7) return 'Great'
  if (score >= 0.55) return 'Good'
  return 'Low'
}

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

const getScoreColor = (score: number) => {
  if (score >= 0.85) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 0.7) return 'text-indigo-600 dark:text-indigo-400'
  if (score >= 0.55) return 'text-violet-600 dark:text-violet-400'
  return 'text-amber-600 dark:text-amber-400'
}

const getScoreBarColor = (score: number) => {
  if (score >= 0.85) return 'bg-emerald-500'
  if (score >= 0.7) return 'bg-indigo-500'
  if (score >= 0.55) return 'bg-violet-500'
  return 'bg-amber-500'
}

export function MessengerProfilePane({ chatId, isOpen, onClose }: MessengerProfilePaneProps) {
  const [compatibility, setCompatibility] = useState<CompatibilityData | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfoData | null>(null)
  const [currentUserInterests, setCurrentUserInterests] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const fetchData = useCallback(async () => {
    if (!isOpen) return

    setIsLoading(true)
    setError(null)
    setCompatibility(null)
    setUserInfo(null)

    try {
      // Fetch current user's interests
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('interests')
          .eq('user_id', user.id)
          .maybeSingle()
        
        if (profile?.interests && Array.isArray(profile.interests)) {
          setCurrentUserInterests(profile.interests)
        } else {
          setCurrentUserInterests([])
        }
      }

      const [compatResponse, userInfoResponse] = await Promise.all([
        fetch(`/api/chat/compatibility?chatId=${chatId}&_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }),
        fetch(`/api/chat/user-info?chatId=${chatId}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
      ])

      if (compatResponse.ok) {
        const compatData = await compatResponse.json()
        setCompatibility(compatData)
      } else {
        safeLogger.warn('[MessengerProfilePane] Failed to fetch compatibility:', await compatResponse.text())
      }

      if (userInfoResponse.ok) {
        const userInfoData = await userInfoResponse.json()
        setUserInfo(userInfoData)
      } else {
        safeLogger.warn('[MessengerProfilePane] Failed to fetch user info:', await userInfoResponse.text())
      }
    } catch (err) {
      safeLogger.error('[MessengerProfilePane] Error fetching data:', err)
      setError('Failed to load profile data')
    } finally {
      setIsLoading(false)
    }
  }, [chatId, isOpen])

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen, fetchData])

  if (!isOpen) return null

  const matchScore = compatibility ? Math.round(compatibility.compatibility_score * 100) : null

  return (
    <div
      data-messenger-profile-pane
      className="flex flex-col h-full w-full overflow-hidden bg-white dark:bg-gray-900"
      style={{
        height: '100%',
        maxHeight: '100%',
        minHeight: 0
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Profile & Compatibility</h2>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close profile panel</span>
          </Button>
        )}
      </div>

      {/* Scrollable Content */}
      <div 
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 scrollbar-visible"
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          height: 0, // Force flex-1 to work properly
          flex: '1 1 0%'
        }}
      >
        <div className="px-6 py-6 space-y-6 bg-white dark:bg-gray-900" style={{ minHeight: 'min-content' }}>
          {isLoading ? (
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-3/4"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          ) : (
            <>
              {/* Match Score Card */}
              {matchScore !== null && compatibility && (
                <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
                  {/* Hero Match Score Section */}
                  <div className="relative p-6 pb-4 text-center bg-gradient-to-b from-indigo-600/10 dark:from-indigo-600/20 to-transparent">
                    <div className="inline-flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Match Score</span>
                    </div>

                    {/* Large Match Percentage */}
                    <div className="relative">
                      <span className={cn(
                        'text-6xl font-black tracking-tight block',
                        compatibility.compatibility_score >= 0.85 ? 'text-emerald-600 dark:text-emerald-400' :
                        compatibility.compatibility_score >= 0.7 ? 'text-indigo-600 dark:text-indigo-400' :
                        compatibility.compatibility_score >= 0.55 ? 'text-violet-600 dark:text-violet-400' :
                        'text-amber-600 dark:text-amber-400'
                      )}>
                        {matchScore}%
                      </span>
                      <div className="mt-2">
                        <span className={cn(
                          'text-sm font-semibold px-3 py-1 rounded-full bg-white dark:bg-gray-900 inline-block border border-gray-200 dark:border-gray-700',
                          compatibility.compatibility_score >= 0.85 ? 'text-emerald-600 dark:text-emerald-400' :
                          compatibility.compatibility_score >= 0.7 ? 'text-indigo-600 dark:text-indigo-400' :
                          compatibility.compatibility_score >= 0.55 ? 'text-violet-600 dark:text-violet-400' :
                          'text-amber-600 dark:text-amber-400'
                        )}>
                          {getCompatibilityLabel(compatibility.compatibility_score)} Match
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details Button */}
                  {(compatibility.harmony_score !== null || compatibility.context_score !== null || compatibility.dimension_scores_json) && (
                    <div className="px-6 pb-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="ghost"
                        onClick={() => setShowDetails(!showDetails)}
                        className="w-full mt-4 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-medium">View Detailed Scores</span>
                          </div>
                          {showDetails ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Expanded Details Section */}
              {matchScore !== null && compatibility && showDetails && (
                <div className="mt-4 mb-6 space-y-4">
                      {/* Context Score and Harmony Score */}
                      <div className="grid grid-cols-2 gap-3">
                        {compatibility.harmony_score !== null && (
                          <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <div className="flex flex-nowrap items-center gap-1.5 mb-1 min-w-0">
                              <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">Harmony Score</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button type="button" className="flex-shrink-0 cursor-help rounded-full p-0.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                                      <Info className="h-3.5 w-3.5" aria-hidden />
                                      <span className="sr-only">What is Harmony Score?</span>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs bg-gray-900 dark:bg-gray-800 border-gray-700 text-gray-100 text-xs">
                                    <p>Measures how well your day-to-day living preferences align - cleanliness, sleep, noise, guests, shared spaces, substances, study/social balance, and home vibe.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {Math.round(compatibility.harmony_score * 100)}%
                            </div>
                            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 mt-2">
                              <div 
                                className={cn('h-full rounded-full transition-all duration-500', getScoreBarColor(compatibility.harmony_score))}
                                style={{ width: `${compatibility.harmony_score * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {compatibility.context_score !== null && (
                          <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                            <div className="flex flex-nowrap items-center gap-1.5 mb-1 min-w-0">
                              <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">Context Score</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button type="button" className="flex-shrink-0 cursor-help rounded-full p-0.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                                      <Info className="h-3.5 w-3.5" aria-hidden />
                                      <span className="sr-only">What is Context Score?</span>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-xs bg-gray-900 dark:bg-gray-800 border-gray-700 text-gray-100 text-xs">
                                    <p>Measures how similar your academic context is - university, programme, and study year.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {Math.round(compatibility.context_score * 100)}%
                            </div>
                            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 mt-2">
                              <div 
                                className={cn('h-full rounded-full transition-all duration-500', getScoreBarColor(compatibility.context_score))}
                                style={{ width: `${compatibility.context_score * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Detailed Dimension Scores */}
                      {compatibility.dimension_scores_json && typeof compatibility.dimension_scores_json === 'object' && Object.keys(compatibility.dimension_scores_json).length > 0 && (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              Dimension Scores
                            </h4>
                          </div>
                          <div className="px-4 pb-4 pt-3">
                            <div className="grid grid-cols-1 gap-3">
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
                                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                  >
                                    <div className="flex items-start justify-between mb-1.5">
                                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                        <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                          {label}
                                        </span>
                                        {description && (
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Info className="w-3 h-3 text-gray-400 dark:text-gray-500 cursor-help flex-shrink-0" />
                                              </TooltipTrigger>
                                              <TooltipContent className="bg-gray-800 dark:bg-gray-700 border-gray-700 dark:border-gray-600 max-w-xs">
                                                <p className="text-xs text-gray-200 dark:text-gray-300">{description}</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        )}
                                      </div>
                                      <span className={cn('text-xs font-bold ml-2 flex-shrink-0', getScoreColor(dimensionScore))}>
                                        {Math.round(dimensionScore * 100)}%
                                      </span>
                                    </div>
                                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                      <div 
                                        className={cn('h-full rounded-full transition-all duration-500', getScoreBarColor(dimensionScore))}
                                        style={{ width: `${dimensionScore * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                </div>
              )}

              {/* Bio */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">BIO</h3>
                {userInfo?.bio && userInfo.bio.trim() ? (
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {userInfo.bio}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">No bio available</p>
                )}
              </div>

              {/* Interests */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">INTERESTS</h3>
                {userInfo?.interests && userInfo.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userInfo.interests.map((interest, index) => {
                      const isShared = currentUserInterests.includes(interest)
                      return (
                        <Badge
                          key={index}
                          variant="secondary"
                          className={cn(
                            "px-3 py-1.5 text-xs rounded-full",
                            isShared
                              ? "bg-purple-600 dark:bg-purple-500 text-white border-purple-600 dark:border-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                          )}
                        >
                          {interest}
                        </Badge>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">No interests listed</p>
                )}
              </div>

              {/* Housing Status */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">HOUSING STATUS</h3>
                {userInfo?.housing_status && userInfo.housing_status.length > 0 ? (
                  <StatusBadgeList
                    statusKeys={userInfo.housing_status}
                    variant="secondary"
                    className="flex-wrap"
                  />
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">No housing status selected</p>
                )}
              </div>

              {/* University Data */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">UNIVERSITY</h3>
                <div className="space-y-2 text-sm">
                  {userInfo?.location && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Location: </span>
                      <span className="text-gray-900 dark:text-white">{userInfo.location}</span>
                    </div>
                  )}
                  {userInfo?.programme_name && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Programme: </span>
                      <span className="text-gray-900 dark:text-white">{userInfo.programme_name}</span>
                    </div>
                  )}
                  {userInfo?.study_year !== null && userInfo?.study_year !== undefined && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Year: </span>
                      <span className="text-gray-900 dark:text-white">{userInfo.study_year}</span>
                    </div>
                  )}
                  {(!userInfo?.location && !userInfo?.programme_name && userInfo?.study_year === null) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">No university information available</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
