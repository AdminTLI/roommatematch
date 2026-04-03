const STORAGE_KEY = 'auth_intentional_sign_out'

/** Call immediately before `signOut()` so session listeners can ignore the resulting `SIGNED_OUT` event. */
export function markIntentionalSignOut(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // private mode / quota
  }
}

/** Returns true if the flag was set (and clears it). */
export function consumeIntentionalSignOutFlag(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      sessionStorage.removeItem(STORAGE_KEY)
      return true
    }
  } catch {
    // ignore
  }
  return false
}
