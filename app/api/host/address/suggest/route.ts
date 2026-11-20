import { NextRequest, NextResponse } from 'next/server'
import { requireHostProfile } from '@/lib/host/auth'
import { suggestPdokAddresses } from '@/lib/host/pdok-address'

export async function GET(request: NextRequest) {
  const hostReq = await requireHostProfile()
  if (!hostReq.ok) return NextResponse.json({ error: hostReq.error }, { status: hostReq.status })

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
