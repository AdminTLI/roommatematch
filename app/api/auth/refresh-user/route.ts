import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  // Get fresh user data (getUser() validates the session server-side)
  // Using getUser() instead of getSession() for security - it authenticates with Supabase Auth server
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return NextResponse.json({ 
      error: 'No active session or failed to get user data' 
    }, { status: 401 })
  }
  
  return NextResponse.json({ 
    user: {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at
    }
  })
}
