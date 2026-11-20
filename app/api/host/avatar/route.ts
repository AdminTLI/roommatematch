import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireHostProfile } from '@/lib/host/auth'
import { resolveHostAvatarUrl } from '@/lib/housing/photos'

export async function POST(request: NextRequest) {
  const hostReq = await requireHostProfile()
  if (!hostReq.ok) return NextResponse.json({ error: hostReq.error }, { status: hostReq.status })

  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file required' }, { status: 400 })
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Max 5MB' }, { status: 400 })
  }
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'jpeg/png/webp only' }, { status: 400 })
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `host-avatars/${hostReq.userId}/${crypto.randomUUID()}.${ext}`
  const admin = await createAdminClient()
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await admin.storage.from('listing-photos').upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  })
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const previousPath = hostReq.host.avatar_path
  const { data, error } = await admin
    .from('host_profiles')
    .update({
      avatar_path: path,
      updated_at: new Date().toISOString(),
    })
    .eq('id', hostReq.host.id)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Best-effort cleanup of the previous avatar object
  if (previousPath && previousPath !== path) {
    await admin.storage.from('listing-photos').remove([previousPath]).catch(() => null)
  }

  const url = await resolveHostAvatarUrl(path)
  return NextResponse.json({ host: data, path, url })
}

export async function DELETE() {
  const hostReq = await requireHostProfile()
  if (!hostReq.ok) return NextResponse.json({ error: hostReq.error }, { status: hostReq.status })

  const previousPath = hostReq.host.avatar_path
  const admin = await createAdminClient()
  const { data, error } = await admin
    .from('host_profiles')
    .update({
      avatar_path: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', hostReq.host.id)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (previousPath) {
    await admin.storage.from('listing-photos').remove([previousPath]).catch(() => null)
  }

  return NextResponse.json({ host: data })
}
