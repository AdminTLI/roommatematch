'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/admin/data-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Verification {
  id: string
  user_id: string
  provider: string
  status: string
  review_reason?: string
  created_at: string
  updated_at: string
  profiles: {
    first_name: string
    last_name: string
    email: string
  }
}

export function AdminVerificationsContent() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadVerifications()
  }, [])

  const loadVerifications = async () => {
    try {
      const response = await fetch('/api/admin/verifications')
      if (response.ok) {
        const data = await response.json()
        setVerifications(data.verifications || [])
      }
    } catch (error) {
      console.error('Failed to load verifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOverride = async (verificationId: string, userId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'override',
          verificationId,
          userId,
          status: newStatus
        })
      })

      if (response.ok) {
        loadVerifications()
      }
    } catch (error) {
      console.error('Failed to override verification:', error)
    }
  }

  const columns = [
    {
      header: 'User',
      accessor: (row: Verification) => 
        `${row.profiles?.first_name || ''} ${row.profiles?.last_name || ''}`.trim() || row.profiles?.email || 'Unknown'
    },
    {
      header: 'Provider',
      accessor: (row: Verification) => (
        <Badge variant="outline">{row.provider}</Badge>
      )
    },
    {
      header: 'Status',
      accessor: (row: Verification) => {
        const colors: Record<string, string> = {
          approved: 'bg-green-100 text-green-800',
          pending: 'bg-blue-100 text-blue-800',
          rejected: 'bg-red-100 text-red-800',
          expired: 'bg-gray-100 text-gray-800'
        }
        return (
          <Badge className={colors[row.status] || colors.pending}>
            {row.status}
          </Badge>
        )
      }
    },
    {
      header: 'Reason',
      accessor: (row: Verification) => row.review_reason || '-'
    },
    {
      header: 'Created',
      accessor: (row: Verification) => new Date(row.created_at).toLocaleDateString()
    },
    {
      header: 'Actions',
      accessor: (row: Verification) => (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleOverride(row.id, row.user_id, 'approved')}
          >
            Approve
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleOverride(row.id, row.user_id, 'rejected')}
          >
            Reject
          </Button>
        </div>
      )
    }
  ]

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verification Queue</h1>
        <p className="text-gray-600 dark:text-gray-400">Review and manage identity verifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verifications</CardTitle>
          <CardDescription>Review verification status and override if needed</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={verifications}
            searchKey="user_id"
            searchPlaceholder="Search by user ID..."
          />
        </CardContent>
      </Card>
    </div>
  )
}

