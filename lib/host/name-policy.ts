/**
 * Host display / company name policy:
 * - Domu Match (and lookalikes) are hard-blocked for non-official hosts
 * - Known housing agencies/orgs require admin identity approval before going live
 */

export type HostNameDecision =
  | { ok: true; kind: 'clear' }
  | { ok: false; kind: 'brand_blocked'; message: string }
  | {
      ok: true
      kind: 'needs_review'
      matchedOrg: string
      message: string
    }

const DOMU_BRAND_COMPACT = 'domumatch'

/** Compact alphanumeric form for fuzzy brand checks. */
export function normalizeHostNameKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

/** Soft token form: "Domu-Match NL" → "domu match nl" */
export function normalizeHostNameTokens(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 0; i < a.length; i++) {
    let prev = i
    row[0] = i + 1
    for (let j = 0; j < b.length; j++) {
      const cur = row[j + 1]
      const cost = a[i] === b[j] ? 0 : 1
      row[j + 1] = Math.min(row[j + 1] + 1, row[j] + 1, prev + cost)
      prev = cur
    }
  }
  return row[b.length]
}

/** Official Domu host accounts that may use the brand name. */
export function isOfficialDomuHostUser(userId: string | null | undefined): boolean {
  if (!userId) return false
  const fromEnv = (process.env.DOMU_OFFICIAL_HOST_USER_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const defaults = [
    // Domu Match demo / official listing host
    '2763f0a1-91fd-482c-81ed-f830327b2c2c',
  ]
  return new Set([...defaults, ...fromEnv]).has(userId)
}

export function isDomuBrandName(value: string): boolean {
  const compact = normalizeHostNameKey(value)
  const tokens = normalizeHostNameTokens(value)
  if (!compact) return false

  if (compact.includes(DOMU_BRAND_COMPACT)) return true
  if (/\bdomu\b/.test(tokens) && /\bmatch\b/.test(tokens)) return true
  // Close typos: domumatc, domuatch, d0mumatch, etc.
  if (compact.length >= 6 && levenshtein(compact, DOMU_BRAND_COMPACT) <= 2) return true
  // "Domu Housing", "Team Domu", "Official Domu"
  if (
    compact === 'domu' ||
    compact.startsWith('domu') && compact.length <= 14 && !compact.includes('domotica')
  ) {
    // Allow unrelated words that merely contain the letters; require token boundary
    if (/\bdomu\b/.test(tokens)) return true
  }
  return false
}

export function namesMatchProtectedOrg(
  value: string,
  orgNames: Array<{ name: string; normalized_name?: string | null }>
): string | null {
  const compact = normalizeHostNameKey(value)
  const tokens = normalizeHostNameTokens(value)
  if (!compact || compact.length < 3) return null

  for (const org of orgNames) {
    const orgCompact =
      (org.normalized_name || '').trim() || normalizeHostNameKey(org.name)
    if (!orgCompact || orgCompact.length < 3) continue

    if (compact === orgCompact) return org.name
    // Claim contains the org name as a clear substring (e.g. "Kamernet Breda")
    if (orgCompact.length >= 5 && compact.includes(orgCompact)) return org.name
    // Org name contains the claim only when the claim is almost the full org name
    if (orgCompact.length >= 5 && orgCompact.includes(compact)) {
      const shorter = Math.min(compact.length, orgCompact.length)
      const longer = Math.max(compact.length, orgCompact.length)
      if (shorter / longer >= 0.75) return org.name
    }
    if (tokens === normalizeHostNameTokens(org.name)) return org.name
    if (
      orgCompact.length >= 6 &&
      Math.abs(compact.length - orgCompact.length) <= 2 &&
      levenshtein(compact, orgCompact) <= 2
    ) {
      return org.name
    }
  }
  return null
}

export function evaluateHostNameFields(options: {
  displayName: string
  companyName?: string | null
  userId?: string | null
  protectedOrgs: Array<{ name: string; normalized_name?: string | null }>
}): HostNameDecision {
  const display = options.displayName.trim()
  const company = (options.companyName || '').trim()
  const official = isOfficialDomuHostUser(options.userId)

  for (const field of [display, company].filter(Boolean)) {
    if (isDomuBrandName(field) && !official) {
      return {
        ok: false,
        kind: 'brand_blocked',
        message:
          'That name is reserved for Domu Match. Please choose a different display or company name.',
      }
    }
  }

  for (const field of [display, company].filter(Boolean)) {
    const matched = namesMatchProtectedOrg(field, options.protectedOrgs)
    if (matched) {
      return {
        ok: true,
        kind: 'needs_review',
        matchedOrg: matched,
        message: `"${matched}" is a known housing organisation. Domu Match admins must approve this name before it goes live on student listings.`,
      }
    }
  }

  return { ok: true, kind: 'clear' }
}

/** Seed list of NL / EU housing platforms & student housing orgs. */
export const DEFAULT_PROTECTED_ORG_NAMES = [
  'Kamernet',
  'Kamer.nl',
  'HousingAnywhere',
  'Housing Anywhere',
  'Roomspot',
  'Holland2Stay',
  'The Student Hotel',
  'SSH',
  'SSH Short Stay',
  'DUWO',
  'Idealis',
  'Vestide',
  'Our Domus',
  'Sparrow',
  'Spotahome',
  'Uniplaces',
  'Nestpick',
  'Pararius',
  'Funda',
  'Kamers.nl',
  'Housing Agency',
  'Direct Wonen',
  'Rentola',
  'Room.nl',
  'Student Experience',
  'Xior',
  'The Social Hub',
  'Stayokay',
  'Camelot',
  'Greystar',
  'International Campus',
] as const
