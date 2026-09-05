'use client'

import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RefreshCw } from 'lucide-react'
import { ADMIN_FIELD_CLASS, ADMIN_LABEL_CLASS } from '@/lib/admin/ui'
import type { AdminAnalyticsFilters } from '@/lib/admin/analytics-query'
import type { MetricsCohort, MetricsHousing, MetricsOrigin } from '@/lib/admin/metrics-filters'
import { AdminUniversityScopeBar } from './admin-university-scope-bar'

type Props = {
  isPlatformSuper: boolean
  universityOptions: Array<{ id: string; name: string }>
  selectedUniversityId: string | null
  onUniversityChange: (id: string | null) => void
  lockedUniversityName?: string | null
  filters: AdminAnalyticsFilters
  onFiltersChange: (next: AdminAnalyticsFilters) => void
  onRefresh: () => void
  isRefreshing: boolean
  canRefresh: boolean
}

export const MetricsToolbar = memo(function MetricsToolbar({
  isPlatformSuper,
  universityOptions,
  selectedUniversityId,
  onUniversityChange,
  lockedUniversityName,
  filters,
  onFiltersChange,
  onRefresh,
  isRefreshing,
  canRefresh,
}: Props) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex min-w-0 flex-1 flex-wrap items-end gap-4">
        <AdminUniversityScopeBar
          isPlatformSuper={isPlatformSuper}
          universityOptions={universityOptions}
          selectedUniversityId={selectedUniversityId}
          onUniversityChange={onUniversityChange}
          lockedUniversityName={lockedUniversityName}
        />
        <div className="space-y-1.5 min-w-[160px]">
          <Label className={ADMIN_LABEL_CLASS}>Study programme</Label>
          <Select
            value={filters.cohort}
            onValueChange={(v) => onFiltersChange({ ...filters, cohort: v as MetricsCohort })}
          >
            <SelectTrigger className={ADMIN_FIELD_CLASS}>
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
          <Label className={ADMIN_LABEL_CLASS}>Student origin</Label>
          <Select
            value={filters.origin}
            onValueChange={(v) => onFiltersChange({ ...filters, origin: v as MetricsOrigin })}
          >
            <SelectTrigger className={ADMIN_FIELD_CLASS}>
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
          <Label className={ADMIN_LABEL_CLASS}>Housing status</Label>
          <Select
            value={filters.housing}
            onValueChange={(v) => onFiltersChange({ ...filters, housing: v as MetricsHousing })}
          >
            <SelectTrigger className={ADMIN_FIELD_CLASS}>
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
      <Button
        onClick={onRefresh}
        variant="outline"
        disabled={isRefreshing || !canRefresh}
        className="shrink-0 gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  )
})
