import { NextResponse } from 'next/server'
import { isDomuLabEnabled } from '@/lib/feature-flags'

export function labDisabledResponse() {
  return NextResponse.json(
    { error: 'Domu Lab is not available' },
    { status: 404 }
  )
}

export function requireDomuLabEnabled(): NextResponse | null {
  if (!isDomuLabEnabled()) {
    return labDisabledResponse()
  }
  return null
}
