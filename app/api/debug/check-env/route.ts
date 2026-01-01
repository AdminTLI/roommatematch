import { NextResponse } from 'next/server'

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  return NextResponse.json({
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV,
    // Persona environment check
    personaEnvironmentId: process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID || 'NOT SET (using fallback)',
    personaTemplateId: process.env.NEXT_PUBLIC_PERSONA_TEMPLATE_ID || 'NOT SET (using fallback)',
    hasPersonaApiKey: !!process.env.PERSONA_API_KEY,
    personaApiUrl: process.env.PERSONA_API_URL || 'https://withpersona.com/api/v1'
  })
}
