import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/roles'

/**
 * API endpoint to get current user's role
 * Only returns role if user is authenticated
 * Role information is not exposed to non-admins in other contexts
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's role
  const role = await getUserRole(user.id)

  return NextResponse.json({ role })
}












