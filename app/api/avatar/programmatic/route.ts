import { NextRequest, NextResponse } from 'next/server'
import { createAvatar } from '@dicebear/core'
import * as avataaars from '@dicebear/avataaars-neutral'

export async function GET(request: NextRequest) {
  const seed = request.nextUrl.searchParams.get('seed')?.trim() || 'anonymous'
  const safeSeed = seed.slice(0, 200)

  const svg = createAvatar(avataaars, {
    seed: safeSeed,
    size: 128,
  }).toString()

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  })
}
