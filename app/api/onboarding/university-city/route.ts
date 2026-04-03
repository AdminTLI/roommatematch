import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { assertSupabaseRestProjectUrl } from '@/lib/supabase/assert-rest-project-url'

export const revalidate = 3600

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  assertSupabaseRestProjectUrl(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL')

  const { searchParams } = new URL(request.url)
  const universityId = searchParams.get('universityId')
  const slug = searchParams.get('slug')

  if (!universityId && !slug) {
    return NextResponse.json(
      { error: 'Missing query param: universityId or slug is required' },
      { status: 400 }
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const query = supabase.from('universities').select('id, slug, city').eq('is_active', true).limit(1)
  const { data, error } = universityId
    ? await query.eq('id', universityId).maybeSingle()
    : await query.eq('slug', slug as string).maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Failed to load university city' }, { status: 500 })
  }

  if (!data) {
    const res = NextResponse.json({ id: null, slug: null, city: null }, { status: 200 })
    res.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
    return res
  }

  const res = NextResponse.json(
    {
      id: data.id ?? null,
      slug: data.slug ?? null,
      city: data.city ?? null,
    },
    { status: 200 }
  )
  res.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
  return res
}
