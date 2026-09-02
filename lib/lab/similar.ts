const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'but',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'by',
  'from',
  'is',
  'it',
  'this',
  'that',
  'i',
  'we',
  'you',
  'my',
  'me',
  'be',
  'are',
  'was',
  'were',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'can',
  'need',
  'want',
  'like',
  'get',
  'make',
  'add',
  'feature',
])

export function tokenizeForSimilarity(text: string): Set<string> {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 3 && !STOP_WORDS.has(t))
  return new Set(tokens)
}

export function similarityScore(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let overlap = 0
  for (const token of a) {
    if (b.has(token)) overlap++
  }
  return overlap / Math.max(a.size, b.size)
}

export interface SimilarWishCandidate {
  id: string
  title: string
  vote_count: number
  score: number
}

export function rankSimilarWishes(
  query: string,
  wishes: Array<{ id: string; title: string; vote_count: number }>,
  limit = 5
): SimilarWishCandidate[] {
  const queryTokens = tokenizeForSimilarity(query)
  if (queryTokens.size === 0) return []

  return wishes
    .map(w => ({
      ...w,
      score: similarityScore(queryTokens, tokenizeForSimilarity(w.title)),
    }))
    .filter(w => w.score >= 0.4)
    .sort((a, b) => b.score - a.score || b.vote_count - a.vote_count)
    .slice(0, limit)
}
