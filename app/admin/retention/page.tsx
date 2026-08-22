'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RETENTION_POLICIES } from '@/lib/privacy/retention-policies'
import { AdminPageWrapper } from '../components/admin-page-wrapper'
import { Clock } from 'lucide-react'

export default function AdminRetentionPage() {
  const [lastCronRun, setLastCronRun] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/ops-log?service=data-retention&limit=1')
      .then((r) => r.json())
      .then((data) => {
        const event = data.events?.[0]
        if (event?.created_at) setLastCronRun(event.created_at)
      })
      .catch(() => {})
  }, [])

  return (
    <AdminPageWrapper
      hub="system"
      title="Data Retention Policies"
      description="Read-only view of configured retention periods and legal basis."
      showComplianceStrip
      compliancePurpose="operations"
    >
      <div className="space-y-6">
        {lastCronRun && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Last retention cron run
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{new Date(lastCronRun).toLocaleString()}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {RETENTION_POLICIES.map((policy) => (
            <Card key={policy.dataType}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2 text-base">
                  <span>{policy.dataType.replace(/_/g, ' ')}</span>
                  <Badge variant="outline">{policy.retentionDays} days</Badge>
                </CardTitle>
                <CardDescription>{policy.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Legal basis:</span> {policy.legalBasis}
                </p>
                {policy.exceptions && policy.exceptions.length > 0 && (
                  <ul className="list-disc pl-5 text-muted-foreground">
                    {policy.exceptions.map((ex) => (
                      <li key={ex}>{ex}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminPageWrapper>
  )
}
