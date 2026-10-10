/** Allowed academic TLDs and known Dutch university email domains */
const ACADEMIC_TLDS = ['.nl', '.edu', '.ac.uk', '.be', '.de']

const ACADEMIC_DOMAIN_PATTERNS = [
  /@student\.avans\.nl$/i,
  /@avans\.nl$/i,
  /@buas\.nl$/i,
  /@([a-z0-9-]+\.)?(edu|ac\.uk|ac\.nl)(\.[a-z]{2})?$/i,
]

/**
 * Returns true when the address looks like a university / academic email
 * (e.g. ends in .edu or .nl, or matches known campus domains).
 */
export function isAcademicEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase()
  if (!normalized || !normalized.includes('@')) return false
  const domain = normalized.slice(normalized.indexOf('@') + 1)
  if (ACADEMIC_DOMAIN_PATTERNS.some((re) => re.test(normalized))) return true
  return ACADEMIC_TLDS.some((tld) => domain.endsWith(tld))
}
