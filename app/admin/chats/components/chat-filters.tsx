'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Filter } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface FilterOptions {
  types: string[]
  createdMonths: string[]
}

interface ChatFiltersProps {
  filters: FilterOptions | null
  selectedFilters: {
    types: string[]
    createdMonths: string[]
  }
  onFiltersChange: (filters: ChatFiltersProps['selectedFilters']) => void
}

export function ChatFilters({
  filters,
  selectedFilters,
  onFiltersChange,
}: ChatFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (
    filterType: keyof ChatFiltersProps['selectedFilters'],
    value: string,
    checked: boolean
  ) => {
    const current = selectedFilters[filterType]
    const updated = checked
      ? [...current, value]
      : current.filter((v) => v !== value)
    
    onFiltersChange({
      ...selectedFilters,
      [filterType]: updated,
    })
  }

  const clearFilter = (filterType: keyof ChatFiltersProps['selectedFilters']) => {
    onFiltersChange({
      ...selectedFilters,
      [filterType]: [],
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      types: [],
      createdMonths: [],
    })
  }

  const getActiveFilterCount = () => {
    return (
      selectedFilters.types.length +
      selectedFilters.createdMonths.length
    )
  }

  const activeCount = getActiveFilterCount()

  if (!filters) {
    return null
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 max-h-[80vh] overflow-y-auto" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filters</h3>
              {activeCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-auto py-1 text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Type Filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Type</label>
                {selectedFilters.types.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('types')}
                    className="h-auto py-0 px-1 text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {filters.types.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={selectedFilters.types.includes(type)}
                      onCheckedChange={(checked) =>
                        updateFilter('types', type, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`type-${type}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Created Date Filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Created Date (MM/YY)</label>
                {selectedFilters.createdMonths.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('createdMonths')}
                    className="h-auto py-0 px-1 text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {filters.createdMonths.map((month) => (
                  <div key={month} className="flex items-center space-x-2">
                    <Checkbox
                      id={`created-${month}`}
                      checked={selectedFilters.createdMonths.includes(month)}
                      onCheckedChange={(checked) =>
                        updateFilter('createdMonths', month, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`created-${month}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {month}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      {activeCount > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {selectedFilters.types.map((type) => (
            <Badge key={`type-${type}`} variant="secondary" className="gap-1">
              {type}
              <button
                onClick={() => updateFilter('types', type, false)}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedFilters.createdMonths.map((month) => (
            <Badge key={`created-${month}`} variant="secondary" className="gap-1">
              {month}
              <button
                onClick={() => updateFilter('createdMonths', month, false)}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}


