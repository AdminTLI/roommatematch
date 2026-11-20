import { NextRequest, NextResponse } from 'next/server'
import { suggestPdokAddresses } from '@/lib/host/pdok-address'

/** Public PDOK address suggest for housing filters (no host auth required). */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || ''
  if (q.trim().length < 3) {
    return NextResponse.json({ suggestions: [] })
  }

  try {
    const suggestions = await suggestPdokAddresses(q)
    return NextResponse.json({ suggestions })
  } catch {
    return NextResponse.json({ error: 'Address search failed' }, { status: 502 })
  }
}
