'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/admin/data-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { UserDetailDialog } from './user-detail-dialog'
import { UserActionsDropdown } from './user-actions-dropdown'
import { UserFilters } from './user-filters'

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

interface FilterOptions {
  emailDomains: string[]
  verificationStatuses: string[]
  accountStatuses: string[]
  createdMonths: string[]
  universities: Array<{ id: string; name: string }>
}

export function AdminUsersContent() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [filters, setFilters] = useState<FilterOptions | null>(null)
  const [selectedFilters, setSelectedFilters] = useState({
    emailDomains: [] as string[],
    verificationStatuses: [] as string[],
    accountStatuses: [] as string[],
    createdMonths: [] as string[],
    universityIds: [] as string[],
  })

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    // Reload users when filters change (skip initial load)
    if (filters !== null) {
      loadUsers(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilters])

  const buildFilterParams = () => {
    const params = new URLSearchParams()
    
    if (selectedFilters.emailDomains.length > 0) {
      params.append('email_domains', selectedFilters.emailDomains.join(','))
    }
    if (selectedFilters.verificationStatuses.length > 0) {
      params.append('verification_statuses', selectedFilters.verificationStatuses.join(','))
    }
    if (selectedFilters.accountStatuses.length > 0) {
      params.append('account_statuses', selectedFilters.accountStatuses.join(','))
    }
    if (selectedFilters.createdMonths.length > 0) {
      params.append('created_months', selectedFilters.createdMonths.join(','))
    }
    if (selectedFilters.universityIds.length > 0) {
      params.append('university_ids', selectedFilters.universityIds.join(','))
    }
    
    // Always include filter metadata
    params.append('include_filters', 'true')
    
    return params.toString()
  }

  const loadUsers = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    
    try {
      const filterParams = buildFilterParams()
      const url = `/api/admin/users${filterParams ? `?${filterParams}` : '?include_filters=true'}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        
        // Update filter options if provided
        if (data.filters) {
          setFilters(data.filters)
        }
      } else {
        console.error('Failed to load users:', response.statusText)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadUsers(true)
  }

  const columns = [
    {
      header: 'Name',
      accessor: (row: User) => `${row.first_name} ${row.last_name || ''}`.trim() || row.email,
      tooltip: 'The user\'s full name (first name and last name). If no name is provided, the email address is shown instead.'
    },
    {
      header: 'Email',
      accessor: 'email' as const,
      tooltip: 'The user\'s email address used for account registration and login.'
    },
    {
      header: 'University',
      accessor: (row: User) => row.university_name || 'N/A',
      tooltip: 'The university or educational institution the user selected during the questionnaire. This data comes from the user_academic table (filled from questionnaire responses). Shows "N/A" if the user has not completed the questionnaire or selected a university.'
    },
    {
      header: 'Verification',
      accessor: (row: User) => {
        const status = row.verification_status
        const colors: Record<string, string> = {
          verified: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
          pending: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
          failed: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
          unverified: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
        }
        return (
          <Badge className={colors[status] || colors.unverified}>
            {status}
          </Badge>
        )
      },
      tooltip: 'Identity verification status: "verified" means the user has successfully completed identity verification, "pending" means verification is in progress, "failed" means verification was rejected, and "unverified" means the user has not yet started the verification process.'
    },
    {
      header: 'Status',
      accessor: (row: User) => {
        // Only show Suspended if is_active is explicitly false
        // If undefined/null, assume active (since they can log in)
        const isSuspended = row.is_active === false
        return (
          <Badge variant={isSuspended ? 'secondary' : 'default'}>
            {isSuspended ? 'Suspended' : 'Active'}
          </Badge>
        )
      },
      tooltip: 'Account status: "Active" means the user can log in and use the platform normally. "Suspended" means the account has been temporarily or permanently disabled by an administrator and the user cannot access the platform. Note: If a user can log in, their status will always be Active.'
    },
    {
      header: 'Created',
      accessor: (row: User) => new Date(row.created_at).toLocaleDateString(),
      tooltip: 'The date when the user account was first created in the system.'
    },
    {
      header: 'Actions',
      accessor: (row: User) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedUserId(row.user_id)
              setIsViewDialogOpen(true)
            }}
          >
            View
          </Button>
          <UserActionsDropdown
            userId={row.user_id}
            isActive={row.is_active !== false}
            verificationStatus={row.verification_status}
            onActionComplete={loadUsers}
          />
        </div>
      ),
      tooltip: 'Available actions for this user: "View" opens the user\'s profile details, and "Actions" provides options to suspend, activate, verify, or delete the user account.'
    }
  ]

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage users, verification status, and access</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRefresh} 
            disabled={isLoading || isRefreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {filters && (
        <UserFilters
          filters={filters}
          selectedFilters={selectedFilters}
          onFiltersChange={setSelectedFilters}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Search and filter users. Universities are fetched from questionnaire data (user_academic table).</CardDescription>
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

      {selectedUserId && (
        <UserDetailDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          userId={selectedUserId}
        />
      )}
    </div>
  )
}



