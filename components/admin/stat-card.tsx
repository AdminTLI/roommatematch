import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ADMIN_HELPER_TEXT, ADMIN_STAT_LABEL_CLASS } from '@/lib/admin/ui'

interface AdminStatCardProps {
  label: string
  value: ReactNode
  hint?: string
  valueClassName?: string
}

export function AdminStatCard({ label, value, hint, valueClassName }: AdminStatCardProps) {
  return (
    <Card>
      <CardContent className="flex min-h-[7rem] flex-col justify-center p-6">
        <div className={ADMIN_STAT_LABEL_CLASS}>{label}</div>
        <div
          className={cn(
            'mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-text-primary',
            valueClassName
          )}
        >
          {value}
        </div>
        {hint ? <p className={`mt-1 ${ADMIN_HELPER_TEXT}`}>{hint}</p> : null}
      </CardContent>
    </Card>
  )
}
