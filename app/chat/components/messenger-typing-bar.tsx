'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { EmojiPicker } from './emoji-picker'
import { cn } from '@/lib/utils'
import { filterContent, getViolationErrorMessage } from '@/lib/utils/content-filter'

interface MessengerTypingBarProps {
  onSend: (message: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function MessengerTypingBar({
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
  className
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
      className={cn('flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-1 rounded-b-lg', className)}
      style={{
        flexShrink: 0,
        flexGrow: 0,
        flexBasis: 'auto'
      }}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          {/* Pill-shaped input container */}
          <div className={cn(
            'flex-1 flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-2.5 py-0.5 min-h-[28px] border transition-all',
            contentValidationError
              ? 'border-red-500 dark:border-red-500 focus-within:ring-2 focus-within:ring-red-300 dark:focus-within:ring-red-400'
              : 'border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-purple-500 dark:focus-within:ring-purple-400 focus-within:border-transparent'
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
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="flex-1 bg-transparent border-none outline-none resize-none text-sm leading-[16px] text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 max-h-[120px] overflow-y-auto scrollbar-hide py-0"
              style={{ minHeight: '14px' }}
            />
          </div>

          {/* Circular Send Button */}
          <button
            onClick={handleSend}
            disabled={disabled || !message.trim() || !!contentValidationError}
            className={cn(
              'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all',
              'bg-purple-600 dark:bg-purple-500 text-white',
              'hover:bg-purple-700 dark:hover:bg-purple-600',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'active:scale-95 shadow-lg',
              message.trim() && !disabled && !contentValidationError ? 'hover:scale-105' : ''
            )}
            aria-label="Send message"
            type="button"
          >
            <Send className="w-5 h-5" />
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
