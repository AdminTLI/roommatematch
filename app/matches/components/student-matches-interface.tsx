'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SuggestionCard } from './suggestion-card'
import { Button } from '@/components/ui/button'
import { MessageCircle, Users, X } from 'lucide-react'
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

export function StudentMatchesInterface({ user }: StudentMatchesInterfaceProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('suggested')
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([])
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
        
        setSuggestions(Array.from(deduped.values()))
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
      const response = await fetch('/api/match/suggestions/respond', {
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
      const response = await fetch('/api/match/suggestions/refresh', {
        method: 'POST',
      })

      if (response.ok) {
        await fetchSuggestions()
      } else {
        console.error('Failed to refresh suggestions')
      }
    } catch (error) {
      console.error('Error refreshing suggestions:', error)
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

      const response = await fetch('/api/chat/get-or-create', {
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

      const response = await fetch('/api/chat/create-group', {
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
    const now = Date.now()
    
    switch (activeTab) {
      case 'suggested':
        return suggestions.filter(s => s.status === 'pending')
      case 'pending':
        return suggestions.filter(s => 
          s.status === 'accepted' && 
          new Date(s.expiresAt).getTime() > now
        )
      case 'confirmed':
        return suggestions.filter(s => s.status === 'confirmed')
      case 'history':
        return suggestions.filter(s => 
          s.status === 'declined' || s.status === 'expired'
        )
      default:
        return []
    }
  }

  const filteredSuggestions = getFilteredSuggestions()

  const tabs = [
    { id: 'suggested' as TabType, label: 'Suggested', count: suggestions.filter(s => s.status === 'pending').length },
    { id: 'pending' as TabType, label: 'Pending', count: suggestions.filter(s => s.status === 'accepted').length },
    { id: 'confirmed' as TabType, label: 'Confirmed', count: suggestions.filter(s => s.status === 'confirmed').length },
    { id: 'history' as TabType, label: 'History', count: suggestions.filter(s => s.status === 'declined' || s.status === 'expired').length },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Matches</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Review and respond to your roommate suggestions. Matches are based on compatibility scores and shared preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-4 sm:mb-6">
        <div className="flex gap-1 bg-white border border-gray-200 p-0.5 sm:p-1 rounded-2xl shadow-sm overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-0 px-2 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              {tab.count > 0 && (
                <span className={`ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Tab-specific description */}
        <div className="mt-3 sm:mt-4 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            {activeTab === 'suggested' && 'New matches waiting for your response'}
            {activeTab === 'pending' && "Matches you've accepted, waiting for others to respond"}
            {activeTab === 'confirmed' && 'Matches where everyone has accepted'}
            {activeTab === 'history' && "Past matches you've declined or that have expired"}
          </p>
        </div>
      </div>

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
          {/* Selection mode info for confirmed tab */}
          {activeTab === 'confirmed' && filteredSuggestions.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Select multiple matches to create a group chat, or select one for individual chat
              </p>
            </div>
          )}

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
