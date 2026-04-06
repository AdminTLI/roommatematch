/**
 * Extracts web source URLs returned with Gemini Google Search grounding.
 * Only these URLs should be surfaced as automatic "Sources"  -  never guess links.
 */

type GroundingChunk = { web?: { uri?: string; title?: string } }

type CandidateLike = {
  groundingMetadata?: { groundingChunks?: GroundingChunk[] }
}

export type DomuSource = { title: string; uri: string }

export function extractGroundingSources(response: { candidates?: CandidateLike[] }): DomuSource[] {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? []
  const out: DomuSource[] = []
  const seen = new Set<string>()

  for (const chunk of chunks) {
    const uri = chunk.web?.uri?.trim()
    if (!uri || seen.has(uri)) continue
    seen.add(uri)

    let title = chunk.web?.title?.trim()
    if (!title) {
      try {
        title = new URL(uri).hostname.replace(/^www\./i, '')
      } catch {
        title = 'Source'
      }
    }
    out.push({ title, uri })
  }

  return out
}

export function appendSourcesSection(reply: string, sources: DomuSource[]): string {
  if (sources.length === 0) return reply

  const lines = sources.map((s) => `- [${s.title}](${s.uri})`).join('\n')
  return `${reply.trimEnd()}\n\n---\n\n### Sources\n\n${lines}\n\n*These links come from the search tool used for this answer. Event times, prices, and availability change  -  always confirm on the official page before you buy tickets or make plans.*`
}
