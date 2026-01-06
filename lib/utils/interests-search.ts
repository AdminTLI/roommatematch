import { INTERESTS_LIST } from '@/lib/constants/interests'

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        )
      }
    }
  }

  return matrix[len1][len2]
}

interface SearchResult {
  interest: string
  type: 'exact' | 'fuzzy'
  distance?: number
  relevance: number
}

/**
 * Search interests with fuzzy matching
 * Returns results sorted by relevance (exact matches first, then fuzzy matches)
 */
export function searchInterests(query: string, excludeSelected: string[] = []): string[] {
  if (!query.trim()) {
    return []
  }

  const normalizedQuery = query.toLowerCase().trim()
  const results: SearchResult[] = []
  const maxDistance = Math.max(2, Math.floor(normalizedQuery.length * 0.3)) // Adaptive threshold

  for (const interest of INTERESTS_LIST) {
    // Skip if already selected
    if (excludeSelected.includes(interest)) {
      continue
    }

    const normalizedInterest = interest.toLowerCase()
    
    // Exact match (case-insensitive contains)
    if (normalizedInterest.includes(normalizedQuery)) {
      // Calculate relevance: exact matches at start get higher score
      const startsWith = normalizedInterest.startsWith(normalizedQuery)
      const relevance = startsWith 
        ? 1000 - normalizedInterest.length // Shorter matches at start are better
        : 500 - (normalizedInterest.indexOf(normalizedQuery) * 10) // Earlier matches are better
      
      results.push({
        interest,
        type: 'exact',
        relevance
      })
      continue
    }

    // Fuzzy match using Levenshtein distance
    const distance = levenshteinDistance(normalizedQuery, normalizedInterest)
    if (distance <= maxDistance) {
      // Calculate relevance: closer matches are better
      const relevance = 100 - distance - (normalizedInterest.length * 0.1)
      
      results.push({
        interest,
        type: 'fuzzy',
        distance,
        relevance
      })
    }
  }

  // Sort by relevance (highest first), then by interest name
  results.sort((a, b) => {
    if (Math.abs(a.relevance - b.relevance) > 0.1) {
      return b.relevance - a.relevance
    }
    return a.interest.localeCompare(b.interest)
  })

  // Limit to top 30 results for performance
  return results.slice(0, 30).map(r => r.interest)
}

/**
 * Check if an interest is in the predefined list
 */
export function isValidInterest(interest: string): boolean {
  return INTERESTS_LIST.includes(interest as any)
}

