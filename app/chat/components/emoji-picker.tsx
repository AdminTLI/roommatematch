'use client'

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
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

const PICKER_WIDTH = 288
const PICKER_EST_HEIGHT = 260
const EDGE = 8

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
  const [fixedPos, setFixedPos] = useState<{ top: number; left: number } | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) {
      setFixedPos(null)
      return
    }

    const place = () => {
      const btn = buttonRef.current
      if (!btn) return
      const rect = btn.getBoundingClientRect()
      const vv = window.visualViewport
      const viewW = vv?.width ?? window.innerWidth
      const viewH = vv?.height ?? window.innerHeight
      const viewTop = vv?.offsetTop ?? 0
      const viewLeft = vv?.offsetLeft ?? 0

      const measuredH = pickerRef.current?.offsetHeight || PICKER_EST_HEIGHT
      const measuredW = pickerRef.current?.offsetWidth || PICKER_WIDTH

      let top: number
      if (position === 'bottom') {
        top = rect.bottom + 8
      } else {
        top = rect.top - measuredH - 8
      }

      // Prefer aligning to the right edge of the trigger (composer sits on the right)
      let left = rect.right - measuredW
      left = Math.max(viewLeft + EDGE, Math.min(left, viewLeft + viewW - measuredW - EDGE))
      top = Math.max(viewTop + EDGE, Math.min(top, viewTop + viewH - measuredH - EDGE))

      setFixedPos({ top, left })
    }

    place()
    requestAnimationFrame(place)

    window.addEventListener('resize', place)
    window.visualViewport?.addEventListener('resize', place)
    window.visualViewport?.addEventListener('scroll', place)
    return () => {
      window.removeEventListener('resize', place)
      window.visualViewport?.removeEventListener('resize', place)
      window.visualViewport?.removeEventListener('scroll', place)
    }
  }, [isOpen, position])

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
    if (mode === 'reaction') {
      setIsOpen(false)
    }
  }

  return (
    <div className={cn('relative', className)}>
      {showButton && (
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'inline-flex h-11 w-11 items-center justify-center transition-colors touch-manipulation',
            'hover:opacity-80 active:scale-95',
            buttonClassName
          )}
          aria-label="Open emoji picker"
          aria-expanded={isOpen}
          type="button"
        >
          <Smile className="w-5 h-5" />
        </button>
      )}

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={pickerRef}
            role="dialog"
            aria-label="Emoji picker"
            style={
              fixedPos
                ? { top: fixedPos.top, left: fixedPos.left }
                : { top: 0, left: 0, visibility: 'hidden' }
            }
            className={cn(
              'fixed z-[220] w-72 max-w-[calc(100vw-1rem)] p-3',
              'rounded-xl border border-gray-200 bg-white/95 shadow-xl backdrop-blur-xl',
              'dark:border-gray-700 dark:bg-gray-800/95',
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Emoji</span>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close emoji picker"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="scrollbar-visible grid max-h-48 grid-cols-8 gap-1 overflow-y-auto pr-1">
              {EMOJI_SET.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="rounded p-1.5 text-lg transition-colors hover:scale-105 hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-700"
                  title={`Select ${emoji}`}
                  type="button"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
