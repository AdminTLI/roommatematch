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
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualProgramme, setManualProgramme] = useState('')

  useEffect(() => {
    if (!institutionId || !degreeLevel) {
      setProgrammes([])
      return
    }

    const loadProgrammes = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/data/programmes/${institutionId}.json`)
        if (!res.ok) {
          if (res.status === 404) {
            console.warn(`Missing programme data for institution: ${institutionId}`)
            // Show manual entry option
            setProgrammes([])
            setShowManualEntry(true)
            return
          }
          throw new Error('Failed to load programmes')
        }
        
        const data = await res.json()
        const levelProgrammes = data[degreeLevel] || []
        
        // Deduplicate and add language labels
        const deduped = deduplicateProgrammes(levelProgrammes)
        setProgrammes(deduped)
        setShowManualEntry(deduped.length === 0)
      } catch (error) {
        console.error('Failed to load programmes:', error)
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
        <p className="text-sm text-gray-600">
          Programme not listed? Enter it manually above.
        </p>
      </div>
    )
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={!institutionId || !degreeLevel}>
      <SelectTrigger>
        <SelectValue placeholder={
          !institutionId ? "Select university first" :
          !degreeLevel ? "Select degree level first" :
          loading ? "Loading programmes..." :
          "Select your programme"
        } />
      </SelectTrigger>
      <SelectContent>
        {programmes.map((prog) => (
          <SelectItem key={prog.id} value={prog.id}>
            <div className="flex flex-col">
              <span>{prog.name}</span>
              {prog.modes && prog.modes.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {prog.modes.map(mode => (
                    <Badge key={mode} variant="secondary" className="text-xs">
                      {mode}
                    </Badge>
                  ))}
                </div>
              )}
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
  // Group by name
  const grouped = new Map<string, Programme[]>()
  
  for (const prog of programmes) {
    const key = prog.name
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(prog)
  }

  // Deduplicate and add language labels
  const result: Programme[] = []
  
  for (const [name, progs] of grouped.entries()) {
    if (progs.length === 1) {
      result.push(progs[0])
    } else {
      // Multiple with same name - check if different languages
      const hasEn = progs.some(p => p.nameEn)
      const hasNl = progs.some(p => !p.nameEn || p.name !== p.nameEn)
      
      if (hasEn && hasNl) {
        // Add language labels
        for (const prog of progs) {
          result.push({
            ...prog,
            name: prog.nameEn ? `${prog.name} (English)` : `${prog.name} (Nederlands)`
          })
        }
      } else {
        // Just take first one
        result.push(progs[0])
      }
    }
  }

  return result.sort((a, b) => a.name.localeCompare(b.name))
}
