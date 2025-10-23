'use client'

import { useState } from 'react'
import { SectionScores } from './section-scores'
import type { MatchSuggestion } from '@/lib/matching/types'

interface SuggestionCardProps {
  suggestion: MatchSuggestion
  onRespond: (id: string, action: 'accept' | 'decline') => Promise<void>
  isLoading?: boolean
}

export function SuggestionCard({ suggestion, onRespond, isLoading = false }: SuggestionCardProps) {
  const [isResponding, setIsResponding] = useState(false)
  
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
  
  const getStatusBadge = () => {
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
            Waiting for others
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-gray-900">
            {suggestion.fitIndex}
          </div>
          <div className="text-sm text-gray-500">
            Compatibility Score
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {suggestion.status === 'pending' && (
            <div className="text-xs text-gray-500">
              Expires in {hoursLeft}h
            </div>
          )}
        </div>
      </div>
      
      {/* Members */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-1">Potential Roommates:</div>
        <div className="text-sm font-medium text-gray-900">
          {suggestion.memberIds.length === 2 
            ? `You + 1 other person`
            : `You + ${suggestion.memberIds.length - 1} others`
          }
        </div>
      </div>
      
      {/* Section Scores */}
      {suggestion.sectionScores && (
        <div className="mb-4">
          <SectionScores scores={suggestion.sectionScores} />
        </div>
      )}
      
      {/* Reasons */}
      {suggestion.reasons && suggestion.reasons.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">Why this match works:</div>
          <div className="text-sm text-gray-700">
            {suggestion.reasons.join(', ')}
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
      
      {/* Run Info */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Run ID: {suggestion.runId}
        </div>
      </div>
    </div>
  )
}
