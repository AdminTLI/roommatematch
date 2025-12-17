import { test, expect } from '@playwright/test'

/**
 * Webhook Secret Validation Tests
 * Ensures webhook endpoints properly validate secrets and fail-closed
 */
test.describe('Webhook Secret Validation', () => {
  const webhookEndpoint = '/api/verification/provider-webhook'

  test('should reject requests without signature header', async ({ page }) => {
    const response = await page.request.post(webhookEndpoint, {
      data: {
        type: 'inquiry.updated',
        data: {
          id: 'test-inquiry-id',
          status: 'approved'
        }
      },
      headers: {
        'Content-Type': 'application/json'
        // No signature header
      }
    })

    // Should reject with 401 (Unauthorized)
    expect(response.status()).toBe(401)
    
    const body = await response.json()
    expect(body.error).toContain('Invalid signature')
  })

  test('should reject requests with invalid signature', async ({ page }) => {
    const response = await page.request.post(webhookEndpoint, {
      data: {
        type: 'inquiry.updated',
        data: {
          id: 'test-inquiry-id',
          status: 'approved'
        }
      },
      headers: {
        'Content-Type': 'application/json',
        'x-persona-signature': 'invalid-signature-here'
      }
    })

    // Should reject with 401 (Unauthorized)
    expect(response.status()).toBe(401)
    
    const body = await response.json()
    expect(body.error).toContain('Invalid signature')
  })

  test('should reject requests when webhook secret is missing from env', async ({ page }) => {
    // This test documents expected behavior when secret is not configured
    // In production, this should return 500/503 (Service Unavailable)
    // The endpoint should fail-closed (reject all requests) when secret is missing
    
    const response = await page.request.post(webhookEndpoint, {
      data: {
        type: 'inquiry.updated',
        data: {
          id: 'test-inquiry-id',
          status: 'approved'
        }
      },
      headers: {
        'Content-Type': 'application/json',
        'x-persona-signature': 'some-signature'
      }
    })

    // Should reject (either 401 for invalid signature or 500/503 for missing config)
    // The important thing is that it doesn't accept the request
    expect([401, 500, 503]).toContain(response.status())
  })

  test('should handle missing signature gracefully', async ({ page }) => {
    const response = await page.request.post(webhookEndpoint, {
      data: {
        type: 'inquiry.updated',
        data: {
          id: 'test-inquiry-id',
          status: 'approved'
        }
      },
      headers: {
        'Content-Type': 'application/json'
        // Explicitly no signature
      }
    })

    // Should reject, not crash
    expect(response.status()).toBeGreaterThanOrEqual(400)
    expect(response.status()).toBeLessThan(500) // Should be client error, not server error
  })

  test('should validate signature format for Persona', async ({ page }) => {
    // Persona uses x-persona-signature header
    const response = await page.request.post(`${webhookEndpoint}?provider=persona`, {
      data: {
        type: 'inquiry.updated',
        data: {
          id: 'test-inquiry-id',
          status: 'approved'
        }
      },
      headers: {
        'Content-Type': 'application/json',
        'x-persona-signature': 'invalid-format'
      }
    })

    expect(response.status()).toBe(401)
  })

  test('should validate signature format for Veriff', async ({ page }) => {
    // Veriff uses x-veriff-signature header
    const response = await page.request.post(`${webhookEndpoint}?provider=veriff`, {
      data: {
        id: 'test-verification-id',
        status: 'approved'
      },
      headers: {
        'Content-Type': 'application/json',
        'x-veriff-signature': 'invalid-format'
      }
    })

    expect(response.status()).toBe(401)
  })

  test('should not expose secret in error messages', async ({ page }) => {
    const response = await page.request.post(webhookEndpoint, {
      data: {
        type: 'inquiry.updated',
        data: {
          id: 'test-inquiry-id',
          status: 'approved'
        }
      },
      headers: {
        'Content-Type': 'application/json',
        'x-persona-signature': 'invalid'
      }
    })

    const body = await response.json()
    const bodyString = JSON.stringify(body)
    
    // Should not contain any secret information
    // Check that common secret patterns are not exposed
    expect(bodyString.toLowerCase()).not.toContain('webhook_secret')
    expect(bodyString.toLowerCase()).not.toContain('persona_webhook_secret')
    expect(bodyString.toLowerCase()).not.toContain('secret')
  })
})










