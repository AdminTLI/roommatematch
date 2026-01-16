'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronDown, ChevronUp, Droplets, Volume2, Moon, Home, Coffee, BookOpen, Heart, Info, Users, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadgeList } from '@/components/ui/status-badge'
import { safeLogger } from '@/lib/utils/logger'
import { cn } from '@/lib/utils'
import { type HousingStatusKey } from '@/lib/constants/housing-status'
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
  if (score >= 0.8) return 'text-emerald-600'
  if (score >= 0.6) return 'text-indigo-600'
  if (score >= 0.4) return 'text-amber-600'
  return 'text-red-600'
}

const getScoreBarColor = (score: number) => {
  if (score >= 0.8) return 'bg-emerald-500'
  if (score >= 0.6) return 'bg-indigo-500'
  if (score >= 0.4) return 'bg-amber-500'
  return 'bg-red-500'
}

export function MessengerProfilePane({ chatId, isOpen, onClose }: MessengerProfilePaneProps) {
  const [compatibility, setCompatibility] = useState<CompatibilityData | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfoData | null>(null)
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
      className="flex flex-col h-full w-full overflow-hidden bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950"
      style={{
        height: '100%',
        maxHeight: '100%',
        minHeight: 0
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Profile & Compatibility</h2>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close profile panel</span>
          </Button>
        )}
      </div>

      {/* Scrollable Content */}
      <div 
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 scrollbar-visible-dark-gradient"
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.5) transparent',
          height: 0, // Force flex-1 to work properly
          flex: '1 1 0%'
        }}
      >
        <div className="px-6 py-6 space-y-6 bg-white" style={{ minHeight: 'min-content' }}>
          {isLoading ? (
            <div className="space-y-6">
              <div className="h-32 bg-slate-100 rounded-lg animate-pulse"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4"></div>
                    <div className="h-2 bg-slate-100 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-600">{error}</p>
            </div>
          ) : (
            <>
              {/* Match Score Card */}
              {matchScore !== null && compatibility && (
                <div className="rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
                  {/* Hero Match Score Section */}
                  <div className="relative p-6 pb-4 text-center bg-gradient-to-b from-violet-600/20 to-transparent">
                    <div className="inline-flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-violet-400" />
                      <span className="text-sm font-medium text-slate-600 uppercase tracking-wider">Match Score</span>
                    </div>

                    {/* Large Match Percentage */}
                    <div className="relative">
                      <span className={cn(
                        'text-6xl font-black tracking-tight block',
                        compatibility.compatibility_score >= 0.9 ? 'text-emerald-400' :
                        compatibility.compatibility_score >= 0.8 ? 'text-indigo-400' :
                        compatibility.compatibility_score >= 0.7 ? 'text-indigo-400' :
                        compatibility.compatibility_score >= 0.6 ? 'text-amber-400' :
                        'text-slate-400'
                      )}>
                        {matchScore}%
                      </span>
                      <div className="mt-2">
                        <span className={cn(
                          'text-sm font-semibold px-3 py-1 rounded-full bg-slate-100 inline-block',
                          compatibility.compatibility_score >= 0.9 ? 'text-emerald-400' :
                          compatibility.compatibility_score >= 0.8 ? 'text-indigo-400' :
                          compatibility.compatibility_score >= 0.7 ? 'text-indigo-400' :
                          compatibility.compatibility_score >= 0.6 ? 'text-amber-400' :
                          'text-slate-400'
                        )}>
                          {getCompatibilityLabel(compatibility.compatibility_score)} Match
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details Button */}
                  {(compatibility.harmony_score !== null || compatibility.context_score !== null || compatibility.dimension_scores_json) && (
                    <div className="px-6 pb-4 border-t border-slate-200">
                      <Button
                        variant="ghost"
                        onClick={() => setShowDetails(!showDetails)}
                        className="w-full mt-4 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg"
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
                          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                            <div className="text-xs text-slate-600 mb-1">Harmony Score</div>
                            <div className="text-2xl font-bold text-slate-900">
                              {Math.round(compatibility.harmony_score * 100)}%
                            </div>
                            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200 mt-2">
                              <div 
                                className={cn('h-full rounded-full transition-all duration-500', getScoreBarColor(compatibility.harmony_score))}
                                style={{ width: `${compatibility.harmony_score * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {compatibility.context_score !== null && (
                          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                            <div className="text-xs text-slate-600 mb-1">Context Score</div>
                            <div className="text-2xl font-bold text-slate-900">
                              {Math.round(compatibility.context_score * 100)}%
                            </div>
                            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200 mt-2">
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
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                          <div className="px-4 py-3 border-b border-slate-200">
                            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-indigo-600" />
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
                                    className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                                  >
                                    <div className="flex items-start justify-between mb-1.5">
                                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                        <Icon className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                        <span className="text-xs font-medium text-slate-900 truncate">
                                          {label}
                                        </span>
                                        {description && (
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Info className="w-3 h-3 text-slate-400 cursor-help flex-shrink-0" />
                                              </TooltipTrigger>
                                              <TooltipContent className="bg-slate-800 border-slate-700 max-w-xs">
                                                <p className="text-xs text-slate-200">{description}</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        )}
                                      </div>
                                      <span className={cn('text-xs font-bold ml-2 flex-shrink-0', getScoreColor(dimensionScore))}>
                                        {Math.round(dimensionScore * 100)}%
                                      </span>
                                    </div>
                                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
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
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">BIO</h3>
                {userInfo?.bio && userInfo.bio.trim() ? (
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {userInfo.bio}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 italic">No bio available</p>
                )}
              </div>

              {/* Interests */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">INTERESTS</h3>
                {userInfo?.interests && userInfo.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userInfo.interests.map((interest, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 rounded-full"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No interests listed</p>
                )}
              </div>

              {/* Housing Status */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">HOUSING STATUS</h3>
                {userInfo?.housing_status && userInfo.housing_status.length > 0 ? (
                  <StatusBadgeList
                    statusKeys={userInfo.housing_status}
                    variant="secondary"
                    className="flex-wrap"
                  />
                ) : (
                  <p className="text-xs text-slate-500 italic">No housing status selected</p>
                )}
              </div>

              {/* University Data */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">UNIVERSITY</h3>
                <div className="space-y-2 text-sm">
                  {userInfo?.location && (
                    <div>
                      <span className="text-slate-600 font-medium">Location: </span>
                      <span className="text-slate-900">{userInfo.location}</span>
                    </div>
                  )}
                  {userInfo?.programme_name && (
                    <div>
                      <span className="text-slate-600 font-medium">Programme: </span>
                      <span className="text-slate-900">{userInfo.programme_name}</span>
                    </div>
                  )}
                  {userInfo?.study_year !== null && userInfo?.study_year !== undefined && (
                    <div>
                      <span className="text-slate-600 font-medium">Year: </span>
                      <span className="text-slate-900">{userInfo.study_year}</span>
                    </div>
                  )}
                  {(!userInfo?.location && !userInfo?.programme_name && userInfo?.study_year === null) && (
                    <p className="text-xs text-slate-500 italic">No university information available</p>
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
