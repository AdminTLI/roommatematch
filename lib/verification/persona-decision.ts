/**
 * Shared Persona identity decisioning: age ≥ 18, DOB match, name match.
 * Fail-closed when required fields are missing from Persona.
 */

import {
  meetsMinimumAge,
  normalizeDateInput,
  MINIMUM_AGE,
} from '@/lib/auth/age-verification'

export type PersonaDecisionReason =
  | 'underage'
  | 'dob_mismatch'
  | 'dob_missing'
  | 'name_mismatch'
  | 'name_missing'
  | 'expected_name_missing'
  | 'expected_dob_missing'
  | 'persona_declined'

export type ExpectedIdentity = {
  firstName?: string | null
  lastName?: string | null
  dateOfBirth?: string | null
}

export type PersonaIdentity = {
  firstName?: string | null
  lastName?: string | null
  dateOfBirth?: string | null
  issuingCountry?: string | null
}

export type PersonaDecisionResult = {
  approved: boolean
  reasons: PersonaDecisionReason[]
  reviewReason: string | null
  providerData: Record<string, unknown>
}

export function normalizePersonName(value?: string | null): string {
  if (!value) return ''
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Compare first token of first name + full last name (middle-name tolerant). */
export function namesMatch(
  expectedFirst?: string | null,
  expectedLast?: string | null,
  personaFirst?: string | null,
  personaLast?: string | null
): boolean {
  const eFirst = normalizePersonName(expectedFirst).split(' ')[0] || ''
  const eLast = normalizePersonName(expectedLast)
  const pFirst = normalizePersonName(personaFirst).split(' ')[0] || ''
  const pLast = normalizePersonName(personaLast)

  if (!eFirst || !eLast || !pFirst || !pLast) return false
  return eFirst === pFirst && eLast === pLast
}

function reasonMessage(reasons: PersonaDecisionReason[]): string {
  if (reasons.includes('underage')) {
    return `You must be at least ${MINIMUM_AGE} years old to use this platform.`
  }
  if (reasons.includes('dob_missing') || reasons.includes('expected_dob_missing')) {
    return 'Date of birth could not be verified from your ID.'
  }
  if (reasons.includes('dob_mismatch')) {
    return 'Date of birth does not match Persona verification.'
  }
  if (reasons.includes('name_missing') || reasons.includes('expected_name_missing')) {
    return 'Name could not be verified from your ID.'
  }
  if (reasons.includes('name_mismatch')) {
    return 'Name on your ID does not match your signup name.'
  }
  if (reasons.includes('persona_declined')) {
    return 'Identity verification was declined.'
  }
  return 'Identity verification failed.'
}

/**
 * Decide whether a Persona inquiry should be approved given claimed vs extracted identity.
 * Does not interpret Persona status — callers pass `personaApproved` from the provider.
 */
export function decidePersonaIdentity(params: {
  personaApproved: boolean
  expected: ExpectedIdentity
  persona: PersonaIdentity
}): PersonaDecisionResult {
  const reasons: PersonaDecisionReason[] = []

  if (!params.personaApproved) {
    reasons.push('persona_declined')
  }

  const expectedDob = normalizeDateInput(params.expected.dateOfBirth)
  const personaDob = normalizeDateInput(params.persona.dateOfBirth)

  if (!expectedDob) {
    reasons.push('expected_dob_missing')
  }
  if (!personaDob) {
    reasons.push('dob_missing')
  }

  if (expectedDob && personaDob) {
    if (expectedDob !== personaDob) {
      reasons.push('dob_mismatch')
    }
    if (!meetsMinimumAge(personaDob)) {
      reasons.push('underage')
    }
  }

  const expectedFirst = params.expected.firstName?.trim() || ''
  const expectedLast = params.expected.lastName?.trim() || ''
  const personaFirst = params.persona.firstName?.trim() || ''
  const personaLast = params.persona.lastName?.trim() || ''

  if (!expectedFirst || !expectedLast) {
    reasons.push('expected_name_missing')
  }
  if (!personaFirst || !personaLast) {
    reasons.push('name_missing')
  }

  if (expectedFirst && expectedLast && personaFirst && personaLast) {
    if (!namesMatch(expectedFirst, expectedLast, personaFirst, personaLast)) {
      reasons.push('name_mismatch')
    }
  }

  const approved = reasons.length === 0

  return {
    approved,
    reasons,
    reviewReason: approved ? null : reasonMessage(reasons),
    providerData: {
      persona_birthdate: personaDob,
      expected_birthdate: expectedDob,
      dob_match: Boolean(expectedDob && personaDob && expectedDob === personaDob),
      persona_name_first: personaFirst || null,
      persona_name_last: personaLast || null,
      expected_name_first: expectedFirst || null,
      expected_name_last: expectedLast || null,
      name_match: namesMatch(expectedFirst, expectedLast, personaFirst, personaLast),
      issuing_country: params.persona.issuingCountry || null,
      decision_reasons: reasons,
    },
  }
}

export function extractPersonaDob(payload: unknown): string | undefined {
  const root = payload as Record<string, any> | null
  if (!root) return undefined

  const candidates: Array<string | undefined> = [
    root?.data?.attributes?.birthdate,
    root?.data?.attributes?.birth_date,
    root?.data?.attributes?.dob,
    root?.data?.attributes?.['date-of-birth'],
    root?.data?.attributes?.['date_of_birth'],
    root?.data?.attributes?.payload?.data?.attributes?.birthdate,
    root?.data?.attributes?.payload?.data?.attributes?.dob,
    root?.data?.attributes?.payload?.data?.attributes?.['date-of-birth'],
    root?.data?.attributes?.fields?.birthdate?.value,
    root?.data?.attributes?.fields?.['birthdate']?.value,
  ]

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  if (Array.isArray(root?.included)) {
    for (const item of root.included) {
      const possibleDob =
        item?.attributes?.birthdate ||
        item?.attributes?.dob ||
        item?.attributes?.['date-of-birth'] ||
        item?.attributes?.['date_of_birth'] ||
        item?.attributes?.['birthdate']
      if (typeof possibleDob === 'string' && possibleDob.trim()) {
        return possibleDob.trim()
      }
    }
  }

  return undefined
}

export function extractPersonaName(payload: unknown): {
  firstName?: string
  lastName?: string
} {
  const root = payload as Record<string, any> | null
  if (!root) return {}

  const attrs = root?.data?.attributes || {}
  const fields = attrs?.fields || {}

  let firstName: string | undefined =
    attrs?.['name-first'] ||
    attrs?.name_first ||
    attrs?.first_name ||
    fields?.['name-first']?.value ||
    fields?.name_first?.value ||
    undefined

  let lastName: string | undefined =
    attrs?.['name-last'] ||
    attrs?.name_last ||
    attrs?.last_name ||
    fields?.['name-last']?.value ||
    fields?.name_last?.value ||
    undefined

  if ((!firstName || !lastName) && typeof attrs?.name === 'string') {
    const parts = attrs.name.trim().split(/\s+/)
    if (parts.length >= 2) {
      firstName = firstName || parts[0]
      lastName = lastName || parts.slice(1).join(' ')
    }
  }

  if (Array.isArray(root?.included)) {
    for (const item of root.included) {
      const a = item?.attributes || {}
      if (!firstName) {
        firstName =
          a?.['name-first'] || a?.name_first || a?.first_name || a?.['first-name']
      }
      if (!lastName) {
        lastName =
          a?.['name-last'] || a?.name_last || a?.last_name || a?.['last-name']
      }
    }
  }

  return {
    firstName: typeof firstName === 'string' ? firstName.trim() : undefined,
    lastName: typeof lastName === 'string' ? lastName.trim() : undefined,
  }
}

export function extractPersonaIssuingCountry(payload: unknown): string | undefined {
  const root = payload as Record<string, any> | null
  if (!root) return undefined

  const candidates = [
    root?.data?.attributes?.['identification-number-country-code'],
    root?.data?.attributes?.country_code,
    root?.data?.attributes?.['country-code'],
    root?.data?.attributes?.fields?.['identification-number-country-code']?.value,
  ]

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  if (Array.isArray(root?.included)) {
    for (const item of root.included) {
      const c =
        item?.attributes?.['issuing-country'] ||
        item?.attributes?.country_code ||
        item?.attributes?.['country-code'] ||
        item?.attributes?.nationality
      if (typeof c === 'string' && c.trim()) return c.trim()
    }
  }

  return undefined
}
