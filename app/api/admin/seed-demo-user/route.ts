import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const seedToken = request.headers.get('x-seed-token')
  if (!seedToken || seedToken !== process.env.ADMIN_SEED_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceRoleKey || !url) {
    return NextResponse.json({ error: 'Missing Supabase env vars' }, { status: 500 })
  }

  const admin = createClient(url, serviceRoleKey)

  const email = 'demo@account.com'
  const password = 'Testing123'

  // Check if exists
  const { data: existing, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 100
  })
  if (listErr) {
    return NextResponse.json({ error: listErr.message }, { status: 500 })
  }
  const userFound = existing.users.find(u => u.email?.toLowerCase() === email)
  let userId: string | undefined
  
  if (userFound) {
    userId = userFound.id
  } else {
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    userId = created.user?.id
  }

  if (!userId) {
    return NextResponse.json({ error: 'Failed to get user ID' }, { status: 500 })
  }

  // Ensure profile exists with verified status
  await admin
    .from('profiles')
    .upsert({
      user_id: userId,
      university_id: '550e8400-e29b-41d4-a716-446655440001', // UvA
      first_name: 'Demo',
      degree_level: 'bachelor',
      program: 'Computer Science',
      campus: 'Science Park',
      languages: ['en', 'nl'],
      verification_status: 'verified'
    }, {
      onConflict: 'user_id'
    })

  // Ensure verification record exists (fully verified with Persona)
  const { data: existingVerification } = await admin
    .from('verifications')
    .select('id')
    .eq('user_id', userId)
    .eq('provider', 'persona')
    .maybeSingle()

  if (existingVerification) {
    // Update existing verification
    await admin
      .from('verifications')
      .update({
        status: 'approved',
        provider_data: {
          inquiry_id: `demo-inquiry-${userId}`,
          persona_status: 'approved',
          demo_account: true
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', existingVerification.id)
  } else {
    // Create new verification
    await admin
      .from('verifications')
      .insert({
        user_id: userId,
        provider: 'persona',
        provider_session_id: `demo-verification-${userId}`,
        status: 'approved',
        provider_data: {
          inquiry_id: `demo-inquiry-${userId}`,
          persona_status: 'approved',
          demo_account: true
        }
      })
  }

  return NextResponse.json({ 
    status: userFound ? 'exists' : 'created', 
    userId,
    verified: true
  })
}


