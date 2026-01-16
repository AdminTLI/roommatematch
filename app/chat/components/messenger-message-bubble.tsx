'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, CheckCheck, Flag } from 'lucide-react'
import { EmojiPicker } from './emoji-picker'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { showSuccessToast, showErrorToast } from '@/lib/toast'

interface MessageReaction {
  emoji: string
  count: number
  userReactions: string[]
}

interface MessengerMessageBubbleProps {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatar?: string
  createdAt: string
  isOwn: boolean
  isSystem?: boolean
  readBy?: string[]
  reactions?: MessageReaction[]
  currentUserId: string
  showSenderName?: boolean
  onReactionChange?: () => void
  otherMembersCount?: number
}

export function MessengerMessageBubble({
  id,
  content,
  senderId,
  senderName,
  senderAvatar,
  createdAt,
  isOwn,
  isSystem = false,
  readBy = [],
  reactions = [],
  currentUserId,
  showSenderName = true,
  onReactionChange,
  otherMembersCount = 1
}: MessengerMessageBubbleProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [isReacting, setIsReacting] = useState(false)
  const [isReporting, setIsReporting] = useState(false)

  const handleReport = async () => {
    if (isReporting) return
    setIsReporting(true)
    try {
      const response = await fetchWithCSRF('/api/chat/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_user_id: senderId,
          message_id: id,
          category: 'inappropriate',
          details: 'Reported via message context menu'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit report')
      }

      showSuccessToast('Report submitted', 'Thank you for your report. We will review it shortly.')
    } catch (error: any) {
      console.error('Failed to report message:', error)
      showErrorToast('Failed to submit report', error.message || 'Please try again.')
    } finally {
      setIsReporting(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleReaction = async (emoji: string) => {
    if (isReacting) return

    setIsReacting(true)
    try {
      const response = await fetchWithCSRF('/api/chat/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: id,
          emoji
        })
      })

      if (!response.ok) {
        // Handle 429 rate limit errors gracefully - don't log as errors
        if (response.status === 429) {
          // Rate limited - silently skip
          return
        }
        throw new Error('Failed to add reaction')
      }

      if (onReactionChange) {
        onReactionChange()
      }
      setShowReactionPicker(false)
    } catch (error: any) {
      // Only log non-rate-limit errors
      if (error?.status !== 429 && error?.response?.status !== 429) {
        console.error('Failed to add reaction:', error)
      }
    } finally {
      setIsReacting(false)
    }
  }

  const hasUserReacted = (emoji: string) => {
    const group = reactions.find(r => r.emoji === emoji)
    return group ? group.userReactions.includes(currentUserId) : false
  }

  const getReadStatus = () => {
    if (!isOwn) return null
    
    // Filter out the current user (sender) from readBy array
    const otherReaders = readBy.filter(id => id !== currentUserId)
    
    // If all other members have read the message, show blue double check (read)
    if (otherReaders.length === otherMembersCount && otherMembersCount > 0) {
      return <CheckCheck className="w-3 h-3 text-blue-400" />
    }
    
    // Check if message was just sent (within last 2 seconds)
    const messageTime = new Date(createdAt).getTime()
    const now = Date.now()
    const timeSinceSent = now - messageTime
    const isJustSent = timeSinceSent < 2000 // 2 seconds
    
    // If message was just sent (within 2 seconds), show single tick
    if (isJustSent && otherReaders.length === 0) {
      return <Check className="w-3 h-3 text-gray-400 dark:text-gray-500" />
    }
    
    // If some but not all other members have read, show gray double check (delivered/partially read)
    if (otherReaders.length > 0 && otherReaders.length < otherMembersCount) {
      return <CheckCheck className="w-3 h-3 text-gray-400 dark:text-gray-500" />
    }
    
    // If no other members have read yet but message is older than 2 seconds, show double gray check (delivered but not read)
    if (otherReaders.length === 0) {
      return <CheckCheck className="w-3 h-3 text-gray-400 dark:text-gray-500" />
    }
    
    // Fallback: single check for sent state
    return <Check className="w-3 h-3 text-gray-400 dark:text-gray-500" />
  }

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 shadow-lg">
          <p className="text-sm text-chat-text-primary dark:text-gray-200 text-center font-bold">
            {content}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-2 group', isOwn ? 'justify-end' : 'justify-start')}>
      {!isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={senderAvatar} />
          <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            {senderName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn('max-w-[85%] flex flex-col', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && showSenderName && (
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 px-1">
            {senderName}
          </div>
        )}

        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className={cn(
                  'px-4 py-3 shadow-lg max-w-full transition-all relative cursor-pointer hover:opacity-90',
                  isOwn
                    ? 'bg-purple-600 dark:bg-purple-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
                  isOwn
                    ? 'rounded-2xl rounded-tr-sm rounded-bl-2xl'
                    : 'rounded-2xl rounded-tl-sm rounded-br-2xl'
                )}
                data-messenger-message-sent={isOwn}
                data-messenger-message-received={!isOwn}
                onMouseEnter={() => setShowReactionPicker(true)}
                onMouseLeave={() => setShowReactionPicker(false)}
              >
                <p className={cn('text-sm break-words leading-relaxed', isOwn ? 'text-white' : 'text-gray-900 dark:text-gray-100')}>
                  {content}
                </p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(content)
                  showSuccessToast('Copied', 'Message copied to clipboard')
                }}
              >
                Copy Message
              </DropdownMenuItem>
              {!isOwn && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleReport}
                    disabled={isReporting}
                    className="text-semantic-danger focus:text-semantic-danger focus:bg-semantic-danger/10"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    {isReporting ? 'Reporting...' : 'Report Message'}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hover reaction picker */}
          {showReactionPicker && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
              <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-full px-2 py-1 shadow-lg border border-gray-200 dark:border-gray-700">
                {['❤️', '👍', '😂'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    disabled={isReacting}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-lg disabled:opacity-50"
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reactions */}
        {reactions.length > 0 && (
          <div className={cn('flex flex-wrap gap-1 mt-1', isOwn ? 'justify-end' : 'justify-start')}>
            {reactions.map((group) => (
              <button
                key={group.emoji}
                onClick={() => handleReaction(group.emoji)}
                disabled={isReacting}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all',
                  hasUserReacted(group.emoji)
                    ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700',
                  'disabled:opacity-50 cursor-pointer'
                )}
                type="button"
              >
                <span>{group.emoji}</span>
                <span className="text-[10px] font-medium">{group.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Timestamp and read status */}
        <div className={cn('flex items-center gap-1.5 mt-1 px-1', isOwn ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
            {formatTime(createdAt)}
          </span>
          {isOwn && getReadStatus()}
        </div>
      </div>
    </div>
  )
}
