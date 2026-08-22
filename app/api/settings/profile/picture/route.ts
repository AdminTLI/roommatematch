import { NextRequest, NextResponse } from 'next/server'
import { signedProfilePictureUrl } from '@/lib/avatars/resolve-user-avatar'
import { createAdminClient, createClient } from '@/lib/supabase/server'

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_BYTES = 5 * 1024 * 1024

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('profile_picture_url')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  const path = profile?.profile_picture_url?.trim()
  if (!path) {
    return NextResponse.json({ preview_signed_url: null, path: null })
  }

  const previewSignedUrl = await signedProfilePictureUrl(path)
  return NextResponse.json({
    preview_signed_url: previewSignedUrl,
    path,
  })
}

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

  const previewSignedUrl = await signedProfilePictureUrl(objectPath)

  return NextResponse.json({
    ok: true,
    path: objectPath,
    preview_signed_url: previewSignedUrl,
  })
}

export async function DELETE() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('profile_picture_url')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  const path = profile?.profile_picture_url?.trim()
  if (path) {
    const { error: removeError } = await admin.storage.from('secure_profile_pics').remove([path])
    if (removeError) {
      console.warn('[profile/picture DELETE] storage remove failed:', removeError.message)
    }
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ profile_picture_url: null, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
