import type { HostProfile } from './types'

/**
 * Host is "verified" for student actions when their email is confirmed.
 * Persona `id_verified` is reserved for a later gate.
 */
export function isHostVerified(
  host: Pick<HostProfile, 'email_verified'> | { email_verified?: boolean | null } | null | undefined
): boolean {
  return Boolean(host?.email_verified)
}

export function getVerificationDeadline(
  host: Pick<HostProfile, 'verification_deadline_at' | 'created_at'> | null | undefined
): Date | null {
  if (!host) return null
  if (host.verification_deadline_at) return new Date(host.verification_deadline_at)
  if (host.created_at) {
    const d = new Date(host.created_at)
    d.setHours(d.getHours() + 24)
    return d
  }
  return null
}

export function verificationCountdownMs(deadline: Date | null): number {
  if (!deadline) return 0
  return Math.max(0, deadline.getTime() - Date.now())
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '0h 0m'
  const totalMin = Math.floor(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h >= 24) {
    const d = Math.floor(h / 24)
    return `${d}d ${h % 24}h`
  }
  return `${h}h ${m}m`
}

export function defaultVerificationDeadline(from = new Date()): string {
  const d = new Date(from)
  d.setHours(d.getHours() + 24)
  return d.toISOString()
}
