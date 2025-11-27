/**
 * Environment Variable Validation
 * Validates critical environment variables at startup to prevent insecure deployments
 */

/**
 * Validate that all critical environment variables are set in production
 * Throws an error if any are missing, preventing the app from starting insecurely
 */
export function validateCriticalEnvVars(): void {
  // Only validate in production or Vercel environments
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV) {
    const missing: string[] = []
    
    // Check for cron secret (either CRON_SECRET or VERCEL_CRON_SECRET)
    const hasCronSecret = !!(process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET)
    if (!hasCronSecret) {
      missing.push('CRON_SECRET or VERCEL_CRON_SECRET')
    }
    
    // Check for CSRF secret
    if (!process.env.CSRF_SECRET) {
      missing.push('CSRF_SECRET')
    }
    
    // Check for admin shared secret
    if (!process.env.ADMIN_SHARED_SECRET) {
      missing.push('ADMIN_SHARED_SECRET')
    }
    
    // Check for Supabase service role key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      missing.push('SUPABASE_SERVICE_ROLE_KEY')
    }
    
    // Check for Supabase URL and anon key (required for app to function)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      missing.push('NEXT_PUBLIC_SUPABASE_URL')
    }
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }
    
    if (missing.length > 0) {
      const errorMessage = [
        `Missing required environment variables in production: ${missing.join(', ')}`,
        '',
        'These secrets are critical for security and application functionality.',
        'Set them in your deployment environment (Vercel, etc.) before deploying.',
        '',
        'Required variables:',
        '  - CRON_SECRET or VERCEL_CRON_SECRET: Secures cron endpoints',
        '  - CSRF_SECRET: Secures CSRF token signing (generate with: openssl rand -hex 32)',
        '  - ADMIN_SHARED_SECRET: Secures admin routes (generate with: openssl rand -hex 32)',
        '  - SUPABASE_SERVICE_ROLE_KEY: Required for service role operations',
        '  - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL',
        '  - NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anonymous key',
        '',
        'The application cannot start without these variables in production.'
      ].join('\n')
      
      throw new Error(errorMessage)
    }
  }
}

/**
 * Validate environment variables at module load time
 * This ensures the app fails fast if critical secrets are missing
 */
validateCriticalEnvVars()


