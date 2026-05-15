/**
 * Public marketing routes (URL paths). Used to load a lighter client provider tree.
 */
const MARKETING_ROUTE_PREFIXES = [
  '/about',
  '/how-it-works',
  '/beta',
  '/students',
  '/young-professionals',
  '/universities',
  '/pricing',
  '/faq',
  '/contact',
  '/careers',
  '/help-center',
  '/questionnaire',
  '/status',
  '/amsterdam',
  '/rotterdam',
  '/utrecht',
  '/den-haag',
  '/eindhoven',
  '/groningen',
  '/leiden',
  '/nijmegen',
  '/blog',
  '/privacy',
  '/terms',
  '/cookies',
] as const

export function isMarketingRoute(pathname: string): boolean {
  if (pathname === '/') return true
  return MARKETING_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}
