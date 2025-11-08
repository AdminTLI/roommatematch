export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize Sentry on server-side
    try {
      const { initSentry } = await import('@/lib/monitoring/sentry')
      initSentry()
    } catch (error) {
      console.warn('[Instrumentation] Failed to initialize Sentry:', error)
    }
  }
}

