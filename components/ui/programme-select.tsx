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

  useEffect(() => {
    if (!institutionId || !degreeLevel) {
      setProgrammes([])
      return
    }

    const loadProgrammes = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/data/programmes/${institutionId}.json`)
        if (!res.ok) throw new Error('Failed to load programmes')
        
        const data = await res.json()
        const levelProgrammes = data[degreeLevel] || []
        
        // Deduplicate and add language labels
        const deduped = deduplicateProgrammes(levelProgrammes)
        setProgrammes(deduped)
      } catch (error) {
        console.error('Failed to load programmes:', error)
        setProgrammes([])
      } finally {
        setLoading(false)
      }
    }

    loadProgrammes()
  }, [institutionId, degreeLevel])

  const handleChange = (progId: string) => {
    onValueChange(progId)
    const selected = programmes.find(p => p.id === progId)
    if (selected && onProgrammeSelect) {
      onProgrammeSelect(selected)
    }
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
          <SelectItem value="none" disabled>
            No programmes found
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
