// Traffic Source Utilities
// Helper functions for UTM parameter parsing and traffic source classification

export interface UTMParams {
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_term?: string | null
  utm_content?: string | null
}

export type TrafficSource = 'organic' | 'direct' | 'referral' | 'social' | 'email' | 'paid' | null

/**
 * Parse UTM parameters from URL search params
 */
export function parseUTMParams(searchParams: URLSearchParams): UTMParams {
  return {
    utm_source: searchParams.get('utm_source'),
    utm_medium: searchParams.get('utm_medium'),
    utm_campaign: searchParams.get('utm_campaign'),
    utm_term: searchParams.get('utm_term'),
    utm_content: searchParams.get('utm_content'),
  }
}

/**
 * Parse UTM parameters from a URL string
 */
export function parseUTMParamsFromURL(url: string): UTMParams {
  try {
    const urlObj = new URL(url)
    return parseUTMParams(urlObj.searchParams)
  } catch {
    // If URL parsing fails, try to extract query string manually
    const queryString = url.includes('?') ? url.split('?')[1] : ''
    const searchParams = new URLSearchParams(queryString)
    return parseUTMParams(searchParams)
  }
}

/**
 * Classify traffic source based on referrer and UTM parameters
 */
export function classifyTrafficSource(
  referrer: string | null | undefined,
  utmSource?: string | null,
  utmMedium?: string | null
): TrafficSource {
  // If UTM source exists, it's paid traffic
  if (utmSource || utmMedium) {
    // Check if it's email
    if (utmMedium?.toLowerCase().includes('email') || utmSource?.toLowerCase().includes('email')) {
      return 'email'
    }
    // Otherwise it's paid
    return 'paid'
  }

  // No referrer means direct traffic
  if (!referrer || referrer.trim() === '') {
    return 'direct'
  }

  const referrerLower = referrer.toLowerCase()

  // Check for search engines (organic)
  const searchEngines = [
    'google.com',
    'google.',
    'bing.com',
    'yahoo.com',
    'duckduckgo.com',
    'yandex.com',
    'baidu.com',
  ]
  if (searchEngines.some(engine => referrerLower.includes(engine))) {
    return 'organic'
  }

  // Check for social media platforms
  const socialPlatforms = [
    'facebook.com',
    'twitter.com',
    'x.com',
    'linkedin.com',
    'instagram.com',
    'tiktok.com',
    'youtube.com',
    'reddit.com',
    'pinterest.com',
    'snapchat.com',
  ]
  if (socialPlatforms.some(platform => referrerLower.includes(platform))) {
    return 'social'
  }

  // Check for email clients
  const emailClients = ['mail.', 'outlook.com', 'gmail.com', 'yahoo.com/mail']
  if (emailClients.some(client => referrerLower.includes(client))) {
    return 'email'
  }

  // Everything else is referral
  return 'referral'
}

/**
 * Format traffic source for display
 */
export function formatTrafficSource(source: TrafficSource): string {
  if (!source) return 'Unknown'
  
  const formats: Record<NonNullable<TrafficSource>, string> = {
    organic: 'Organic Search',
    direct: 'Direct',
    referral: 'Referral',
    social: 'Social Media',
    email: 'Email',
    paid: 'Paid Advertising',
  }
  
  return formats[source] || source
}

/**
 * Get referrer from window object (client-side only)
 */
export function getReferrer(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return document.referrer || null
}

