'use client'

import { memo } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AdminAnalyticsFilters } from '@/lib/admin/analytics-query'
import type { MetricsCohort, MetricsHousing, MetricsOrigin } from '@/lib/admin/metrics-filters'

type Props = {
  filters: AdminAnalyticsFilters
  onChange: (next: AdminAnalyticsFilters) => void
}

export const MetricsFilterBar = memo(function MetricsFilterBar({ filters, onChange }: Props) {
  return (
    <div className="sticky top-0 z-20 -mx-4 md:-mx-6 px-4 md:px-6 py-4 mb-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Cohort Filters</h2>
          <p className="text-xs text-muted-foreground max-w-xl">
            Slice institutional KPIs by study level, student origin, and housing progression. Filters apply to all
            dashboard requests for this view.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5 min-w-[160px]">
            <Label className="text-xs">Study programme</Label>
            <Select
              value={filters.cohort}
              onValueChange={(v) => onChange({ ...filters, cohort: v as MetricsCohort })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Cohort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="bachelor_1">Bachelor · Year 1</SelectItem>
                <SelectItem value="bachelor_2">Bachelor · Year 2</SelectItem>
                <SelectItem value="bachelor_3">Bachelor · Year 3</SelectItem>
                <SelectItem value="masters">Master&apos;s / Pre-master</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 min-w-[160px]">
            <Label className="text-xs">Student origin</Label>
            <Select
              value={filters.origin}
              onValueChange={(v) => onChange({ ...filters, origin: v as MetricsOrigin })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Origin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="domestic">Domestic (NL)</SelectItem>
                <SelectItem value="international">International</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 min-w-[180px]">
            <Label className="text-xs">Housing status</Label>
            <Select
              value={filters.housing}
              onValueChange={(v) => onChange({ ...filters, housing: v as MetricsHousing })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Housing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="looking">Unmatched / looking</SelectItem>
                <SelectItem value="matched">Matched / housed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
})
