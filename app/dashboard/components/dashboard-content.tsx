'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useQuery, useQueries } from '@tanstack/react-query'
import { createPortal } from 'react-dom'
import {
  TrendingUp,
  Users,
  MessageCircle,
  Calendar,
  ArrowRight,
  Plus,
  Star,
  Heart,
  Bell,
  AlertCircle,
  FileText,
  Loader2,
  CheckCircle,
  UserPlus,
  Home,
  RefreshCw,
  Search,
  X,
  User,
  Building2,
  Settings,
  LayoutDashboard,
  Sparkles,
  Zap,
  GraduationCap,
  Briefcase
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DiscoveryCard } from './discovery-card'
import { DiscoveryFeedMobileCarousel } from './discovery-feed-mobile-carousel'
import { MatchRightsInfoBanner } from '@/components/privacy/match-rights-info-banner'
import { EmptyState } from '@/components/ui/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { DashboardData } from '@/types/dashboard'
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { queryKeys, queryClient } from '@/app/providers'
import { useRealtimeInvalidation } from '@/hooks/use-realtime-invalidation'
import { monitorQuery } from '@/lib/utils/query-monitor'
import {
  fetchLiveCompatibilityBatch,
  type LiveCompatibilitySnapshot,
} from '@/lib/matching/live-compatibility'
import { WellnessSurveyModal } from './wellness-survey-modal'
import { SuccessNpsWidget } from '@/app/(components)/success-nps-widget'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }
}

/** Opacity-only: no translateY  -  ancestor transforms break 3D flip / backface-visibility in WebKit. */
const fadeInOpacity = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] },
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

interface DashboardContentProps {
  hasCompletedQuestionnaire?: boolean
  hasPartialProgress?: boolean
  progressCount?: number
  profileCompletion?: number
  questionnaireProgress?: {
    completedSections: number
    totalSections: number
    isSubmitted: boolean
  }
  dashboardData: DashboardData
  user?: {
    id: string
    email: string
    email_confirmed_at?: string
    name?: string
    avatar?: string
  }
  firstName?: string
  /** Cohort for dual marketplace; used for empty-state copy (student vs professional). */
  userType?: 'student' | 'professional'
}


interface WarningNotification {
  id: string
  title: string
  message: string
  metadata?: Record<string, any>
  created_at?: string
}


function WarningBanner({ userId }: { userId?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false)
  const [isAcknowledged, setIsAcknowledged] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchUnacknowledgedWarnings = useCallback(async (): Promise<WarningNotification[]> => {
    if (!userId) return []

    const params = new URLSearchParams({
      limit: '20',
      type: 'safety_alert',
    })

    const response = await fetch(`/api/notifications/my?${params.toString()}`)
    if (!response.ok) {
      logger.warn('[WarningBanner] Failed to fetch notifications for warnings', {
        status: response.status,
        statusText: response.statusText,
      })
      return []
    }

    const data = await response.json()
    const notifications = (data.notifications || []) as WarningNotification[]

    // Only consider admin warnings that have not been acknowledged via Continue
    const unacknowledgedWarnings = notifications.filter((notif: any) => {
      const metadata = notif.metadata || {}
      const isWarning = metadata.action === 'warn'
      const hasContinued = metadata.acknowledged_continue === true
      return isWarning && !hasContinued
    })

    return unacknowledgedWarnings
  }, [userId])

  const { data: warnings = [], isLoading } = useQuery({
    queryKey: ['dashboard', 'warnings', userId],
    queryFn: fetchUnacknowledgedWarnings,
    enabled: !!userId,
    staleTime: 30_000,
  })

  useRealtimeInvalidation({
    table: 'notifications',
    event: '*',
    filter: `user_id=eq.${userId}`,
    queryKeys: ['dashboard', 'warnings', userId],
    enabled: !!userId,
  })

  const activeWarning = warnings[0]

  const handleContinue = async () => {
    if (!activeWarning || !userId) return
    if (!isAcknowledged) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/notifications/acknowledge-warning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId: activeWarning.id }),
      })

      if (!response.ok) {
        logger.error('[WarningBanner] Failed to acknowledge warning', {
          status: response.status,
          statusText: response.statusText,
        })
        return
      }

      // Refresh warnings and related activity so the banner disappears
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'warnings', userId] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.activity(userId) }),
      ])

      setIsModalOpen(false)
      setIsAcknowledged(false)
    } catch (error) {
      logger.error('[WarningBanner] Error acknowledging warning', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!userId || isLoading || !activeWarning) {
    return null
  }

  return (
    <>
      <div
        className="rounded-2xl border border-amber-400/70 bg-amber-50/90 dark:bg-amber-950/50 px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="mt-0.5">
          <AlertCircle className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            You have received a warning
          </p>
          <p className="text-xs text-amber-800/80 dark:text-amber-200/80">
            Click here to read and acknowledge this warning.
          </p>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400 font-bold">
              You have received a warning
            </DialogTitle>
            <DialogDescription>
              Please read this warning carefully and acknowledge that you understand it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/40 border border-amber-200/80 dark:border-amber-800 px-4 py-3">
              <p className="text-sm text-amber-900 dark:text-amber-50 whitespace-pre-line">
                {activeWarning.message}
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="warning-acknowledge"
                checked={isAcknowledged}
                onCheckedChange={(value) => setIsAcknowledged(Boolean(value))}
              />
              <Label
                htmlFor="warning-acknowledge"
                className="text-sm text-zinc-800 dark:text-zinc-100 leading-snug cursor-pointer"
              >
                I understand and acknowledge this warning. I will follow the{' '}
                <button
                  type="button"
                  className="underline text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsGuidelinesOpen(true)
                  }}
                >
                  community guidelines
                </button>{' '}
                moving forward.
              </Label>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={handleContinue}
              disabled={!isAcknowledged || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Continue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Community Guidelines Dialog */}
      <Dialog open={isGuidelinesOpen} onOpenChange={setIsGuidelinesOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Domu Match Community Guidelines</DialogTitle>
            <DialogDescription>
              These guidelines explain how to use Domu Match safely and appropriately, and what
              behaviors are not allowed on the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-zinc-800 dark:text-zinc-100">
            <p>
              Domu Match exists to help students and young people find safe, compatible roommates
              and shared housing. By using the platform you agree to:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use Domu Match only for housing and roommate matching, not dating or hookups.</li>
              <li>Treat others with respect, avoid harassment, bullying, and hate speech.</li>
              <li>
                Follow applicable anti-discrimination and fair housing laws when setting
                preferences.
              </li>
              <li>
                Never run scams or frauds, including fake listings or asking for money before a
                legitimate agreement is in place.
              </li>
              <li>
                Keep communication and content free from sexual content, nudity, or exploitative
                offers (such as rent in exchange for sexual favors).
              </li>
              <li>Protect your privacy and that of others; do not share or threaten to share private information.</li>
              <li>
                Be honest and accurate in your profile, listings, and communication, and disclose
                relevant information about the property and living situation.
              </li>
            </ul>
            <p>
              You should report users, listings, or messages that appear unsafe, abusive,
              discriminatory, fraudulent, or clearly outside the intended use of Domu Match. Admins
              may issue warnings, restrict features, or suspend or permanently ban accounts to
              protect the community.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              This is a summary. A more detailed version of the Domu Match Community Guidelines is
              maintained in our policy documentation and may be updated over time.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setIsGuidelinesOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


export function DashboardContent({ hasCompletedQuestionnaire = false, hasPartialProgress = false, progressCount = 0, profileCompletion = 0, questionnaireProgress, dashboardData, user, firstName = '', userType }: DashboardContentProps) {
  const router = useRouter()
  const supabase = createClient()
  const [timeGreeting, setTimeGreeting] = useState('Good evening')

  const displayFirstName =
    firstName ||
    (user?.name ? user.name.split(' ')[0] : '') ||
    'Student'

  useEffect(() => {
    const computeGreeting = () => {
      // Use the browser's local time (and therefore user access location/timezone)
      const now = new Date()
      const hour = now.getHours()

      if (hour >= 4 && hour < 12) return 'Good morning'
      if (hour >= 12 && hour < 18) return 'Good afternoon'
      return 'Good evening'
    }

    setTimeGreeting(computeGreeting())
  }, [])

  // Helper function for formatting time ago (defined early for use in callbacks)
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  // Fetch recent matches with React Query
  const fetchRecentMatches = useCallback(async () => {
    if (!user?.id) {
      logger.log('[loadRecentMatches] No user ID provided')
      return []
    }

    return monitorQuery('fetchRecentMatches', async () => {
      try {
        logger.log('[loadRecentMatches] Fetching recent match suggestions for user:', user.id)

        // Load processed suggestions from localStorage (same as matches page)
        // This ensures we filter out suggestions that have been declined/accepted/confirmed
        const STORAGE_KEY = `processed_suggestions_${user.id}`
        const processedSuggestions = new Map<string, 'declined' | 'accepted' | 'confirmed'>()
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
              const data = JSON.parse(stored) as Record<string, { status: string; timestamp: number }>
              for (const [id, value] of Object.entries(data)) {
                if (value.status === 'declined' || value.status === 'accepted' || value.status === 'confirmed') {
                  processedSuggestions.set(id, value.status as 'declined' | 'accepted' | 'confirmed')
                }
              }
            }
          } catch (error) {
            logger.warn('[loadRecentMatches] Failed to load processed suggestions from localStorage', { error })
          }
        }

        // Use the same API endpoint as the matches page to ensure consistency
        // This uses the same RPC deduplication logic
        const response = await fetch('/api/match/suggestions/my?limit=20&offset=0')
        if (!response.ok) {
          logger.error('[loadRecentMatches] Error fetching suggestions from API:', response.statusText)
          return []
        }

        const data = await response.json()
        const rawSuggestions = data.suggestions || []

        logger.log('[loadRecentMatches] Raw suggestions from API:', {
          suggestionsCount: rawSuggestions.length,
          processedSuggestionsCount: processedSuggestions.size
        })

        if (rawSuggestions.length === 0) {
          return []
        }

        // Client-side dedupe: keep only latest suggestion per otherId (same as matches page)
        const deduped = new Map<string, typeof rawSuggestions[0]>()
        for (const sug of rawSuggestions) {
          const otherId = sug.memberIds.find((id: string) => id !== user.id)
          if (!otherId) continue

          const existing = deduped.get(otherId)
          if (!existing || new Date(sug.createdAt) > new Date(existing.createdAt)) {
            deduped.set(otherId, sug)
          }
        }

        // Sync localStorage with database: Clear entries where DB status doesn't match localStorage
        const staleEntries: string[] = []
        Array.from(deduped.values()).forEach(s => {
          const cachedStatus = processedSuggestions.get(s.id)
          if (cachedStatus) {
            // If DB shows pending but localStorage says processed, localStorage is stale - clear it
            if (s.status === 'pending' && (cachedStatus === 'declined' || cachedStatus === 'accepted' || cachedStatus === 'confirmed')) {
              logger.log('[loadRecentMatches] Detected stale localStorage entry:', {
                id: s.id,
                cachedStatus,
                dbStatus: s.status
              })
              staleEntries.push(s.id)
            }
          }
        })

        // Remove stale entries from processedSuggestions
        if (staleEntries.length > 0 && typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
              const data = JSON.parse(stored) as Record<string, { status: string; timestamp: number }>
              staleEntries.forEach(id => delete data[id])
              localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
              logger.log('[loadRecentMatches] Cleared', staleEntries.length, 'stale localStorage entries')
            }
          } catch (error) {
            logger.warn('[loadRecentMatches] Failed to clear stale localStorage entries', { error })
          }
        }

        // Filter to only pending suggestions that user hasn't accepted (same filtering as matches page)
        // Also check localStorage cache to filter out processed suggestions
        const suggested = Array.from(deduped.values()).filter(s => {
          // Skip if this was a stale entry we just cleared
          if (staleEntries.includes(s.id)) {
            return true // Include it since we cleared the stale cache
          }

          // Check local cache first - if we've processed this suggestion, exclude it
          const processedStatus = processedSuggestions.get(s.id)
          if (processedStatus === 'declined' || processedStatus === 'accepted' || processedStatus === 'confirmed') {
            logger.log('[loadRecentMatches] Excluding processed suggestion:', {
              id: s.id,
              processedStatus,
              apiStatus: s.status
            })
            return false
          }

          // Must be pending status
          if (s.status !== 'pending') {
            return false
          }
          // User must not have already accepted (accepted matches go to pending tab)
          if (s.acceptedBy?.includes(user.id)) {
            return false
          }
          return true
        })

        // Get the 3 most recent unique matches (sorted by createdAt)
        const recentMatches = suggested
          .map(s => {
            const otherId = s.memberIds.find((id: string) => id !== user.id)
            return { userId: otherId, createdAt: s.createdAt, suggestion: s }
          })
          .filter(m => m.userId) // Filter out any null userIds
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3) // Take 3 most recent
          .map(m => ({ userId: m.userId, created_at: m.createdAt }))

        if (recentMatches.length === 0) {
          return []
        }

        const recentUserIds = recentMatches.map(m => m.userId)

        const extractScore = (value: unknown, defaultValue: number = 0): number => {
          if (value == null || value === '') return defaultValue
          const num = Number(value)
          return Number.isNaN(num) ? defaultValue : num
        }

        const suggestionByUserId = new Map<string, (typeof rawSuggestions)[0]>()
        for (const sug of Array.from(deduped.values())) {
          const oid = sug.memberIds?.find((id: string) => id !== user.id)
          if (oid) suggestionByUserId.set(oid, sug)
        }

        let compatibilityScores: Array<{
          userId: string
          score: number
          harmonyScore: number
          contextScore: number
          dimensionScores: { [key: string]: number } | null
        }>

        const liveByPeer = new Map<string, LiveCompatibilitySnapshot>()
        for (const otherUserId of recentUserIds) {
          const embedded = suggestionByUserId.get(otherUserId)?.liveCompatibility
          if (embedded) liveByPeer.set(otherUserId, embedded)
        }
        const missingPeerIds = recentUserIds.filter((id) => !liveByPeer.has(id))
        if (missingPeerIds.length > 0) {
          try {
            const batch = await fetchLiveCompatibilityBatch(missingPeerIds)
            batch.forEach((snapshot, peerId) => liveByPeer.set(peerId, snapshot))
          } catch (batchError) {
            logger.error('Error in batch compatibility for dashboard recent matches:', batchError)
          }
        }

        compatibilityScores = recentUserIds.map((otherUserId) => {
          const live = liveByPeer.get(otherUserId)
          const sug = suggestionByUserId.get(otherUserId)
          const fitIndex = Number(sug?.fitIndex ?? 0)
          const fallbackScore = fitIndex > 0 ? fitIndex / 100 : Number(sug?.fitScore ?? 0)
          if (live) {
            return {
              userId: otherUserId,
              score: extractScore(live.compatibility_score, fallbackScore),
              harmonyScore: extractScore(live.harmony_score, 0),
              contextScore: extractScore(live.context_score, 0),
              dimensionScores: live.dimension_scores_json,
            }
          }
          return {
            userId: otherUserId,
            score: fallbackScore,
            harmonyScore: 0,
            contextScore: 0,
            dimensionScores: null,
          }
        })

        // Create maps for easy lookup
        const scoreMap = new Map(compatibilityScores.map(m => [m.userId, m.score]))
        const harmonyScoreMap = new Map(compatibilityScores.map(m => [m.userId, m.harmonyScore]))
        const contextScoreMap = new Map(compatibilityScores.map(m => [m.userId, m.contextScore]))
        const dimensionScoresMap = new Map(compatibilityScores.map(m => [m.userId, m.dimensionScores]))

        // Maintain the order from recentMatches (most recent first) and add scores
        const recentMatchEntries = recentMatches.map(({ userId, created_at }) => ({
          userId,
          created_at,
          score: scoreMap.get(userId) || 0,
          harmonyScore: harmonyScoreMap.get(userId),
          contextScore: contextScoreMap.get(userId),
          dimensionScores: dimensionScoresMap.get(userId) || null
        }))

        const finalUserIds = recentMatchEntries.map(m => m.userId)

        // Add this check before querying profiles
        if (finalUserIds.length === 0) {
          logger.log('No user IDs to fetch profiles for')
          return []
        }

        // Fetch profiles for matched users (without relying on nested relationships).
        // Profile rows may be blocked by RLS for pending suggestions; still show cards (same as /matches).
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select(`
          user_id, 
          first_name, 
          last_name, 
          university_id
        `)
          .in('user_id', finalUserIds)

        if (profilesError) {
          logger.warn(
            'Error loading profiles for recent matches (likely RLS). Showing suggestion cards without profile details.',
            { error: profilesError }
          )
        }

        const profiles = profilesData ?? []

        // Fetch university names separately to avoid nested relation issues
        const universityMap = new Map<string, string>()
        const universityIds = Array.from(
          new Set(
            (profiles || [])
              .map((p: any) => p.university_id)
              .filter((id: string | null | undefined): id is string => !!id)
          )
        )

        if (universityIds.length > 0) {
          const { data: universities, error: universitiesError } = await supabase
            .from('universities')
            .select('id, name')
            .in('id', universityIds)

          if (universitiesError) {
            logger.warn('Error loading university data (non-critical):', universitiesError)
          } else {
            universities?.forEach((u: any) => {
              if (u.id && u.name) {
                universityMap.set(u.id, u.name)
              }
            })
          }
        }

        // Fetch program names separately from user_academic
        // Try with explicit foreign key first, fallback to simple join if that fails
        const { data: academicData, error: academicError } = await supabase
          .from('user_academic')
          .select(`
          user_id,
          program_id,
          programs(name)
        `)
          .in('user_id', finalUserIds)

        if (academicError) {
          logger.warn('Error loading academic data (non-critical):', academicError)
        }

        // Create a map of user_id to program name
        const programMap = new Map<string, string>()
        academicData?.forEach((academic: any) => {
          if (academic.programs?.name) {
            programMap.set(academic.user_id, academic.programs.name)
          }
        })

        // Create a map of user_id to match score
        const matchScoreMap = new Map(recentMatchEntries.map(m => [m.userId, m.score]))

        const isUUID = (str: string): boolean => {
          if (!str || typeof str !== 'string') return false
          if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) return true
          if (/[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}/i.test(str)) return true
          return false
        }

        const removeUUIDs = (str: string): string => {
          if (!str || typeof str !== 'string') return str
          return str.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '').trim()
        }

        const normalizeMatchScore = (rawScore: number, sug?: (typeof rawSuggestions)[0]): number => {
          let normalizedScore = rawScore
          if (normalizedScore <= 0 && sug) {
            const fitIndex = Number(sug.fitIndex ?? 0)
            normalizedScore = fitIndex > 0 ? fitIndex / 100 : Number(sug.fitScore ?? 0)
          }
          if (normalizedScore > 1.0) {
            if (normalizedScore > 100) {
              normalizedScore = 1
            } else {
              normalizedScore = normalizedScore / 100
            }
          }
          return Math.max(0, Math.min(normalizedScore, 1.0))
        }

        // Format matches maintaining the order from recentMatchEntries (most recent first)
        const formattedMatches = recentMatchEntries.map(({ userId, score, harmonyScore, contextScore, dimensionScores }) => {
          const sug = suggestionByUserId.get(userId)
          const profile = profiles.find((p: { user_id: string }) => p.user_id === userId)

          const baseMatch = {
            id: userId,
            userId,
            score: normalizeMatchScore(score, sug),
            harmonyScore: extractScore(harmonyScore, 0),
            contextScore: extractScore(contextScore, 0),
            dimensionScores: dimensionScores || null,
            avatar: undefined as undefined,
          }

          if (!profile) {
            logger.log(
              '[loadRecentMatches] Peer profile unavailable (RLS or missing row); showing suggestion card without profile fields',
              { userId }
            )
            return {
              ...baseMatch,
              name: undefined,
              program: '',
              university: '',
            }
          }

          const fullName = [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(' ') || 'User'
          const programDisplay = programMap.get(userId) || null
          const universityName = profile.university_id
            ? universityMap.get(profile.university_id) || 'University'
            : 'University'

          let safeName = removeUUIDs(fullName)
          if (isUUID(safeName) || safeName === userId || safeName.includes(userId) || !safeName) {
            safeName = 'User'
          }

          let safeUniversity = removeUUIDs(universityName)
          if (isUUID(safeUniversity) || safeUniversity === userId || safeUniversity.includes(userId) || !safeUniversity) {
            safeUniversity = 'University'
          }

          let safeProgram = removeUUIDs(programDisplay || '')
          if (isUUID(safeProgram) || safeProgram === userId || safeProgram.includes(userId) || !safeProgram) {
            safeProgram = ''
          }

          return {
            ...baseMatch,
            name: safeName,
            program: safeProgram,
            university: safeUniversity,
          }
        })

        logger.log('loadRecentMatches: Formatted', formattedMatches.length, 'recent matches from match_suggestions table')

        return formattedMatches
      } catch (error) {
        logger.error('Failed to load recent matches:', error)
        return []
      }
    })
  }, [user?.id, supabase])

  const { data: recentMatches = [], isLoading: isLoadingMatches, refetch: refetchRecentMatches } = useQuery({
    queryKey: queryKeys.matches.top(user?.id),
    queryFn: fetchRecentMatches,
    staleTime: 10_000, // 10 seconds - refresh more frequently to sync with localStorage changes
    enabled: !!user?.id,
    // Don't use initialData or placeholderData - let client-side query fetch with proper localStorage filtering
    // Server-side data doesn't have access to localStorage, so it can't filter processed suggestions
    // Start with empty array and let the query populate with correctly filtered matches
  })

  // Fetch total matches count with React Query
  const fetchTotalMatchesCount = useCallback(async (): Promise<number> => {
    if (!user?.id) {
      logger.log('loadTotalMatchesCount: No user ID')
      return 0
    }

    return monitorQuery('fetchTotalMatchesCount', async () => {
      try {
        logger.log('loadTotalMatchesCount: Fetching match suggestions for user', user.id)
        const now = new Date().toISOString()

        // Fetch active confirmed pair suggestions and count unique matched users,
        // so repeated suggestions for the same pair don't inflate totals.
        // Only show confirmed matches where both users have accepted
        const { data: suggestions, error } = await supabase
          .from('match_suggestions')
          .select('member_ids, fit_score')
          .eq('kind', 'pair')
          .contains('member_ids', [user.id])
          .eq('status', 'confirmed') // Only show confirmed matches where both users have accepted
          .gte('expires_at', now) // Only non-expired suggestions

        if (error) {
          logger.error('Error fetching match suggestions for count:', error)
        } else if (suggestions && suggestions.length > 0) {
          const matchMap = new Map<string, number>()

          suggestions.forEach((s: any) => {
            const memberIds = s.member_ids as string[]
            if (!memberIds || memberIds.length !== 2) return

            const otherUserId = memberIds[0] === user.id ? memberIds[1] : memberIds[0]
            const fitScore = Number(s.fit_score || 0)

            const currentBest = matchMap.get(otherUserId) ?? 0
            if (fitScore > currentBest) {
              matchMap.set(otherUserId, fitScore)
            }
          })

          const total = matchMap.size
          logger.log('loadTotalMatchesCount: Unique matched users from suggestions', total)
          return total
        }

        // Fallback: use legacy matches table if there are no suggestions
        logger.log('loadTotalMatchesCount: No active match_suggestions, falling back to matches table')

        const { count: matchesAsA } = await supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .eq('a_user', user.id)

        const { count: matchesAsB } = await supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .eq('b_user', user.id)

        const total = (matchesAsA || 0) + (matchesAsB || 0)
        logger.log('loadTotalMatchesCount: Total matches from legacy table', total)
        return total
      } catch (error) {
        logger.error('Failed to load total matches count:', error)
        return 0
      }
    })
  }, [user?.id, supabase])

  const { data: totalMatches = dashboardData.kpis.totalMatches } = useQuery({
    queryKey: queryKeys.matches.count(user?.id),
    queryFn: fetchTotalMatchesCount,
    staleTime: 10_000, // 10 seconds for real-time data
    enabled: !!user?.id,
    initialData: dashboardData.kpis.totalMatches,
  })

  // Fetch average compatibility with React Query
  const fetchAvgCompatibility = useCallback(async (): Promise<number> => {
    if (!user?.id) {
      logger.log('loadAvgCompatibility: No user ID')
      return 0
    }

    return monitorQuery('fetchAvgCompatibility', async () => {
      try {
        logger.log('loadAvgCompatibility: Fetching matches for user', user.id)
        // Fetch active confirmed match suggestions (matching server-side logic: limit 20, then deduplicate)
        // Only show confirmed matches where both users have accepted
        const now = new Date().toISOString()
        const { data: avgSuggestions, error } = await supabase
          .from('match_suggestions')
          .select('member_ids, fit_score, fit_index, created_at')
          .eq('kind', 'pair')
          .contains('member_ids', [user.id])
          .eq('status', 'confirmed')
          .gte('expires_at', now)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) {
          logger.error('Error fetching match suggestions for avg:', error)
        }

        const avgByPeer = new Map<string, number>()
        for (const s of avgSuggestions || []) {
          const memberIds = s.member_ids as string[]
          if (!memberIds || memberIds.length !== 2) continue
          const otherUserId = memberIds[0] === user.id ? memberIds[1] : memberIds[0]
          if (!avgByPeer.has(otherUserId)) {
            const fitIndex = Number(s.fit_index ?? Math.round(Number(s.fit_score || 0) * 100))
            avgByPeer.set(otherUserId, fitIndex > 0 ? fitIndex / 100 : Number(s.fit_score || 0))
          }
        }

        const allScores = Array.from(avgByPeer.values())
          .map(score => Math.min(score, 1.0)) // Cap each score at 1.0 (100%)
          .filter(score => score > 0) // Only include valid scores

        logger.log('loadAvgCompatibility: Found', allScores.length, 'matches', 'scores:', allScores)

        if (allScores.length > 0) {
          const average = Math.min(
            Math.round(
              (allScores.reduce((sum, score) => sum + score, 0) / allScores.length) * 100
            ),
            100 // Cap the final result at 100%
          )
          logger.log('loadAvgCompatibility: Average calculated as', average)
          return average
        } else {
          logger.log('loadAvgCompatibility: No matches found, setting to 0')
          return 0
        }
      } catch (error) {
        logger.error('Failed to load average compatibility:', error)
        return 0
      }
    })
  }, [user?.id, supabase])

  const { data: avgCompatibility = dashboardData.kpis.avgCompatibility } = useQuery({
    queryKey: queryKeys.matches.compatibility(user?.id),
    queryFn: fetchAvgCompatibility,
    staleTime: 5 * 60 * 1000, // 5 minutes - compatibility scores don't change frequently
    enabled: !!user?.id,
    initialData: dashboardData.kpis.avgCompatibility,
    refetchOnMount: false, // Don't refetch immediately on mount since we have initialData
    refetchOnWindowFocus: false, // Don't refetch on window focus to prevent visual jumps
  })

  // Fetch recent activity with React Query
  const fetchRecentActivity = useCallback(async (): Promise<any[]> => {
    if (!user?.id) return []

    return monitorQuery('fetchRecentActivity', async () => {
      try {

        // Fetch notifications
        const response = await fetch('/api/notifications/my?limit=10')
        const notificationsData = response.ok ? await response.json() : { notifications: [] }
        const notifications = notificationsData.notifications || []

        // Fetch recent chat messages
        const { data: chatMembers } = await supabase
          .from('chat_members')
          .select('chat_id')
          .eq('user_id', user.id)

        let chatMessages: any[] = []
        if (chatMembers && chatMembers.length > 0) {
          const chatIds = chatMembers.map(cm => cm.chat_id)

          // Get last_read_at for each chat
          const { data: memberships } = await supabase
            .from('chat_members')
            .select('chat_id, last_read_at')
            .eq('user_id', user.id)
            .in('chat_id', chatIds)

          if (memberships) {
            // Get recent messages from user's chats
            // Note: Fetch messages first, then get profile names separately to avoid foreign key issues
            const { data: messages } = await supabase
              .from('messages')
              .select(`
              id,
              content,
              user_id,
              chat_id,
              created_at
            `)
              .in('chat_id', chatIds)
              .neq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(10)

            if (messages) {
              // Get profile names for messages
              const userIds = new Set(messages.map(m => m.user_id))
              const { data: profiles } = await supabase
                .from('profiles')
                .select('user_id, first_name')
                .in('user_id', Array.from(userIds))

              const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || [])

              chatMessages = messages.map((msg: any) => {
                const profile = profilesMap.get(msg.user_id)
                const senderName = profile?.first_name || 'User'
                const timeAgo = formatTimeAgo(msg.created_at)
                return {
                  id: `message-${msg.id}`,
                  type: 'chat_message',
                  title: `${senderName} has sent you a message`,
                  message: '', // Don't show content
                  timeAgo,
                  isRead: false, // We'll check this based on last_read_at
                  metadata: { chat_id: msg.chat_id, message_id: msg.id }
                }
              })
            }
          }
        }

        // Combine notifications and chat messages, sort by time
        // For match_created and match_accepted notifications, verify both users accepted before showing names
        const processedNotifications = await Promise.all(notifications.map(async (notif: any) => {
          const timeAgo = formatTimeAgo(notif.created_at)

          // Safety check: For match_created and match_accepted notifications, verify both users accepted
          if (notif.type === 'match_created' || notif.type === 'match_accepted') {
            let bothUsersAccepted = false

            // First, check if message contains a name that needs sanitization
            let hasName = false
            let genericMessage = ''

            if (notif.type === 'match_created' && notif.message && notif.message.includes('match with')) {
              // Check if message contains a name - if it has text between "with" and "!" that's not generic, it's a name
              const matchWithPattern = /match with ([^!]+)!/i
              const match = notif.message.match(matchWithPattern)
              if (match) {
                const namePart = match[1].toLowerCase().trim()
                hasName = !namePart.includes('someone') &&
                  !namePart.includes('a potential roommate') &&
                  !namePart.includes('user') &&
                  namePart.length > 0
              }
              genericMessage = 'You have matched with someone! Check out your matches to see who.'
            } else if (notif.type === 'match_accepted' && notif.message && notif.message.includes('accepted your match request')) {
              // Check if message contains a name (not just "Someone")
              hasName = !notif.message.includes('Someone') &&
                !notif.message.includes('someone') &&
                !notif.message.includes('Someone accepted your match request')
              genericMessage = 'Someone accepted your match request!'
            }

            // Only verify if we detected a name (optimization)
            if (hasName && notif.metadata?.match_id) {
              try {
                // First try match_suggestions table (new system)
                const { data: suggestion } = await supabase
                  .from('match_suggestions')
                  .select('status, accepted_by, member_ids')
                  .eq('id', notif.metadata.match_id)
                  .single()

                if (suggestion) {
                  const acceptedBy = suggestion.accepted_by || []
                  const memberIds = suggestion.member_ids || []
                  bothUsersAccepted = suggestion.status === 'confirmed' ||
                    (memberIds.length === 2 && memberIds.every((id: string) => acceptedBy.includes(id)))
                } else {
                  // If not found in match_suggestions, try old matches table
                  const { data: match } = await supabase
                    .from('matches')
                    .select('status, a_user, b_user')
                    .eq('id', notif.metadata.match_id)
                    .single()

                  if (match) {
                    // In old matches table, status 'confirmed' means both accepted
                    bothUsersAccepted = match.status === 'confirmed'
                  }
                }
              } catch (error: any) {
                // If we can't verify, assume not both accepted (safer for privacy)
                logger.warn('Failed to verify match acceptance status, assuming not both accepted', error)
                bothUsersAccepted = false
              }
            }

            // If name detected AND (both users haven't accepted OR we couldn't verify), sanitize
            if (hasName && !bothUsersAccepted) {
              notif.message = genericMessage
            }
          }

          return {
            id: notif.id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            timeAgo,
            isRead: notif.is_read,
            metadata: notif.metadata || {}
          }
        }))

        const allActivity = [...processedNotifications, ...chatMessages]

        // Sort by created_at (newest first) - approximate sort by timeAgo
        allActivity.sort((a, b) => {
          // Simple sort - items with "Just now" come first, then minutes, hours, days
          if (a.timeAgo === 'Just now') return -1
          if (b.timeAgo === 'Just now') return 1
          return 0
        })

        return allActivity.slice(0, 10)
      } catch (error) {
        logger.error('Failed to load activity:', error)
        return []
      }
    })
  }, [user?.id, supabase])

  const { data: recentActivity = [], isLoading: isLoadingActivity, refetch: refetchRecentActivity } = useQuery({
    queryKey: queryKeys.activity(user?.id),
    queryFn: fetchRecentActivity,
    staleTime: 10_000, // 10 seconds for real-time data
    enabled: !!user?.id,
  })


  // Set up real-time invalidation for notifications
  useRealtimeInvalidation({
    table: 'notifications',
    event: '*',
    filter: `user_id=eq.${user?.id}`,
    queryKeys: queryKeys.activity(user?.id),
    enabled: !!user?.id,
  })

  // Set up real-time invalidation for messages
  useRealtimeInvalidation({
    table: 'messages',
    event: 'INSERT',
    queryKeys: queryKeys.activity(user?.id),
    enabled: !!user?.id,
  })

  // Set up real-time invalidation for match_suggestions (multiple query keys)
  useRealtimeInvalidation({
    table: 'match_suggestions',
    event: '*',
    queryKeys: queryKeys.matches.top(user?.id),
    enabled: !!user?.id,
  })

  useRealtimeInvalidation({
    table: 'match_suggestions',
    event: '*',
    queryKeys: queryKeys.matches.count(user?.id),
    enabled: !!user?.id,
  })

  useRealtimeInvalidation({
    table: 'match_suggestions',
    event: '*',
    queryKeys: queryKeys.matches.compatibility(user?.id),
    enabled: !!user?.id,
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'match_created':
      case 'match_accepted':
      case 'match_confirmed':
        return <Heart className="w-4 h-4" />
      case 'chat_message':
      case 'chat_message_reaction':
        return <MessageCircle className="w-4 h-4" />
      case 'profile_updated':
      case 'questionnaire_completed':
        return <CheckCircle className="w-4 h-4" />
      case 'housing_update':
        return <Home className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'match_created':
      case 'match_accepted':
      case 'match_confirmed':
        return 'bg-semantic-success/20 text-semantic-success'
      case 'chat_message':
      case 'chat_message_reaction':
        return 'bg-semantic-accent-soft text-semantic-accent'
      case 'profile_updated':
      case 'questionnaire_completed':
        return 'bg-semantic-accent-soft text-semantic-accent'
      case 'housing_update':
        return 'bg-semantic-warning/20 text-semantic-warning'
      default:
        return 'bg-bg-surface-alt text-text-secondary'
    }
  }

  const handleActivityClick = (activity: any) => {
    const { metadata, type } = activity

    switch (type) {
      case 'match_created':
      case 'match_accepted':
      case 'match_confirmed':
        if (metadata.chat_id) {
          router.push(`/chat/${metadata.chat_id}`)
        } else {
          router.push('/matches')
        }
        break
      case 'chat_message':
      case 'chat_message_reaction':
        if (metadata.chat_id) {
          const mid = typeof metadata.message_id === 'string' ? metadata.message_id : ''
          router.push(mid ? `/chat?chatId=${metadata.chat_id}&messageId=${encodeURIComponent(mid)}` : `/chat?chatId=${metadata.chat_id}`)
        }
        break
      case 'profile_updated':
        router.push('/settings')
        break
      case 'questionnaire_completed':
        router.push('/matches')
        break
      case 'housing_update':
        router.push('/housing')
        break
      default:
        router.push('/notifications')
    }
  }

  const handleBrowseMatches = () => {
    router.push('/matches')
  }

  const handleStartChat = () => {
    router.push('/chat')
  }


  const handleUpdateProfile = () => {
    router.push('/settings')
  }

  const handleViewAllActivity = () => {
    router.push('/matches')
  }

  const handleChatWithMatch = (userId: string) => {
    // Navigate to chat with this user
    router.push(`/chat?user=${userId}`)
  }

  return (
    <div className="space-y-8 pb-24 md:pb-6">
      {/* Wellness Check survey (14-day / 30-day) */}
      <WellnessSurveyModal />
      {/* Platform Success & NPS micro-survey widget (floating, non-blocking) */}
      <SuccessNpsWidget />
      {/* Admin Warning Banner */}
      <WarningBanner userId={user?.id} />

      {/* Header Section */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-2 text-indigo-400 mb-1">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-wider">Discovery Feed</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          {timeGreeting} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400">{displayFirstName}</span>
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-lg text-lg font-medium">
          Here are your suggested matches. Complete your profile to discover more potential roommates.
        </p>
      </motion.div>

      <MatchRightsInfoBanner />

      {/* Discovery Feed — mobile: horizontal carousel (up to 3 matches + view-all CTA) */}
      {recentMatches.length > 0 && (
        <motion.div
          variants={fadeInOpacity}
          initial="initial"
          animate="animate"
          className="md:hidden"
        >
          <DiscoveryFeedMobileCarousel matches={recentMatches} />
        </motion.div>
      )}

      {/* Discovery Feed — tablet/desktop grid */}
      <motion.div
        variants={staggerChildren}
        initial="initial"
        animate="animate"
        className={cn(
          'gap-6 md:auto-rows-fr',
          recentMatches.length > 0
            ? 'hidden md:grid md:grid-cols-2 lg:grid-cols-3'
            : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-md:auto-rows-auto',
        )}
      >
        {recentMatches.length > 0 &&
          recentMatches.map((match: any) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('[Dashboard] Rendering match card:', {
                matchId: match.id,
                userId: match.userId,
                name: match.name,
                harmonyScore: match.harmonyScore,
                contextScore: match.contextScore,
                dimensionScores: match.dimensionScores,
                dimensionScoresType: typeof match.dimensionScores,
                dimensionScoresKeys: match.dimensionScores ? Object.keys(match.dimensionScores) : null,
                allMatchKeys: Object.keys(match),
              })
            }
            return (
              <motion.div key={match.id} variants={fadeInOpacity} className="md:h-full">
                <DiscoveryCard
                  profile={{
                    id: match.userId || match.id,
                    name: match.name,
                    matchPercentage:
                      Math.round((match.score || 0) * 100) > 100
                        ? Math.round(match.score || 0)
                        : Math.round((match.score || 0) * 100),
                    harmonyScore: match.harmonyScore,
                    contextScore: match.contextScore,
                    dimensionScores: match.dimensionScores || null,
                  }}
                />
              </motion.div>
            )
          })}

        {/* Empty State Card - Glassmorphic, user_type-aware (Phase 3) */}
        {recentMatches.length === 0 && (
          <motion.div
            variants={fadeInUp}
            className="h-full"
          >
            <Card className="h-full bg-background/40 dark:bg-white/5 backdrop-blur-lg border border-border/50 shadow-xl overflow-hidden">
              <CardContent className="flex flex-col items-center justify-center p-8 group">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                  className="w-20 h-20 rounded-2xl bg-white/10 dark:bg-black/40 backdrop-blur-md flex items-center justify-center mb-6 border border-white/10"
                >
                  {userType === 'student' ? (
                    <GraduationCap className="w-10 h-10 text-violet-400 dark:text-violet-300" />
                  ) : userType === 'professional' ? (
                    <Briefcase className="w-10 h-10 text-amber-400 dark:text-amber-300" />
                  ) : (
                    <TrendingUp className="w-10 h-10 text-violet-400 dark:text-violet-300" />
                  )}
                </motion.div>
                <div className="text-center max-w-[300px] space-y-3">
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {userType === 'student'
                      ? "You've seen all the students in your area!"
                      : userType === 'professional'
                        ? "You're caught up!"
                        : 'No suggested matches yet'}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                    {userType === 'student'
                      ? "We're constantly verifying new students. Check back tomorrow for fresh campus matches."
                      : userType === 'professional'
                        ? "You've reviewed all the young professionals currently looking for housing. We'll notify you when new professionals join."
                        : 'New suggestions will appear here as they become available.'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="mt-8 bg-white/10 dark:bg-black/40 backdrop-blur-md border border-border/50 hover:bg-white/20 dark:hover:bg-black/60 text-zinc-900 dark:text-zinc-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push('/settings')
                  }}
                >
                  Review My Dealbreakers
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Call to Action - Find More (desktop only; mobile uses carousel CTA → /matches) */}
        {recentMatches.length > 0 && recentMatches.length < 3 && (
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="group relative hidden md:flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-800 border border-slate-700 shadow-xl transition-all duration-300 hover:border-violet-500/50 cursor-pointer h-full"
            onClick={() => router.push('/settings')}
          >
            <div className="w-20 h-20 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <Zap className="w-10 h-10 text-violet-400" />
            </div>
            <div className="text-center max-w-[280px]">
              <h3 className="text-2xl font-bold text-white mb-3">Find More</h3>
              <p className="text-slate-400 text-sm">Refine your preferences to see more people.</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Recent Activity Section */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="pt-12 mt-4"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-400">Recent Activity</span>
          </div>
          <Button
            variant="ghost"
            className="text-zinc-500 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 text-xs font-bold uppercase tracking-widest transition-colors h-auto p-0"
            onClick={() => router.push('/notifications')}
          >
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentActivity?.slice(0, 4).map((activity: any) => (
            <motion.div
              key={activity.id}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => handleActivityClick(activity)}
              className="flex items-start gap-4 p-5 rounded-3xl bg-white/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/10 backdrop-blur-xl cursor-pointer group transition-all"
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110",
                getActivityColor(activity.type).includes('text-white') ? getActivityColor(activity.type) : `${getActivityColor(activity.type)} bg-opacity-10`
              )}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-zinc-900 dark:text-zinc-100 text-sm font-bold leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {activity.title || activity.message || 'New activity'}
                </p>
                <p className="text-zinc-500 text-[10px] mt-2 font-bold uppercase tracking-wider">{activity.timeAgo}</p>
              </div>
            </motion.div>
          ))}
          {(!recentActivity || recentActivity.length === 0) && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white/10 dark:bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
              <Bell className="w-10 h-10 mb-4 text-zinc-300 dark:text-zinc-700 animate-pulse" />
              <p className="text-sm text-zinc-500 font-medium">No recent activity to show yet.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
