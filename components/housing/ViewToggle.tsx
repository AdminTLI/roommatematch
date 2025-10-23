// View Toggle Component
// Toggle between List, Map, and Split views

'use client'

import { Button } from '@/components/ui/button'
import { List, Map, LayoutGrid } from 'lucide-react'
import { ViewMode } from '@/types/housing'
import { cn } from '@/lib/utils'

interface ViewToggleProps {
  value: ViewMode
  onChange: (view: ViewMode) => void
  className?: string
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  const views = [
    { value: 'list' as const, label: 'List', icon: List },
    { value: 'map' as const, label: 'Map', icon: Map },
    { value: 'split' as const, label: 'Split', icon: LayoutGrid }
  ]

  return (
    <div className={cn('flex rounded-lg border border-gray-200 p-1', className)}>
      {views.map((view) => {
        const Icon = view.icon
        const isActive = value === view.value
        
        return (
          <Button
            key={view.value}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onChange(view.value)}
            className={cn(
              'flex items-center gap-2',
              isActive 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{view.label}</span>
          </Button>
        )
      })}
    </div>
  )
}
