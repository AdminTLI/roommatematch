'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send, X } from 'lucide-react'
import { EmojiPicker } from './emoji-picker'
import { cn } from '@/lib/utils'
import { filterContent, getViolationErrorMessage } from '@/lib/utils/content-filter'

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
  /** Mobile: run after visual viewport settles so the composer stays above the keyboard */
  onComposerFocus?: () => void
  /** Mobile: iOS Chrome sometimes skips a final visualViewport event when the keyboard closes */
  onComposerBlur?: () => void
  /** Shown above the input when replying to a message */
  replyDraft?: ComposerReplyPreview | null
  onCancelReply?: () => void
}

export function MessengerTypingBar({
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
  className,
  onComposerFocus,
  onComposerBlur,
  replyDraft,
  onCancelReply,
}: MessengerTypingBarProps) {
  const [message, setMessage] = useState('')
  const [contentValidationError, setContentValidationError] = useState<string>('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Validate content in real-time
  const validateContent = (text: string) => {
    if (!text.trim()) {
      setContentValidationError('')
      return true
    }
    
    const contentCheck = filterContent(text)
    const blockingViolations = contentCheck.violations.filter(v => 
      v === 'links' || v === 'email' || v === 'phone'
    )
    
    if (blockingViolations.length > 0) {
      const errorMessage = getViolationErrorMessage(blockingViolations)
      setContentValidationError(errorMessage)
      return false
    }
    
    // Clear error if no blocking violations
    setContentValidationError('')
    return true
  }

  const handleSend = () => {
    const trimmedMessage = message.trim()
    if (trimmedMessage && !disabled && !contentValidationError) {
      onSend(trimmedMessage)
      setMessage('')
      setContentValidationError('')
      // Reset textarea height
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
      
      // Set cursor position after emoji
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length
        textarea.focus()
      }, 0)
    } else {
      setMessage(prev => prev + emoji)
    }
  }

  // Auto-resize textarea
  const handleInput = () => {
    const textarea = inputRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }

  return (
    <div 
      data-messenger-composer
      className={cn(
        'relative z-[60] flex-shrink-0 rounded-b-lg border-t border-gray-200 bg-white p-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] dark:border-gray-700 dark:bg-gray-950',
        className,
      )}
      style={{
        flexShrink: 0,
        flexGrow: 0,
        flexBasis: 'auto',
      }}
    >
      <div className="flex flex-col gap-1">
        {replyDraft ? (
          <div className="flex items-start gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 dark:border-gray-700 dark:bg-gray-900/90">
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
        <div className="flex items-center gap-1">
          {/* Pill-shaped input container */}
          <div className={cn(
            'flex-1 flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-2.5 py-1.5 min-h-[44px] border transition-all',
            contentValidationError
              ? 'border-red-500 dark:border-red-500 focus-within:ring-2 focus-within:ring-red-300 dark:focus-within:ring-red-400'
              : 'border-gray-200 dark:border-gray-700'
          )}>
            {/* Emoji Picker */}
            <div className="flex-shrink-0 self-center">
              <EmojiPicker
                onEmojiSelect={handleEmojiSelect}
                mode="text"
                position="top"
                buttonClassName="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              />
            </div>

            {/* Text Input */}
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => {
                const value = e.target.value
                setMessage(value)
                validateContent(value)
                handleInput()
              }}
              onFocus={() => {
                onComposerFocus?.()
              }}
              onBlur={onComposerBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              /* 16px+ on iOS prevents Safari from auto-zooming the page on focus */
              className="flex-1 bg-transparent border-none outline-none resize-none text-base leading-normal text-gray-900 dark:text-gray-100 placeholder:text-base placeholder:text-gray-500 dark:placeholder:text-gray-400 max-h-[120px] overflow-y-auto scrollbar-hide py-0.5 touch-manipulation"
              style={{ minHeight: '22px', fontSize: '16px' }}
            />
          </div>

          {/* Circular Send Button */}
          <button
            onClick={handleSend}
            disabled={disabled || !message.trim() || !!contentValidationError}
            className={cn(
              'flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full transition-colors',
              'bg-purple-600 text-white dark:bg-purple-500',
              'hover:bg-purple-700 dark:hover:bg-purple-600',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'active:scale-[0.98]',
            )}
            aria-label="Send message"
            type="button"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        {contentValidationError && (
          <p className="text-xs text-red-600 dark:text-red-400 px-2">
            {contentValidationError}
          </p>
        )}
      </div>
    </div>
  )
}
