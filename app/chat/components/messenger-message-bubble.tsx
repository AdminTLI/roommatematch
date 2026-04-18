'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, CheckCheck, Copy, Flag, Reply, Smile } from 'lucide-react'
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
import { showErrorToast, showSuccessToast } from '@/lib/toast'

/** Common chat reactions — toggle via API on pick */
const REACTION_PICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙌', '🔥', '👏']

/** ~2 rows of 40px cells + padding/border; used before first paint */
const REACTION_MENU_EST_HEIGHT = 140
const REACTION_MENU_EST_WIDTH = 220
/** Reserve space for composer + safe margin so the menu does not sit under the typing bar */
const REACTION_VIEWPORT_BOTTOM_RESERVE = 104
const REACTION_VIEWPORT_EDGE_MARGIN = 8

function getScrollableAncestor(el: HTMLElement | null): HTMLElement | null {
  let p: HTMLElement | null = el?.parentElement ?? null
  while (p) {
    const { overflowY } = window.getComputedStyle(p)
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      p.scrollHeight > p.clientHeight + 1
    ) {
      return p
    }
    p = p.parentElement
  }
  return null
}

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
  const [reactionMenuOpen, setReactionMenuOpen] = useState(false)
  /** Fixed viewport coordinates so the picker never clips off-screen */
  const [reactionMenuFixedPos, setReactionMenuFixedPos] = useState<{
    top: number
    left: number
  } | null>(null)
  const [isReacting, setIsReacting] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const reactionTriggerRef = useRef<HTMLButtonElement>(null)
  const reactionMenuRef = useRef<HTMLDivElement>(null)

  const updateReactionMenuPlacement = useCallback(() => {
    const trigger = reactionTriggerRef.current
    if (!trigger || !reactionMenuOpen) return

    const triggerRect = trigger.getBoundingClientRect()
    const menuEl = reactionMenuRef.current
    const measured = menuEl?.getBoundingClientRect()
    const menuWidth =
      measured && measured.width > 1 ? measured.width : Math.min(REACTION_MENU_EST_WIDTH, window.innerWidth - 2 * REACTION_VIEWPORT_EDGE_MARGIN)
    const menuHeight =
      measured && measured.height > 1 ? measured.height : REACTION_MENU_EST_HEIGHT

    const vv = window.visualViewport
    const visibleTop = (vv?.offsetTop ?? 0) + REACTION_VIEWPORT_EDGE_MARGIN
    const visibleBottom = Math.min(
      window.innerHeight,
      vv ? vv.offsetTop + vv.height : window.innerHeight,
    ) - REACTION_VIEWPORT_BOTTOM_RESERVE - REACTION_VIEWPORT_EDGE_MARGIN
    const visibleLeft = (vv?.offsetLeft ?? 0) + REACTION_VIEWPORT_EDGE_MARGIN
    const visibleRight = Math.min(
      window.innerWidth,
      vv ? vv.offsetLeft + vv.width : window.innerWidth,
    ) - REACTION_VIEWPORT_EDGE_MARGIN

    const gap = 6
    const spaceBelow = visibleBottom - triggerRect.bottom
    const spaceAbove = triggerRect.top - visibleTop

    const placeAbove =
      spaceBelow >= menuHeight + gap
        ? false
        : spaceAbove >= menuHeight + gap
          ? true
          : spaceAbove > spaceBelow

    let top = placeAbove ? triggerRect.top - menuHeight - gap : triggerRect.bottom + gap
    top = Math.max(visibleTop, Math.min(top, visibleBottom - menuHeight))

    let left = isOwn ? triggerRect.left : triggerRect.right - menuWidth
    left = Math.max(visibleLeft, Math.min(left, visibleRight - menuWidth))

    setReactionMenuFixedPos({ top, left })
  }, [reactionMenuOpen, isOwn])

  useLayoutEffect(() => {
    if (!reactionMenuOpen) {
      setReactionMenuFixedPos(null)
      return
    }
    updateReactionMenuPlacement()
    const id = requestAnimationFrame(() => updateReactionMenuPlacement())
    return () => cancelAnimationFrame(id)
  }, [reactionMenuOpen, updateReactionMenuPlacement])

  useEffect(() => {
    if (!reactionMenuOpen) return

    const onReposition = () => updateReactionMenuPlacement()
    const scrollOpts: AddEventListenerOptions = { passive: true }

    window.addEventListener('resize', onReposition)
    window.visualViewport?.addEventListener('resize', onReposition)
    window.visualViewport?.addEventListener('scroll', onReposition)

    const scrollParent = getScrollableAncestor(reactionTriggerRef.current)
    scrollParent?.addEventListener('scroll', onReposition, scrollOpts)

    return () => {
      window.removeEventListener('resize', onReposition)
      window.visualViewport?.removeEventListener('resize', onReposition)
      window.visualViewport?.removeEventListener('scroll', onReposition)
      scrollParent?.removeEventListener('scroll', onReposition)
    }
  }, [reactionMenuOpen, updateReactionMenuPlacement])

  useEffect(() => {
    if (!reactionMenuOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (reactionMenuRef.current?.contains(target)) return
      if (reactionTriggerRef.current?.contains(target)) return
      setReactionMenuOpen(false)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setReactionMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [reactionMenuOpen])

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
        let detail: string | undefined
        try {
          const data = (await response.json()) as { error?: string }
          if (typeof data?.error === 'string' && data.error.trim()) {
            detail = data.error.trim()
          }
        } catch {
          /* ignore */
        }
        showErrorToast('Could not update reaction', detail ?? `Error ${response.status}`)
        return
      }

      if (onReactionChange) {
        onReactionChange()
      }
      setReactionMenuOpen(false)
    } catch (error: unknown) {
      const err = error as { status?: number; response?: { status?: number } }
      if (err?.status !== 429 && err?.response?.status !== 429) {
        console.error('Failed to add reaction:', error)
        showErrorToast('Could not update reaction', error instanceof Error ? error.message : undefined)
      }
    } finally {
      setIsReacting(false)
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
    >
      {replyTo ? (
        <div
          className={cn(
            'mb-2 rounded-lg border py-2 pl-2.5 pr-2 text-left shadow-inner',
            isOwn
              ? 'border-zinc-200/90 bg-zinc-100/95 dark:border-white/20 dark:bg-black/40 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
              : 'border-zinc-200/80 bg-zinc-100/85 dark:border-white/10 dark:bg-white/[0.08]',
            'border-l-[3px] border-l-purple-600 dark:border-l-purple-300',
          )}
        >
          <p
            className={cn(
              'text-[11px] font-semibold tracking-tight text-purple-700',
              isOwn ? 'dark:text-purple-100' : 'dark:text-purple-200',
            )}
          >
            {replyTo.senderName}
          </p>
          <p
            className={cn(
              'mt-0.5 max-w-none text-[13px] font-normal leading-snug break-words sm:text-sm',
              isOwn
                ? 'line-clamp-4 text-zinc-700 dark:text-zinc-50'
                : 'line-clamp-3 text-zinc-600 dark:text-zinc-300',
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

        <div
          className={cn(
            'flex flex-col',
            isOwn ? 'items-end' : 'items-start',
            replyTo ? 'max-w-[min(94vw,26rem)] sm:max-w-[32rem]' : 'max-w-[85%]',
            reactions.length > 0 && !reactionMenuOpen && 'pb-4',
          )}
        >
          <div className="relative min-w-0 max-w-full">
            <ContextMenu>
              <ContextMenuTrigger asChild>{bubbleInner}</ContextMenuTrigger>
              <ContextMenuContent className="w-56">
                {onReply ? (
                  <ContextMenuItem onSelect={handleReplySelect}>
                    <Reply className="h-4 w-4 shrink-0 opacity-80" />
                    Reply
                  </ContextMenuItem>
                ) : null}
                <ContextMenuItem onSelect={handleCopy}>
                  <Copy className="h-4 w-4 shrink-0 opacity-80" />
                  Copy message
                </ContextMenuItem>
                {!isOwn && (
                  <>
                    <ContextMenuSeparator className="my-1.5 bg-border-subtle" />
                    <ContextMenuItem
                      className="text-red-600 data-[highlighted]:bg-red-500/12 data-[highlighted]:text-red-700 dark:text-red-400 dark:data-[highlighted]:bg-red-950/70 dark:data-[highlighted]:text-red-100"
                      onSelect={() => setReportOpen(true)}
                    >
                      <Flag className="h-4 w-4 shrink-0 opacity-90" />
                      Report message
                    </ContextMenuItem>
                  </>
                )}
              </ContextMenuContent>
            </ContextMenu>

            {sortedReactions.length > 0 && !reactionMenuOpen ? (
              <div
                role="group"
                aria-label={reactionAriaLabel}
                className={cn(
                  // Below bubble body so text/timestamp stay clear; slight upward nudge only kisses the bottom edge
                  'pointer-events-auto absolute top-full z-20 max-w-full min-w-0 -translate-y-1.5',
                  isOwn ? 'right-3' : 'left-3',
                )}
              >
                <div
                  className={cn(
                    'inline-flex h-[25px] w-max max-w-full min-w-0 flex-nowrap items-center justify-center gap-px overflow-hidden rounded-full border px-1 py-0 shadow-[0_1px_2px_rgba(15,23,42,0.08)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.45)]',
                    'border-zinc-200/95 bg-white dark:border-zinc-600 dark:bg-zinc-800',
                  )}
                >
                  {sortedReactions.map((group) => (
                    <button
                      key={group.emoji}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        void handleReaction(group.emoji)
                      }}
                      disabled={isReacting}
                      title={
                        showPerEmojiCounts
                          ? `${group.emoji} · ${group.count}`
                          : `${group.emoji}`
                      }
                      className={cn(
                        'inline-flex h-full min-h-0 min-w-0 shrink-0 cursor-pointer items-center justify-center gap-0.5 rounded-none border-0 bg-transparent px-1.5',
                        'hover:bg-zinc-100 active:bg-zinc-200/80 disabled:opacity-50 dark:hover:bg-zinc-700/80 dark:active:bg-zinc-600/80',
                      )}
                    >
                      <span className="inline-flex min-h-[1.125rem] min-w-[1.125rem] shrink-0 items-center justify-center text-[15px] leading-none">
                        {group.emoji}
                      </span>
                      {showPerEmojiCounts ? (
                        <span className="inline-flex min-w-[0.65rem] items-center justify-center text-[10px] font-medium tabular-nums leading-none text-zinc-400 dark:text-zinc-500">
                          {group.count}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Beside bubble only — no extra row (avoids large vertical gaps between messages) */}
            <div
              className={cn(
                // Vertically centred on the full bubble height (parent is `relative` around the bubble)
                'absolute top-1/2 z-10 -translate-y-1/2',
                // Their message: control on the right of the bubble; yours: on the left
                isOwn ? 'right-full mr-0.5' : 'left-full ml-0.5',
              )}
            >
              <button
                ref={reactionTriggerRef}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={reactionMenuOpen}
                aria-label="Add reaction"
                onClick={(e) => {
                  e.stopPropagation()
                  setReactionMenuOpen((open) => !open)
                }}
                className={cn(
                  'inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent sm:h-8 sm:w-8',
                  'text-zinc-500 transition-colors hover:border-zinc-200 hover:bg-zinc-100 hover:text-zinc-800',
                  'dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
                  'pointer-events-auto',
                  reactionMenuOpen
                    ? 'opacity-100'
                    : 'max-md:opacity-90 md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100',
                )}
              >
                <Smile className="h-4 w-4" aria-hidden />
              </button>

              {reactionMenuOpen
                ? createPortal(
                    <div
                      ref={reactionMenuRef}
                      role="dialog"
                      aria-label="Choose a reaction"
                      style={
                        reactionMenuFixedPos
                          ? {
                              top: reactionMenuFixedPos.top,
                              left: reactionMenuFixedPos.left,
                            }
                          : { top: 0, left: 0, visibility: 'hidden' as const }
                      }
                      className={cn(
                        'fixed z-[200] w-[min(220px,calc(100vw-1rem))] rounded-xl border border-zinc-200 bg-white/98 p-2 shadow-xl backdrop-blur-xl',
                        'dark:border-zinc-600 dark:bg-zinc-900/98',
                      )}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <div className="grid grid-cols-4 gap-1">
                        {REACTION_PICK_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            disabled={isReacting}
                            onClick={() => void handleReaction(emoji)}
                            className={cn(
                              'flex h-10 items-center justify-center rounded-lg text-xl transition-colors',
                              'hover:bg-zinc-100 active:scale-95 dark:hover:bg-zinc-800',
                              'disabled:cursor-not-allowed disabled:opacity-50',
                            )}
                            title={`React with ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>,
                    document.body,
                  )
                : null}
            </div>
          </div>
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
