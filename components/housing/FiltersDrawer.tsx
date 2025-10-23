// Filters Drawer Component
// Right-side drawer with comprehensive filter options

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Euro, MapPin, Calendar, Home, Users, Shield } from 'lucide-react'
import { FiltersState } from '@/types/housing'

interface FiltersDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: FiltersState
  onFiltersChange: (filters: FiltersState) => void
}

export function FiltersDrawer({
  open,
  onOpenChange,
  filters,
  onFiltersChange
}: FiltersDrawerProps) {
  const [localFilters, setLocalFilters] = useState<FiltersState>(filters)

  const handleApply = () => {
    onFiltersChange(localFilters)
    onOpenChange(false)
  }

  const handleClear = () => {
    const clearedFilters: FiltersState = {
      sort: 'best',
      view: 'split',
      page: 1
    }
    setLocalFilters(clearedFilters)
  }

  const handleReset = () => {
    setLocalFilters(filters)
  }

  const updateFilter = (key: keyof FiltersState, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleArrayFilter = (key: keyof FiltersState, value: any) => {
    const currentArray = (localFilters[key] as any[]) || []
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    updateFilter(key, newArray)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Filter Listings
          </SheetTitle>
          <SheetDescription>
            Refine your search to find the perfect place
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Price Range (€/month)
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="priceMin" className="text-xs text-gray-500">Min</Label>
                <Input
                  id="priceMin"
                  type="number"
                  placeholder="0"
                  value={localFilters.priceMin || ''}
                  onChange={(e) => updateFilter('priceMin', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
              <div>
                <Label htmlFor="priceMax" className="text-xs text-gray-500">Max</Label>
                <Input
                  id="priceMax"
                  type="number"
                  placeholder="2000"
                  value={localFilters.priceMax || ''}
                  onChange={(e) => updateFilter('priceMax', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g., Amsterdam"
                  value={localFilters.city || ''}
                  onChange={(e) => updateFilter('city', e.target.value || undefined)}
                />
              </div>
              <div>
                <Label htmlFor="radius">Radius (km)</Label>
                <Slider
                  value={[localFilters.radiusKm || 5]}
                  onValueChange={([value]) => updateFilter('radiusKm', value)}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 text-center">
                  {localFilters.radiusKm || 5} km
                </div>
              </div>
            </div>
          </div>

          {/* Move-in Date */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Move-in Date
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="moveInFrom" className="text-xs text-gray-500">From</Label>
                <Input
                  id="moveInFrom"
                  type="date"
                  value={localFilters.moveInFrom || ''}
                  onChange={(e) => updateFilter('moveInFrom', e.target.value || undefined)}
                />
              </div>
              <div>
                <Label htmlFor="moveInTo" className="text-xs text-gray-500">To</Label>
                <Input
                  id="moveInTo"
                  type="date"
                  value={localFilters.moveInTo || ''}
                  onChange={(e) => updateFilter('moveInTo', e.target.value || undefined)}
                />
              </div>
            </div>
          </div>

          {/* Lease Length */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Lease Length</Label>
            <div className="flex flex-wrap gap-2">
              {[3, 6, 12, 24].map(months => (
                <Badge
                  key={months}
                  variant={localFilters.leaseMonths?.includes(months) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayFilter('leaseMonths', months)}
                >
                  {months} months
                </Badge>
              ))}
            </div>
          </div>

          {/* Room Types */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Home className="h-4 w-4" />
              Room Type
            </Label>
            <div className="space-y-2">
              {[
                { value: 'room', label: 'Private Room' },
                { value: 'studio', label: 'Studio' },
                { value: 'apartment', label: 'Entire Apartment' }
              ].map(roomType => (
                <div key={roomType.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={roomType.value}
                    checked={localFilters.roomTypes?.includes(roomType.value as any) || false}
                    onCheckedChange={(checked) => 
                      checked 
                        ? toggleArrayFilter('roomTypes', roomType.value)
                        : toggleArrayFilter('roomTypes', roomType.value)
                    }
                  />
                  <Label htmlFor={roomType.value} className="text-sm">
                    {roomType.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Amenities</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'wifi', 'heating', 'washing_machine', 'dishwasher',
                'garden', 'balcony', 'elevator', 'parking'
              ].map(amenity => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={localFilters.accessibility?.includes(amenity as any) || false}
                    onCheckedChange={(checked) => 
                      checked 
                        ? toggleArrayFilter('accessibility', amenity)
                        : toggleArrayFilter('accessibility', amenity)
                    }
                  />
                  <Label htmlFor={amenity} className="text-xs capitalize">
                    {amenity.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* University Verified */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="universityVerified"
                checked={localFilters.universityVerifiedOnly || false}
                onCheckedChange={(checked) => updateFilter('universityVerifiedOnly', checked)}
              />
              <Label htmlFor="universityVerified" className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                University-Verified Only
              </Label>
            </div>
          </div>

          {/* Compatibility */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Compatibility
            </Label>
            <div>
              <Label htmlFor="minCompatibility">Minimum Compatibility</Label>
              <Slider
                value={[localFilters.minCompatibility || 70]}
                onValueChange={([value]) => updateFilter('minCompatibility', value)}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">
                {localFilters.minCompatibility || 70}% match
              </div>
            </div>
          </div>

          {/* Lifestyle */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Lifestyle</Label>
            <div className="space-y-2">
              <div>
                <Label htmlFor="quietHours">Quiet Hours</Label>
                <Select
                  value={localFilters.quietHours || ''}
                  onValueChange={(value) => updateFilter('quietHours', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strict">Strict (22:00-08:00)</SelectItem>
                    <SelectItem value="normal">Normal (23:00-07:00)</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="cleanlinessLevel">Cleanliness Level</Label>
                <Select
                  value={localFilters.cleanlinessLevel?.toString() || ''}
                  onValueChange={(value) => updateFilter('cleanlinessLevel', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Very relaxed</SelectItem>
                    <SelectItem value="2">Relaxed</SelectItem>
                    <SelectItem value="3">Moderate</SelectItem>
                    <SelectItem value="4">Strict</SelectItem>
                    <SelectItem value="5">Very strict</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-6 border-t">
          <Button variant="outline" onClick={handleClear} className="flex-1">
            Clear All
          </Button>
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Reset
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
