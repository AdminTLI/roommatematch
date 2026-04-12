'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, CheckCheck, Copy, Flag, Reply } from 'lucide-react'
import { EmojiPicker } from './emoji-picker'
import { ReportUserDialog } from './report-user-dialog'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { cn } from '@/lib/utils'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { showSuccessToast } from '@/lib/toast'

export interface MessageReplyRef {
  id: string
  content: string
  senderName: string
  senderId: string
}

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
  chatId: string
  /** Quoted message this one replies to */
  replyTo?: MessageReplyRef | null
  onReply?: (target: MessageReplyRef) => void
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
  otherMembersCount = 1,
  chatId,
  replyTo,
  onReply,
}: MessengerMessageBubbleProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [isReacting, setIsReacting] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

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
          emoji,
        }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          return
        }
        throw new Error('Failed to add reaction')
      }

      if (onReactionChange) {
        onReactionChange()
      }
      setShowReactionPicker(false)
    } catch (error: unknown) {
      const err = error as { status?: number; response?: { status?: number } }
      if (err?.status !== 429 && err?.response?.status !== 429) {
        console.error('Failed to add reaction:', error)
      }
    } finally {
      setIsReacting(false)
    }
  }

  const hasUserReacted = (emoji: string) => {
    const group = reactions.find((r) => r.emoji === emoji)
    return group ? group.userReactions.includes(currentUserId) : false
  }

  const getReadStatus = () => {
    if (!isOwn) return null

    const otherReaders = readBy.filter((rid) => rid !== currentUserId)

    if (otherReaders.length === otherMembersCount && otherMembersCount > 0) {
      return <CheckCheck className="h-3.5 w-3.5 text-sky-600 dark:text-sky-200" aria-hidden />
    }

    const messageTime = new Date(createdAt).getTime()
    const timeSinceSent = Date.now() - messageTime
    const isJustSent = timeSinceSent < 2000

    if (isJustSent && otherReaders.length === 0) {
      return <Check className="h-3.5 w-3.5 text-zinc-500 dark:text-white/70" aria-hidden />
    }

    if (otherReaders.length > 0 && otherReaders.length < otherMembersCount) {
      return <CheckCheck className="h-3.5 w-3.5 text-zinc-500 dark:text-white/70" aria-hidden />
    }

    if (otherReaders.length === 0) {
      return <CheckCheck className="h-3.5 w-3.5 text-zinc-500 dark:text-white/70" aria-hidden />
    }

    return <Check className="h-3.5 w-3.5 text-zinc-500 dark:text-white/70" aria-hidden />
  }

  const handleCopy = () => {
    void navigator.clipboard.writeText(content)
    showSuccessToast('Copied', 'Message copied to clipboard')
  }

  const handleReplySelect = () => {
    onReply?.({
      id,
      content,
      senderName,
      senderId,
    })
  }

  if (isSystem) {
    return (
      <div className="my-4 flex justify-center">
        <div className="rounded-2xl border border-zinc-200/60 bg-white/50 px-5 py-3 text-center shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-zinc-800/50">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{content}</p>
        </div>
      </div>
    )
  }

  const bubbleGlass = isOwn
    ? 'border-white/70 bg-white/65 text-zinc-900 shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:border-purple-400/35 dark:bg-purple-600 dark:text-white dark:shadow-[0_1px_16px_rgba(0,0,0,0.35)]'
    : 'border-zinc-300/50 bg-zinc-200/45 text-zinc-900 shadow-[0_1px_12px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-zinc-950/35 dark:text-zinc-100 dark:shadow-[0_1px_16px_rgba(0,0,0,0.4)]'

  const bubbleInner = (
    <div
      className={cn(
        'relative max-w-full cursor-default touch-manipulation backdrop-blur-2xl transition-all hover:brightness-[1.02] dark:hover:brightness-110',
        'border px-3 py-2',
        bubbleGlass,
        isOwn
          ? 'rounded-tl-[18px] rounded-tr-[18px] rounded-br-[5px] rounded-bl-[18px]'
          : 'rounded-tl-[18px] rounded-tr-[18px] rounded-br-[18px] rounded-bl-[5px]',
      )}
      onMouseEnter={() => setShowReactionPicker(true)}
      onMouseLeave={() => setShowReactionPicker(false)}
    >
      {replyTo ? (
        <div
          className={cn(
            'mb-2 border-l-[3px] pl-2 text-left',
            isOwn ? 'border-white/80 dark:border-white/50' : 'border-purple-500 dark:border-purple-400',
          )}
        >
          <p
            className={cn(
              'text-[11px] font-semibold',
              isOwn ? 'text-white/90 dark:text-white/90' : 'text-purple-700 dark:text-purple-300',
            )}
          >
            {replyTo.senderName}
          </p>
          <p
            className={cn(
              'line-clamp-2 text-xs',
              isOwn ? 'text-white/75 dark:text-white/80' : 'text-zinc-600 dark:text-zinc-400',
            )}
          >
            {replyTo.content}
          </p>
        </div>
      ) : null}
      {!isOwn && showSenderName && (
        <div className="mb-1 text-[11px] font-semibold tracking-tight text-zinc-600 dark:text-zinc-400">
          {senderName}
        </div>
      )}
      <div className="flex flex-row flex-wrap items-end justify-start gap-x-4 gap-y-1 sm:gap-x-5">
        <p className="m-0 max-w-full min-w-[max(0px,calc(100%-5.5rem))] flex-[1_1_auto] text-left text-[15px] leading-snug break-words sm:min-w-[max(0px,calc(100%-6rem))]">
          {content}
        </p>
        <span
          className={cn(
            'ml-auto inline-flex shrink-0 items-center gap-1 pb-px text-[11px] leading-none tabular-nums',
            isOwn ? 'text-zinc-500 dark:text-white/75' : 'text-zinc-500 dark:text-zinc-400',
          )}
        >
          {formatTime(createdAt)}
          {isOwn && <span className="inline-flex items-center">{getReadStatus()}</span>}
        </span>
      </div>
    </div>
  )

  return (
    <>
      <div className={cn('group flex gap-2', isOwn ? 'justify-end' : 'justify-start')}>
        {!isOwn && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={senderAvatar} />
            <AvatarFallback className="bg-zinc-200 text-xs text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100">
              {senderName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}

        <div className={cn('flex max-w-[85%] flex-col', isOwn ? 'items-end' : 'items-start')}>
          <div className="relative">
            <ContextMenu>
              <ContextMenuTrigger asChild>{bubbleInner}</ContextMenuTrigger>
              <ContextMenuContent className="w-52">
                {onReply ? (
                  <ContextMenuItem className="gap-2" onSelect={handleReplySelect}>
                    <Reply className="h-4 w-4" />
                    Reply
                  </ContextMenuItem>
                ) : null}
                <ContextMenuItem className="gap-2" onSelect={handleCopy}>
                  <Copy className="h-4 w-4" />
                  Copy message
                </ContextMenuItem>
                {!isOwn && (
                  <>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      className="gap-2 text-semantic-danger focus:bg-semantic-danger/10 focus:text-semantic-danger"
                      onSelect={() => setReportOpen(true)}
                    >
                      <Flag className="h-4 w-4" />
                      Report message
                    </ContextMenuItem>
                  </>
                )}
              </ContextMenuContent>
            </ContextMenu>

            {showReactionPicker && (
              <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                <div className="flex gap-1 rounded-full border border-zinc-200 bg-white/95 px-2 py-1 shadow-lg backdrop-blur-md dark:border-zinc-600 dark:bg-zinc-800/95">
                  {['❤️', '👍', '😂'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleReaction(emoji)}
                      disabled={isReacting}
                      className="rounded p-1 text-lg transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-700"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {reactions.length > 0 && (
            <div className={cn('mt-1 flex flex-wrap gap-1', isOwn ? 'justify-end' : 'justify-start')}>
              {reactions.map((group) => (
                <button
                  key={group.emoji}
                  type="button"
                  onClick={() => handleReaction(group.emoji)}
                  disabled={isReacting}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-all',
                    hasUserReacted(group.emoji)
                      ? 'border-purple-300 bg-purple-100 text-purple-700 dark:border-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                      : 'border-zinc-300 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700',
                    'cursor-pointer disabled:opacity-50',
                  )}
                >
                  <span>{group.emoji}</span>
                  <span className="text-[10px] font-medium">{group.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {!isOwn && (
        <ReportUserDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          chatId={chatId}
          targetUserId={senderId}
          messageId={id}
          targetDisplayName={senderName}
          variant="message"
        />
      )}
    </>
  )
}
