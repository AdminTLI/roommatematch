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
        setProgrammes(data.programmes || [])
      } catch (err) {
        console.error('Error fetching programmes:', err)
        setError(err instanceof Error ? err.message : 'Failed to load programmes')
        setProgrammes([])
      } finally {
        setLoading(false)
      }
    }

    fetchProgrammes()
  }, [institutionId, level, isEnabled])

  const handleSelect = (programmeId: string) => {
    onChange(programmeId)
    setOpen(false)
  }

  const renderProgrammeItem = (programme: Programme) => (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-medium">{programme.name}</span>
        {programme.isVariant && (
          <Badge variant="secondary" className="text-xs">
            Variant
          </Badge>
        )}
      </div>
      
      {programme.nameEn && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {programme.nameEn}
        </span>
      )}
      
      <div className="flex flex-wrap gap-1">
        {programme.modes?.map(mode => (
          <Badge 
            key={mode} 
            variant="outline" 
            className="text-xs capitalize"
          >
            {mode}
          </Badge>
        ))}
        {programme.discipline && (
          <Badge variant="outline" className="text-xs">
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
            "w-full justify-between",
            !isEnabled && "cursor-not-allowed opacity-50"
          )}
          disabled={!isEnabled}
        >
          <span className="truncate">{getDisplayText()}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search programmes..." 
            disabled={!isEnabled || loading}
          />
          <CommandList>
            {loading && (
              <CommandEmpty>Loading programmes...</CommandEmpty>
            )}
            
            {error && (
              <CommandEmpty>
                <div className="text-center py-4">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Please try again later or contact support.
                  </p>
                </div>
              </CommandEmpty>
            )}
            
            {!loading && !error && programmes.length === 0 && (
              <CommandEmpty>
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No programmes found for this selection.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Try selecting a different degree level.
                  </p>
                </div>
              </CommandEmpty>
            )}
            
            {!loading && !error && programmes.length > 0 && (
              <CommandGroup>
                {programmes.map((programme) => (
                  <CommandItem
                    key={programme.id}
                    value={`${programme.name} ${programme.nameEn || ''} ${programme.discipline || ''}`}
                    onSelect={() => handleSelect(programme.id)}
                    className="p-3"
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === programme.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1">
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
