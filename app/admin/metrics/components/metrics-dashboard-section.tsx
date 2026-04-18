'use client'

import { memo, type ReactNode } from 'react'

type Variant = 'cohort' | 'engagement'

const variantStyles: Record<
  Variant,
  { bar: string; badge: string; title: string; description: string }
> = {
  cohort: {
    bar: 'bg-primary',
    badge: 'bg-primary/10 text-primary border-primary/20',
    title: 'University Cohort',
    description: 'text-muted-foreground',
  },
  engagement: {
    bar: 'bg-muted-foreground/50',
    badge: 'bg-muted/80 text-foreground border-border',
    title: 'Engagement & Journeys',
    description: 'text-muted-foreground',
  },
}

type Props = {
  variant: Variant
  title: string
  description: string
  children: ReactNode
}

export const MetricsDashboardSection = memo(function MetricsDashboardSection({
  variant,
  title,
  description,
  children,
}: Props) {
  const v = variantStyles[variant]
  return (
    <section className="relative rounded-xl border border-border/70 bg-card/40 overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${v.bar}`} aria-hidden />
      <div className="pl-5 pr-4 pt-5 pb-1 md:pl-6 md:pr-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <p
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${v.badge}`}
            >
              {v.title}
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">{title}</h2>
            <p className={`mt-1 max-w-3xl text-sm leading-relaxed ${v.description}`}>{description}</p>
          </div>
        </div>
      </div>
      <div className="space-y-6 md:space-y-8 px-4 pb-6 pt-4 md:px-6 md:pb-8">{children}</div>
    </section>
  )
})
