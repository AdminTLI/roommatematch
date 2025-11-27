'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RefreshCw, Shield, User, UserCog } from 'lucide-react'
import { useIsSuperAdmin } from '@/lib/auth/roles-client'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UserWithRole {
  id: string
  email: string
  role: 'user' | 'admin' | 'super_admin'
  created_at: string
  is_active: boolean
}

export function UserRoleManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const isSuperAdmin = useIsSuperAdmin()

  // Hide component if user is not super admin
  if (!isSuperAdmin) {
    return null
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/roles')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || 'Failed to load users')
      }
    } catch (error) {
      console.error('Failed to load users:', error)
      setError('Failed to load users. Please try again.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
    setUpdatingUserId(userId)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role: newRole,
        }),
      })

      if (response.ok) {
        setSuccess(`Role updated successfully`)
        // Reload users to reflect changes
        await loadUsers(true)
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || 'Failed to update role')
      }
    } catch (error) {
      console.error('Failed to update role:', error)
      setError('Failed to update role. Please try again.')
    } finally {
      setUpdatingUserId(null)
    }
  }

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { className: string; icon: React.ReactNode }> = {
      super_admin: {
        className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
        icon: <Shield className="w-3 h-3 mr-1" />
      },
      admin: {
        className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
        icon: <UserCog className="w-3 h-3 mr-1" />
      },
      user: {
        className: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
        icon: <User className="w-3 h-3 mr-1" />
      },
    }

    const variant = variants[role] || variants.user

    return (
      <Badge className={variant.className}>
        <span className="flex items-center">
          {variant.icon}
          {role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'User'}
        </span>
      </Badge>
    )
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading users...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Role Management
            </CardTitle>
            <CardDescription>
              Assign and manage user roles. Only Super Admins can access this section.
            </CardDescription>
          </div>
          <Button
            onClick={() => loadUsers(true)}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <AlertDescription className="text-green-800 dark:text-green-300">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by email or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="space-y-2">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No users found matching your search.' : 'No users found.'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{user.email}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                        {!user.is_active && (
                          <span className="ml-2 text-red-600">(Inactive)</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(user.role)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        handleRoleChange(user.id, value as 'user' | 'admin' | 'super_admin')
                      }
                      disabled={updatingUserId === user.id}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    {updatingUserId === user.id && (
                      <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 pt-4 border-t">
          <p className="font-semibold mb-1">Role Descriptions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>User:</strong> Default role for all signups. Standard platform access.
            </li>
            <li>
              <strong>Admin:</strong> Limited admin access. Can manage users and content within their assigned scope.
            </li>
            <li>
              <strong>Super Admin:</strong> Full admin control. Can assign roles and access all features.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}


