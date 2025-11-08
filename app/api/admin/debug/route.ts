import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'

/**
 * Debug endpoint - should be disabled in production
 * Only returns minimal info to authenticated admin, no enumeration
 */
export async function GET(request: NextRequest) {
  // Disable in production for security
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoint disabled in production' },
      { status: 404 }
    )
  }

  try {
    const adminCheck = await requireAdmin(request, false)
    
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: adminCheck.error || 'Admin access required' },
        { status: adminCheck.status }
      )
    }

    const { user, adminRecord } = adminCheck

    // Only return info about the current admin, no enumeration
    return NextResponse.json({
      isAdmin: true,
      role: adminRecord?.role,
      universityId: adminRecord?.university_id
      // Do not return user ID, email, or other admins
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Debug check failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

