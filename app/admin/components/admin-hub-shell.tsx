'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import {
  ADMIN_HUBS,
  resolveAdminHub,
  type AdminHubId,
} from '@/lib/admin/navigation'
import { AdminSectionTabs, type TabBadgeCounts } from './admin-section-tabs'
import { AdminComplianceStrip, type CompliancePurpose } from './admin-compliance-strip'

interface AdminHubShellProps {
  children: ReactNode
  hub?: AdminHubId
  title?: string
  description?: string
  actions?: ReactNode
  showComplianceStrip?: boolean
  compliancePurpose?: CompliancePurpose
  tabBadgeCounts?: TabBadgeCounts
  hideTabs?: boolean
}

export function AdminHubShell({
  children,
  hub: hubOverride,
  title,
  description,
  actions,
  showComplianceStrip = false,
  compliancePurpose = 'operations',
  tabBadgeCounts,
  hideTabs = false,
}: AdminHubShellProps) {
  const pathname = usePathname()
  const hub = hubOverride ?? resolveAdminHub(pathname)
  const hubDef = ADMIN_HUBS.find((h) => h.id === hub) ?? ADMIN_HUBS[0]
  const displayTitle = title ?? hubDef.label
  const displayDescription = description ?? hubDef.description

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {displayTitle}
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">{displayDescription}</p>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>

      {showComplianceStrip && (
        <AdminComplianceStrip purpose={compliancePurpose} />
      )}

      {!hideTabs && hub !== 'overview' && (
        <AdminSectionTabs
          hub={hub as Exclude<AdminHubId, 'overview'>}
          badgeCounts={tabBadgeCounts}
        />
      )}

      <div>{children}</div>
    </div>
  )
}
