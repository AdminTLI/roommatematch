import { NextResponse } from 'next/server'

/**
 * IndexNow API endpoint
 * Notifies search engines (Google, Bing, Yandex) when content is updated
 * 
 * Usage: Call this endpoint after publishing new content
 * POST /api/indexnow with body: { urls: ['https://domumatch.com/blog/new-post'] }
 */

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'generate-a-key-here'
const BASE_URL = 'https://domumatch.com'

// IndexNow endpoints for different search engines
const SEARCH_ENGINES = [
  'https://api.indexnow.org/indexnow', // IndexNow API (shared by Bing, Yandex)
  // Google doesn't use IndexNow yet, use Search Console URL Inspection API instead
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { urls } = body

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      )
    }

    // Validate URLs
    const validUrls = urls.filter((url) => url.startsWith(BASE_URL))
    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: 'No valid URLs provided' },
        { status: 400 }
      )
    }

    // Notify search engines
    const results = await Promise.allSettled(
      SEARCH_ENGINES.map(async (endpoint) => {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            host: 'domumatch.com',
            key: INDEXNOW_KEY,
            keyLocation: `${BASE_URL}/indexnow-key.txt`,
            urlList: validUrls,
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to notify ${endpoint}: ${response.statusText}`)
        }

        return { endpoint, status: 'success' }
      })
    )

    const successes = results.filter((r) => r.status === 'fulfilled')
    const failures = results.filter((r) => r.status === 'rejected')

    return NextResponse.json({
      message: 'IndexNow notifications sent',
      urls: validUrls,
      results: {
        successes: successes.length,
        failures: failures.length,
        details: results,
      },
    })
  } catch (error) {
    console.error('IndexNow error:', error)
    return NextResponse.json(
      { error: 'Failed to process IndexNow request' },
      { status: 500 }
    )
  }
}

// Optional: GET endpoint to verify the service is working
export async function GET() {
  return NextResponse.json({
    service: 'IndexNow API',
    status: 'operational',
    usage: 'POST /api/indexnow with { urls: ["url1", "url2"] }',
    note: 'Make sure to set INDEXNOW_KEY environment variable',
  })
}
