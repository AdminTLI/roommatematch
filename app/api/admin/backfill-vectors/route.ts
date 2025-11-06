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

    console.log('[Admin] Starting vector backfill for all users with responses')
    
    // Get all users with responses
    const { data: usersWithResponses, error: usersError } = await supabase
      .from('responses')
      .select('user_id')
      .order('user_id')

    if (usersError) {
      throw new Error(`Failed to fetch users with responses: ${usersError.message}`)
    }

    if (!usersWithResponses || usersWithResponses.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No users with responses found',
        processed: 0 
      })
    }

    // Get unique user IDs
    const uniqueUserIds = Array.from(new Set(usersWithResponses.map(r => r.user_id)))
    console.log(`[Admin] Found ${uniqueUserIds.length} unique users with responses`)

    let processed = 0
    let skipped = 0
    const errors: string[] = []

    // Process each user
    for (const userId of uniqueUserIds) {
      try {
        // Check if vector already exists and is non-zero
        const { data: existingVector } = await supabase
          .from('user_vectors')
          .select('vector')
          .eq('user_id', userId)
          .single()

        if (existingVector?.vector && Array.isArray(existingVector.vector)) {
          const magnitude = Math.sqrt(existingVector.vector.reduce((sum: number, v: number) => sum + v * v, 0))
          if (magnitude > 0) {
            skipped++
            continue
          }
        }

        // Generate vector
        const { error: vectorError } = await supabase.rpc('compute_user_vector_and_store', { 
          p_user_id: userId 
        })
        
        if (vectorError) {
          const errorMsg = `Failed to generate vector for user ${userId}: ${vectorError.message}`
          console.error(errorMsg)
          errors.push(errorMsg)
        } else {
          processed++
          if (processed % 10 === 0) {
            console.log(`[Admin] Processed ${processed}/${uniqueUserIds.length} users`)
          }
        }
      } catch (error) {
        const errorMsg = `Error processing user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Vector backfill completed`,
      processed,
      skipped,
      total: uniqueUserIds.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined // Limit error output
    })

  } catch (error) {
    console.error('[Admin] Vector backfill failed:', error)
    return NextResponse.json(
      { 
        error: 'Vector backfill failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

