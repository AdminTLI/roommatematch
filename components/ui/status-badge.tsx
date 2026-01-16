'use client'

import { Badge } from '@/components/ui/badge'
import { getHousingStatus, type HousingStatusKey } from '@/lib/constants/housing-status'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  statusKey: HousingStatusKey
  className?: string
  variant?: 'default' | 'secondary' | 'outline'
}

export function StatusBadge({ statusKey, className, variant = 'secondary' }: StatusBadgeProps) {
  const status = getHousingStatus(statusKey)
  
  if (!status) {
    return null
  }

  return (
    <Badge
      variant={variant}
      className={cn('inline-flex items-center gap-1.5', className)}
    >
      <span className="text-sm" aria-hidden="true">{status.emoji}</span>
      <span>{status.label}</span>
    </Badge>
  )
}

interface StatusBadgeListProps {
  statusKeys: HousingStatusKey[]
  className?: string
  variant?: 'default' | 'secondary' | 'outline'
}

export function StatusBadgeList({ statusKeys, className, variant = 'secondary' }: StatusBadgeListProps) {
  if (!statusKeys || statusKeys.length === 0) {
    return null
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {statusKeys.map((key) => (
        <StatusBadge key={key} statusKey={key} variant={variant} />
      ))}
    </div>
  )
}
