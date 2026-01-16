/**
 * Search utilities for help center
 * Includes fuzzy search, synonym matching, and weighted scoring
 */

import { getAllArticles, HelpArticle } from '../help-content'
import { expandQuery, getSynonyms } from './synonyms'

export interface SearchResult {
  article: HelpArticle
  score: number
  matchedFields: string[]
  matchedTerms: string[]
}

/**
 * Normalize text for searching (lowercase, remove accents, trim)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .trim()
}

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

/**
 * Calculate similarity score between two strings (0-1)
 */
function similarityScore(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 1
  
  const distance = levenshteinDistance(str1, str2)
  return 1 - distance / maxLength
}

/**
 * Check if a term matches text (direct, fuzzy, or synonym)
 */
function termMatches(term: string, text: string, threshold: number = 0.7): boolean {
  const normalizedTerm = normalizeText(term)
  const normalizedText = normalizeText(text)
  
  // Direct match
  if (normalizedText.includes(normalizedTerm)) {
    return true
  }
  
  // Fuzzy match
  const words = normalizedText.split(/\s+/)
  for (const word of words) {
    const similarity = similarityScore(normalizedTerm, word)
    if (similarity >= threshold) {
      return true
    }
    
    // Check if word starts with term
    if (word.startsWith(normalizedTerm) && normalizedTerm.length >= 3) {
      return true
    }
  }
  
  // Synonym match
  const synonyms = getSynonyms(term)
  for (const synonym of synonyms) {
    if (normalizedText.includes(normalizeText(synonym))) {
      return true
    }
  }
  
  return false
}

/**
 * Score an article based on search query
 * Returns score and matched fields/terms
 */
function scoreArticle(
  article: HelpArticle,
  queryTerms: string[],
  expandedTerms: string[]
): { score: number; matchedFields: string[]; matchedTerms: string[] } {
  let totalScore = 0
  const matchedFields: string[] = []
  const matchedTerms: string[] = []
  
  const normalizedTitle = normalizeText(article.title)
  const normalizedContent = normalizeText(article.content)
  const normalizedTags = article.tags.map(t => normalizeText(t)).join(' ')
  const normalizedKeywords = article.keywords.map(k => normalizeText(k)).join(' ')
  
  for (const term of queryTerms) {
    const normalizedTerm = normalizeText(term)
    
    // Title match (3x weight)
    if (termMatches(normalizedTerm, normalizedTitle, 0.8)) {
      totalScore += 30
      if (!matchedFields.includes('title')) matchedFields.push('title')
      if (!matchedTerms.includes(term)) matchedTerms.push(term)
    }
    
    // Tag match (2x weight)
    if (termMatches(normalizedTerm, normalizedTags, 0.7)) {
      totalScore += 20
      if (!matchedFields.includes('tags')) matchedFields.push('tags')
      if (!matchedTerms.includes(term)) matchedTerms.push(term)
    }
    
    // Keyword match (2x weight)
    if (termMatches(normalizedTerm, normalizedKeywords, 0.7)) {
      totalScore += 20
      if (!matchedFields.includes('keywords')) matchedFields.push('keywords')
      if (!matchedTerms.includes(term)) matchedTerms.push(term)
    }
    
    // Content match (1x weight, but lower per-term score)
    if (termMatches(normalizedTerm, normalizedContent, 0.6)) {
      totalScore += 5
      if (!matchedFields.includes('content')) matchedFields.push('content')
      if (!matchedTerms.includes(term)) matchedTerms.push(term)
    }
  }
  
  // Also check expanded terms (synonyms) but with lower weight
  for (const expandedTerm of expandedTerms) {
    const normalizedExpanded = normalizeText(expandedTerm)
    
    if (normalizedTitle.includes(normalizedExpanded)) {
      totalScore += 10
      if (!matchedFields.includes('title')) matchedFields.push('title')
    }
    
    if (normalizedTags.includes(normalizedExpanded) || normalizedKeywords.includes(normalizedExpanded)) {
      totalScore += 5
      if (!matchedFields.includes('tags')) matchedFields.push('tags')
    }
  }
  
  // Boost exact phrase matches
  const queryPhrase = queryTerms.join(' ')
  const normalizedQuery = normalizeText(queryPhrase)
  if (normalizedTitle.includes(normalizedQuery)) {
    totalScore += 20
  }
  if (normalizedContent.includes(normalizedQuery)) {
    totalScore += 10
  }
  
  return { score: totalScore, matchedFields, matchedTerms }
}

/**
 * Search help articles
 * Returns sorted results by relevance
 */
export function searchHelpArticles(
  query: string,
  locale: 'en' | 'nl' = 'en',
  maxResults: number = 20
): SearchResult[] {
  if (!query || query.trim().length === 0) {
    return []
  }
  
  const queryTrimmed = query.trim()
  const queryTerms = queryTrimmed.split(/\s+/).filter(term => term.length > 0)
  const expandedTerms = expandQuery(queryTrimmed)
  
  const allArticles = getAllArticles(locale)
  const results: SearchResult[] = []
  
  for (const article of allArticles) {
    const { score, matchedFields, matchedTerms } = scoreArticle(
      article,
      queryTerms,
      expandedTerms
    )
    
    if (score > 0) {
      results.push({
        article,
        score,
        matchedFields,
        matchedTerms,
      })
    }
  }
  
  // Sort by score (descending)
  results.sort((a, b) => b.score - a.score)
  
  // Return top results
  return results.slice(0, maxResults)
}

/**
 * Highlight matching terms in text
 */
export function highlightMatches(
  text: string,
  terms: string[],
  className: string = 'font-semibold bg-yellow-200'
): string {
  if (!terms || terms.length === 0) return text
  
  let highlighted = text
  const normalizedText = text.toLowerCase()
  
  // Sort terms by length (longest first) to avoid partial matches
  const sortedTerms = [...terms].sort((a, b) => b.length - a.length)
  
  for (const term of sortedTerms) {
    const normalizedTerm = term.toLowerCase()
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    
    highlighted = highlighted.replace(regex, (match) => {
      // Check if already highlighted
      if (match.includes('<mark') || match.includes('<span')) {
        return match
      }
      return `<mark class="${className}">${match}</mark>`
    })
  }
  
  return highlighted
}

/**
 * Get search suggestions based on popular queries
 */
export function getSearchSuggestions(query: string): string[] {
  const suggestions = [
    'How to create an account',
    'Email verification',
    'ID verification',
    'Matching algorithm',
    'Compatibility scores',
    'Starting a chat',
    'Reporting a user',
    'Blocking users',
    'Privacy settings',
    'Housing listings',
    'Finding roommates',
    'Student life tips',
    'Troubleshooting',
    'Account settings',
    'Safety features',
  ]
  
  if (!query || query.trim().length === 0) {
    return suggestions.slice(0, 5)
  }
  
  const normalizedQuery = normalizeText(query)
  const filtered = suggestions.filter(suggestion =>
    normalizeText(suggestion).includes(normalizedQuery)
  )
  
  return filtered.length > 0 ? filtered.slice(0, 5) : suggestions.slice(0, 5)
}



