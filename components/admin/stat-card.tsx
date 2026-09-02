import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ADMIN_STAT_LABEL_CLASS } from '@/lib/admin/ui'

interface AdminStatCardProps {
  label: string
  value: ReactNode
  valueClassName?: string
}

export function AdminStatCard({ label, value, valueClassName }: AdminStatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className={ADMIN_STAT_LABEL_CLASS}>{label}</div>
        <div
          className={cn(
            'mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-text-primary',
            valueClassName
          )}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  )
}
