import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const EMAIL_CHANGE_DISABLED_MESSAGE =
  'Email cannot be changed in the app. Please contact support at domumatch@gmail.com to update your account email.'

export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: EMAIL_CHANGE_DISABLED_MESSAGE }, { status: 403 })
}
