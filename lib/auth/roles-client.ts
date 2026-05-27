'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { UserRole } from './role-constants'

/**
 * Client-side hook to get current user's role
 * Returns null if user is not authenticated or if role cannot be determined
 */
export function useUserRole(): { role: UserRole | null; isLoading: boolean } {
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchRole() {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setRole(null)
        setIsLoading(false)
        return
      }

      // Fetch role from API endpoint (which will check permissions server-side)
      try {
        let response = await fetch('/api/auth/role')
        if (response.status === 429) {
          await new Promise((resolve) => setTimeout(resolve, 1500))
          response = await fetch('/api/auth/role')
        }
        if (response.ok) {
          const data = await response.json()
          setRole(data.role || 'user')
        } else if (response.status === 401) {
          setRole(null)
        } else {
          // Do not downgrade elevated users on transient errors (e.g. rate limits)
          console.warn('Could not fetch user role:', response.status, response.statusText)
          setRole(null)
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
        setRole(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRole()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { role, isLoading }
}

/**
 * Client-side hook to check if current user is admin (includes super admin)
 */
export function useIsAdmin(): boolean {
  const { role } = useUserRole()
  return role === 'admin' || role === 'super_admin' || role === 'moderator' || role === 'university_admin'
}

/**
 * Client-side hook to check if current user is super admin
 */
export function useIsSuperAdmin(): { isSuperAdmin: boolean; isLoading: boolean } {
  const { role, isLoading } = useUserRole()
  return { isSuperAdmin: role === 'super_admin', isLoading }
}

