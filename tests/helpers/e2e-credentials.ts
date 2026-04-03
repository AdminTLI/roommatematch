/**
 * E2E credentials come from .env.local / .env.test (loaded in playwright.config.ts).
 * Never commit real addresses or passwords.
 */
export function getE2eTestPassword(): string {
  const p = process.env.E2E_TEST_PASSWORD
  if (!p) {
    throw new Error(
      'E2E_TEST_PASSWORD is not set. Add it to .env.local or .env.test (see env.example).'
    )
  }
  return p
}

export function getE2eTestEmail(): string {
  const e = process.env.E2E_TEST_EMAIL
  if (!e) {
    throw new Error(
      'E2E_TEST_EMAIL is not set. Add it to .env.local or .env.test (see env.example).'
    )
  }
  return e
}

/** Second account for multi-user realtime tests; optional override for user A. */
export function getE2eRealtimeUserAEmail(): string {
  return process.env.E2E_REALTIME_USER_A_EMAIL ?? getE2eTestEmail()
}
