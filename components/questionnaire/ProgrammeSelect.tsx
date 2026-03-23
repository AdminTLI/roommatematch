'use client'

import { useState, useEffect } from 'react'
import { Programme, DegreeLevel } from '@/types/programme'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProgrammeSelectProps {
  institutionId?: string
  level?: DegreeLevel
  value?: string
  onChange: (programmeId: string, programmeName?: string) => void
  disabled?: boolean
  placeholder?: string
}

/**
 * Programme selection component using a standard dropdown.
 * Displays programme name and optional metadata chips.
 * Enabled only when both institutionId and level are provided.
 */
export function ProgrammeSelect({
  institutionId,
  level,
  value,
  onChange,
  disabled,
  placeholder = "Select a programme"
}: ProgrammeSelectProps) {
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEnabled = Boolean(institutionId && level) && !disabled

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
    const selected = programmes.find(p => p.id === programmeId)
    onChange(programmeId, selected?.name)
  }

  const placeholderText = !isEnabled
    ? "Select university and degree level first"
    : loading
      ? "Loading programmes..."
      : error
        ? "Error loading programmes"
        : placeholder

  return (
    <Select
      value={value || ''}
      onValueChange={handleSelect}
      disabled={!isEnabled || loading || Boolean(error)}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholderText} />
      </SelectTrigger>
      <SelectContent>
        {!loading && !error && programmes.length > 0 && programmes.map((programme) => (
          <SelectItem key={getUniqueProgrammeKey(programme)} value={programme.id}>
            {programme.name}
          </SelectItem>
        ))}
        {!loading && !error && programmes.length === 0 && (
          <SelectItem value="__none__" disabled>
            No programmes found
          </SelectItem>
        )}
      </SelectContent>
    </Select>
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
