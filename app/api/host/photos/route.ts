import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireHostProfile } from '@/lib/host/auth'

export async function POST(request: NextRequest) {
  const hostReq = await requireHostProfile()
  if (!hostReq.ok) return NextResponse.json({ error: hostReq.error }, { status: hostReq.status })

  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file required' }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Max 10MB' }, { status: 400 })
  }
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'jpeg/png/webp only' }, { status: 400 })
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${hostReq.userId}/${crypto.randomUUID()}.${ext}`
  const admin = await createAdminClient()
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await admin.storage.from('listing-photos').upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: signed } = await admin.storage
    .from('listing-photos')
    .createSignedUrl(path, 60 * 60 * 24 * 365)

  return NextResponse.json({
    path,
    url: signed?.signedUrl || null,
  })
}
