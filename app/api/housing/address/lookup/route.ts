import { NextRequest, NextResponse } from 'next/server'
import { lookupPdokAddress } from '@/lib/host/pdok-address'

/** Public PDOK address lookup for housing filters (no host auth required). */
export async function GET(request: NextRequest) {
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
