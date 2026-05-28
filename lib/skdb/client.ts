/**
 * Studiekeuzedatabase API V1 client.
 * @see https://portal.skdb.nl/documentatie/
 */

import { getSkdbApiBase, getSkdbApiKey } from './env'
import { SkdbApiAuthError } from './errors'
import { validateSkdbSyncConfig } from './validate-config'

export { getSkdbApiBase, getSkdbApiKey } from './env'

export type SkdbInstelling = {
  instellingSkdb: number
  instellingNaam?: string
  instellingCode?: string
}

export type SkdbOpleidingVorm = {
  eindeOpleidingDatum?: string | null
  taalCodes?: string[] | string | null
  talen?: string[] | string | null
  onderwijstaal?: string | null
}

export type SkdbOpleiding = {
  instellingSkdb?: number
  instellingNaam?: string
  instellingCode?: string
  opleidingNaam?: string
  opleidingNaamEngels?: string
  rioNaamEngels?: string
  opleidingCode?: string | number
  crohoCode?: string | number
  graad?: string
  soortHo?: string
  studieLastEcts?: string | number | null
  lcskSector?: string
  lcskCluster?: string
  vormen?: SkdbOpleidingVorm[]
  talen?: string[] | string | null
  taalCodes?: string[] | string | null
  onderwijstaal?: string | null
  wettelijkeVooropleidingEisenVwo?: string
  wettelijkeAanvullendeEisenVwo?: string
  wettelijkeVooropleidingEisenHavo?: string
  wettelijkeAanvullendeEisenHavo?: string
  toelatingsEisenMbo?: string
  [key: string]: unknown
}

function authHeaders(): HeadersInit {
  const key = getSkdbApiKey()
  if (!key) {
    throw new Error('SKDB_API_KEY must be set for API mode')
  }
  return {
    Authorization: `Bearer ${key}`,
    Accept: 'application/json',
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  const base = getSkdbApiBase()
  const res = await fetch(`${base}${path.startsWith('/') ? path : `/${path}`}`, {
    headers: authHeaders(),
  })
  if (!res.ok) {
    if (res.status === 401) {
      const validation = validateSkdbSyncConfig()
      const hints =
        validation.ok === false
          ? validation.hints
          : [
              'Verify SKDB_API_KEY in .env.local matches the portal token.',
              'Request or renew access: https://portal.skdb.nl/aanvraag-toegang-skdb/',
            ]
      throw new SkdbApiAuthError(
        `SKDB API request failed (${path}): 401 Authorization Required`,
        hints
      )
    }
    throw new Error(`SKDB API request failed (${path}): ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export async function fetchInstellingen(): Promise<SkdbInstelling[]> {
  const data = await fetchJson<SkdbInstelling[]>('/instellingen')
  return Array.isArray(data) ? data : []
}

export async function fetchOpleidingen(): Promise<SkdbOpleiding[]> {
  const data = await fetchJson<SkdbOpleiding[]>('/opleidingen')
  return Array.isArray(data) ? data : []
}

export function buildInstellingNaamMap(
  instellingen: SkdbInstelling[]
): Map<number, string> {
  const map = new Map<number, string>()
  for (const inst of instellingen) {
    if (typeof inst?.instellingSkdb === 'number') {
      map.set(
        inst.instellingSkdb,
        inst.instellingNaam || `Instelling ${inst.instellingSkdb}`
      )
    }
  }
  return map
}
