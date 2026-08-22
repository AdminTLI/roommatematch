'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react'
import { AdminPageWrapper } from '../../components/admin-page-wrapper'
import { getDaysUntilDeadline, isRequestOverdue } from '@/lib/privacy/dsar-utils'

interface DSARRequest {
  id: string
  user_id: string
  request_type: string
  status: string
  requested_at: string
  sla_deadline: string
  completed_at?: string
  admin_notes?: string
  processing_metadata?: Record<string, unknown>
}

export default function AdminDsarDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [request, setRequest] = useState<DSARRequest | null>(null)
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const loadRequest = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/dsar/${id}`)
      if (!response.ok) throw new Error('Failed to load request')
      const data = await response.json()
      setRequest(data.request)
      setNotes(data.request.admin_notes || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load request')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadRequest()
  }, [id])

  const updateStatus = async (status: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/dsar/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: notes }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to update request')
      }
      const data = await response.json()
      setRequest(data.request)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update request')
    } finally {
      setIsUpdating(false)
    }
  }

  const saveNotes = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/dsar/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: notes }),
      })
      if (!response.ok) throw new Error('Failed to save notes')
      const data = await response.json()
      setRequest(data.request)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notes')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <AdminPageWrapper
      hub="system"
      title="DSAR Request Detail"
      description="Process data subject access requests within the 30-day SLA."
      showComplianceStrip
      compliancePurpose="operations"
    >
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/admin/dsar')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to DSAR list
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Loading…</div>
        ) : request ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  Request {request.id.slice(0, 8)}…
                  <Badge>{request.status}</Badge>
                  <Badge variant="outline">{request.request_type}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p><strong>User ID:</strong> {request.user_id}</p>
                <p><strong>Requested:</strong> {new Date(request.requested_at).toLocaleString()}</p>
                <p><strong>SLA deadline:</strong> {new Date(request.sla_deadline).toLocaleString()}</p>
                <p className={isRequestOverdue(request.sla_deadline) ? 'text-destructive font-medium' : ''}>
                  {isRequestOverdue(request.sla_deadline)
                    ? `${Math.abs(getDaysUntilDeadline(request.sla_deadline))} days overdue`
                    : `${getDaysUntilDeadline(request.sla_deadline)} days remaining`}
                </p>
                {request.completed_at && (
                  <p><strong>Completed:</strong> {new Date(request.completed_at).toLocaleString()}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notes">Processing notes (internal)</Label>
                  <Textarea
                    id="notes"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={saveNotes} disabled={isUpdating}>
                  Save notes
                </Button>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              {request.status === 'pending' && (
                <Button onClick={() => updateStatus('in_progress')} disabled={isUpdating}>
                  <Clock className="h-4 w-4 mr-2" />
                  Start processing
                </Button>
              )}
              {request.status === 'in_progress' && (
                <>
                  <Button onClick={() => updateStatus('completed')} disabled={isUpdating}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark completed
                  </Button>
                  <Button variant="destructive" onClick={() => updateStatus('rejected')} disabled={isUpdating}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-muted-foreground">Request not found</div>
        )}
      </div>
    </AdminPageWrapper>
  )
}
