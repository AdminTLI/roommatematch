export type PasswordRequirementKey =
  | 'minLength'
  | 'uppercase'
  | 'lowercase'
  | 'number'

export type PasswordStrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong'

export type PasswordRequirement = {
  key: PasswordRequirementKey
  met: boolean
  missingLabel: string
}

export type PasswordStrength = {
  requirements: PasswordRequirement[]
  missing: PasswordRequirement[]
  metCount: number
  totalCount: number
  score: number
  level: PasswordStrengthLevel
  label: string
  isValid: boolean
  missingSummary: string | null
}

const REQUIREMENT_CHECKS: Array<{
  key: PasswordRequirementKey
  test: (password: string) => boolean
  missingLabel: string
}> = [
  {
    key: 'minLength',
    test: (password) => password.length >= 8,
    missingLabel: 'at least 8 characters',
  },
  {
    key: 'lowercase',
    test: (password) => /[a-z]/.test(password),
    missingLabel: 'a lowercase letter',
  },
  {
    key: 'uppercase',
    test: (password) => /[A-Z]/.test(password),
    missingLabel: 'an uppercase letter',
  },
  {
    key: 'number',
    test: (password) => /\d/.test(password),
    missingLabel: 'a number',
  },
]

const LEVEL_BY_MET: Record<number, { level: PasswordStrengthLevel; label: string }> = {
  0: { level: 'empty', label: '' },
  1: { level: 'weak', label: 'Weak' },
  2: { level: 'fair', label: 'Fair' },
  3: { level: 'good', label: 'Good' },
  4: { level: 'strong', label: 'Strong' },
}

export function getPasswordStrength(password: string): PasswordStrength {
  const requirements = REQUIREMENT_CHECKS.map(({ key, test, missingLabel }) => ({
    key,
    met: test(password),
    missingLabel,
  }))

  const missing = requirements.filter((requirement) => !requirement.met)
  const metCount = requirements.length - missing.length
  const totalCount = requirements.length
  const { level, label } = password.length === 0
    ? LEVEL_BY_MET[0]
    : LEVEL_BY_MET[metCount] ?? LEVEL_BY_MET[0]

  return {
    requirements,
    missing,
    metCount,
    totalCount,
    score: password.length === 0 ? 0 : Math.round((metCount / totalCount) * 100),
    level,
    label,
    isValid: missing.length === 0 && password.length > 0,
    missingSummary:
      missing.length === 0 ? null : `Add ${missing[0].missingLabel}`,
  }
}

/** Map Supabase's verbose password-policy errors to a short user-facing message. */
export function formatAuthPasswordError(message: string | undefined | null): string | null {
  if (!message) return null

  const lower = message.toLowerCase()
  const isPasswordPolicyError =
    lower.includes('password should contain') ||
    lower.includes('abcdefghijklmnopqrstuvwxyz') ||
    (lower.includes('password') &&
      (lower.includes('least one character of each') ||
        lower.includes('weak') ||
        lower.includes('too short')))

  if (!isPasswordPolicyError) return null

  return 'Password must be at least 8 characters and include uppercase, lowercase, and a number.'
}
