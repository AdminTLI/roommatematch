import { NextRequest, NextResponse } from 'next/server'
import { requireHostProfile } from '@/lib/host/auth'
import { lookupPdokAddress } from '@/lib/host/pdok-address'

export async function GET(request: NextRequest) {
  const hostReq = await requireHostProfile()
  if (!hostReq.ok) return NextResponse.json({ error: hostReq.error }, { status: hostReq.status })

  const id = request.nextUrl.searchParams.get('id') || ''
  if (!id.trim()) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  try {
    const address = await lookupPdokAddress(id)
    if (!address) return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    return NextResponse.json({ address })
  } catch {
    return NextResponse.json({ error: 'Address lookup failed' }, { status: 502 })
  }
}
