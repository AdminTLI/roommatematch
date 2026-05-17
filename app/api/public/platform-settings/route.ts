import { NextResponse } from 'next/server'
import { getPlatformSettings, toPublicPlatformSettings } from '@/lib/platform-settings'

/** Public read of maintenance/registration flags and branding (no secrets). */
export async function GET() {
  const settings = await getPlatformSettings()
  return NextResponse.json(toPublicPlatformSettings(settings), {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  })
}
