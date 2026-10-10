'use client'

import { useState, useRef, KeyboardEvent, TouchEvent, useEffect } from 'react'
import { ChevronLeft, Dices, List, Plus, Send, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { filterContent, getViolationErrorMessage } from '@/lib/utils/content-filter'
import {
  formatConversationQuestion,
  PROMPT_CATEGORIES,
  questionsForCategory,
  randomIcebreaker,
  type ConversationPromptContext,
  type PromptCategoryId,
} from '@/lib/chat/conversation-prompts'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

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
  promptContext?: ConversationPromptContext
  /** External insert (e.g. profile pane nudge) */
  insertText?: string | null
  onInsertTextConsumed?: () => void
}

function composerTextareaMaxPx() {
  if (typeof window === 'undefined') return 144
  return window.matchMedia('(min-width: 1024px)').matches ? 144 : 96
}

function resizeTextarea(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return
  const maxPx = composerTextareaMaxPx()
  textarea.style.height = 'auto'
  textarea.style.height = `${Math.min(textarea.scrollHeight, maxPx)}px`
}

const iconButtonClass =
  'flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-zinc-100 hover:text-violet-700 disabled:opacity-40 dark:hover:bg-zinc-800 dark:hover:text-violet-300'

export function MessengerTypingBar({
  onSend,
  placeholder = 'Message',
  disabled = false,
  className,
  onComposerFocus,
  onComposerBlur,
  replyDraft,
  onCancelReply,
  promptContext,
  insertText,
  onInsertTextConsumed,
}: MessengerTypingBarProps) {
  const [message, setMessage] = useState('')
  const [contentValidationError, setContentValidationError] = useState<string>('')
  const [browseOpen, setBrowseOpen] = useState(false)
  const [browseCategory, setBrowseCategory] = useState<PromptCategoryId | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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

  useEffect(() => {
    if (!browseOpen) setBrowseCategory(null)
  }, [browseOpen])

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
    setBrowseOpen(false)
    requestAnimationFrame(() => {
      resizeTextarea(inputRef.current)
      inputRef.current?.focus({ preventScroll: true })
    })
  }

  const handleRandomPrompt = () => {
    applyPrompt(randomIcebreaker(promptContext?.partnerName))
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

  const handleComposerTouchEnd = (e: TouchEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget
    if (target !== document.activeElement) {
      e.preventDefault()
      target.focus({ preventScroll: true })
    }
  }

  const hasText = message.trim().length > 0 && !contentValidationError
  const multiLine = message.includes('\n') || message.length > 40
  const activeCategory = PROMPT_CATEGORIES.find(c => c.id === browseCategory)
  const categoryQuestions = browseCategory ? questionsForCategory(browseCategory) : []

  return (
    <div
      data-messenger-composer
      className={cn(
        'relative flex-shrink-0 px-1.5 pb-2 pt-1 sm:px-2 lg:px-3',
        // Drop under the browse sheet (z-50) while it is open
        browseOpen ? 'z-40' : 'z-[60]',
        className,
      )}
      style={{
        flexShrink: 0,
        flexGrow: 0,
        flexBasis: 'auto',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="chat-input-dock mx-0 flex flex-col gap-1.5 rounded-[1.25rem] px-1 py-1.5 dark:bg-zinc-900">
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
              className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              aria-label="Cancel reply"
              onClick={() => onCancelReply?.()}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : null}

        <div className="flex min-w-0 items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                className={iconButtonClass}
                aria-label="Conversation helpers"
              >
                <Plus className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="top"
              sideOffset={10}
              className={cn(
                'w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-white/50 bg-white/95 p-1.5',
                'shadow-[0_-10px_28px_rgba(15,23,42,0.10),0_8px_24px_rgba(15,23,42,0.08)]',
                'backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/95',
                'dark:shadow-[0_-10px_28px_rgba(0,0,0,0.45),0_8px_24px_rgba(0,0,0,0.35)]',
              )}
            >
              <DropdownMenuItem
                className="cursor-pointer gap-3 rounded-xl px-3 py-3 focus:bg-slate-100 dark:focus:bg-zinc-800"
                onSelect={() => handleRandomPrompt()}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                  <Dices className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Surprise opener</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Random question from the bank
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-3 rounded-xl px-3 py-3 focus:bg-slate-100 dark:focus:bg-zinc-800"
                onSelect={() => setBrowseOpen(true)}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                  <List className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Browse questions</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Housing, living, uni, and more
                  </p>
                </div>
              </DropdownMenuItem>
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
                'max-h-[96px] min-h-[22px] w-full min-w-0 flex-1 resize-none overflow-x-hidden overflow-y-auto lg:max-h-[144px]',
                'border-none bg-transparent py-0.5 text-base leading-normal text-gray-900 outline-none',
                'whitespace-pre-wrap break-words [overflow-wrap:anywhere] scrollbar-hide',
                'placeholder:text-base placeholder:text-gray-500 touch-manipulation',
                'dark:text-gray-100 dark:placeholder:text-gray-400',
              )}
              style={{ fontSize: '16px' }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={disabled || !hasText}
            className={cn(
              'grid h-10 w-10 shrink-0 place-items-center touch-manipulation rounded-full transition-colors',
              hasText
                ? 'bg-indigo-500 text-white shadow-md hover:brightness-110'
                : 'bg-zinc-200 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500',
              'disabled:cursor-not-allowed',
            )}
            aria-label="Send message"
            type="button"
          >
            <Send className="h-5 w-5 translate-x-px translate-y-px" strokeWidth={2} />
          </button>
        </div>

        {contentValidationError && (
          <p className="px-2 text-xs text-red-600 dark:text-red-400">{contentValidationError}</p>
        )}
      </div>

      <Sheet open={browseOpen} onOpenChange={setBrowseOpen}>
        <SheetContent
          side="bottom"
          className={cn(
            'z-[110] flex h-[min(82dvh,640px)] flex-col gap-0 rounded-t-3xl border-0 p-0',
            'shadow-[0_-12px_40px_rgba(15,23,42,0.14)] dark:shadow-[0_-12px_40px_rgba(0,0,0,0.55)]',
            // Use our own header close control so it aligns with the back button
            '[&>button]:hidden',
          )}
        >
          <SheetHeader className="space-y-0 p-0 text-center">
            <div className="grid min-h-14 grid-cols-[2.75rem_1fr_2.75rem] items-center gap-1 px-2 py-2">
              <div className="flex items-center justify-center">
                {browseCategory ? (
                  <button
                    type="button"
                    onClick={() => setBrowseCategory(null)}
                    aria-label="Back"
                    className="inline-flex h-11 w-11 touch-manipulation items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
                  </button>
                ) : null}
              </div>
              <SheetTitle className="px-1 text-center text-base font-semibold leading-snug tracking-tight">
                {activeCategory ? activeCategory.title : 'Browse Questions'}
              </SheetTitle>
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setBrowseOpen(false)}
                  aria-label="Close"
                  className="inline-flex h-11 w-11 touch-manipulation items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" strokeWidth={2.25} />
                </button>
              </div>
            </div>
            <SheetDescription className="sr-only">
              {activeCategory
                ? activeCategory.description
                : 'Pick a topic, then tap a question to drop it into your message.'}
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">
            {!browseCategory ? (
              <ul className="space-y-0.5">
                {PROMPT_CATEGORIES.map(category => (
                  <li key={category.id}>
                    <button
                      type="button"
                      onClick={() => setBrowseCategory(category.id)}
                      className="flex w-full touch-manipulation flex-col rounded-2xl px-3 py-3 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80"
                    >
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {category.title}
                      </span>
                      <span className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                        {category.description}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-0.5">
                {categoryQuestions.map(question => (
                  <li key={question.id}>
                    <button
                      type="button"
                      onClick={() =>
                        applyPrompt(
                          formatConversationQuestion(question, promptContext?.partnerName),
                        )
                      }
                      className="flex w-full touch-manipulation flex-col rounded-2xl px-3 py-3 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80"
                    >
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {question.label}
                      </span>
                      <span className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                        {formatConversationQuestion(question, promptContext?.partnerName)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
