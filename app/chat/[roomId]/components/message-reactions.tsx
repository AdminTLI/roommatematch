'use client'

import { useState } from 'react'
import { Smile } from 'lucide-react'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { safeLogger } from '@/lib/utils/logger'

interface ReactionGroup {
  emoji: string
  count: number
  userReactions: string[] // user IDs who reacted with this emoji
}

interface MessageReactionsProps {
  messageId: string
  reactions: ReactionGroup[]
  /** Other participants in the room (excl. self). `1` = 1:1 DM. */
  otherMembersCount?: number
  onReactionChange?: () => void
}

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙌', '🔥', '👏']

export function MessageReactions({
  messageId,
  reactions,
  otherMembersCount = 1,
  onReactionChange,
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

  const sortedReactions =
    reactions.length > 0
      ? [...reactions].sort((a, b) => b.count - a.count || a.emoji.localeCompare(b.emoji))
      : []

  const uniqueReactorIds = new Set<string>()
  for (const r of reactions) {
    for (const uid of r.userReactions) {
      uniqueReactorIds.add(uid)
    }
  }
  const isOneToOneRoom = otherMembersCount <= 1
  const showPerEmojiCounts = !isOneToOneRoom || uniqueReactorIds.size >= 2

  const reactionAriaLabel =
    sortedReactions.length === 0
      ? ''
      : showPerEmojiCounts
        ? sortedReactions.map((g) => `${g.emoji} ${g.count}`).join(', ')
        : sortedReactions.map((g) => g.emoji).join(' ')

  if (reactions.length === 0 && !showPicker) {
    return (
      <div className="mt-px">
        <button
          onClick={() => setShowPicker(true)}
          className="inline-flex h-[18px] items-center gap-px rounded-full px-[3px] py-0 text-[11px] leading-none text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          title="Add reaction"
        >
          <Smile className="h-3 w-3 shrink-0" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative mt-px flex max-w-full flex-wrap items-center gap-1.5">
      {sortedReactions.length > 0 ? (
        <div
          role="group"
          aria-label={reactionAriaLabel}
          className="inline-flex h-[25px] w-max max-w-full min-w-0 flex-nowrap items-center justify-center gap-px overflow-hidden rounded-full border border-white/25 bg-white/15 px-1 py-0 shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
        >
          {sortedReactions.map((group) => (
            <button
              key={group.emoji}
              type="button"
              onClick={() => void handleReactionToggle(group.emoji)}
              disabled={isToggling !== null}
              title={
                showPerEmojiCounts ? `${group.emoji} · ${group.count}` : `${group.emoji}`
              }
              className={`
                inline-flex h-full min-h-0 min-w-0 shrink-0 cursor-pointer items-center justify-center gap-0.5 rounded-none border-0 bg-transparent px-1.5
                hover:bg-white/10 active:bg-white/15
                ${isToggling ? 'cursor-wait opacity-50' : ''}
              `}
            >
              <span className="inline-flex min-h-[1.125rem] min-w-[1.125rem] shrink-0 items-center justify-center text-[15px] leading-none">
                {group.emoji}
              </span>
              {showPerEmojiCounts ? (
                <span className="inline-flex min-w-[0.65rem] items-center justify-center text-[10px] font-medium tabular-nums leading-none text-white/55">
                  {group.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="inline-flex h-[25px] items-center gap-px rounded-full border border-transparent px-1 py-0 text-[11px] leading-none text-white/60 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
        title="Add reaction"
      >
        <Smile className="h-3 w-3 shrink-0" />
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
