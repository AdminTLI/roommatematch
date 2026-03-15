export function proOnboardingUrl(pathname: string, search: string | null = null) {
  const base = `/onboarding-professional${pathname.startsWith('/') ? '' : '/'}${pathname}`
  if (!search) return base
  return `${base}${search.startsWith('?') ? '' : '?'}${search}`
}

