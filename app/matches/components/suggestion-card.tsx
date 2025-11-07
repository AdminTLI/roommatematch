'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SectionScores } from './section-scores'
import type { MatchSuggestion } from '@/lib/matching/types'

interface SuggestionCardProps {
  suggestion: MatchSuggestion
  onRespond: (id: string, action: 'accept' | 'decline') => Promise<void>
  isLoading?: boolean
  currentUserId: string
}

export function SuggestionCard({ suggestion, onRespond, isLoading = false, currentUserId }: SuggestionCardProps) {
  const [isResponding, setIsResponding] = useState(false)
  const [isOpeningChat, setIsOpeningChat] = useState(false)
  const router = useRouter()
  
  const now = Date.now()
  const expiresAt = new Date(suggestion.expiresAt).getTime()
  const hoursLeft = Math.max(0, Math.ceil((expiresAt - now) / 3600000))
  
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
      const response = await fetch('/api/chat/get-or-create', {
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
  
  const getStatusBadge = () => {
    // Check how many users still need to accept
    const acceptedCount = (suggestion.acceptedBy || []).length
    const totalMembers = suggestion.memberIds.length
    const pendingCount = totalMembers - acceptedCount
    
    switch (suggestion.status) {
      case 'pending':
        return (
          <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
            Pending
          </span>
        )
      case 'accepted':
        return (
          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
            {pendingCount === 1 ? 'Waiting for response' : 'Waiting for others'}
          </span>
        )
      case 'confirmed':
        return (
          <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
            Confirmed 🎉
          </span>
        )
      case 'declined':
        return (
          <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
            Declined
          </span>
        )
      case 'expired':
        return (
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
            Expired
          </span>
        )
      default:
        return null
    }
  }
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header - Compact layout */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {suggestion.fitIndex}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Compatibility</div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge()}
              {suggestion.status === 'pending' && (
                <span className="text-xs text-gray-500">
                  Expires in {hoursLeft}h
                </span>
              )}
            </div>
            <div className="text-sm text-gray-700">
              {suggestion.memberIds.length === 2 
                ? `You + 1 other person`
                : `You + ${suggestion.memberIds.length - 1} others`
              }
            </div>
          </div>
        </div>
      </div>
      
      {/* Section Scores - More compact */}
      {suggestion.sectionScores && (
        <div className="mb-4 pb-4 border-b border-gray-100">
          <SectionScores scores={suggestion.sectionScores} />
        </div>
      )}
      
      {/* Reasons - Compact */}
      {suggestion.reasons && suggestion.reasons.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-600 mb-1">Why this match works:</div>
          <div className="text-sm text-gray-700 leading-relaxed">
            {suggestion.reasons.map((reason, index) => {
              // Capitalize first letter, lowercase rest after commas
              const formatted = index === 0 
                ? reason.charAt(0).toUpperCase() + reason.slice(1).toLowerCase()
                : reason.toLowerCase()
              return index === 0 ? formatted : `, ${formatted}`
            }).join('')}
          </div>
        </div>
      )}
      
      {/* Actions */}
      {suggestion.status === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={() => handleRespond('decline')}
            disabled={isResponding || isLoading}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isResponding ? 'Declining...' : 'Decline'}
          </button>
          <button
            onClick={() => handleRespond('accept')}
            disabled={isResponding || isLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isResponding ? 'Accepting...' : 'Accept'}
          </button>
        </div>
      )}
      
      {/* Chat Now button for confirmed matches */}
      {suggestion.status === 'confirmed' && (
        <button
          onClick={handleChatNow}
          disabled={isOpeningChat}
          className="w-full px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isOpeningChat ? 'Opening chat...' : '💬 Chat Now'}
        </button>
      )}
      
      {/* Run Info (debug only) */}
      {process.env.NEXT_PUBLIC_DEBUG_MATCHES === 'true' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Run ID: {suggestion.runId}
          </div>
        </div>
      )}
    </div>
  )
}
