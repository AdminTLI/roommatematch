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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text-primary">Interests</label>
        <span className={cn(
          "text-xs",
          isAtMin ? "text-text-muted" : "text-amber-600 dark:text-amber-400",
          isAtMax && "text-text-muted"
        )}>
          {value.length}/{max} selected
          {!isAtMin && ` (minimum ${min} required)`}
        </span>
      </div>

      {/* Selected interests as badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-border-subtle bg-bg-surface-alt min-h-[60px]">
          {value.map((interest) => (
            <Badge
              key={interest}
              variant="secondary"
              className="px-3 py-1.5 text-sm flex items-center gap-2 bg-primary/10 text-primary border-primary/20"
            >
              {interest}
              <button
                type="button"
                onClick={() => handleRemove(interest)}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${interest}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
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
              "w-full justify-start text-left font-normal h-11",
              !value.length && "text-muted-foreground",
              error && "border-red-500 focus:border-red-500"
            )}
          >
            <Search className="mr-2 h-4 w-4" />
            {isAtMax 
              ? `Maximum ${max} interests reached`
              : value.length === 0
              ? "Search and select interests..."
              : `Add more interests (${remaining} remaining)`}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[400px] p-0" 
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Command shouldFilter={false} className="rounded-lg border-none">
            <CommandInput
              placeholder="Search interests..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>
                {searchQuery.trim() 
                  ? "No interests found. Try a different search term."
                  : "Start typing to search interests..."}
              </CommandEmpty>
              <CommandGroup>
                {filteredInterests.map((interest) => {
                  const isSelected = value.includes(interest)
                  return (
                    <CommandItem
                      key={interest}
                      value={interest}
                      onSelect={() => handleSelect(interest)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span>{interest}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Helper text and error messages */}
      <div className="space-y-1">
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {!error && !isAtMin && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Please select at least {min} interests
          </p>
        )}
        {!error && isAtMin && value.length < max && (
          <p className="text-sm text-text-muted">
            {remaining} interest{remaining !== 1 ? 's' : ''} remaining
          </p>
        )}
        {!error && isAtMax && (
          <p className="text-sm text-text-muted">
            Maximum {max} interests selected
          </p>
        )}
      </div>
    </div>
  )
}

