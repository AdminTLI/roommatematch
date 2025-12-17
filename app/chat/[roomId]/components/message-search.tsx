'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, X, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string
  sender_id: string
  sender_name: string
  created_at: string
  is_own: boolean
}

interface MessageSearchProps {
  messages: Message[]
  isOpen: boolean
  onClose: () => void
  onMessageSelect: (messageId: string) => void
}

export function MessageSearch({ messages, isOpen, onClose, onMessageSelect }: MessageSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Message[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter messages based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([])
      setSelectedIndex(0)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = messages.filter(msg => 
      msg.content.toLowerCase().includes(query)
    )
    
    setResults(filtered)
    setSelectedIndex(0)
  }, [searchQuery, messages])

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setSearchQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault()
        handleSelectMessage(results[selectedIndex].id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  const handleSelectMessage = (messageId: string) => {
    onMessageSelect(messageId)
    onClose()
  }

  const highlightText = (text: string, query: string) => {
    if (!query) return text
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Messages</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto min-h-0 border border-border-subtle rounded-lg">
            {searchQuery && results.length === 0 ? (
              <div className="p-8 text-center text-text-muted">
                <p>No messages found</p>
              </div>
            ) : searchQuery && results.length > 0 ? (
              <div className="divide-y divide-border-subtle">
                {results.map((message, index) => (
                  <button
                    key={message.id}
                    onClick={() => handleSelectMessage(message.id)}
                    className={cn(
                      "w-full text-left p-4 hover:bg-bg-surface-alt transition-colors",
                      index === selectedIndex && "bg-bg-surface-alt"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-text-primary">
                            {message.sender_name}
                          </span>
                          <span className="text-xs text-text-muted">
                            {new Date(message.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary line-clamp-2">
                          {highlightText(message.content, searchQuery)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-text-muted">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Type to search messages</p>
                <p className="text-xs mt-2">Use ↑↓ to navigate, Enter to select</p>
              </div>
            )}
          </div>

          {/* Footer with keyboard hints */}
          {results.length > 0 && (
            <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border-subtle">
              <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" />
                  <ArrowDown className="h-3 w-3" />
                  Navigate
                </span>
                <span>Enter to select</span>
                <span>Esc to close</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}










