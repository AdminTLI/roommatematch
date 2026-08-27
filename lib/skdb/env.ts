const DEFAULT_BASE = 'https://api.skdb.nl/v1'

export function getSkdbApiBase(): string {
  const raw = process.env.SKDB_API_BASE || DEFAULT_BASE
  const trimmed = raw.replace(/\/+$/, '')
  if (!trimmed.endsWith('/v1')) {
    return trimmed.endsWith('/v0') ? trimmed.replace(/\/v0$/, '/v1') : `${trimmed}/v1`
  }
  return trimmed
}

/**
 * SKDB portal keys are used as: Authorization: Bearer secret-token:<jwt>
 * Accept either the full `secret-token:…` value or a bare JWT from .env / Vercel.
 */
export function getSkdbApiKey(): string | undefined {
  const raw = process.env.SKDB_API_KEY?.trim()
  if (!raw) return undefined
  if (raw.startsWith('secret-token:')) return raw
  if (raw.startsWith('eyJ')) return `secret-token:${raw}`
  return raw
}
