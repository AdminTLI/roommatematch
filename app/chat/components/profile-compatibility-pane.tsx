'use client'

import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadgeList } from '@/components/ui/status-badge'
import { type HousingStatusKey } from '@/lib/constants/housing-status'
import { 
  Sparkles, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Droplets, 
  Volume2, 
  Moon, 
  Home, 
  Coffee, 
  BookOpen, 
  Heart,
  Info,
  Users
} from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { safeLogger } from '@/lib/utils/logger'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CompatibilityData {
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
  harmony_score?: number | null
  context_score?: number | null
  dimension_scores_json?: { [key: string]: number } | null
  is_valid_match?: boolean
  algorithm_version?: string
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

interface ProfileCompatibilityPaneProps {
  chatId: string
  userId: string
  isOpen: boolean
  onClose?: () => void
}

const getScoreGradient = (score: number) => {
  if (score >= 0.9) return 'from-emerald-500 to-green-600'
  if (score >= 0.8) return 'from-blue-500 to-indigo-600'
  if (score >= 0.7) return 'from-indigo-500 to-purple-600'
  if (score >= 0.6) return 'from-purple-500 to-pink-600'
  return 'from-pink-500 to-red-600'
}

const getCompatibilityLabel = (score: number) => {
  if (score >= 0.9) return 'Excellent'
  if (score >= 0.8) return 'Very Good'
  if (score >= 0.7) return 'Good'
  if (score >= 0.6) return 'Fair'
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
  if (score >= 0.8) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 0.6) return 'text-blue-600 dark:text-blue-400'
  if (score >= 0.4) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

const getScoreBarColor = (score: number) => {
  if (score >= 0.8) return 'bg-emerald-400'
  if (score >= 0.6) return 'bg-blue-400'
  if (score >= 0.4) return 'bg-yellow-400'
  return 'bg-red-400'
}

export function ProfileCompatibilityPane({ chatId, userId, isOpen, onClose }: ProfileCompatibilityPaneProps) {
  const [compatibility, setCompatibility] = useState<CompatibilityData | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfoData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDimensions, setShowDimensions] = useState(false)

  const fetchData = useCallback(async () => {
    if (!isOpen) return

    setIsLoading(true)
    setError(null)
    setCompatibility(null)
    setUserInfo(null)

    try {
      // Fetch compatibility and user info in parallel
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
        safeLogger.warn('[ProfilePane] Failed to fetch compatibility:', await compatResponse.text())
      }

      if (userInfoResponse.ok) {
        const userInfoData = await userInfoResponse.json()
        setUserInfo(userInfoData)
      } else {
        safeLogger.warn('[ProfilePane] Failed to fetch user info:', await userInfoResponse.text())
        if (userInfoResponse.status === 403) {
          setError('You can only view info for matched users.')
        }
      }
    } catch (err) {
      safeLogger.error('[ProfilePane] Error fetching data:', err)
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
  const displayName = userInfo
    ? `${userInfo.first_name || ''}${userInfo.last_name ? ` ${userInfo.last_name}` : ''}`.trim() || 'User'
    : null

  return (
    <div data-profile-compatibility-pane className="flex flex-col h-full w-full overflow-hidden bg-white dark:bg-gray-900">
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
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-visible bg-white dark:bg-gray-900">
        <div className="px-6 py-6 space-y-6">
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
              {/* Match Score */}
              {matchScore !== null && (
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreGradient(compatibility!.compatibility_score)} flex items-center justify-center shadow-lg`}>
                      <span className="text-5xl font-bold text-white">
                        {matchScore}
                      </span>
                    </div>
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">MATCH SCORE</h3>
                    <p className="text-lg text-gray-700 dark:text-gray-300">{getCompatibilityLabel(compatibility!.compatibility_score)} Match</p>
                  </div>
                </div>
              )}

              {/* Context Score & Harmony Score */}
              {(compatibility?.context_score !== null && compatibility?.context_score !== undefined) || 
               (compatibility?.harmony_score !== null && compatibility?.harmony_score !== undefined) ? (
                <div className="grid grid-cols-2 gap-4">
                  {compatibility?.context_score !== null && compatibility?.context_score !== undefined && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Context Score</div>
                      <div className={`text-2xl font-bold ${getScoreColor(compatibility.context_score)}`}>
                        {Math.round(compatibility.context_score * 100)}%
                      </div>
                      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 mt-2">
                        <div 
                          className={`h-full rounded-full ${getScoreBarColor(compatibility.context_score)} transition-all duration-500`}
                          style={{ width: `${compatibility.context_score * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {compatibility?.harmony_score !== null && compatibility?.harmony_score !== undefined && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Harmony Score</div>
                      <div className={`text-2xl font-bold ${getScoreColor(compatibility.harmony_score)}`}>
                        {Math.round(compatibility.harmony_score * 100)}%
                      </div>
                      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 mt-2">
                        <div 
                          className={`h-full rounded-full ${getScoreBarColor(compatibility.harmony_score)} transition-all duration-500`}
                          style={{ width: `${compatibility.harmony_score * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Detailed Dimension Scores - Collapsible */}
              {compatibility?.dimension_scores_json && typeof compatibility.dimension_scores_json === 'object' && Object.keys(compatibility.dimension_scores_json).length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                  <button
                    onClick={() => setShowDimensions(!showDimensions)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Detailed Dimension Scores
                      </h4>
                    </div>
                    {showDimensions ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                  
                  {showDimensions && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
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
                                <span className={`text-xs font-bold ml-2 flex-shrink-0 ${getScoreColor(dimensionScore)}`}>
                                  {Math.round(dimensionScore * 100)}%
                                </span>
                              </div>
                              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                <div 
                                  className={`h-full rounded-full ${getScoreBarColor(dimensionScore)} transition-all duration-500`}
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

              {/* Bio - Always show */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">BIO</h3>
                {userInfo?.bio && userInfo.bio.trim() ? (
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {userInfo.bio}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    No bio available
                  </p>
                )}
              </div>

              {/* Interests - Always show */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">INTERESTS</h3>
                {userInfo?.interests && userInfo.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userInfo.interests.map((interest, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    No interests listed
                  </p>
                )}
              </div>

              {/* Housing Status - Always show */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">HOUSING STATUS</h3>
                {userInfo?.housing_status && userInfo.housing_status.length > 0 ? (
                  <StatusBadgeList
                    statusKeys={userInfo.housing_status}
                    variant="secondary"
                    className="flex-wrap"
                  />
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    No housing status selected
                  </p>
                )}
              </div>

              {/* University Details - Always show */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">UNIVERSITY</h3>
                <div className="space-y-2 text-sm">
                  {userInfo?.university_name ? (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">University: </span>
                      <span className="text-gray-900 dark:text-white">{userInfo.university_name}</span>
                    </div>
                  ) : null}
                  {userInfo?.programme_name ? (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Programme: </span>
                      <span className="text-gray-900 dark:text-white">{userInfo.programme_name}</span>
                    </div>
                  ) : null}
                  {userInfo?.study_year !== null && userInfo?.study_year !== undefined ? (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Year: </span>
                      <span className="text-gray-900 dark:text-white">{userInfo.study_year}</span>
                    </div>
                  ) : null}
                  {userInfo?.degree_level ? (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Degree Level: </span>
                      <span className="text-gray-900 dark:text-white">{userInfo.degree_level}</span>
                    </div>
                  ) : null}
                  {(!userInfo?.university_name && !userInfo?.programme_name && userInfo?.study_year === null && !userInfo?.degree_level) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                      No university information available
                    </p>
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
