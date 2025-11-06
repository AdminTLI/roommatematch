import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userIds, chatId } = await request.json()
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'userIds array is required' }, { status: 400 })
    }

    // Verify user has access to this chat if chatId is provided
    if (chatId) {
      const { data: membership } = await supabase
        .from('chat_members')
        .select('id')
        .eq('chat_id', chatId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (!membership) {
        return NextResponse.json({ error: 'Not a member of this chat' }, { status: 403 })
      }
    }

    // Use admin client to fetch profiles (bypasses RLS)
    const admin = await createAdminClient()
    const { data: profiles, error: profilesError } = await admin
      .from('profiles')
      .select('user_id, first_name, last_name, avatar_url')
      .in('user_id', userIds)

    if (profilesError) {
      console.error('Failed to fetch profiles:', profilesError)
      return NextResponse.json(
        { error: `Failed to fetch profiles: ${profilesError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ profiles: profiles || [] })
  } catch (error) {
    console.error('Error fetching chat profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}

