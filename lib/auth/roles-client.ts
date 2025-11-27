'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { UserRole } from './roles'

/**
 * Client-side hook to get current user's role
 * Returns null if user is not authenticated or if role cannot be determined
 */
export function useUserRole(): UserRole | null {
  const [role, setRole] = useState<UserRole | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setRole(null)
        return
      }

      // Fetch role from API endpoint (which will check permissions server-side)
      try {
        const response = await fetch('/api/auth/role')
        if (response.ok) {
          const data = await response.json()
          setRole(data.role || 'user')
        } else {
          setRole('user') // Default to user if API fails
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
        setRole('user') // Default to user on error
      }
    }

    fetchRole()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return role
}

/**
 * Client-side hook to check if current user is admin (includes super admin)
 */
export function useIsAdmin(): boolean {
  const role = useUserRole()
  return role === 'admin' || role === 'super_admin'
}

/**
 * Client-side hook to check if current user is super admin
 */
export function useIsSuperAdmin(): boolean {
  const role = useUserRole()
  return role === 'super_admin'
}

