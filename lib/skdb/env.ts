const DEFAULT_BASE = 'https://api.skdb.nl/v1'

export function getSkdbApiBase(): string {
  const raw = process.env.SKDB_API_BASE || DEFAULT_BASE
  const trimmed = raw.replace(/\/+$/, '')
  if (!trimmed.endsWith('/v1')) {
    return trimmed.endsWith('/v0') ? trimmed.replace(/\/v0$/, '/v1') : `${trimmed}/v1`
  }
  return trimmed
}

export function getSkdbApiKey(): string | undefined {
  return process.env.SKDB_API_KEY?.trim() || undefined
}
