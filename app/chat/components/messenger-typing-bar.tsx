'use client'

import { useState, useRef, KeyboardEvent, TouchEvent, useEffect } from 'react'
import { Lightbulb, Plus, Send, X } from 'lucide-react'
import { EmojiPicker } from './emoji-picker'
import { cn } from '@/lib/utils'
import { filterContent, getViolationErrorMessage } from '@/lib/utils/content-filter'
import {
  attachMenuPrompts,
  buildPromptChips,
  randomIcebreaker,
  type ConversationPromptContext,
  type PromptChip,
} from '@/lib/chat/conversation-prompts'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface ComposerReplyPreview {
  id: string
  content: string
  senderName: string
}

interface MessengerTypingBarProps {
  onSend: (message: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  onComposerFocus?: () => void
  onComposerBlur?: () => void
  replyDraft?: ComposerReplyPreview | null
  onCancelReply?: () => void
  /** When true, show first-message prompt chips above the dock */
  showPromptChips?: boolean
  promptContext?: ConversationPromptContext
  /** External insert (e.g. profile pane nudge) */
  insertText?: string | null
  onInsertTextConsumed?: () => void
}

function resizeTextarea(textarea: HTMLTextAreaElement | null, maxPx = 144) {
  if (!textarea) return
  textarea.style.height = 'auto'
  textarea.style.height = `${Math.min(textarea.scrollHeight, maxPx)}px`
}

const iconButtonClass =
  'flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-zinc-100 hover:text-violet-700 disabled:opacity-40 dark:hover:bg-zinc-800 dark:hover:text-violet-300'

export function MessengerTypingBar({
  onSend,
  placeholder = 'Message',
  disabled = false,
  className,
  onComposerFocus,
  onComposerBlur,
  replyDraft,
  onCancelReply,
  showPromptChips = false,
  promptContext,
  insertText,
  onInsertTextConsumed,
}: MessengerTypingBarProps) {
  const [message, setMessage] = useState('')
  const [contentValidationError, setContentValidationError] = useState<string>('')
  const [chips, setChips] = useState<PromptChip[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!showPromptChips) {
      setChips([])
      return
    }
    setChips(buildPromptChips(promptContext || {}))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional shallow deps
  }, [
    showPromptChips,
    promptContext?.partnerName,
    promptContext?.budgetMin,
    promptContext?.budgetMax,
    promptContext?.compat?.compatibility_score,
    promptContext?.compat?.dimension_scores_json,
    promptContext?.interests?.join(','),
    promptContext?.preferredCities?.join(','),
  ])

  useEffect(() => {
    if (!insertText) return
    setMessage(insertText)
    setContentValidationError('')
    onInsertTextConsumed?.()
    requestAnimationFrame(() => {
      resizeTextarea(inputRef.current)
      inputRef.current?.focus({ preventScroll: true })
    })
  }, [insertText, onInsertTextConsumed])

  useEffect(() => {
    resizeTextarea(inputRef.current)
  }, [message])

  const validateContent = (text: string) => {
    if (!text.trim()) {
      setContentValidationError('')
      return true
    }

    const contentCheck = filterContent(text)
    const blockingViolations = contentCheck.violations.filter(
      v => v === 'links' || v === 'email' || v === 'phone',
    )

    if (blockingViolations.length > 0) {
      setContentValidationError(getViolationErrorMessage(blockingViolations))
      return false
    }

    setContentValidationError('')
    return true
  }

  const applyPrompt = (text: string) => {
    setMessage(text)
    validateContent(text)
    requestAnimationFrame(() => {
      resizeTextarea(inputRef.current)
      inputRef.current?.focus({ preventScroll: true })
    })
  }

  const handleSend = () => {
    const trimmedMessage = message.trim()
    if (trimmedMessage && !disabled && !contentValidationError) {
      onSend(trimmedMessage)
      setMessage('')
      setContentValidationError('')
      if (inputRef.current) {
        inputRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!contentValidationError) {
        handleSend()
      }
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    const textarea = inputRef.current
    if (textarea) {
      const start = textarea.selectionStart || 0
      const end = textarea.selectionEnd || 0
      const newMessage = message.substring(0, start) + emoji + message.substring(end)
      setMessage(newMessage)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length
        textarea.focus({ preventScroll: true })
        resizeTextarea(textarea)
      }, 0)
    } else {
      setMessage(prev => prev + emoji)
    }
  }

  const handleComposerTouchEnd = (e: TouchEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget
    if (target !== document.activeElement) {
      e.preventDefault()
      target.focus({ preventScroll: true })
    }
  }

  const hasText = message.trim().length > 0 && !contentValidationError
  const attachItems = attachMenuPrompts(promptContext?.partnerName)
  const multiLine = message.includes('\n') || message.length > 40

  return (
    <div
      data-messenger-composer
      className={cn('relative z-[60] flex-shrink-0 px-3 pb-2 pt-1 lg:px-4', className)}
      style={{
        flexShrink: 0,
        flexGrow: 0,
        flexBasis: 'auto',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      {showPromptChips && chips.length > 0 && !disabled && (
        <div className="scrollbar-hide mb-2 flex gap-2 overflow-x-auto px-1 pb-1">
          {chips.map(chip => (
            <button
              key={chip.id}
              type="button"
              onClick={() => applyPrompt(chip.message)}
              className="shrink-0 rounded-full bg-[hsl(var(--chat-active-fill))] px-3 py-1.5 text-xs font-medium text-violet-800 transition-colors hover:bg-violet-100 dark:bg-violet-950/50 dark:text-violet-200 dark:hover:bg-violet-900/60"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-dock mx-0 flex flex-col gap-1.5 rounded-[1.25rem] px-2 py-2 dark:bg-zinc-900">
        {replyDraft ? (
          <div className="flex items-start gap-1 rounded-xl bg-zinc-50 px-2 py-2 dark:bg-zinc-800/90">
            <div className="min-w-0 flex-1 border-l-[3px] border-purple-600 pl-2 dark:border-purple-500">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Replying to {replyDraft.senderName}
              </p>
              <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-300">{replyDraft.content}</p>
            </div>
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              aria-label="Cancel reply"
              onClick={() => onCancelReply?.()}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : null}

        <div className="flex min-w-0 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                className={iconButtonClass}
                aria-label="Quick attach prompts"
              >
                <Plus className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="top"
              className="w-56 border-white/40 bg-white/85 backdrop-blur-[12px] dark:border-white/10 dark:bg-zinc-900/85"
            >
              {attachItems.map(item => (
                <DropdownMenuItem key={item.id} onClick={() => applyPrompt(item.message)}>
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div
            className={cn(
              'flex min-h-[44px] min-w-0 flex-1 items-center bg-zinc-100 px-3 py-2 transition-all dark:bg-zinc-800',
              multiLine ? 'rounded-2xl' : 'rounded-full',
              contentValidationError && 'ring-2 ring-red-300 dark:ring-red-400',
            )}
          >
            <textarea
              ref={inputRef}
              value={message}
              onChange={e => {
                const value = e.target.value
                setMessage(value)
                validateContent(value)
              }}
              onTouchEnd={handleComposerTouchEnd}
              onFocus={() => {
                onComposerFocus?.()
              }}
              onBlur={onComposerBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              wrap="soft"
              className={cn(
                'max-h-[144px] min-h-[22px] w-full min-w-0 flex-1 resize-none overflow-x-hidden overflow-y-auto',
                'border-none bg-transparent py-0.5 text-base leading-normal text-gray-900 outline-none',
                'whitespace-pre-wrap break-words [overflow-wrap:anywhere] scrollbar-hide',
                'placeholder:text-base placeholder:text-gray-500 touch-manipulation',
                'dark:text-gray-100 dark:placeholder:text-gray-400',
              )}
              style={{ fontSize: '16px' }}
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => applyPrompt(randomIcebreaker(promptContext?.partnerName))}
              className="grid h-11 w-11 shrink-0 place-items-center touch-manipulation rounded-full text-amber-600 transition-colors hover:bg-amber-50 disabled:opacity-40 dark:text-amber-400 dark:hover:bg-amber-950/40"
              aria-label="Suggest an icebreaker"
              title="Icebreaker"
            >
              <Lightbulb className="h-5 w-5" />
            </button>

            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              mode="text"
              position="top"
              className="shrink-0"
              buttonClassName="grid h-11 w-11 place-items-center rounded-full text-gray-500 hover:bg-zinc-100 dark:text-gray-400 dark:hover:bg-zinc-800 dark:hover:text-gray-200"
            />

            <button
              onClick={handleSend}
              disabled={disabled || !hasText}
              className={cn(
                'grid h-11 w-11 shrink-0 place-items-center touch-manipulation rounded-full transition-colors',
                hasText
                  ? 'bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] text-white shadow-md hover:brightness-110'
                  : 'bg-zinc-200 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500',
                'disabled:cursor-not-allowed',
              )}
              aria-label="Send message"
              type="button"
            >
              {/* Lucide Send is optically top-left heavy; nudge to true visual center */}
              <Send className="h-5 w-5 translate-x-px translate-y-px" strokeWidth={2} />
            </button>
          </div>
        </div>

        {contentValidationError && (
          <p className="px-2 text-xs text-red-600 dark:text-red-400">{contentValidationError}</p>
        )}
      </div>
    </div>
  )
}
