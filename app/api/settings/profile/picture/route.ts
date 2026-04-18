import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_BYTES = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }

  const mime = file.type || 'application/octet-stream'
  if (!ALLOWED.has(mime)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, or WebP images are allowed.' }, { status: 400 })
  }

  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg'
  const objectPath = `${user.id}/profile.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const admin = createAdminClient()
  const { error: uploadError } = await admin.storage.from('secure_profile_pics').upload(objectPath, buffer, {
    contentType: mime,
    upsert: true,
  })

  if (uploadError) {
    const msg = uploadError.message || 'Upload failed'
    const bucketMissing = /bucket not found/i.test(msg)
    return NextResponse.json(
      {
        error: bucketMissing
          ? 'Storage bucket "secure_profile_pics" is missing. Apply db/migrations/202604181530_secure_profile_pics_bucket.sql (or supabase/migrations/202604181430_progressive_disclosure_and_secure_photos.sql) on your Supabase project, then retry.'
          : msg,
      },
      { status: bucketMissing ? 503 : 500 }
    )
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ profile_picture_url: objectPath, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  const { data: signed } = await admin.storage.from('secure_profile_pics').createSignedUrl(objectPath, 3600)

  return NextResponse.json({
    ok: true,
    path: objectPath,
    preview_signed_url: signed?.signedUrl ?? null,
  })
}
