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
  isSelectable?: boolean
  isSelected?: boolean
  onToggleSelection?: () => void
}

export function SuggestionCard({ 
  suggestion, 
  onRespond, 
  isLoading = false, 
  currentUserId,
  isSelectable = false,
  isSelected = false,
  onToggleSelection
}: SuggestionCardProps) {
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
            Waiting for the other person to accept
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
    <div 
      className={`bg-white rounded-xl border p-4 sm:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer ${
        isSelected 
          ? 'border-blue-500 border-2 bg-blue-50' 
          : 'border-gray-200'
      } ${isSelectable ? 'hover:border-blue-300' : ''}`}
      onClick={isSelectable && suggestion.status === 'confirmed' ? onToggleSelection : undefined}
    >
      {/* Header - Compact layout */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Selection checkbox */}
          {isSelectable && suggestion.status === 'confirmed' && (
            <div 
              className="flex-shrink-0 w-6 h-6 border-2 rounded border-gray-300 flex items-center justify-center cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onToggleSelection?.()
              }}
            >
              {isSelected && (
                <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          )}
          <div className="text-center flex-shrink-0">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">
              {suggestion.fitIndex}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Compatibility</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {getStatusBadge()}
              {suggestion.status === 'pending' && (
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  Expires in {hoursLeft}h
                </span>
              )}
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
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => handleRespond('decline')}
            disabled={isResponding || isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
          >
            {isResponding ? 'Declining...' : 'Decline'}
          </button>
          <button
            onClick={() => handleRespond('accept')}
            disabled={isResponding || isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
          >
            {isResponding ? 'Accepting...' : 'Accept'}
          </button>
        </div>
      )}
      
      {/* Chat Now button for confirmed matches - only show when not in selection mode */}
      {suggestion.status === 'confirmed' && !isSelectable && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleChatNow()
          }}
          disabled={isOpeningChat}
          className="w-full px-4 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
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
