'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { SuggestionCard } from './suggestion-card'
import { Button } from '@/components/ui/button'
import { MessageCircle, Users, X, Clock } from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import type { MatchSuggestion } from '@/lib/matching/types'

interface StudentMatchesInterfaceProps {
  user: {
    id: string
    email: string
    name: string
    avatar?: string
  }
}

type TabType = 'suggested' | 'pending' | 'confirmed' | 'history'

interface MatchWithStatus extends MatchSuggestion {
  otherUserId?: string
  otherUserName?: string
  waitingForResponse?: boolean
}

export function StudentMatchesInterface({ user }: StudentMatchesInterfaceProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('suggested')
  const [suggestions, setSuggestions] = useState<MatchWithStatus[]>([])
  const [pendingSuggestions, setPendingSuggestions] = useState<MatchWithStatus[]>([])
  const [confirmedMatches, setConfirmedMatches] = useState<MatchWithStatus[]>([])
  const [historyMatches, setHistoryMatches] = useState<MatchWithStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isResponding, setIsResponding] = useState(false)
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set())
  const [isCreatingChat, setIsCreatingChat] = useState(false)

  // Fetch suggestions
  const fetchSuggestions = async (includeExpired = false) => {
    try {
      setIsLoading(true)
      const url = includeExpired ? '/api/match/suggestions/my?includeExpired=true' : '/api/match/suggestions/my'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        const rawSuggestions = data.suggestions || []
        
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
        
        // Categorize suggestions
        const suggested = allSuggestions.filter(s => s.status === 'pending' && !s.acceptedBy?.includes(user.id))
        const pending = allSuggestions.filter(s => s.status === 'accepted' && s.acceptedBy?.includes(user.id) && s.acceptedBy.length < s.memberIds.length)
        const confirmed = allSuggestions.filter(s => s.status === 'accepted' && s.acceptedBy?.length === s.memberIds.length)
        
        // History: Show all matches that are not currently active (declined, expired, confirmed, or old pending/accepted)
        // Sort chronologically (newest first)
        const history = allSuggestions
          .filter(s => {
            // Include declined and expired
            if (s.status === 'declined' || s.status === 'expired') return true
            // Include confirmed matches (they're in history once confirmed)
            if (s.status === 'accepted' && s.acceptedBy?.length === s.memberIds.length) return true
            // Include old pending/accepted that are no longer active
            const isOld = new Date(s.expiresAt) < new Date()
            if (isOld && (s.status === 'pending' || s.status === 'accepted')) return true
            return false
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        
        setSuggestions(suggested)
        setPendingSuggestions(pending)
        setConfirmedMatches(confirmed)
        setHistoryMatches(history)
      } else {
        console.error('Failed to fetch suggestions')
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle suggestion response
  const handleRespond = async (suggestionId: string, action: 'accept' | 'decline') => {
    try {
      setIsResponding(true)
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

      if (response.ok) {
        // Refresh suggestions after responding
        await fetchSuggestions()
      } else {
        const errorData = await response.json()
        console.error('Failed to respond to suggestion:', errorData.error)
        alert(`Failed to ${action} suggestion: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error responding to suggestion:', error)
      alert(`Failed to ${action} suggestion`)
    } finally {
      setIsResponding(false)
    }
  }

  // Refresh suggestions
  const handleRefresh = async () => {
    try {
      const response = await fetchWithCSRF('/api/match/suggestions/refresh', {
        method: 'POST',
      })

      if (response.ok) {
        await fetchSuggestions()
      } else {
        // Read the error response to show helpful message
        const errorData = await response.json().catch(() => ({ error: 'Failed to refresh suggestions' }))
        const errorMessage = errorData.error || 'Failed to refresh suggestions'
        const retryAfter = errorData.retryAfter
        
        console.error('Failed to refresh suggestions:', errorMessage)
        
        // Show error toast with retry information
        if (retryAfter && retryAfter > 0) {
          const minutes = Math.ceil(retryAfter / 60)
          toast.error(errorMessage, {
            description: `Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
            duration: 7000,
          })
        } else {
          toast.error(errorMessage, {
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
      alert('Please select exactly one match for individual chat')
      return
    }

    setIsCreatingChat(true)
    try {
      const suggestionId = Array.from(selectedMatches)[0]
      const suggestion = suggestions.find(s => s.id === suggestionId)
      if (!suggestion) {
        alert('Match not found')
        return
      }

      const otherUserId = suggestion.memberIds.find(id => id !== user.id)
      if (!otherUserId) {
        alert('Could not find other user')
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
        alert(error.error || 'Failed to create chat')
        return
      }

      const { chat_id } = await response.json()
      router.push(`/chat/${chat_id}`)
      setSelectedMatches(new Set())
    } catch (error) {
      console.error('Error creating individual chat:', error)
      alert('Failed to create chat. Please try again.')
    } finally {
      setIsCreatingChat(false)
    }
  }

  // Handle group chat creation
  const handleGroupChat = async () => {
    if (selectedMatches.size < 2) {
      alert('Please select at least 2 matches for group chat')
      return
    }

    if (selectedMatches.size > 5) {
      alert('Maximum 5 people allowed in a group chat')
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
        alert('Could not find users to add to group')
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
        alert(error.error || 'Failed to create group chat')
        return
      }

      const { chat_id } = await response.json()
      router.push(`/chat/${chat_id}`)
      setSelectedMatches(new Set())
    } catch (error) {
      console.error('Error creating group chat:', error)
      alert('Failed to create group chat. Please try again.')
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24">
      {/* Header */}
      <div className="mb-5 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-2">Your Matches</h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          Review and respond to your roommate suggestions. Matches are based on compatibility scores and shared preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          {/* Tabs container with edge fade and chevron hint when overflowing */}
          <div className="flex gap-1.5 sm:gap-1 bg-white border border-gray-200 p-1 sm:p-1 rounded-2xl shadow-sm overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 min-w-[88px] sm:flex-1 sm:min-w-0 px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl text-sm sm:text-sm font-medium transition-colors whitespace-nowrap touch-manipulation ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              {tab.count > 0 && (
                <span className={`ml-1.5 sm:ml-2 px-2 sm:px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
            {/* Enhanced edge fade + scroll indicator */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-r from-transparent via-white/80 to-white hidden sm:block" />
            {/* Mobile scroll indicator - more prominent */}
            <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-l-lg shadow-sm sm:hidden">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-blue-600">→</span>
            </div>
          </div>
        </div>
        {/* Tab-specific description */}
        <div className="mt-3 sm:mt-4 text-center px-2">
          <p className="text-sm sm:text-sm text-gray-600 leading-relaxed">
            {activeTab === 'suggested' && 'New matches waiting for your response'}
            {activeTab === 'pending' && "Matches you've accepted, waiting for others to respond"}
            {activeTab === 'confirmed' && 'Matches where everyone has accepted'}
            {activeTab === 'history' && "Past matches you've declined or that have expired"}
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
          <div className="text-gray-500">Loading your matches...</div>
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {activeTab === 'suggested' && 'No new suggestions available. Try refreshing to get new matches.'}
            {activeTab === 'pending' && 'No pending matches waiting for responses.'}
            {activeTab === 'confirmed' && 'No confirmed matches yet.'}
            {activeTab === 'history' && 'No match history available.'}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Loading...' : 'Refresh Suggestions'}
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:gap-6 mb-4 sm:mb-6">
            {filteredSuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onRespond={handleRespond}
                isLoading={isResponding}
                currentUserId={user.id}
                isSelectable={activeTab === 'confirmed'}
                isSelected={selectedMatches.has(suggestion.id)}
                onToggleSelection={() => handleToggleSelection(suggestion.id)}
              />
            ))}
          </div>

          {/* Action buttons for selected matches */}
          {activeTab === 'confirmed' && selectedMatches.size > 0 && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex items-center gap-3">
                <div className="text-sm font-medium text-gray-700">
                  {selectedMatches.size} {selectedMatches.size === 1 ? 'match' : 'matches'} selected
                </div>
                <div className="flex gap-2">
                  {selectedMatches.size === 1 && (
                    <Button
                      onClick={handleIndividualChat}
                      disabled={isCreatingChat}
                      variant="default"
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Individual Chat
                    </Button>
                  )}
                  {selectedMatches.size >= 2 && (
                    <Button
                      onClick={handleGroupChat}
                      disabled={isCreatingChat}
                      variant="default"
                      className="flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Group Chat ({selectedMatches.size})
                    </Button>
                  )}
                  <Button
                    onClick={() => setSelectedMatches(new Set())}
                    variant="outline"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Loading...' : 'Refresh Suggestions'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
