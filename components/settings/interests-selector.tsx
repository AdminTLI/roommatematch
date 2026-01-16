'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Check, X, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { searchInterests } from '@/lib/utils/interests-search'
import { cn } from '@/lib/utils'

interface InterestsSelectorProps {
  value: string[]
  onChange: (interests: string[]) => void
  min?: number
  max?: number
  error?: string
}

export function InterestsSelector({
  value,
  onChange,
  min = 3,
  max = 10,
  error
}: InterestsSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce search query for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Filter out selected interests from search results
  const filteredInterests = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return []
    }
    return searchInterests(debouncedQuery, value)
  }, [debouncedQuery, value])

  const handleSelect = useCallback((interest: string) => {
    if (value.includes(interest)) {
      // Deselect if already selected
      onChange(value.filter(i => i !== interest))
    } else {
      // Select if not at max
      if (value.length < max) {
        onChange([...value, interest])
        // Clear search after selection to show it was added
        setSearchQuery('')
      }
    }
  }, [value, onChange, max])

  const handleRemove = useCallback((interest: string) => {
    onChange(value.filter(i => i !== interest))
  }, [value, onChange])

  const isAtMax = value.length >= max
  const isAtMin = value.length >= min
  const remaining = max - value.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Interests</label>
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-widest",
          isAtMin ? "text-zinc-500 dark:text-zinc-400" : "text-amber-600 dark:text-amber-500",
          isAtMax && "text-zinc-500 dark:text-zinc-400"
        )}>
          {value.length} / {max}
          {!isAtMin && <span className="ml-1 text-amber-600/70 dark:text-amber-500/70">(Min {min})</span>}
        </span>
      </div>

      {/* Selected interests as badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/60 min-h-[52px]">
          {value.map((interest) => (
            <div
              key={interest}
              className="group inline-flex items-center gap-1 rounded-lg border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-200 h-auto"
            >
              <span className="whitespace-nowrap leading-none">{interest}</span>
              <button
                type="button"
                onClick={() => handleRemove(interest)}
                className="ml-0.5 hover:bg-blue-200 dark:hover:bg-blue-500/30 rounded-full transition-colors flex items-center justify-center opacity-70 group-hover:opacity-100 -mr-0.5 w-3 h-3 p-0"
                aria-label={`Remove ${interest}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search and select dropdown */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={isAtMax}
            className={cn(
              "w-full justify-start text-left font-normal h-11 bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/20 text-zinc-900 dark:text-zinc-100 transition-all rounded-xl",
              !value.length && "text-zinc-500 dark:text-zinc-400",
              error && "border-red-500/50 focus:border-red-500"
            )}
          >
            <Search className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <span className="truncate">
              {isAtMax
                ? `Maximum ${max} interests reached`
                : value.length === 0
                  ? "Search and select interests..."
                  : `Add more (${remaining} remaining)`}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden"
          align="start"
          side="bottom"
          sideOffset={8}
        >
          <Command shouldFilter={false} className="bg-transparent">
            <CommandInput
              placeholder="Search interests..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="h-12 border-none focus:ring-0 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-zinc-50 dark:bg-white/5"
            />
            <CommandList className="max-h-[300px] scrollbar-hide">
              <CommandEmpty className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                {searchQuery.trim()
                  ? "No interests found."
                  : "Start typing to search..."}
              </CommandEmpty>
              <CommandGroup>
                {filteredInterests.map((interest) => {
                  const isSelected = value.includes(interest)
                  return (
                    <CommandItem
                      key={interest}
                      value={interest}
                      onSelect={() => handleSelect(interest)}
                      className="cursor-pointer py-3 px-4 aria-selected:bg-zinc-100 dark:aria-selected:bg-white/5 text-zinc-900 dark:text-zinc-100 aria-selected:text-zinc-900 dark:aria-selected:text-white transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                          isSelected ? "bg-blue-500 border-blue-500" : "border-zinc-300 dark:border-white/20"
                        )}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span>{interest}</span>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Helper text and error messages */}
      <div className="space-y-1.5 px-1">
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
        )}
        {!error && !isAtMin && (
          <p className="text-[10px] text-amber-600 dark:text-amber-500/80 font-bold uppercase tracking-wider">
            Minimum {min} interests required
          </p>
        )}
        {!error && isAtMin && value.length < max && (
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">
            {remaining} slot{remaining !== 1 ? 's' : ''} available
          </p>
        )}
      </div>
    </div>
  )
}

