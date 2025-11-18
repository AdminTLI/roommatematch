'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Filter } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface FilterOptions {
  emailDomains: string[]
  verificationStatuses: string[]
  accountStatuses: string[]
  createdMonths: string[]
  universities: Array<{ id: string; name: string }>
}

interface UserFiltersProps {
  filters: FilterOptions | null
  selectedFilters: {
    emailDomains: string[]
    verificationStatuses: string[]
    accountStatuses: string[]
    createdMonths: string[]
    universityIds: string[]
  }
  onFiltersChange: (filters: UserFiltersProps['selectedFilters']) => void
}

export function UserFilters({
  filters,
  selectedFilters,
  onFiltersChange,
}: UserFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (
    filterType: keyof UserFiltersProps['selectedFilters'],
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

  const clearFilter = (filterType: keyof UserFiltersProps['selectedFilters']) => {
    onFiltersChange({
      ...selectedFilters,
      [filterType]: [],
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      emailDomains: [],
      verificationStatuses: [],
      accountStatuses: [],
      createdMonths: [],
      universityIds: [],
    })
  }

  const getActiveFilterCount = () => {
    return (
      selectedFilters.emailDomains.length +
      selectedFilters.verificationStatuses.length +
      selectedFilters.accountStatuses.length +
      selectedFilters.createdMonths.length +
      selectedFilters.universityIds.length
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

            {/* Email Domain Filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Email Domain</label>
                {selectedFilters.emailDomains.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('emailDomains')}
                    className="h-auto py-0 px-1 text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {filters.emailDomains.map((domain) => (
                  <div key={domain} className="flex items-center space-x-2">
                    <Checkbox
                      id={`email-${domain}`}
                      checked={selectedFilters.emailDomains.includes(domain)}
                      onCheckedChange={(checked) =>
                        updateFilter('emailDomains', domain, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`email-${domain}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      @{domain}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Status Filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Verification Status</label>
                {selectedFilters.verificationStatuses.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('verificationStatuses')}
                    className="h-auto py-0 px-1 text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {filters.verificationStatuses.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`verification-${status}`}
                      checked={selectedFilters.verificationStatuses.includes(status)}
                      onCheckedChange={(checked) =>
                        updateFilter('verificationStatuses', status, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`verification-${status}`}
                      className="text-sm cursor-pointer flex-1 capitalize"
                    >
                      {status}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Status Filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Account Status</label>
                {selectedFilters.accountStatuses.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('accountStatuses')}
                    className="h-auto py-0 px-1 text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {filters.accountStatuses.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`account-${status}`}
                      checked={selectedFilters.accountStatuses.includes(status)}
                      onCheckedChange={(checked) =>
                        updateFilter('accountStatuses', status, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`account-${status}`}
                      className="text-sm cursor-pointer flex-1 capitalize"
                    >
                      {status}
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

            {/* University Filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">University</label>
                {selectedFilters.universityIds.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('universityIds')}
                    className="h-auto py-0 px-1 text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {filters.universities.map((university) => (
                  <div key={university.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`university-${university.id}`}
                      checked={selectedFilters.universityIds.includes(university.id)}
                      onCheckedChange={(checked) =>
                        updateFilter('universityIds', university.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`university-${university.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {university.name}
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
          {selectedFilters.emailDomains.map((domain) => (
            <Badge key={`email-${domain}`} variant="secondary" className="gap-1">
              @{domain}
              <button
                onClick={() => updateFilter('emailDomains', domain, false)}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedFilters.verificationStatuses.map((status) => (
            <Badge key={`verification-${status}`} variant="secondary" className="gap-1">
              {status}
              <button
                onClick={() => updateFilter('verificationStatuses', status, false)}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedFilters.accountStatuses.map((status) => (
            <Badge key={`account-${status}`} variant="secondary" className="gap-1">
              {status}
              <button
                onClick={() => updateFilter('accountStatuses', status, false)}
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
          {selectedFilters.universityIds.map((universityId) => {
            const university = filters.universities.find((u) => u.id === universityId)
            return (
              <Badge key={`university-${universityId}`} variant="secondary" className="gap-1">
                {university?.name || universityId}
                <button
                  onClick={() => updateFilter('universityIds', universityId, false)}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}

