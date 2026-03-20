'use client'

import { useState, useEffect } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Programme, DegreeLevel } from '@/types/programme'
import { ChevronDown, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface ProgrammeSelectProps {
  institutionId?: string
  level?: DegreeLevel
  value?: string
  onChange: (programmeId: string, programmeName?: string) => void
  disabled?: boolean
  placeholder?: string
}

/**
 * Programme selection component with search and filtering
 * 
 * Uses cmdk for fast search through potentially large programme lists.
 * Displays programme name, English name (if available), and mode chips.
 * Only enabled when both institutionId and level are provided.
 */
export function ProgrammeSelect({
  institutionId,
  level,
  value,
  onChange,
  disabled,
  placeholder = "Select a programme"
}: ProgrammeSelectProps) {
  const [open, setOpen] = useState(false)
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const isEnabled = Boolean(institutionId && level) && !disabled
  const selectedProgramme = programmes.find(p => p.id === value)

  // Fetch programmes when institution or level changes
  useEffect(() => {
    if (!isEnabled) {
      setProgrammes([])
      setError(null)
      return
    }

    const fetchProgrammes = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/programmes?inst=${institutionId}&level=${level}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch programmes: ${response.status}`)
        }
        
        const data = await response.json()
        const rawProgrammes = data.programmes || []
        console.log('📚 Fetched programmes for', institutionId, level, ':', rawProgrammes.length, 'programmes')
        
        // Deduplicate programmes to remove duplicates
        const deduplicated = deduplicateProgrammes(rawProgrammes)
        console.log('📊 Deduplicated to', deduplicated.length, 'unique programmes')
        setProgrammes(deduplicated)
      } catch (err) {
        console.error('Error fetching programmes:', err)
        setError(err instanceof Error ? err.message : 'Failed to load programmes')
        setProgrammes([])
      } finally {
        setLoading(false)
      }
    }

    // Add a small delay to prevent rapid API calls
    const timeoutId = setTimeout(fetchProgrammes, 100)
    return () => clearTimeout(timeoutId)
  }, [institutionId, level, isEnabled])

  const handleSelect = (programmeId: string) => {
    // Keep query in sync with selected programme so it appears when editing
    const selected = programmes.find(p => p.id === programmeId)
    onChange(programmeId, selected?.name)
    setQuery(selected?.name ?? '')
    setOpen(false)
  }

  // Whenever the popover opens, seed the query with the current selection so user can edit/backspace
  useEffect(() => {
    if (open) {
      setQuery(selectedProgramme?.name ?? '')
    }
  }, [open, selectedProgramme])

  const renderProgrammeItem = (programme: Programme) => {
    // Display programme name with optional badges for additional info
    const hasAdditionalInfo = programme.modes && programme.modes.length > 0;
    
    if (!hasAdditionalInfo) {
      // Clean name only when no additional info
      return (
        <span className="font-medium text-text-primary leading-tight">
          {programme.name}
        </span>
      );
    }
    
    // Name with badges for additional information
    return (
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <span className="font-medium text-text-primary leading-tight">
            {programme.name}
          </span>
          {programme.isVariant && (
            <Badge variant="secondary" className="text-xs shrink-0">
              Variant
            </Badge>
          )}
        </div>
        
        {programme.nameEn && programme.nameEn !== programme.name && (
          <span className="text-sm text-text-secondary block">
            {programme.nameEn}
          </span>
        )}
        
        <div className="flex flex-wrap gap-1.5">
          {programme.modes?.map(mode => (
            <Badge 
              key={mode} 
              variant="outline" 
              className="text-xs capitalize px-2 py-0.5"
            >
              {mode}
            </Badge>
          ))}
          {programme.discipline && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              {programme.discipline}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  const placeholderText = !isEnabled
    ? "Select university and degree level first"
    : loading
      ? "Loading programmes..."
      : error
        ? "Error loading programmes"
        : placeholder

  const normalizedQuery = query.trim().toLowerCase()
  const visibleProgrammes = !normalizedQuery
    ? programmes
    : programmes.filter((programme) => {
        const haystack = `${programme.name} ${programme.nameEn || ''} ${programme.discipline || ''} ${
          programme.modes?.join(' ') || ''
        }`.toLowerCase()
        return haystack.includes(normalizedQuery)
      })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            role="combobox"
            aria-expanded={open}
            aria-haspopup="dialog"
            className={cn(
              "w-full pr-9 rounded-xl border border-border-subtle/40 bg-bg-surface-alt/20 text-text-primary shadow-md shadow-black/20 backdrop-blur-md placeholder:text-text-muted",
              !isEnabled && "cursor-not-allowed opacity-50"
            )}
            disabled={!isEnabled}
            placeholder={placeholderText}
            value={open ? query : (selectedProgramme?.name || '')}
            onChange={(e) => {
              setQuery(e.target.value)
            }}
            onFocus={() => {
              if (isEnabled && !open) setOpen(true)
            }}
            onClick={() => {
              if (isEnabled && !open) setOpen(true)
            }}
          />
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        </div>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] max-w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl border border-border-subtle/30 bg-bg-surface-alt/80 shadow-2xl shadow-black/20 backdrop-blur-2xl" 
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <Command
          className="rounded-2xl bg-transparent text-text-primary border-0 shadow-none"
          shouldFilter={true}
        >
          <CommandList className="max-h-[400px] overflow-y-auto scrollbar-visible-dark-gradient">
            {loading && (
              <CommandEmpty className="py-6 text-center text-sm text-text-secondary">
                Loading programmes...
              </CommandEmpty>
            )}
            
            {error && (
              <CommandEmpty className="py-6 text-center">
                <p className="text-sm text-rose-300">
                  {error}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Please try again later or contact support.
                </p>
              </CommandEmpty>
            )}
            
            {!loading && !error && visibleProgrammes.length === 0 && (
              <CommandEmpty className="py-6 text-center space-y-2">
                <p className="text-sm text-text-primary">
                  No programmes found for this institution and degree level.
                </p>
                <p className="text-xs text-text-muted">
                  Data temporarily unavailable. This institution may not have programmes available for the selected degree level.
                </p>
                <div className="mt-3 p-3 bg-sky-500/10 rounded-lg border border-sky-400/40">
                  <p className="text-xs text-sky-300 font-medium mb-2">
                    💡 Institutions with available programmes:
                  </p>
                  <div className="text-xs text-sky-200 space-y-1">
                    <p><strong>WO Universities:</strong> Leiden University, University of Twente, Protestantse Theologische Universiteit, Theologische Universiteit Apeldoorn, Theologische Universiteit Utrecht</p>
                    <p><strong>HBO Institutions:</strong> Aeres Hogeschool, Avans Hogeschool, Design Academy Eindhoven, Gerrit Rietveld Academie, HAS green academy, Hogeschool der Kunsten Den Haag, Hogeschool Inholland, Hogeschool Leiden, Hogeschool Rotterdam, Hogeschool Viaa, Hotelschool The Hague, HZ University of Applied Sciences, Iselinge Hogeschool, Marnix Academie, NHL Stenden Hogeschool, Zuyd Hogeschool</p>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-emerald-500/10 rounded border border-emerald-400/50">
                  <p className="text-xs text-emerald-200 font-medium">
                    ✅ No problem! You can still continue by using the "Undecided Program" option below.
                  </p>
                </div>
              </CommandEmpty>
            )}
            
            {!loading && !error && visibleProgrammes.length > 0 && (
              <CommandGroup>
                {visibleProgrammes.map((programme) => (
                  <CommandItem
                    key={getUniqueProgrammeKey(programme)}
                    value={`${programme.name} ${programme.nameEn || ''} ${programme.discipline || ''} ${programme.modes?.join(' ') || ''}`}
                    onSelect={() => handleSelect(programme.id)}
                    className="px-4 py-3 cursor-pointer text-text-primary hover:bg-bg-surface-alt/50 aria-selected:bg-bg-surface-alt/70"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          value === programme.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        {renderProgrammeItem(programme)}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Deduplicate programmes by removing true duplicates
 * Prioritizes programmes with RIO codes, then by ID, then by name+level combination
 */
function deduplicateProgrammes(programmes: Programme[]): Programme[] {
  if (programmes.length === 0) return []

  // Step 1: First pass - deduplicate by RIO code (most reliable identifier)
  const byRioCode = new Map<string, Programme>()
  
  for (const prog of programmes) {
    const rioCode = prog.externalRefs?.rioCode
    if (rioCode) {
      // If we haven't seen this RIO code, keep it
      if (!byRioCode.has(rioCode)) {
        byRioCode.set(rioCode, prog)
      }
      // If we've seen it, prefer the one with a better ID if available
      else {
        const existing = byRioCode.get(rioCode)!
        // Prefer programme with an ID that's different from RIO code
        if (prog.id && prog.id !== rioCode && (existing.id === rioCode || !existing.id)) {
          byRioCode.set(rioCode, prog)
        }
      }
    }
  }

  // Step 2: Second pass - deduplicate by ID for programmes not already included
  const uniqueProgrammes = new Map<string, Programme>()
  
  // Add all programmes with RIO codes
  for (const prog of byRioCode.values()) {
    const key = prog.externalRefs?.rioCode || prog.id || `${prog.name}-${prog.level}`
    uniqueProgrammes.set(key, prog)
  }
  
  // Add programmes without RIO codes, deduplicating by ID
  for (const prog of programmes) {
    const rioCode = prog.externalRefs?.rioCode
    // Skip if already added via RIO code
    if (rioCode && byRioCode.has(rioCode)) {
      continue
    }
    
    // Use ID as key if available
    if (prog.id && !uniqueProgrammes.has(prog.id)) {
      uniqueProgrammes.set(prog.id, prog)
    } else if (!prog.id) {
      // No ID and no RIO code - use name+level as fallback key
      const fallbackKey = `${prog.name.toLowerCase().trim()}-${prog.level}`
      if (!uniqueProgrammes.has(fallbackKey)) {
        uniqueProgrammes.set(fallbackKey, prog)
      }
    }
  }

  // Step 3: Final pass - deduplicate by name+level in case same programme has different IDs/RIO codes
  const byNameAndLevel = new Map<string, Programme[]>()
  
  for (const prog of uniqueProgrammes.values()) {
    const nameKey = `${prog.name.toLowerCase().trim()}-${prog.level}`
    if (!byNameAndLevel.has(nameKey)) {
      byNameAndLevel.set(nameKey, [])
    }
    byNameAndLevel.get(nameKey)!.push(prog)
  }

  // Step 4: Keep only one programme per name+level, preferring best identifier
  const final: Programme[] = []
  
  for (const [nameKey, progs] of byNameAndLevel.entries()) {
    if (progs.length === 1) {
      final.push(progs[0])
    } else {
      // Multiple programmes with same name+level - keep the one with best identifier
      // Priority: RIO code > proper ID (different from RIO) > first one
      const best = progs.reduce((best, current) => {
        const bestRio = best.externalRefs?.rioCode
        const currentRio = current.externalRefs?.rioCode
        
        // Prefer one with RIO code
        if (currentRio && !bestRio) return current
        if (bestRio && !currentRio) return best
        
        // Both or neither have RIO code - prefer one with better ID
        const bestId = best.id && best.id !== bestRio ? best.id : null
        const currentId = current.id && current.id !== currentRio ? current.id : null
        
        if (currentId && !bestId) return current
        if (bestId && !currentId) return best
        
        return best // Keep first if equivalent
      })
      
      final.push(best)
    }
  }

  // Sort alphabetically
  return final.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Generate a unique key for a programme to use as React key
 */
function getUniqueProgrammeKey(programme: Programme): string {
  // Use RIO code if available (most unique)
  if (programme.externalRefs?.rioCode) {
    return programme.externalRefs.rioCode
  }
  // Use ID
  if (programme.id) {
    return programme.id
  }
  // Fallback to name + level (shouldn't happen but just in case)
  return `${programme.name}-${programme.level}`
}
