'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SectionScores } from './section-scores'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { Clock, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { showErrorToast, showSuccessToast } from '@/lib/toast'
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
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)
  const router = useRouter()
  
  const now = Date.now()
  const expiresAt = new Date(suggestion.expiresAt).getTime()
  const hoursLeft = Math.max(0, Math.ceil((expiresAt - now) / 3600000))
  
  // Convert hours to days and hours format
  const formatExpirationTime = (hours: number): string => {
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`
    }
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    if (remainingHours === 0) {
      return `${days} day${days !== 1 ? 's' : ''}`
    }
    return `${days} day${days !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`
  }
  
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
      const response = await fetchWithCSRF('/api/chat/get-or-create', {
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

  const handleBlockUser = async () => {
    setIsBlocking(true)
    try {
      // Find the other user ID
      const otherUserId = suggestion.memberIds.find(id => id !== currentUserId)
      if (!otherUserId) {
        showErrorToast('Error', 'Could not identify user to block')
        return
      }

      const response = await fetchWithCSRF('/api/match/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blocked_user_id: otherUserId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to block user')
      }

      showSuccessToast('User blocked', 'This user has been blocked and will not appear in future matches.')
      setShowBlockDialog(false)
      // Remove this suggestion from the UI by calling onRespond with decline
      await onRespond(suggestion.id, 'decline')
    } catch (error: any) {
      console.error('Failed to block user:', error)
      showErrorToast('Failed to block user', error.message || 'Please try again.')
    } finally {
      setIsBlocking(false)
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
        // Find which users haven't accepted yet
        const notAccepted = suggestion.memberIds.filter(id => !suggestion.acceptedBy?.includes(id))
        const waitingForCurrentUser = notAccepted.includes(currentUserId)
        
        if (waitingForCurrentUser) {
          return (
            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Waiting for your response
            </span>
          )
        } else {
          return (
            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Waiting for {pendingCount > 1 ? `${pendingCount} others` : 'other person'} to accept
            </span>
          )
        }
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
      className={`bg-white rounded-xl border p-3 sm:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer ${
        isSelected 
          ? 'border-blue-500 border-2 bg-blue-50' 
          : 'border-gray-200'
      } ${isSelectable ? 'hover:border-blue-300' : ''}`}
      onClick={isSelectable && suggestion.status === 'confirmed' ? onToggleSelection : undefined}
    >
      {/* Header - Compact layout */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2.5 sm:gap-4 flex-1 min-w-0">
          {/* Selection checkbox */}
          {isSelectable && suggestion.status === 'confirmed' && (
            <div 
              className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 border-2 rounded border-gray-300 flex items-center justify-center cursor-pointer touch-manipulation"
              onClick={(e) => {
                e.stopPropagation()
                onToggleSelection?.()
              }}
            >
              {isSelected && (
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                  <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          )}
          <div className="text-center flex-shrink-0">
            <div className="text-xl sm:text-3xl font-bold text-blue-600">
              {suggestion.fitIndex}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Compatibility</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              {getStatusBadge()}
              {suggestion.status === 'pending' && (
                <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">
                  Expires in {formatExpirationTime(hoursLeft)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Section Scores - More compact */}
      {suggestion.sectionScores && (
        <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-100">
          <SectionScores scores={suggestion.sectionScores} />
        </div>
      )}
      
      {/* Match Explanation */}
      {suggestion.reasons && suggestion.reasons.length > 0 && (
        <div className="mb-3 sm:mb-4">
          <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1.5 sm:mb-1">Why this match works:</div>
          <div className="text-xs sm:text-sm text-gray-700 leading-relaxed sm:leading-relaxed">
            {(() => {
              // Generate human-like explanation from reasons and scores
              const reasons = suggestion.reasons || []
              const scores = suggestion.sectionScores || {}
              
              // Get top strengths
              const academicScore = scores.academic || 0
              const personalityScore = scores.personality || 0
              const socialScore = scores.social || 0
              const lifestyleScore = scores.lifestyle || 0
              const scheduleScore = scores.schedule || 0
              
              // Build explanation sentences
              const strengths: string[] = []
              const concerns: string[] = []
              
              // First sentence: Main strengths
              if (reasons.length > 0) {
                const mainReasons = reasons.slice(0, 2).join(' and ')
                strengths.push(`You two seem like a great fit because ${mainReasons.toLowerCase()}.`)
              } else {
                strengths.push(`Based on your profiles, you both share similar values and lifestyle preferences that should make living together comfortable.`)
              }
              
              // Second sentence: Specific compatibility highlights
              const topScores: string[] = []
              if (academicScore > 0.7) topScores.push('academic backgrounds')
              if (personalityScore > 0.7) topScores.push('personality traits')
              if (socialScore > 0.7) topScores.push('social preferences')
              if (lifestyleScore > 0.7) topScores.push('lifestyle habits')
              
              if (topScores.length > 0) {
                strengths.push(`Your ${topScores.slice(0, 2).join(' and ')} align really well, which should help you both feel at home and understand each other's routines.`)
              } else {
                strengths.push(`You both seem to value similar things when it comes to shared living spaces, which is always a good foundation for a roommate relationship.`)
              }
              
              // Third sentence: Constructive feedback/things to watch out for
              if (scheduleScore < 0.5) {
                concerns.push(`One thing to keep in mind is that your schedules might be quite different, so it'd be worth discussing quiet hours and study times early on to make sure you're both comfortable.`)
              } else if (lifestyleScore < 0.5) {
                concerns.push(`You might want to chat about cleanliness expectations and how you both like to keep shared spaces, since those small differences can sometimes cause friction if not discussed upfront.`)
              } else if (socialScore < 0.5) {
                concerns.push(`Since you have different preferences around guests and socializing at home, having an open conversation about boundaries and house rules would help you both feel respected.`)
              } else {
                concerns.push(`Like with any roommate situation, communication is key - make sure you're both on the same page about the important stuff like bills, shared responsibilities, and what happens if plans change.`)
              }
              
              return [...strengths, ...concerns].join(' ')
            })()}
          </div>
        </div>
      )}
      
      {/* Actions */}
      {suggestion.status === 'pending' && (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => handleRespond('decline')}
            disabled={isResponding || isLoading}
            className="flex-1 px-4 py-2.5 sm:py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium touch-manipulation min-h-[44px]"
          >
            {isResponding ? 'Declining...' : 'Decline'}
          </button>
          <button
            onClick={() => handleRespond('accept')}
            disabled={isResponding || isLoading}
            className="flex-1 px-4 py-2.5 sm:py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium touch-manipulation min-h-[44px]"
          >
            {isResponding ? 'Accepting...' : 'Accept'}
          </button>
        </div>
      )}

      {/* Block button for pending/accepted matches */}
      {(suggestion.status === 'pending' || suggestion.status === 'accepted') && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowBlockDialog(true)
            }}
            className="flex-1 px-4 py-2.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors font-medium text-sm flex items-center justify-center gap-2 touch-manipulation min-h-[44px]"
          >
            <Ban className="h-4 w-4" />
            Block User
          </button>
        </div>
      )}
      
      {/* Actions for confirmed matches */}
      {suggestion.status === 'confirmed' && !isSelectable && (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleChatNow()
            }}
            disabled={isOpeningChat}
            className="flex-1 px-4 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base touch-manipulation min-h-[44px]"
          >
            {isOpeningChat ? 'Opening chat...' : '💬 Chat Now'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowBlockDialog(true)
            }}
            className="px-4 py-2.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors font-medium text-sm sm:text-base touch-manipulation min-h-[44px] min-w-[44px]"
            title="Block user"
          >
            <Ban className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Block User Confirmation Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block User?</DialogTitle>
            <DialogDescription>
              Are you sure you want to block this user? You will not be matched with them again, 
              and any existing matches will be declined. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBlockUser} disabled={isBlocking}>
              {isBlocking ? 'Blocking...' : 'Block User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
