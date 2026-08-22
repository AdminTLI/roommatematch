'use client'

import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CompliancePurpose = 'safety' | 'support' | 'operations'

const PURPOSE_COPY: Record<CompliancePurpose, string> = {
  safety:
    'Access to personal data on this page is logged for GDPR Art. 30. Purpose: platform safety and content moderation.',
  support:
    'Access to personal data on this page is logged for GDPR Art. 30. Purpose: user support and account administration.',
  operations:
    'Administrative actions on this page are logged for GDPR Art. 30. Purpose: platform operations and compliance.',
}

interface AdminComplianceStripProps {
  purpose?: CompliancePurpose
  className?: string
}

export function AdminComplianceStrip({
  purpose = 'operations',
  className,
}: AdminComplianceStripProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border border-blue-200/60 bg-blue-50/80 px-3 py-2 text-xs text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-100',
        className
      )}
      role="note"
    >
      <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
      <p>{PURPOSE_COPY[purpose]}</p>
    </div>
  )
}
