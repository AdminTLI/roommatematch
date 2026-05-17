'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'

export type HealthStatus = 'online' | 'degraded' | 'offline'

export interface ServiceHealth {
  status: HealthStatus
  responseTime: number
  statusReason: string
  lastCheck: string
  error?: string
  details?: Record<string, unknown>
  consecutiveSlowCount?: number
  consecutiveHealthyCount?: number
  latencyThresholdMs?: number
}

export interface SystemHealthData {
  overall: {
    status: HealthStatus
    lastCheck: string
    summary: {
      online: number
      degraded: number
      offline: number
      total: number
    }
  }
  services: {
    database: ServiceHealth
    authentication: ServiceHealth
    matchingEngine: ServiceHealth
    fileStorage: ServiceHealth
  }
}

const SERVICE_ROWS: {
  key: keyof SystemHealthData['services']
  label: string
}[] = [
  { key: 'database', label: 'Database' },
  { key: 'authentication', label: 'Admin session / Auth API' },
  { key: 'matchingEngine', label: 'Matching engine' },
  { key: 'fileStorage', label: 'File storage' },
]

function statusBadgeClass(status: HealthStatus): string {
  const variants = {
    online: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    degraded: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    offline: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  }
  return variants[status]
}

function statusLabel(status: HealthStatus): string {
  if (status === 'online') return 'Online'
  if (status === 'degraded') return 'Degraded'
  return 'Offline'
}

function ServiceRow({
  label,
  service,
}: {
  label: string
  service: ServiceHealth
}) {
  const [open, setOpen] = useState(service.status !== 'online')
  const hasDetails =
    service.status !== 'online' ||
    !!service.error ||
    !!service.details ||
    !!service.statusReason

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-900/40 rounded-md px-1 -mx-1"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {hasDetails && (
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                />
              )}
              <span className="text-sm text-gray-600 dark:text-muted-foreground truncate">
                {label}
              </span>
              {service.responseTime > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                  ({service.responseTime}ms)
                </span>
              )}
            </div>
            <Badge variant="default" className={statusBadgeClass(service.status)}>
              {statusLabel(service.status)}
            </Badge>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="pb-3 pl-6 pr-1 space-y-2 text-sm">
            <p className="text-gray-700 dark:text-gray-300">
              {service.statusReason || service.error || 'No additional details'}
            </p>
            {service.latencyThresholdMs != null && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Latency threshold: {service.latencyThresholdMs}ms
                {service.consecutiveSlowCount != null &&
                  service.consecutiveSlowCount > 0 &&
                  ` · Slow checks: ${service.consecutiveSlowCount}`}
                {service.consecutiveHealthyCount != null &&
                  service.status !== 'online' &&
                  ` · Recovery checks: ${service.consecutiveHealthyCount}`}
              </p>
            )}
            {service.error && (
              <p className="text-xs text-red-600 dark:text-red-400">{service.error}</p>
            )}
            {service.details && Object.keys(service.details).length > 0 && (
              <pre className="text-xs bg-gray-100 dark:bg-gray-900 rounded p-2 overflow-x-auto text-gray-600 dark:text-gray-400">
                {JSON.stringify(service.details, null, 2)}
              </pre>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

interface SystemStatusPanelProps {
  systemHealth: SystemHealthData | null
  isLoading?: boolean
  showLogsLink?: boolean
  compact?: boolean
}

export function SystemStatusPanel({
  systemHealth,
  isLoading = false,
  showLogsLink = true,
}: SystemStatusPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (!systemHealth) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">Unable to load system status</p>
    )
  }

  const overallLabel =
    systemHealth.overall.status === 'online'
      ? 'All Systems Operational'
      : systemHealth.overall.status === 'degraded'
        ? 'Some Issues Detected'
        : 'System Offline'

  return (
    <div className="space-y-2">
      {systemHealth.overall.status !== 'online' && showLogsLink && (
        <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2 text-sm text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-2">
          <span>{overallLabel}</span>
          <Link
            href="/admin/logs"
            className="font-medium underline underline-offset-2 hover:no-underline"
          >
            View full log →
          </Link>
        </div>
      )}

      {SERVICE_ROWS.map(({ key, label }) => (
        <ServiceRow key={key} label={label} service={systemHealth.services[key]} />
      ))}

      <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t dark:border-gray-700">
        Last checked: {new Date(systemHealth.overall.lastCheck).toLocaleString()}
      </p>
    </div>
  )
}
