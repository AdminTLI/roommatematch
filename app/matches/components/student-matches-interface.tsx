'use client'

import { useState, useEffect } from 'react'
import { SuggestionCard } from './suggestion-card'
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
  const [activeTab, setActiveTab] = useState<TabType>('suggested')
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isResponding, setIsResponding] = useState(false)

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
  }, [activeTab])

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
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Matches</h1>
        <p className="text-gray-600">
          Review and respond to your roommate suggestions. Matches are based on compatibility scores and shared preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-2xl shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
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
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
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
          <div className="grid gap-6 mb-6">
            {filteredSuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onRespond={handleRespond}
                isLoading={isResponding}
                currentUserId={user.id}
              />
            ))}
          </div>
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
