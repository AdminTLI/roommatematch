// Client Sentry bootstrap — keep @sentry/nextjs off the critical path.
// The SDK is dynamically imported only after idle, and only when consent exists.

type RouterTransitionArgs = Parameters<
  typeof import('@sentry/nextjs').captureRouterTransitionStart
>

let captureRouterTransitionStart:
  | ((...args: RouterTransitionArgs) => void)
  | null = null

export function onRouterTransitionStart(...args: RouterTransitionArgs) {
  captureRouterTransitionStart?.(...args)
}

function scheduleSentryBootstrap() {
  if (typeof window === 'undefined') return

  const boot = () => {
    void import('@/lib/privacy/sentry-consent-client')
      .then(async (mod) => {
        const active = await mod.installSentryConsentListener()
        if (!active) return
        const Sentry = await import('@sentry/nextjs')
        captureRouterTransitionStart = Sentry.captureRouterTransitionStart
      })
      .catch(() => {
        // Non-fatal: monitoring must not break page load
      })
  }

  const ric = window.requestIdleCallback
  if (typeof ric === 'function') {
    ric(() => boot(), { timeout: 4000 })
  } else {
    window.setTimeout(boot, 2500)
  }
}

scheduleSentryBootstrap()
