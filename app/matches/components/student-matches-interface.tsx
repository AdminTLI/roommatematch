'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { showErrorToast } from '@/lib/toast'
import { EmptyMatchesState } from './empty-matches-state'
import { Button } from '@/components/ui/button'
import { Clock, Sparkles, MessageCircle, LucideIcon } from 'lucide-react'
import { DiscoveryCard } from '@/app/dashboard/components/discovery-card'
import { motion } from 'framer-motion'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import type { MatchSuggestion } from '@/lib/matching/types'
import { queryKeys, queryClient } from '@/app/providers'

interface StudentMatchesInterfaceProps {
  user: {
    id: string
    email: string
    name: string
    firstName?: string
    avatar?: string
  }
}

type TabType = 'suggested' | 'pending' | 'confirmed' | 'history'

interface MatchWithStatus extends MatchSuggestion {
  otherUserId?: string
  otherUserName?: string
  waitingForResponse?: boolean
}

// Wrapper component to fetch compatibility data and render DiscoveryCard
function DiscoveryCardWrapper({ 
  suggestion, 
  otherUserId, 
  currentUserId,
  onSkip,
  onConnect,
  connectButtonText,
  connectButtonIcon
}: { 
  suggestion: MatchWithStatus
  otherUserId: string
  currentUserId: string
  onSkip: () => void
  onConnect: () => void
  connectButtonText?: string
  connectButtonIcon?: LucideIcon
}) {
  const [compatibilityData, setCompatibilityData] = useState<{
    compatibility_score?: number
    harmony_score?: number | null
    context_score?: number | null
    dimension_scores_json?: { [key: string]: number } | null
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCompatibility = async () => {
      if (!otherUserId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch(`/api/chat/compatibility?otherUserId=${otherUserId}`)
        if (response.ok) {
          const data = await response.json()
          setCompatibilityData(data)
        }
      } catch (error) {
        console.error('Error fetching compatibility data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompatibility()
  }, [otherUserId])

  // Generate compatibility highlights from suggestion data
  const generateHighlights = (): string[] => {
    const highlights: string[] = []
    
    // Use reasons from suggestion if available
    if (suggestion.reasons && suggestion.reasons.length > 0) {
      highlights.push(...suggestion.reasons.slice(0, 3))
    }
    
    // Add harmony/context based highlights if scores are high
    if (compatibilityData?.harmony_score && compatibilityData.harmony_score >= 0.7) {
      highlights.push('Excellent day-to-day living compatibility')
    }
    
    if (compatibilityData?.context_score && compatibilityData.context_score >= 0.7) {
      highlights.push('Similar academic background and goals')
    }
    
    // Ensure we have at least 3 highlights
    while (highlights.length < 3) {
      if (highlights.length === 0) highlights.push('Similar lifestyle preferences')
      else if (highlights.length === 1) highlights.push('Compatible schedules')
      else highlights.push('Shared interests')
    }
    
    return highlights.slice(0, 3)
  }

  const matchScore = compatibilityData?.compatibility_score 
    ? Math.round(compatibilityData.compatibility_score * 100)
    : suggestion.fitIndex || 0

  const harmonyScore = compatibilityData?.harmony_score ?? 0
  const contextScore = compatibilityData?.context_score ?? 0

  if (isLoading) {
    return (
      <div className="h-96 bg-slate-800 rounded-2xl border border-slate-700 animate-pulse" />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <DiscoveryCard
        profile={{
          id: otherUserId,
          matchPercentage: matchScore,
          harmonyScore: harmonyScore,
          contextScore: contextScore,
          compatibilityHighlights: generateHighlights(),
          dimensionScores: compatibilityData?.dimension_scores_json || null
        }}
        onSkip={onSkip}
        onConnect={onConnect}
        connectButtonText={connectButtonText}
        connectButtonIcon={connectButtonIcon}
      />
    </motion.div>
  )
}

export function StudentMatchesInterface({ user }: StudentMatchesInterfaceProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('suggested')
  const [suggestions, setSuggestions] = useState<MatchWithStatus[]>([])
  const [pendingSuggestions, setPendingSuggestions] = useState<MatchWithStatus[]>([])
  const [confirmedMatches, setConfirmedMatches] = useState<MatchWithStatus[]>([])
  const [historyMatches, setHistoryMatches] = useState<MatchWithStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set())
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [pagination, setPagination] = useState<{ limit: number; offset: number; total: number; has_more: boolean } | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Track locally processed suggestions to filter them out even if API returns stale data
  // Use localStorage to persist across page navigations
  const STORAGE_KEY = `processed_suggestions_${user.id}`

  // Load processed suggestions from localStorage on mount
  const [processedSuggestions, setProcessedSuggestions] = useState<Map<string, 'declined' | 'accepted' | 'confirmed'>>(() => {
    if (typeof window === 'undefined') return new Map()
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored) as Record<string, { status: string; timestamp: number }>
        // Only keep entries from last 24 hours to prevent localStorage bloat
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
        const filtered = new Map<string, 'declined' | 'accepted' | 'confirmed'>()
        for (const [id, { status, timestamp }] of Object.entries(data)) {
          if (timestamp > oneDayAgo) {
            filtered.set(id, status as 'declined' | 'accepted' | 'confirmed')
          }
        }
        return filtered
      }
    } catch (error) {
      console.error('[Matches] Failed to load processed suggestions from localStorage:', error)
    }
    return new Map()
  })

  // Persist processed suggestions to localStorage whenever it changes
  // Use a ref to track previous state and only update when there's an actual change
  const prevProcessedRef = useRef<string>('')
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      // Load existing data to preserve timestamps for entries that haven't changed
      const existingData: Record<string, { status: string; timestamp: number }> = {}
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          Object.assign(existingData, parsed)
        }
      } catch {
        // Ignore parse errors
      }

      // Update or add entries for current processed suggestions
      const data: Record<string, { status: string; timestamp: number }> = {}
      for (const [id, status] of Array.from(processedSuggestions.entries())) {
        // Preserve existing timestamp if status hasn't changed, otherwise use current time
        const existing = existingData[id]
        if (existing && existing.status === status) {
          data[id] = existing
        } else {
          data[id] = { status, timestamp: Date.now() }
        }
      }

      // Only update localStorage if data actually changed
      const dataString = JSON.stringify(data)
      if (dataString !== prevProcessedRef.current) {
        localStorage.setItem(STORAGE_KEY, dataString)
        prevProcessedRef.current = dataString
      }
    } catch (error) {
      console.error('[Matches] Failed to save processed suggestions to localStorage:', error)
    }
  }, [processedSuggestions, STORAGE_KEY])

  // Fetch suggestions
  const fetchSuggestions = async (includeExpired = false, loadMore = false) => {
    try {
      if (loadMore) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
      }

      const limit = 20
      const offset = loadMore && pagination ? pagination.offset + pagination.limit : 0
      const url = includeExpired
        ? `/api/match/suggestions/my?includeExpired=true&limit=${limit}&offset=${offset}`
        : `/api/match/suggestions/my?limit=${limit}&offset=${offset}`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        const rawSuggestions = data.suggestions || []
        const paginationData = data.pagination || { limit, offset, total: rawSuggestions.length, has_more: false }

        setPagination(paginationData)

        // Client-side dedupe guard: keep only latest suggestion per otherId
        const deduped = new Map<string, MatchSuggestion>()
        for (const sug of rawSuggestions) {
          const otherId = sug.memberIds.find((id: string) => id !== user.id)
          if (!otherId) continue

          const existing = deduped.get(otherId)
          if (!existing || new Date(sug.createdAt) > new Date(existing.createdAt)) {
            deduped.set(otherId, sug)
          }
        }

        const allSuggestions = Array.from(deduped.values())

        // Sync localStorage with database: Clear entries where DB status doesn't match localStorage
        // This fixes the issue where matches are pending in DB but marked as processed in localStorage
        const staleEntries: string[] = []
        allSuggestions.forEach(s => {
          const cachedStatus = processedSuggestions.get(s.id)
          if (cachedStatus) {
            // If DB shows pending but localStorage says processed, localStorage is stale
            if (s.status === 'pending' && (cachedStatus === 'declined' || cachedStatus === 'accepted' || cachedStatus === 'confirmed')) {
              console.log('[Filter] Detected stale localStorage entry - DB is pending but localStorage says processed:', {
                id: s.id,
                cachedStatus,
                dbStatus: s.status
              })
              staleEntries.push(s.id)
            }
            // If DB shows confirmed but localStorage says declined/accepted, clear it (confirmed is the truth)
            if (s.status === 'confirmed' && (cachedStatus === 'declined' || cachedStatus === 'accepted')) {
              console.log('[Filter] Detected stale localStorage entry - DB is confirmed but localStorage says otherwise:', {
                id: s.id,
                cachedStatus,
                dbStatus: s.status
              })
              staleEntries.push(s.id)
            }
          }
        })

        // Remove stale entries from processedSuggestions
        if (staleEntries.length > 0) {
          setProcessedSuggestions(prev => {
            const next = new Map(prev)
            staleEntries.forEach(id => next.delete(id))
            console.log('[Filter] Cleared', staleEntries.length, 'stale localStorage entries')
            return next
          })
        }

        // Categorize suggestions
        // Defensive filtering: explicitly exclude declined and confirmed matches from suggested tab
        // Also exclude accepted matches (they should be in pending tab, not suggested)
        // Also check local processedSuggestions cache to filter out matches that were declined/accepted
        // even if API returns stale data
        const suggested = allSuggestions.filter(s => {
          // Skip if this was a stale entry we just cleared
          if (staleEntries.includes(s.id)) {
            return true // Include it since we cleared the stale cache
          }

          // Check local cache first - if we've processed this suggestion, exclude it from suggested
          const processedStatus = processedSuggestions.get(s.id)
          if (processedStatus === 'declined' || processedStatus === 'accepted' || processedStatus === 'confirmed') {
            console.log('[Filter] Excluding from suggested - locally processed:', {
              id: s.id,
              processedStatus,
              apiStatus: s.status
            })
            return false
          }

          // Must be pending status (this excludes declined, accepted, and confirmed)
          if (s.status !== 'pending') {
            console.log('[Filter] Excluding from suggested - wrong status:', {
              id: s.id,
              status: s.status,
              acceptedBy: s.acceptedBy
            })
            return false
          }
          // User must not have already accepted (accepted matches go to pending tab)
          if (s.acceptedBy?.includes(user.id)) {
            console.log('[Filter] Excluding from suggested - user already accepted:', {
              id: s.id,
              status: s.status,
              acceptedBy: s.acceptedBy
            })
            return false
          }
          return true
        })
        const pending = allSuggestions.filter(s => s.status === 'accepted' && s.acceptedBy?.includes(user.id) && s.acceptedBy.length < s.memberIds.length)
        // Confirmed: Must have all members accepted (current user must be in acceptedBy AND all members must have accepted)
        // Include matches with status 'confirmed' OR status 'accepted' where all members have accepted
        // (fallback for cases where status wasn't updated to 'confirmed' yet)
        const confirmed = allSuggestions.filter(s => {
          const allAccepted = s.acceptedBy?.includes(user.id) && 
                             s.acceptedBy && 
                             s.memberIds && 
                             s.acceptedBy.length === s.memberIds.length
          if (!allAccepted) return false
          // Include if status is 'confirmed' or if status is 'accepted' with all members accepted
          return s.status === 'confirmed' || (s.status === 'accepted' && allAccepted)
        })

        // History: Show all matches that are not currently active (declined, confirmed)
        // Matches don't expire - only declined and confirmed matches go to history
        // Sort chronologically (newest first)
        const history = allSuggestions
          .filter(s => {
            // Include declined matches
            if (s.status === 'declined') return true
            // Include confirmed matches (they're in history once confirmed)
            // Must verify current user is in acceptedBy to avoid showing matches where user hasn't accepted
            if (s.status === 'confirmed' && s.acceptedBy?.includes(user.id) && s.acceptedBy.length === s.memberIds.length) return true
            return false
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        if (loadMore) {
          // Append new suggestions to existing ones
          setSuggestions(prev => {
            const combined = [...prev, ...suggested]
            // Re-dedupe in case of overlaps
            const deduped = new Map<string, MatchWithStatus>()
            for (const sug of combined) {
              const otherId = sug.memberIds.find((id: string) => id !== user.id)
              if (!otherId) continue
              // Additional defensive check: never include declined/accepted/confirmed in suggested
              // Also check local cache
              const processedStatus = processedSuggestions.get(sug.id)
              if (processedStatus === 'declined' || processedStatus === 'accepted' || processedStatus === 'confirmed') {
                console.log('[Filter] Skipping locally processed match in loadMore:', {
                  id: sug.id,
                  processedStatus,
                  apiStatus: sug.status
                })
                continue
              }
              if (sug.status !== 'pending' || sug.acceptedBy?.includes(user.id)) {
                console.log('[Filter] Skipping non-pending match in loadMore:', {
                  id: sug.id,
                  status: sug.status,
                  acceptedBy: sug.acceptedBy
                })
                continue
              }
              const existing = deduped.get(otherId)
              if (!existing || new Date(sug.createdAt) > new Date(existing.createdAt)) {
                deduped.set(otherId, sug)
              }
            }
            return Array.from(deduped.values())
          })
          setPendingSuggestions(prev => {
            const combined = [...prev, ...pending]
            const deduped = new Map<string, MatchWithStatus>()
            for (const sug of combined) {
              const otherId = sug.memberIds.find((id: string) => id !== user.id)
              if (!otherId) continue
              const existing = deduped.get(otherId)
              if (!existing || new Date(sug.createdAt) > new Date(existing.createdAt)) {
                deduped.set(otherId, sug)
              }
            }
            return Array.from(deduped.values())
          })
        } else {
          // Replace all suggestions with additional defensive filtering
          // Ensure no declined/accepted/confirmed matches slip through
          const finalSuggested = suggested.filter(s => {
            // Skip if this was a stale entry we just cleared
            if (staleEntries.includes(s.id)) {
              return true // Include it since we cleared the stale cache
            }

            // Check local cache
            const processedStatus = processedSuggestions.get(s.id)
            if (processedStatus === 'declined' || processedStatus === 'accepted' || processedStatus === 'confirmed') {
              console.warn('[Filter] Removed locally processed match from suggested tab:', {
                id: s.id,
                processedStatus,
                apiStatus: s.status
              })
              return false
            }
            const isValid = s.status === 'pending' && !s.acceptedBy?.includes(user.id)
            if (!isValid) {
              console.warn('[Filter] Removed invalid match from suggested tab:', {
                id: s.id,
                status: s.status,
                acceptedBy: s.acceptedBy
              })
            }
            return isValid
          })

          setSuggestions(finalSuggested)
          setPendingSuggestions(pending)
          setConfirmedMatches(confirmed)
          setHistoryMatches(history)

          // Clean up processedSuggestions cache - remove entries that match API status
          // This ensures we don't permanently hide matches that should be visible
          setProcessedSuggestions(prev => {
            const next = new Map(prev)
            let removedCount = 0
            for (const sug of allSuggestions) {
              const cachedStatus = next.get(sug.id)
              // If API status matches cached status, we can remove from cache (API has caught up)
              if (cachedStatus === 'declined' && sug.status === 'declined') {
                next.delete(sug.id)
                removedCount++
              } else if (cachedStatus === 'accepted' && sug.status === 'accepted') {
                next.delete(sug.id)
                removedCount++
              } else if (cachedStatus === 'confirmed' && sug.status === 'confirmed') {
                next.delete(sug.id)
                removedCount++
              }
            }
            if (removedCount > 0) {
              console.log('[Filter] Cleaned up processedSuggestions cache:', {
                removedCount,
                remainingCacheSize: next.size
              })
            }
            return next
          })

          console.log('[Filter] Final counts:', {
            suggested: finalSuggested.length,
            pending: pending.length,
            confirmed: confirmed.length,
            history: history.length,
            total: allSuggestions.length
          })
        }
      } else {
        console.error('Failed to fetch suggestions')
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  // React Query mutation for responding to match suggestions with optimistic updates
  const respondMutation = useMutation({
    mutationFn: async ({ suggestionId, action }: { suggestionId: string; action: 'accept' | 'decline' }) => {
      const response = await fetchWithCSRF('/api/match/suggestions/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          suggestionId,
          action,
        }),
      })

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch (parseError) {
          // If we can't parse the error response, create a basic error
          const statusText = response.statusText || 'Unknown error'
          errorData = {
            error: `Failed to ${action} suggestion (${response.status}: ${statusText})`,
            details: `Server returned status ${response.status}`
          }
        }

        console.error('[Match Respond] API error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url: response.url
        })

        // Build a more informative error message
        const errorMessage = errorData.error || `Failed to ${action} suggestion`
        const errorDetails = errorData.details ? ` - ${errorData.details}` : ''
        const retryAfter = errorData.retryAfter ? ` Please try again in ${Math.ceil(errorData.retryAfter / 60)} minutes.` : ''

        throw new Error(`${errorMessage}${errorDetails}${retryAfter}`)
      }

      const result = await response.json()
      console.log('[Match Respond] Success:', { suggestionId, action, result })
      return { suggestionId, action, result }
    },
    onMutate: async ({ suggestionId, action }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.matches.all(user.id) })

      // Track this suggestion as processed locally
      const processedStatus = action === 'decline' ? 'declined' : action === 'accept' ? 'accepted' : 'confirmed'
      setProcessedSuggestions(prev => {
        const next = new Map(prev)
        next.set(suggestionId, processedStatus)
        return next
      })

      // Optimistically update UI - remove from all lists immediately
      setSuggestions(prev => {
        const filtered = prev.filter(s => s.id !== suggestionId)
        console.log('[Match Respond] Optimistic update - removed from suggestions:', {
          suggestionId,
          beforeCount: prev.length,
          afterCount: filtered.length
        })
        return filtered
      })
      setPendingSuggestions(prev => prev.filter(s => s.id !== suggestionId))
      setConfirmedMatches(prev => prev.filter(s => s.id !== suggestionId))
      // For declined/accepted matches, we'll add them to appropriate tabs after the API confirms

      // Return context for rollback
      return { suggestionId, action }
    },
    onSuccess: ({ suggestionId, action }) => {
      console.log('[Match Respond] onSuccess:', { suggestionId, action, activeTab })

      // Don't immediately refetch - the optimistic update already removed it from UI
      // Only refetch if we're on a tab that needs to show the updated match (history/confirmed)
      // This reduces API calls and prevents rate limiting issues
      if (activeTab === 'history' || activeTab === 'confirmed' || activeTab === 'pending') {
        // Invalidate matches queries but don't refetch immediately
        queryClient.invalidateQueries({ queryKey: queryKeys.matches.all(user.id) })

        // Wait longer before refetching to ensure database update has propagated
        // For declined/accepted matches, we need to ensure they're properly filtered out
        const delay = action === 'decline' ? 2000 : 1500

        setTimeout(() => {
          console.log('[Match Respond] Refetching after delay:', { suggestionId, action, activeTab })
          // Only refetch if still on a tab that needs the data
          if (activeTab === 'history' || activeTab === 'confirmed' || activeTab === 'pending') {
            fetchSuggestions(activeTab === 'history' || activeTab === 'confirmed')
          }
        }, delay)
      } else {
        // For suggested tab, we don't need to refetch - the match is already removed optimistically
        // and the localStorage cache will prevent it from showing if API returns stale data
        console.log('[Match Respond] Skipping refetch for suggested tab - using optimistic update and localStorage cache')
      }
    },
    onError: (error, { suggestionId }, context) => {
      console.error('[Match Respond] Error:', { error, suggestionId, context })
      // Rollback optimistic update - refetch to restore state
      fetchSuggestions(activeTab === 'history' || activeTab === 'confirmed')
      const errorMessage = error instanceof Error ? error.message : `Failed to ${context?.action || 'respond to'} suggestion`
      toast.error(errorMessage)
    },
  })

  // Handle suggestion response
  const handleRespond = async (suggestionId: string, action: 'accept' | 'decline') => {
    try {
      await respondMutation.mutateAsync({ suggestionId, action })
    } catch (error) {
      // Error handling is done in onError
    }
  }

  const isResponding = respondMutation.isPending

  // Refresh suggestions
  const handleRefresh = async () => {
    try {
      const response = await fetchWithCSRF('/api/match/suggestions/refresh', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()

        // Check for diagnostic information if no suggestions
        if (data.diagnostic && data.suggestions?.length === 0) {
          const diagnostic = data.diagnostic
          const reasons = diagnostic.possibleReasons || []
          const counts = diagnostic.candidateCounts || {}
          const matchingStats = diagnostic.matchingStats || null

          // Show informative message with diagnostic details
          let message = 'No matches found. '
          if (reasons.length > 0) {
            message += reasons[0]
            if (reasons.length > 1) {
              message += ` ${reasons[1]}`
            }
          } else {
            message += 'Please check back later or try adjusting your preferences.'
          }

          // Log detailed diagnostic info to console for debugging
          console.log('[Matching] Detailed diagnostic info:', {
            candidateCounts: {
              totalEligible: counts.totalEligible,
              sameDegreeLevel: counts.sameDegreeLevel,
              inCohort: counts.inCohort
            },
            matchingStats: matchingStats,
            fullDiagnostic: diagnostic,
            reasons
          })

          // Also log the raw response to see what we're getting
          console.log('[Matching] Full API response:', data)
          console.log('[Matching] Diagnostic from API:', data.diagnostic)
          console.log('[Matching] MatchingStats from diagnostic:', data.diagnostic?.matchingStats)

          toast.info(message, {
            duration: 10000,
            description: matchingStats
              ? `${matchingStats.totalPairs} pairs checked, ${matchingStats.dealBreakerBlocks} blocked by deal-breakers, ${matchingStats.belowThreshold} below threshold`
              : undefined
          })
        } else if (data.suggestions && data.suggestions.length > 0) {
          // Only show success message if we actually have suggestions for this user
          // The count should now be accurate (only includes user's suggestions)
          toast.success(`Found ${data.suggestions.length} new suggestion${data.suggestions.length !== 1 ? 's' : ''}`, {
            duration: 3000,
          })
        } else if (data.created !== undefined && data.created === 0) {
          // If created is 0, no new suggestions were found
          toast.info('No new suggestions found. Try again later or check your preferences.', {
            duration: 5000,
          })
        }

        await fetchSuggestions()
      } else {
        // Read the error response to show helpful message
        const errorData = await response.json().catch(() => ({ error: 'Failed to refresh suggestions' }))
        const errorMessage = errorData.error || 'Failed to refresh suggestions'
        const errorDetails = errorData.details || ''
        const retryAfter = errorData.retryAfter
        const requiresOnboarding = errorData.requiresOnboarding

        console.error('Failed to refresh suggestions:', errorMessage, {
          status: response.status,
          errorData,
          missingFields: errorData.missingFields,
          details: errorData.details
        })

        // Handle CSRF token errors with a user-friendly message
        if (response.status === 403 && (errorMessage.includes('CSRF') || errorMessage.includes('Invalid CSRF token'))) {
          toast.error('Session expired', {
            description: 'Please refresh the page and try again.',
            duration: 7000,
          })
        } else if (response.status === 404 && requiresOnboarding) {
          // Handle profile/onboarding incomplete errors
          toast.error(errorMessage, {
            description: errorDetails || 'Please complete your profile and questionnaire to get matches.',
            duration: 8000,
          })
        } else if (retryAfter && retryAfter > 0) {
          // Show error toast with retry information
          const minutes = Math.ceil(retryAfter / 60)
          toast.error(errorMessage, {
            description: `Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
            duration: 7000,
          })
        } else {
          toast.error(errorMessage, {
            description: errorDetails || undefined,
            duration: 5000,
          })
        }
      }
    } catch (error) {
      console.error('Error refreshing suggestions:', error)
      toast.error('Failed to refresh suggestions', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        duration: 5000,
      })
    }
  }

  // Load suggestions on mount
  useEffect(() => {
    fetchSuggestions()
  }, [])

  // Refetch with includeExpired when switching to history or confirmed tab
  useEffect(() => {
    if (activeTab === 'history' || activeTab === 'confirmed') {
      fetchSuggestions(true)
    } else {
      fetchSuggestions(false)
    }
    // Clear selection when switching tabs
    setSelectedMatches(new Set())
  }, [activeTab])

  // Handle match selection toggle
  const handleToggleSelection = (suggestionId: string) => {
    const newSelected = new Set(selectedMatches)
    if (newSelected.has(suggestionId)) {
      newSelected.delete(suggestionId)
    } else {
      newSelected.add(suggestionId)
    }
    setSelectedMatches(newSelected)
  }

  // Handle individual chat creation
  const handleIndividualChat = async () => {
    if (selectedMatches.size !== 1) {
      showErrorToast('Selection Required', 'Please select exactly one match for individual chat')
      return
    }

    setIsCreatingChat(true)
    try {
      const suggestionId = Array.from(selectedMatches)[0]
      const suggestion = suggestions.find(s => s.id === suggestionId)
      if (!suggestion) {
        showErrorToast('Error', 'Match not found')
        return
      }

      const otherUserId = suggestion.memberIds.find(id => id !== user.id)
      if (!otherUserId) {
        showErrorToast('Error', 'Could not find other user')
        return
      }

      const response = await fetchWithCSRF('/api/chat/get-or-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otherUserId }),
      })

      if (!response.ok) {
        const error = await response.json()
        showErrorToast('Failed to Create Chat', error.error || 'Failed to create chat')
        return
      }

      const { chat_id } = await response.json()
      router.push(`/chat/${chat_id}`)
      setSelectedMatches(new Set())
    } catch (error) {
      console.error('Error creating individual chat:', error)
      showErrorToast('Failed to Create Chat', 'Failed to create chat. Please try again.')
    } finally {
      setIsCreatingChat(false)
    }
  }

  // Handle group chat creation
  const handleGroupChat = async () => {
    if (selectedMatches.size < 2) {
      showErrorToast('Selection Required', 'Please select at least 2 matches for group chat')
      return
    }

    if (selectedMatches.size > 5) {
      showErrorToast('Limit Exceeded', 'Maximum 5 people allowed in a group chat')
      return
    }

    setIsCreatingChat(true)
    try {
      const selectedSuggestionIds = Array.from(selectedMatches)
      const selectedSuggestions = suggestions.filter(s => selectedSuggestionIds.includes(s.id))

      // Get all other user IDs from selected matches
      const otherUserIds = selectedSuggestions
        .map(s => s.memberIds.find(id => id !== user.id))
        .filter((id): id is string => id !== undefined)

      if (otherUserIds.length === 0) {
        showErrorToast('Error', 'Could not find users to add to group')
        return
      }

      const response = await fetchWithCSRF('/api/chat/create-group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          member_ids: otherUserIds,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        showErrorToast('Failed to Create Group Chat', error.error || 'Failed to create group chat')
        return
      }

      const { chat_id } = await response.json()
      router.push(`/chat/${chat_id}`)
      setSelectedMatches(new Set())
    } catch (error) {
      console.error('Error creating group chat:', error)
      showErrorToast('Failed to Create Group Chat', 'Failed to create group chat. Please try again.')
    } finally {
      setIsCreatingChat(false)
    }
  }

  // Filter suggestions by tab
  const getFilteredSuggestions = () => {
    switch (activeTab) {
      case 'suggested':
        return suggestions
      case 'pending':
        return pendingSuggestions
      case 'confirmed':
        return confirmedMatches
      case 'history':
        return historyMatches
      default:
        return []
    }
  }

  const filteredSuggestions = getFilteredSuggestions()

  const tabs = [
    { id: 'suggested' as TabType, label: 'Suggested', count: suggestions.length },
    { id: 'pending' as TabType, label: 'Pending', count: pendingSuggestions.length },
    { id: 'confirmed' as TabType, label: 'Confirmed', count: confirmedMatches.length },
    { id: 'history' as TabType, label: 'History', count: historyMatches.length },
  ]

  // Extract first name from user.firstName (if provided) or user.name
  const firstName = user.firstName || (user.name ? user.name.split(' ')[0] : 'Student')

  return (
    <div className="space-y-8 pb-24 md:pb-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-5 sm:mb-8">
        <div className="flex items-center gap-2 text-indigo-400 mb-1">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-wider">Discovery Feed</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-2">
          Hello <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400">{firstName}</span>,
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-lg text-lg font-medium">
          Here are your top matches for today based on your preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-4 sm:mb-6">
        {/* Mobile: Dropdown Select (< 640px) */}
        <div className="block sm:hidden mb-4">
          <Select value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
            <SelectTrigger className="w-full bg-white/5 border-white/10 text-white rounded-xl backdrop-blur-xl">
              <SelectValue>
                <span className="font-medium">
                  {tabs.find(t => t.id === activeTab)?.label}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-zinc-950/90 border-white/10 backdrop-blur-xl text-white">
              {tabs.map((tab) => (
                <SelectItem key={tab.id} value={tab.id} className="py-3 px-2 justify-center [&>span]:text-center focus:bg-white/10 focus:text-white">
                  <span className="font-medium w-full text-center">{tab.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Tabs with rounded corners fixed */}
        <div className="hidden sm:block">
          <div className="relative">
            <div className="flex gap-1 bg-gray-50 dark:bg-white/5 p-1 rounded-2xl backdrop-blur-xl">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-all duration-300 rounded-xl ${activeTab === tab.id
                    ? 'bg-indigo-500 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/5'
                    }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab-specific description */}
        <div className="mt-3 sm:mt-4 text-center px-2">
          <p className="text-sm sm:text-sm text-text-secondary leading-relaxed">
            {activeTab === 'suggested' && `You have ${suggestions.length} suggested match${suggestions.length !== 1 ? 'es' : ''}`}
            {activeTab === 'pending' && `You have ${pendingSuggestions.length} pending match${pendingSuggestions.length !== 1 ? 'es' : ''}`}
            {activeTab === 'confirmed' && `You have ${confirmedMatches.length} confirmed match${confirmedMatches.length !== 1 ? 'es' : ''}`}
            {activeTab === 'history' && `You have ${historyMatches.length} match${historyMatches.length !== 1 ? 'es' : ''} in history`}
          </p>
        </div>
      </div>

      {/* Progress Banner for Pending Tab */}
      {activeTab === 'pending' && pendingSuggestions.length > 0 && (
        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                Waiting for Response
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                You've accepted {pendingSuggestions.length} match{pendingSuggestions.length !== 1 ? 'es' : ''}.
                The other person needs to accept before you can start chatting.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-text-muted">Loading your matches...</div>
        </div>
      ) : filteredSuggestions.length === 0 ? (
        activeTab === 'suggested' ? (
          <EmptyMatchesState
            hasCompletedQuestionnaire={true}
            onRefresh={handleRefresh}
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-text-muted mb-4">
              {activeTab === 'pending' && 'No pending matches waiting for responses.'}
              {activeTab === 'confirmed' && 'No confirmed matches yet.'}
              {activeTab === 'history' && 'No match history available.'}
            </div>
          </div>
        )
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredSuggestions.map((suggestion) => {
              const otherUserId = suggestion.memberIds.find(id => id !== user.id)
              
              // Determine actions based on tab
              let onSkip: (() => void) | undefined
              let onConnect: (() => void) | undefined
              
              if (activeTab === 'suggested') {
                // Suggested: allow accept/decline
                onSkip = () => handleRespond(suggestion.id, 'decline')
                onConnect = () => handleRespond(suggestion.id, 'accept')
              } else if (activeTab === 'pending') {
                // Pending: no actions (waiting for response)
                onSkip = undefined
                onConnect = undefined
              } else if (activeTab === 'confirmed') {
                // Confirmed: navigate to chat (but handle selection for group chat separately)
                // For now, navigate to individual chat
                onSkip = undefined
                onConnect = async () => {
                  if (otherUserId) {
                    try {
                      const response = await fetchWithCSRF('/api/chat/get-or-create', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ otherUserId }),
                      })
                      if (response.ok) {
                        const { chat_id } = await response.json()
                        router.push(`/chat/${chat_id}`)
                      }
                    } catch (error) {
                      console.error('Error creating chat:', error)
                    }
                  }
                }
              } else if (activeTab === 'history') {
                // History: no actions or view only
                onSkip = undefined
                onConnect = undefined
              }
              
              return (
                <DiscoveryCardWrapper
                  key={suggestion.id}
                  suggestion={suggestion}
                  otherUserId={otherUserId || ''}
                  currentUserId={user.id}
                  onSkip={onSkip}
                  onConnect={onConnect}
                  connectButtonText={activeTab === 'confirmed' ? 'Chat' : undefined}
                  connectButtonIcon={activeTab === 'confirmed' ? MessageCircle : undefined}
                />
              )
            })}
          </div>

          {/* Load More button for suggested tab */}
          {activeTab === 'suggested' && pagination?.has_more && (
            <div className="flex justify-center mb-4 sm:mb-6">
              <Button
                onClick={() => fetchSuggestions(false, true)}
                disabled={isLoadingMore}
                variant="outline"
                className="min-w-[120px]"
              >
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}


          {/* Refresh button only shown on suggested tab */}
          {activeTab === 'suggested' && (
            <div className="flex flex-col items-center">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Loading...' : 'Refresh Suggestions'}
              </button>
              <p className="text-xs sm:text-sm text-text-secondary mt-3 text-center leading-relaxed">
                Suggestions are automatically generated once every 6 hours. To get fresh matches instantly, click the Refresh Suggestions button above.

                If you've recently completed or updated your questionnaire, our algorithm may need up to an hour to process your responses. To find your best potential roommates we'll need to analyze compatibility values, calculate match scores, and run our sophisticated matching algorithms.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
