'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/admin/data-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, Shield } from 'lucide-react'

interface User {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  verification_status: string
  university_name: string
  is_active: boolean
  created_at: string
}

export function AdminUsersContent() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const columns = [
    {
      header: 'Name',
      accessor: (row: User) => `${row.first_name} ${row.last_name || ''}`.trim() || row.email
    },
    {
      header: 'Email',
      accessor: 'email' as const
    },
    {
      header: 'University',
      accessor: (row: User) => row.university_name || 'N/A'
    },
    {
      header: 'Verification',
      accessor: (row: User) => {
        const status = row.verification_status
        const colors: Record<string, string> = {
          verified: 'bg-green-100 text-green-800',
          pending: 'bg-blue-100 text-blue-800',
          failed: 'bg-red-100 text-red-800',
          unverified: 'bg-gray-100 text-gray-800'
        }
        return (
          <Badge className={colors[status] || colors.unverified}>
            {status}
          </Badge>
        )
      }
    },
    {
      header: 'Status',
      accessor: (row: User) => (
        <Badge variant={row.is_active ? 'default' : 'secondary'}>
          {row.is_active ? 'Active' : 'Suspended'}
        </Badge>
      )
    },
    {
      header: 'Created',
      accessor: (row: User) => new Date(row.created_at).toLocaleDateString()
    },
    {
      header: 'Actions',
      accessor: (row: User) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline">View</Button>
          <Button size="sm" variant="outline">Actions</Button>
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
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage users, verification status, and access</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Search and filter users</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users}
            searchKey="email"
            searchPlaceholder="Search by email or name..."
          />
        </CardContent>
      </Card>
    </div>
  )
}

