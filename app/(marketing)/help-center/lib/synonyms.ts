/**
 * Synonym dictionary for help center search
 * Maps search terms to related terms to improve search results
 */

export const synonyms: Record<string, string[]> = {
  // Account related
  account: ['profile', 'settings', 'user', 'account settings'],
  profile: ['account', 'user', 'information', 'details'],
  settings: ['account', 'preferences', 'configuration', 'options'],
  
  // Verification related
  verification: ['verify', 'ID', 'check', 'confirm', 'identity', 'verification process'],
  verify: ['verification', 'ID', 'check', 'confirm'],
  'ID verification': ['verification', 'identity check', 'ID check', 'identity verification'],
  'email verification': ['verify email', 'confirm email', 'email check'],
  
  // Matching related
  match: ['compatibility', 'roommate', 'suggestion', 'match', 'pairing'],
  matching: ['compatibility', 'matching', 'pairing', 'finding roommates'],
  compatibility: ['match', 'compatibility score', 'fit', 'alignment'],
  score: ['rating', 'compatibility', 'match score', 'percentage'],
  
  // Chat related
  chat: ['message', 'conversation', 'talk', 'messaging', 'DM'],
  message: ['chat', 'conversation', 'DM', 'text'],
  conversation: ['chat', 'message', 'talk'],
  
  // Housing related
  housing: ['accommodation', 'place', 'room', 'apartment', 'housing listing', 'home'],
  accommodation: ['housing', 'place', 'room', 'apartment'],
  listing: ['housing', 'accommodation', 'place', 'property'],
  apartment: ['housing', 'accommodation', 'place', 'room'],
  room: ['housing', 'accommodation', 'apartment', 'place'],
  
  // Safety related
  safety: ['security', 'report', 'protection', 'safety features'],
  report: ['flag', 'report user', 'complain', 'safety concern'],
  blocking: ['block', 'block user', 'prevent', 'restrict'],
  
  // Privacy related
  privacy: ['data', 'personal information', 'privacy settings', 'GDPR'],
  data: ['privacy', 'information', 'personal data', 'GDPR'],
  GDPR: ['privacy', 'data protection', 'rights'],
  
  // Onboarding related
  onboarding: ['setup', 'questionnaire', 'getting started', 'profile creation'],
  questionnaire: ['quiz', 'questions', 'survey', 'onboarding'],
  'getting started': ['onboarding', 'begin', 'start', 'first steps'],
  
  // University related
  university: ['uni', 'school', 'institution', 'college'],
  'university email': ['student email', 'institutional email', 'edu email'],
  
  // Troubleshooting related
  problem: ['issue', 'error', 'trouble', 'not working', 'bug'],
  issue: ['problem', 'error', 'trouble', 'bug'],
  error: ['problem', 'issue', 'bug', 'not working'],
  'not working': ['problem', 'issue', 'error', 'broken'],
  
  // Features
  filter: ['search', 'options', 'preferences', 'criteria'],
  search: ['find', 'look', 'filter', 'browse'],
  notification: ['alert', 'update', 'notice', 'reminder'],
  
  // Student life
  roommate: ['flatmate', 'housemate', 'roommate', 'co-tenant'],
  flatmate: ['roommate', 'housemate', 'co-tenant'],
  Netherlands: ['Holland', 'Dutch', 'NL'],
  Dutch: ['Netherlands', 'Holland', 'NL'],
  
  // General terms
  help: ['support', 'assistance', 'FAQ', 'guide'],
  support: ['help', 'assistance', 'FAQ'],
  FAQ: ['frequently asked questions', 'help', 'questions'],
  guide: ['tutorial', 'help', 'instructions', 'how to'],
  tutorial: ['guide', 'instructions', 'how to', 'walkthrough'],
}

/**
 * Get all synonyms for a given term
 */
export function getSynonyms(term: string): string[] {
  const normalized = term.toLowerCase().trim()
  const directSynonyms = synonyms[normalized] || []
  
  // Also check if the term is a synonym of another term
  const reverseSynonyms: string[] = []
  for (const [key, values] of Object.entries(synonyms)) {
    if (values.includes(normalized)) {
      reverseSynonyms.push(key, ...values)
    }
  }
  
  return [...new Set([...directSynonyms, ...reverseSynonyms, normalized])]
}

/**
 * Expand a search query with all synonyms
 */
export function expandQuery(query: string): string[] {
  const terms = query.toLowerCase().trim().split(/\s+/)
  const expandedTerms = new Set<string>()
  
  for (const term of terms) {
    expandedTerms.add(term)
    const termSynonyms = getSynonyms(term)
    termSynonyms.forEach(syn => expandedTerms.add(syn))
  }
  
  return Array.from(expandedTerms)
}



