'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

interface UserDetail {
  user: {
    id: string
    email: string
    email_confirmed_at: string | null
    created_at: string
    last_sign_in_at: string | null
    is_active: boolean
  }
  profile: {
    first_name: string
    last_name: string
    verification_status: string
    phone: string | null
    bio: string | null
    created_at: string
  } | null
  academic: {
    university_id: string
    universities: {
      name: string
      slug: string
    } | null
    programs: {
      name: string
      name_en: string | null
      degree_level: string
    } | null
    study_start_year: number | null
    study_start_month: number | null
    expected_graduation_year: number | null
  } | null
  stats: {
    matches: number
    chats: number
  }
}

interface UserDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export function UserDetailDialog({ open, onOpenChange, userId }: UserDetailDialogProps) {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && userId) {
      loadUserDetail()
    } else {
      setUserDetail(null)
      setError(null)
    }
  }, [open, userId])

  const loadUserDetail = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to load user details')
      }
      
      const data = await response.json()
      setUserDetail(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user details')
      console.error('Failed to load user details:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Complete information about this user account
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {!isLoading && !error && userDetail && (
          <div className="space-y-6">
            {/* User Account Info */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-medium">{userDetail.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">User ID</p>
                  <p className="font-mono text-xs">{userDetail.user.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Account Status</p>
                  <Badge variant={userDetail.user.is_active ? 'default' : 'secondary'}>
                    {userDetail.user.is_active ? 'Active' : 'Suspended'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email Verified</p>
                  <Badge variant={userDetail.user.email_confirmed_at ? 'default' : 'secondary'}>
                    {userDetail.user.email_confirmed_at ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Created At</p>
                  <p className="text-sm">
                    {new Date(userDetail.user.created_at).toLocaleString()}
                  </p>
                </div>
                {userDetail.user.last_sign_in_at && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last Sign In</p>
                    <p className="text-sm">
                      {new Date(userDetail.user.last_sign_in_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Information */}
            {userDetail.profile && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Profile Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                    <p className="font-medium">
                      {userDetail.profile.first_name} {userDetail.profile.last_name || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Verification Status</p>
                    <Badge
                      className={
                        userDetail.profile.verification_status === 'verified'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : userDetail.profile.verification_status === 'pending'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          : userDetail.profile.verification_status === 'failed'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                      }
                    >
                      {userDetail.profile.verification_status}
                    </Badge>
                  </div>
                  {userDetail.profile.phone && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                      <p className="text-sm">{userDetail.profile.phone}</p>
                    </div>
                  )}
                  {userDetail.profile.bio && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Bio</p>
                      <p className="text-sm">{userDetail.profile.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Academic Information */}
            {userDetail.academic && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Academic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  {userDetail.academic.universities && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">University</p>
                      <p className="font-medium">{userDetail.academic.universities.name}</p>
                    </div>
                  )}
                  {userDetail.academic.programs && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Program</p>
                      <p className="text-sm">
                        {userDetail.academic.programs.name_en || userDetail.academic.programs.name}
                        {' '}
                        <span className="text-gray-500">
                          ({userDetail.academic.programs.degree_level})
                        </span>
                      </p>
                    </div>
                  )}
                  {userDetail.academic.study_start_year && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Study Start</p>
                      <p className="text-sm">
                        {userDetail.academic.study_start_month
                          ? `${userDetail.academic.study_start_month}/${userDetail.academic.study_start_year}`
                          : userDetail.academic.study_start_year}
                      </p>
                    </div>
                  )}
                  {userDetail.academic.expected_graduation_year && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Expected Graduation</p>
                      <p className="text-sm">{userDetail.academic.expected_graduation_year}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Statistics */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Matches</p>
                  <p className="text-2xl font-bold">{userDetail.stats.matches}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Chats</p>
                  <p className="text-2xl font-bold">{userDetail.stats.chats}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}


