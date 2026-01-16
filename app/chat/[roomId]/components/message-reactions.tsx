'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Smile } from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { safeLogger } from '@/lib/utils/logger'

interface Reaction {
  id: string
  emoji: string
  user_id: string
  created_at: string
}

interface ReactionGroup {
  emoji: string
  count: number
  userReactions: string[] // user IDs who reacted with this emoji
}

interface MessageReactionsProps {
  messageId: string
  userId: string
  reactions: ReactionGroup[]
  onReactionChange?: () => void
}

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙌', '🔥', '👏']

export function MessageReactions({
  messageId,
  userId,
  reactions,
  onReactionChange
}: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [isToggling, setIsToggling] = useState<string | null>(null)

  const handleReactionToggle = async (emoji: string) => {
    if (isToggling) return

    setIsToggling(emoji)
    try {
      const response = await fetchWithCSRF('/api/chat/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          emoji
        })
      })

      if (!response.ok) {
        const error = await response.json()
        safeLogger.error('Failed to toggle reaction:', error)
        return
      }

      // Notify parent to refresh reactions
      if (onReactionChange) {
        onReactionChange()
      }
    } catch (error) {
      safeLogger.error('Error toggling reaction:', error)
    } finally {
      setIsToggling(null)
      setShowPicker(false)
    }
  }

  const hasUserReacted = (emoji: string) => {
    const group = reactions.find(r => r.emoji === emoji)
    return group ? group.userReactions.includes(userId) : false
  }

  if (reactions.length === 0 && !showPicker) {
    return (
      <div className="mt-1">
        <button
          onClick={() => setShowPicker(true)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full hover:bg-white/10 transition-colors text-xs text-white/60 hover:text-white"
          title="Add reaction"
        >
          <Smile className="w-3 h-3" />
        </button>
      </div>
    )
  }

  return (
    <div className="mt-1 flex items-center gap-1 flex-wrap">
      {/* Existing Reactions */}
      {reactions.map((group) => (
        <button
          key={group.emoji}
          onClick={() => handleReactionToggle(group.emoji)}
          disabled={isToggling === group.emoji}
          className={`
            inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all
            ${hasUserReacted(group.emoji)
              ? 'bg-white/20 text-white border border-white/30'
              : 'bg-white/10 text-white/80 hover:bg-white/15 border border-white/20'
            }
            ${isToggling === group.emoji ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:scale-105'}
          `}
        >
          <span>{group.emoji}</span>
          <span className="text-[10px] font-medium">{group.count}</span>
        </button>
      ))}

      {/* Add Reaction Button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-white/10 transition-colors text-xs text-white/60 hover:text-white border border-transparent hover:border-white/20"
        title="Add reaction"
      >
        <Smile className="w-3 h-3" />
      </button>

      {/* Emoji Picker */}
      {showPicker && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl z-50">
          <div className="flex items-center gap-1 flex-wrap max-w-[200px]">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReactionToggle(emoji)}
                disabled={isToggling === emoji}
                className="p-1.5 rounded hover:bg-white/10 transition-colors text-lg disabled:opacity-50"
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
