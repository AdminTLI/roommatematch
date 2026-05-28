import { existsSync } from 'fs'
import { resolve } from 'path'
import { getSkdbApiBase, getSkdbApiKey } from './env'

const PLACEHOLDER_KEY_PATTERNS = [
  /^your_skdb_api_key/i,
  /^your[_-]?api[_-]?key/i,
  /^changeme/i,
  /^replace[_-]?me/i,
  /^xxx+$/i,
  /^todo$/i,
]

export function isPlaceholderSkdbApiKey(key: string | undefined): boolean {
  if (!key || key.length < 8) return true
  return PLACEHOLDER_KEY_PATTERNS.some((p) => p.test(key))
}

/** SKDB portal tokens are JWTs: header.payload.signature (three dot-separated parts). */
export function isTruncatedSkdbApiKey(key: string | undefined): boolean {
  if (!key || !key.startsWith('eyJ')) return false
  const parts = key.split('.')
  if (parts.length !== 3) return true
  if (parts.some((p) => !p || p.length < 10)) return true
  return false
}

export function describeSkdbApiKeyIssue(key: string | undefined): string | null {
  if (!key) return 'SKDB_API_KEY is not set in .env.local.'
  if (isPlaceholderSkdbApiKey(key)) {
    return 'SKDB_API_KEY looks like a placeholder, not a real portal token.'
  }
  if (isTruncatedSkdbApiKey(key)) {
    const parts = key.split('.').length
    return `SKDB_API_KEY appears truncated (JWT should have 3 dot-separated parts, found ${parts}). Copy the full token from the portal in one go.`
  }
  return null
}

export type SkdbDataSource = 'dump' | 'api'

export type SkdbConfigValidation =
  | {
      ok: true
      source: SkdbDataSource
      dumpPath?: string
      apiBase: string
    }
  | {
      ok: false
      message: string
      hints: string[]
    }

/**
 * Resolve whether sync should use dump or API, with actionable errors when misconfigured.
 */
export function validateSkdbSyncConfig(): SkdbConfigValidation {
  const apiBase = getSkdbApiBase()
  const apiKey = getSkdbApiKey()
  const dumpPathRaw = process.env.SKDB_DUMP_PATH?.trim()
  const dumpPath = dumpPathRaw ? resolve(process.cwd(), dumpPathRaw) : undefined
  const dumpExists = dumpPath ? existsSync(dumpPath) : false
  const apiKeyUsable =
    apiKey && !isPlaceholderSkdbApiKey(apiKey) && !isTruncatedSkdbApiKey(apiKey)

  if (dumpPath && dumpExists) {
    return { ok: true, source: 'dump', dumpPath, apiBase }
  }

  if (apiKeyUsable) {
    if (dumpPath && !dumpExists) {
      console.warn(
        `⚠️  SKDB_DUMP_PATH is set but file not found: ${dumpPath}\n   Falling back to API mode.`
      )
    }
    return { ok: true, source: 'api', apiBase }
  }

  const hints: string[] = []

  if (dumpPath && !dumpExists) {
    hints.push(
      `Download a CSV/XLSX export from https://portal.skdb.nl/ and save it to ${dumpPath}, or update SKDB_DUMP_PATH.`
    )
  }

  if (!apiKey) {
    hints.push(
      'Set SKDB_API_KEY in .env.local with the token from the Studiekeuzedatabase portal (https://portal.skdb.nl/).'
    )
  } else if (isPlaceholderSkdbApiKey(apiKey)) {
    hints.push(
      'SKDB_API_KEY looks like a placeholder. Replace it with your real API token from https://portal.skdb.nl/ (Account → API key).'
    )
    hints.push(
      'Request access if needed: https://portal.skdb.nl/aanvraag-toegang-skdb/ (accounts are valid for one year).'
    )
  } else if (isTruncatedSkdbApiKey(apiKey)) {
    hints.push(
      'Your token looks cut off. In the portal, copy the entire API key (a long string with two dots, like xxxxx.yyyyy.zzzzz).'
    )
    hints.push(
      'Paste it on a single line in .env.local: SKDB_API_KEY=paste-here-with-no-quotes-or-line-breaks'
    )
    hints.push(
      'Typical SKDB JWT length is 300+ characters; yours is shorter than expected.'
    )
  } else {
    hints.push(
      'If the full token still returns 401, renew access: https://portal.skdb.nl/aanvraag-toegang-skdb/ (accounts expire after one year).'
    )
  }

  hints.push('Alternatively, use dump mode: SKDB_DUMP_PATH=./data/skdb-opleidingen.csv (see SKDB_DUMP_SETUP.md).')
  hints.push(`Use API V1 base URL: SKDB_API_BASE=${apiBase}`)

  let message = 'SKDB is not configured for sync.'
  const keyIssue = describeSkdbApiKeyIssue(apiKey)
  if (keyIssue && isTruncatedSkdbApiKey(apiKey)) {
    message = `SKDB API key is incomplete: ${keyIssue}`
  } else if (keyIssue && isPlaceholderSkdbApiKey(apiKey)) {
    message = `SKDB API returned 401 because SKDB_API_KEY is still a placeholder value in .env.local.`
  } else if (apiKey) {
    message =
      'SKDB API authentication failed. Your SKDB_API_KEY may be expired or invalid (portal accounts expire after one year).'
  }

  return { ok: false, message, hints }
}
