'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Programme {
  id: string
  name: string
  nameEn?: string
  level: 'bachelor' | 'premaster' | 'master'
  sector: 'hbo' | 'wo' | 'wo_special'
  modes?: ('fulltime' | 'parttime' | 'dual')[]
  discipline?: string
  externalRefs?: {
    rioCode: string
    instCode: string
  }
  languageCodes?: string[]
  ectsCredits?: number
  durationYears?: number
  durationMonths?: number
  admissionRequirements?: string
}

interface ProgrammeSelectProps {
  institutionId: string | null
  degreeLevel: 'bachelor' | 'premaster' | 'master' | null
  value: string
  onValueChange: (value: string) => void
  onProgrammeSelect?: (programme: Programme) => void
}

export function ProgrammeSelect({
  institutionId,
  degreeLevel,
  value,
  onValueChange,
  onProgrammeSelect
}: ProgrammeSelectProps) {
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualProgramme, setManualProgramme] = useState('')

  useEffect(() => {
    if (!institutionId || !degreeLevel) {
      setProgrammes([])
      setError(null)
      setShowManualEntry(false)
      return
    }

    const loadProgrammes = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const apiRes = await fetch(`/api/programmes?inst=${institutionId}&level=${degreeLevel}`)
        
        if (!apiRes.ok) {
          throw new Error(`Failed to load programmes: ${apiRes.status} ${apiRes.statusText}`)
        }
        
        const apiData = await apiRes.json()
        const apiProgrammes = apiData.programmes || []
        
        // Deduplicate and add language labels
        const deduped = deduplicateProgrammes(apiProgrammes)
        setProgrammes(deduped)
        setShowManualEntry(deduped.length === 0)
        
        if (deduped.length === 0) {
          setError('Data temporarily unavailable')
        }
        
        console.log(`[ProgrammeSelect] Loaded ${deduped.length} programmes from API for ${institutionId}/${degreeLevel}`)
      } catch (err) {
        console.error('[ProgrammeSelect] Failed to load programmes:', err)
        setError(err instanceof Error ? err.message : 'Failed to load programmes')
        setProgrammes([])
        setShowManualEntry(true)
      } finally {
        setLoading(false)
      }
    }

    loadProgrammes()
  }, [institutionId, degreeLevel])

  const handleChange = (progId: string) => {
    if (progId === 'manual') {
      setShowManualEntry(true)
      onValueChange('')
    } else if (progId === 'other') {
      setShowManualEntry(true)
      onValueChange('other')
    } else {
      onValueChange(progId)
      const selected = programmes.find(p => p.id === progId)
      if (selected && onProgrammeSelect) {
        onProgrammeSelect(selected)
      }
    }
  }

  const handleManualChange = (value: string) => {
    setManualProgramme(value)
    onValueChange(value)
  }

  if (showManualEntry) {
    return (
      <div className="space-y-2">
        <input
          type="text"
          value={manualProgramme}
          onChange={(e) => handleManualChange(e.target.value)}
          placeholder="Enter your programme name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && (
          <p className="text-sm text-amber-600">
            {error}. Programme not listed? Enter it manually above.
          </p>
        )}
        {!error && (
          <p className="text-sm text-gray-600">
            Programme not listed? Enter it manually above.
          </p>
        )}
      </div>
    )
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={!institutionId || !degreeLevel || loading}>
      <SelectTrigger>
        <SelectValue placeholder={
          !institutionId ? "Select university first" :
          !degreeLevel ? "Select degree level first" :
          loading ? "Loading programmes..." :
          error ? "Data temporarily unavailable" :
          "Select your programme"
        } />
      </SelectTrigger>
      <SelectContent>
        {programmes.map((prog) => (
          <SelectItem key={prog.id} value={prog.id}>
            <div className="flex flex-col gap-1">
              <span>{prog.name}</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {prog.modes && prog.modes.length > 0 && (
                  prog.modes.map(mode => (
                    <Badge key={mode} variant="secondary" className="text-xs">
                      {mode}
                    </Badge>
                  ))
                )}
                {prog.languageCodes && prog.languageCodes.length > 0 && (
                  prog.languageCodes.map(lang => (
                    <Badge key={lang} variant="outline" className="text-xs">
                      {lang.toUpperCase()}
                    </Badge>
                  ))
                )}
                {prog.ectsCredits && (
                  <Badge variant="outline" className="text-xs">
                    {prog.ectsCredits} ECTS
                  </Badge>
                )}
                {(prog.durationYears || prog.durationMonths) && (
                  <Badge variant="outline" className="text-xs">
                    {prog.durationYears 
                      ? `${prog.durationYears} ${prog.durationYears === 1 ? 'year' : 'years'}`
                      : prog.durationMonths
                      ? `${prog.durationMonths} ${prog.durationMonths === 1 ? 'month' : 'months'}`
                      : ''}
                  </Badge>
                )}
              </div>
            </div>
          </SelectItem>
        ))}
        {programmes.length === 0 && !loading && (
          <SelectItem value="other">
            Programme not listed
          </SelectItem>
        )}
        {programmes.length > 0 && (
          <SelectItem value="other">
            Programme not listed
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}

function deduplicateProgrammes(programmes: Programme[]): Programme[] {
  // First, group by unique ID/RIO code to remove true duplicates
  const byId = new Map<string, Programme>()
  const byRioCode = new Map<string, Programme>()
  
  for (const prog of programmes) {
    // Use ID as primary key
    if (prog.id && !byId.has(prog.id)) {
      byId.set(prog.id, prog)
    }
    
    // Also track by RIO code if available
    if (prog.externalRefs?.rioCode) {
      const rioCode = prog.externalRefs.rioCode
      if (!byRioCode.has(rioCode)) {
        byRioCode.set(rioCode, prog)
      } else {
        // If RIO code already exists, prefer the one with ID match
        const existing = byRioCode.get(rioCode)!
        if (prog.id && existing.id !== prog.id) {
          // Different IDs but same RIO code - keep both, will handle by name later
        }
      }
    }
  }
  
  // Get unique programmes by ID first
  const uniqueById = Array.from(byId.values())
  
  // Now group by name for language variant handling
  const groupedByName = new Map<string, Programme[]>()
  
  for (const prog of uniqueById) {
    const nameKey = prog.name.toLowerCase().trim()
    if (!groupedByName.has(nameKey)) {
      groupedByName.set(nameKey, [])
    }
    groupedByName.get(nameKey)!.push(prog)
  }

  // Deduplicate and add language labels
  const result: Programme[] = []
  
  for (const [nameKey, progs] of groupedByName.entries()) {
    if (progs.length === 1) {
      result.push(progs[0])
    } else {
      // Multiple programmes with same name - check if they're truly duplicates or language variants
      // First check if they have different IDs/RIO codes
      const uniqueProgs = new Map<string, Programme>()
      for (const prog of progs) {
        const uniqueKey = prog.id || prog.externalRefs?.rioCode || `${prog.name}-${prog.level}`
        if (!uniqueProgs.has(uniqueKey)) {
          uniqueProgs.set(uniqueKey, prog)
        }
      }
      
      const uniqueProgsArray = Array.from(uniqueProgs.values())
      
      if (uniqueProgsArray.length === 1) {
        // True duplicates with same ID/RIO code - just take one
        result.push(uniqueProgsArray[0])
      } else {
        // Different programmes with same name - check if different languages
        const hasEn = uniqueProgsArray.some(p => p.nameEn && p.nameEn !== p.name)
        const hasNl = uniqueProgsArray.some(p => !p.nameEn || p.name === p.nameEn)
        
        if (hasEn && hasNl) {
          // Add language labels to distinguish
          for (const prog of uniqueProgsArray) {
            if (prog.nameEn && prog.nameEn !== prog.name) {
              result.push({
                ...prog,
                name: `${prog.name} (English)`
              })
            } else {
              result.push({
                ...prog,
                name: `${prog.name} (Nederlands)`
              })
            }
          }
        } else {
          // Same name, different IDs - keep all but add distinguishing info
          for (const prog of uniqueProgsArray) {
            const displayName = prog.externalRefs?.rioCode 
              ? `${prog.name} (${prog.externalRefs.rioCode})`
              : prog.nameEn && prog.nameEn !== prog.name
              ? `${prog.name} (${prog.nameEn})`
              : prog.name
            result.push({
              ...prog,
              name: displayName
            })
          }
        }
      }
    }
  }

  return result.sort((a, b) => a.name.localeCompare(b.name))
}
