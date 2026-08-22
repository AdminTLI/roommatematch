import { NextRequest, NextResponse } from 'next/server'
import { renderProgrammaticAvatarSvg } from '@/lib/avatars/render-programmatic-avatar'

export async function GET(request: NextRequest) {
  const seed = request.nextUrl.searchParams.get('seed')?.trim() || 'anonymous'
  const safeSeed = seed.slice(0, 200)

  const svg = renderProgrammaticAvatarSvg(safeSeed)

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      // Version query param on client URLs busts caches when avatar styling changes.
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
