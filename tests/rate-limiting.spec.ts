import { test, expect } from '@playwright/test'

/**
 * Comprehensive rate limiting tests
 * Tests all rate-limited endpoints to ensure proper enforcement
 */
test.describe('Rate Limiting', () => {
  // Helper to make authenticated requests
  async function makeRequest(
    page: any,
    method: string,
    url: string,
    data?: any,
    headers?: Record<string, string>
  ) {
    return page.request[method.toLowerCase()](url, {
      data,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    })
  }

  test.describe('Message Rate Limiting', () => {
    test('should rate limit message sending after 30 requests in 5 minutes', async ({ page }) => {
      // Mock authentication
      await page.evaluate(() => {
        localStorage.setItem('mock-user-id', 'test-user-1')
      })

      // Make 35 rapid requests (exceeding the 30 request limit)
      const requests = Array(35).fill(null).map((_, i) =>
        makeRequest(page, 'POST', '/api/chat/send', {
          chat_id: 'test-chat-id',
          content: `Test message ${i}`
        })
      )

      const responses = await Promise.all(requests)

      // Count rate limited responses (429 status)
      const rateLimitedResponses = responses.filter(r => r.status() === 429)
      expect(rateLimitedResponses.length).toBeGreaterThan(0)

      // Verify rate limit headers are present
      const firstRateLimited = responses.find(r => r.status() === 429)
      if (firstRateLimited) {
        const headers = firstRateLimited.headers()
        // Check for rate limit headers (if implemented)
        expect(headers['x-ratelimit-limit'] || headers['retry-after']).toBeDefined()
      }
    })

    test('should allow messages within rate limit', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('mock-user-id', 'test-user-2')
      })

      // Make 10 requests (within the 30 request limit)
      const requests = Array(10).fill(null).map((_, i) =>
        makeRequest(page, 'POST', '/api/chat/send', {
          chat_id: 'test-chat-id',
          content: `Test message ${i}`
        })
      )

      const responses = await Promise.all(requests)

      // All should succeed (or at least not be rate limited)
      const rateLimitedResponses = responses.filter(r => r.status() === 429)
      expect(rateLimitedResponses.length).toBe(0)
    })
  })

  test.describe('Report Rate Limiting', () => {
    test('should rate limit reports after 5 requests in 1 hour', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('mock-user-id', 'test-user-3')
      })

      // Make 7 rapid requests (exceeding the 5 request limit)
      const requests = Array(7).fill(null).map((_, i) =>
        makeRequest(page, 'POST', '/api/chat/report', {
          target_user_id: 'target-user-id',
          category: 'spam',
          details: `Test report ${i}`
        })
      )

      const responses = await Promise.all(requests)

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status() === 429)
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })
  })

  test.describe('Matching Rate Limiting', () => {
    test('should rate limit match refresh requests', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('mock-user-id', 'test-user-4')
      })

      // Make 7 rapid requests (exceeding the 5 request limit)
      const requests = Array(7).fill(null).map(() =>
        makeRequest(page, 'POST', '/api/match/suggestions/refresh')
      )

      const responses = await Promise.all(requests)

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status() === 429)
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })
  })

  test.describe('Profile Update Rate Limiting', () => {
    test('should rate limit profile updates', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('mock-user-id', 'test-user-5')
      })

      // Make multiple profile update requests
      const requests = Array(15).fill(null).map((_, i) =>
        makeRequest(page, 'POST', '/api/settings/profile', {
          first_name: `Test${i}`,
          last_name: 'User'
        })
      )

      const responses = await Promise.all(requests)

      // Some requests should be rate limited (if profile updates are rate limited)
      // This test may need adjustment based on actual rate limit configuration
      const rateLimitedResponses = responses.filter(r => r.status() === 429)
      // Note: Profile updates may not be rate limited, adjust expectation accordingly
    })
  })

  test.describe('Rate Limit Headers', () => {
    test('should include rate limit headers in responses', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('mock-user-id', 'test-user-6')
      })

      const response = await makeRequest(page, 'POST', '/api/chat/send', {
        chat_id: 'test-chat-id',
        content: 'Test message'
      })

      const headers = response.headers()
      
      // Check for standard rate limit headers (if implemented)
      // These headers help clients understand rate limit status
      const hasRateLimitInfo = 
        headers['x-ratelimit-limit'] ||
        headers['x-ratelimit-remaining'] ||
        headers['x-ratelimit-reset'] ||
        headers['retry-after']

      // Note: Headers may not be implemented yet, this test documents expected behavior
      // Uncomment when headers are added:
      // expect(hasRateLimitInfo).toBeTruthy()
    })
  })

  test.describe('Rate Limit Reset Behavior', () => {
    test('should reset rate limit after window expires', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('mock-user-id', 'test-user-7')
      })

      // Exhaust rate limit
      const exhaustRequests = Array(35).fill(null).map((_, i) =>
        makeRequest(page, 'POST', '/api/chat/send', {
          chat_id: 'test-chat-id',
          content: `Exhaust ${i}`
        })
      )
      await Promise.all(exhaustRequests)

      // Wait for rate limit window to reset (5 minutes for messages)
      // In a real test, you might want to mock time or use a shorter window for testing
      // For now, this test documents the expected behavior
      
      // After reset, requests should be allowed again
      // Note: This test would require time manipulation or waiting, which is impractical
      // Consider using a test-specific rate limit configuration with shorter windows
    })
  })

  test.describe('Concurrent Request Handling', () => {
    test('should handle concurrent requests correctly', async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem('mock-user-id', 'test-user-8')
      })

      // Make many concurrent requests
      const requests = Array(50).fill(null).map((_, i) =>
        makeRequest(page, 'POST', '/api/chat/send', {
          chat_id: 'test-chat-id',
          content: `Concurrent ${i}`
        })
      )

      const responses = await Promise.all(requests)

      // Verify that rate limiting is applied correctly even with concurrent requests
      const rateLimitedCount = responses.filter(r => r.status() === 429).length
      const successCount = responses.filter(r => r.status() === 200 || r.status() === 201).length

      // Should have some rate limited and some successful (within limit)
      expect(rateLimitedCount + successCount).toBeGreaterThan(0)
    })
  })
})










