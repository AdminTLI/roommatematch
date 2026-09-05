import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ADMIN_CARD_TITLE, ADMIN_HELPER_TEXT, ADMIN_SECTION_GAP, ADMIN_SECTION_TITLE } from '@/lib/admin/ui'

export function MetricsSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section>
      <h2 className={ADMIN_SECTION_TITLE}>{title}</h2>
      <div className={ADMIN_SECTION_GAP}>{children}</div>
    </section>
  )
}

export function MetricsChartCard({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader className={actions ? 'flex flex-row items-start justify-between space-y-0' : undefined}>
        <div>
          <CardTitle className={ADMIN_CARD_TITLE}>{title}</CardTitle>
          {description ? <CardDescription className="mt-1">{description}</CardDescription> : null}
        </div>
        {actions}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function MetricsListRow({
  label,
  value,
  meta,
  mono,
}: {
  label: string
  value: string
  meta?: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 px-4 py-3">
      <span className={`min-w-0 truncate text-sm text-gray-900 dark:text-gray-100 ${mono ? 'font-mono' : ''}`}>
        {label}
      </span>
      <div className="shrink-0 text-right">
        <span className="text-sm font-medium tabular-nums">{value}</span>
        {meta ? <span className={`ml-2 ${ADMIN_HELPER_TEXT}`}>{meta}</span> : null}
      </div>
    </div>
  )
}
