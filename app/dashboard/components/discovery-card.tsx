'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { X, UserPlus, Zap, Heart, Users, MessageCircle, LucideIcon, Info, Droplets, Volume2, Moon, Coffee, BookOpen, Home, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface DiscoveryCardProps {
    profile: {
        id: string
        name?: string // Optional - not displayed for anonymization
        matchPercentage?: number
        harmonyScore?: number
        contextScore?: number
        compatibilityHighlights?: string[]
        dimensionScores?: { [key: string]: number } | null
    }
    onSkip?: (id: string) => void
    onConnect?: (id: string) => void
    connectButtonText?: string
    connectButtonIcon?: LucideIcon
}

// Dimension labels, descriptions, and icons
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

// Helper to get score color class
function getScoreColor(score: number): string {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-indigo-400'
    if (score >= 40) return 'text-amber-400'
    return 'text-slate-400'
}

function getScoreBarColor(score: number): string {
    if (score >= 80) return 'bg-emerald-500'
    if (score >= 60) return 'bg-indigo-500'
    if (score >= 40) return 'bg-amber-500'
    return 'bg-slate-500'
}

function getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Low'
}

export function DiscoveryCard({ profile, onSkip, onConnect, connectButtonText = 'Connect', connectButtonIcon = UserPlus }: DiscoveryCardProps) {
    const router = useRouter()
    const [isFlipped, setIsFlipped] = useState(false)
    const matchScore = Math.round(profile.matchPercentage || 0)
    // Convert scores from 0-1 range to 0-100, default to 0 if not provided
    const harmonyScore = profile.harmonyScore != null && profile.harmonyScore !== undefined 
      ? Math.round(profile.harmonyScore * 100) 
      : 0
    const contextScore = profile.contextScore != null && profile.contextScore !== undefined
      ? Math.round(profile.contextScore * 100)
      : 0

    // Default compatibility highlights if none provided
    const highlights = profile.compatibilityHighlights || [
        'Similar lifestyle preferences',
        'Compatible schedules',
        'Shared interests'
    ]
    
    const ConnectIcon = connectButtonIcon

    const handleSkip = () => {
        if (onSkip) {
            onSkip(profile.id)
        }
    }

    const handleConnect = () => {
        if (onConnect) {
            onConnect(profile.id)
        } else {
            router.push(`/chat?userId=${profile.id}`)
        }
    }

    return (
        <div className="w-full h-full" style={{ perspective: '1000px' }}>
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
              className="w-full h-full"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
            >
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-slate-800 border border-slate-700 shadow-xl h-full"
              >
            {/* Hero Match Score Section */}
            <div className="relative p-6 pb-4 text-center bg-gradient-to-b from-violet-600/20 to-transparent">
                <div className="inline-flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-violet-400" />
                    <span className="text-sm font-medium text-slate-300 uppercase tracking-wider">Match Score</span>
                </div>

                {/* Large Match Percentage */}
                <div className="relative">
                    <span className={`text-6xl font-black tracking-tight ${getScoreColor(matchScore)}`}>
                        {matchScore}%
                    </span>
                    <div className="mt-2">
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-slate-700/50 ${getScoreColor(matchScore)}`}>
                            {getScoreLabel(matchScore)} Match
                        </span>
                    </div>
                </div>
            </div>

            {/* Score Breakdown Section */}
            <div className="px-6 py-4 space-y-4 border-t border-slate-700/50">
                {/* Harmony Score */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-pink-400" />
                            <span className="text-sm font-medium text-slate-300">Harmony</span>
                        </div>
                        <span className={`text-sm font-bold ${getScoreColor(harmonyScore)}`}>
                            {harmonyScore}%
                        </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${harmonyScore}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full ${getScoreBarColor(harmonyScore)}`}
                        />
                    </div>
                </div>

                {/* Context Score */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-slate-300">Context</span>
                        </div>
                        <span className={`text-sm font-bold ${getScoreColor(contextScore)}`}>
                            {contextScore}%
                        </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${contextScore}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                            className={`h-full rounded-full ${getScoreBarColor(contextScore)}`}
                        />
                    </div>
                </div>
            </div>

            {/* View Details Button */}
            <div className="px-6 pb-4">
              <Button
                onClick={() => setIsFlipped(true)}
                className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-900/30 transition-all transform hover:scale-[1.02] active:scale-95"
              >
                View Details
              </Button>
            </div>

            {/* Compatibility Highlights */}
            <div className="flex-1 px-6 py-4 border-t border-slate-700/50">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Why you match
                </h4>
                <ul className="space-y-2">
                    {highlights.slice(0, 3).map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            <span className="text-sm text-slate-300 leading-tight">{highlight}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Actions - only show if at least one action handler is provided */}
            {(onSkip || onConnect) && (
                <div className="p-4 flex items-center gap-3 border-t border-slate-700">
                    {onSkip && (
                        <Button
                            variant="ghost"
                            onClick={handleSkip}
                            className="flex-1 h-11 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 font-semibold transition-all"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Skip
                        </Button>
                    )}
                    {onConnect && (
                        <Button
                            onClick={handleConnect}
                            className={`${onSkip ? 'flex-1' : 'w-full'} h-11 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-900/30 transition-all transform hover:scale-[1.02] active:scale-95`}
                        >
                            <ConnectIcon className="w-4 h-4 mr-2" />
                            {connectButtonText}
                        </Button>
                    )}
                </div>
            )}
              </motion.div>
            </div>

            {/* Back Face */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="w-full h-full overflow-hidden rounded-2xl bg-slate-800 border border-slate-700 shadow-xl flex flex-col p-5 sm:p-6">
                {/* User Details Heading */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-slate-100 mb-1">User Details</h3>
                  {profile.name && (
                    <p className="text-sm text-slate-400">{profile.name}</p>
                  )}
                </div>

                {/* Harmony & Context Scores - Horizontal Layout */}
                {(harmonyScore > 0 || contextScore > 0) && (
                  <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-slate-700/50">
                    {harmonyScore > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-pink-400" />
                            <span className="text-sm font-medium text-slate-300">Harmony</span>
                          </div>
                          <span className={`text-sm font-semibold ${getScoreColor(harmonyScore)}`}>
                            {harmonyScore}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${getScoreBarColor(harmonyScore)} transition-all duration-500`}
                            style={{ width: `${harmonyScore}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {contextScore > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-slate-300">Context</span>
                          </div>
                          <span className={`text-sm font-semibold ${getScoreColor(contextScore)}`}>
                            {contextScore}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${getScoreBarColor(contextScore)} transition-all duration-500`}
                            style={{ width: `${contextScore}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Dimension Scores - 2 Column Grid */}
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
                      const dimensionScore = profile.dimensionScores && typeof profile.dimensionScores === 'object' && profile.dimensionScores[dimensionKey]
                        ? (typeof profile.dimensionScores[dimensionKey] === 'number' ? profile.dimensionScores[dimensionKey] : 0)
                        : 0
                      const scorePercent = Math.round(dimensionScore * 100)
                      
                      return (
                        <div 
                          key={dimensionKey} 
                          className="p-2.5 rounded-lg border border-slate-700 bg-slate-900/30"
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
                            <span className={`text-sm font-bold flex-shrink-0 ${getScoreColor(scorePercent)}`}>
                              {scorePercent}%
                            </span>
                          </div>
                          <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-700 mt-1.5">
                            <div 
                              className={`h-full rounded-full ${getScoreBarColor(scorePercent)} transition-all duration-500`}
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
    )
}
