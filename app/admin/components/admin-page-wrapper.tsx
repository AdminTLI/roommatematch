'use client'

import type { ReactNode } from 'react'
import { AdminHubShell } from './admin-hub-shell'
import type { AdminHubId } from '@/lib/admin/navigation'
import type { CompliancePurpose } from './admin-compliance-strip'

interface AdminPageWrapperProps {
  hub: AdminHubId
  children: ReactNode
  title?: string
  description?: string
  showComplianceStrip?: boolean
  compliancePurpose?: CompliancePurpose
}

export function AdminPageWrapper({
  hub,
  children,
  title,
  description,
  showComplianceStrip,
  compliancePurpose,
}: AdminPageWrapperProps) {
  return (
    <AdminHubShell
      hub={hub}
      title={title}
      description={description}
      showComplianceStrip={showComplianceStrip}
      compliancePurpose={compliancePurpose}
    >
      {children}
    </AdminHubShell>
  )
}
