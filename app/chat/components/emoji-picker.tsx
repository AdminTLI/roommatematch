'use client'

import { useState, useRef, useEffect } from 'react'
import { Smile, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const EMOJI_SET = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
  '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😋',
  '😎', '🤩', '🥳', '😏', '😌', '🤔', '🤨', '😐',
  '😮', '😲', '😢', '😭', '😤', '😡', '😬', '😱',
  '🙏', '👏', '🙌', '👍', '👎', '👊', '🤝', '✌️',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💯',
  '🔥', '✨', '🎉', '🎊', '💫', '🌟', '⭐', '⚡',
  '🍕', '🍔', '🍟', '🍣', '🍩', '🍪', '☕', '🧋',
  '⚽', '🏀', '🏈', '🎮', '🎧', '🎵', '📚', '🧠',
  '🌍', '🌈', '☀️', '🌙', '⏰', '📍', '🎯', '✅'
]

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  className?: string
  buttonClassName?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  mode?: 'text' | 'reaction' | 'both'
  showButton?: boolean
}

export function EmojiPicker({
  onEmojiSelect,
  className,
  buttonClassName,
  position = 'top',
  mode = 'both',
  showButton = true
}: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        buttonRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji)
    // For text mode, keep picker open; for reaction mode, close it
    if (mode === 'reaction') {
      setIsOpen(false)
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-0 mb-2'
      case 'bottom':
        return 'top-full left-0 mt-2'
      case 'left':
        return 'right-full top-0 mr-2'
      case 'right':
        return 'left-full top-0 ml-2'
      default:
        return 'bottom-full left-0 mb-2'
    }
  }

  return (
    <div className={cn('relative', className)}>
      {showButton && (
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'inline-flex items-center justify-center transition-colors',
            'hover:opacity-80 active:scale-95',
            buttonClassName
          )}
          aria-label="Open emoji picker"
          type="button"
        >
          <Smile className="w-5 h-5" />
        </button>
      )}

      {isOpen && (
        <div
          ref={pickerRef}
          className={cn(
            'absolute z-50 p-3 bg-white dark:bg-gray-800 backdrop-blur-xl',
            'border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl',
            'w-72 max-w-[90vw]',
            getPositionClasses()
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Emoji</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close emoji picker"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto pr-1 scrollbar-visible">
            {EMOJI_SET.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-lg hover:scale-105 active:scale-95"
                title={`Select ${emoji}`}
                type="button"
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
