// This file configures the initialization of Sentry on the client.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { installSentryConsentListener } from '@/lib/privacy/sentry-consent-client'

// Consent-aware init: starts immediately if already consented, and re-syncs
// on `consent-changed` without requiring a full page reload.
installSentryConsentListener()

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
