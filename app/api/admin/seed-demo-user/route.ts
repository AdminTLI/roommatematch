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
  if (userFound) {
    return NextResponse.json({ status: 'exists', userId: userFound.id })
  }

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ status: 'created', userId: created.user?.id })
}


