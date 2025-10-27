import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminRecord } = await supabase
      .from('admins')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!adminRecord) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('[Admin] Manually triggering match computation for all users')
    
    // Get all active users with profiles and vectors
    const { data: users } = await supabase
      .from('users')
      .select(`
        id,
        profiles!inner(user_id, university_id),
        user_vectors!inner(user_id, vector)
      `)
      .eq('is_active', true)

    if (!users || users.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No users found for matching',
        processed: 0 
      })
    }

    let processed = 0
    const errors: string[] = []

    // Process each user
    for (const userRecord of users) {
      try {
        await supabase.rpc('compute_matches', {
          target_user_id: userRecord.id
        })
        processed++
        console.log(`[Admin] Processed matches for user ${userRecord.id}`)
      } catch (error) {
        const errorMsg = `Failed to compute matches for user ${userRecord.id}: ${error}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Match computation completed`,
      processed,
      total: users.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('[Admin] Manual match trigger failed:', error)
    return NextResponse.json(
      { 
        error: 'Match computation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
