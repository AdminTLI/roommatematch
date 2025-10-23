'use client'

import { useState, useEffect } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Programme, DegreeLevel } from '@/types/programme'
import { ChevronDown, Check } from 'lucide-react'

interface ProgrammeSelectProps {
  institutionId?: string
  level?: DegreeLevel
  value?: string
  onChange: (programmeId: string) => void
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
        console.log('📚 Fetched programmes for', institutionId, level, ':', data.programmes?.length || 0, 'programmes')
        console.log('📊 Programme data:', data)
        setProgrammes(data.programmes || [])
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
    onChange(programmeId)
    setOpen(false)
  }

  const renderProgrammeItem = (programme: Programme) => (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-gray-900 dark:text-gray-100 leading-tight">
          {programme.name}
        </span>
        {programme.isVariant && (
          <Badge variant="secondary" className="text-xs shrink-0">
            Variant
          </Badge>
        )}
      </div>
      
      {programme.nameEn && programme.nameEn !== programme.name && (
        <span className="text-sm text-gray-600 dark:text-gray-400 block">
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
  )

  const getDisplayText = () => {
    if (selectedProgramme) {
      return selectedProgramme.name
    }
    if (!isEnabled) {
      return "Select university and degree level first"
    }
    if (loading) {
      return "Loading programmes..."
    }
    if (error) {
      return "Error loading programmes"
    }
    return placeholder
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-12 px-4",
            !isEnabled && "cursor-not-allowed opacity-50"
          )}
          disabled={!isEnabled}
        >
          <span className="truncate text-left">{getDisplayText()}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-full min-w-[400px] max-w-[600px] p-0" 
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <Command className="rounded-lg border shadow-md" shouldFilter={true}>
          <CommandInput 
            placeholder="Search programmes..." 
            disabled={!isEnabled || loading}
            className="h-12 px-4 text-base border-b"
          />
          <CommandList className="max-h-[400px] overflow-y-auto">
            {loading && (
              <CommandEmpty className="py-6 text-center text-sm">
                Loading programmes...
              </CommandEmpty>
            )}
            
            {error && (
              <CommandEmpty className="py-6 text-center">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Please try again later or contact support.
                </p>
              </CommandEmpty>
            )}
            
            {!loading && !error && programmes.length === 0 && (
              <CommandEmpty className="py-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No programmes found for this institution and degree level.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  This institution may not have programmes in the DUO database, or they may not be available for the selected degree level.
                </p>
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">
                    💡 Institutions with available programmes:
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                    <p><strong>WO Universities:</strong> Leiden University, University of Twente, Protestantse Theologische Universiteit, Theologische Universiteit Apeldoorn, Theologische Universiteit Utrecht</p>
                    <p><strong>HBO Institutions:</strong> Aeres Hogeschool, Avans Hogeschool, Design Academy Eindhoven, Gerrit Rietveld Academie, HAS green academy, Hogeschool der Kunsten Den Haag, Hogeschool Inholland, Hogeschool Leiden, Hogeschool Rotterdam, Hogeschool Viaa, Hotelschool The Hague, HZ University of Applied Sciences, Iselinge Hogeschool, Marnix Academie, NHL Stenden Hogeschool, Zuyd Hogeschool</p>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                    ✅ No problem! You can still continue by using the "Undecided Program" option below.
                  </p>
                </div>
              </CommandEmpty>
            )}
            
            {!loading && !error && programmes.length > 0 && (
              <CommandGroup>
                {programmes.map((programme) => (
                  <CommandItem
                    key={programme.id}
                    value={`${programme.name} ${programme.nameEn || ''} ${programme.discipline || ''} ${programme.modes?.join(' ') || ''}`}
                    onSelect={() => handleSelect(programme.id)}
                    className="px-4 py-3 cursor-pointer"
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
