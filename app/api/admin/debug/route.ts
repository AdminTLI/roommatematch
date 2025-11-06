import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        authError: authError?.message 
      }, { status: 401 })
    }

    // Check admin record
    const { data: adminRecord, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    // Also check all admins to see what's in the table
    const { data: allAdmins, error: allAdminsError } = await supabase
      .from('admins')
      .select('user_id, role, university_id')
      .limit(10)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at
      },
      adminRecord: adminRecord || null,
      adminError: adminError?.message,
      allAdmins: allAdmins || [],
      allAdminsError: allAdminsError?.message,
      isAdmin: !!adminRecord
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

