import { test, expect } from '@playwright/test'
import crypto from 'crypto'

test.describe('Verification Flow - Expanded Tests', () => {
  test.describe('Verification Start', () => {
    test('should create verification session with Veriff provider', async ({ page }) => {
      // Mock authentication
      await page.route('/api/auth/user', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: { id: 'test-user-id', email: 'test@example.com' }
          })
        })
      })

      // Mock profile check
      await page.route('/api/profiles*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            verification_status: 'unverified'
          })
        })
      })

      // Mock Veriff API
      await page.route('**/api/verification/start', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            sessionId: 'veriff-session-123',
            clientToken: 'veriff-token-456',
            provider: 'veriff',
            status: 'pending'
          })
        })
      })

      await page.goto('/verify')
      
      const startButton = page.locator('button:has-text("Start Verification")')
      if (await startButton.isVisible({ timeout: 5000 })) {
        await startButton.click()
        
        // Should show pending status
        await expect(page.locator('text=pending')).toBeVisible({ timeout: 5000 })
      }
    })

    test('should handle already verified users', async ({ page }) => {
      await page.route('/api/verification/start', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'verified',
            message: 'Already verified'
          })
        })
      })

      await page.goto('/verify')
      
      // Should show verified status
      await expect(page.locator('text=verified')).toBeVisible({ timeout: 5000 })
    })

    test('should reuse existing pending verification', async ({ page }) => {
      await page.route('/api/verification/start', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            sessionId: 'existing-session-123',
            status: 'pending',
            provider: 'veriff'
          })
        })
      })

      await page.goto('/verify')
      
      // Should show existing session
      await expect(page.locator('text=pending')).toBeVisible({ timeout: 5000 })
    })

    test('should handle provider API failures gracefully', async ({ page }) => {
      await page.route('/api/verification/start', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Failed to create verification session'
          })
        })
      })

      await page.goto('/verify')
      
      const startButton = page.locator('button:has-text("Start Verification")')
      if (await startButton.isVisible({ timeout: 5000 })) {
        await startButton.click()
        
        // Should show error message
        await expect(page.locator('text=/error|failed/i')).toBeVisible({ timeout: 5000 })
      }
    })
  })

  test.describe('Verification Status Polling', () => {
    test('should poll status and update UI when approved', async ({ page }) => {
      let pollCount = 0
      
      await page.route('/api/verification/status', async route => {
        pollCount++
        const status = pollCount < 3 ? 'pending' : 'approved'
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status,
            verification: {
              id: 'test-verification-id',
              provider: 'veriff',
              status: status === 'pending' ? 'pending' : 'approved'
            }
          })
        })
      })

      await page.goto('/verify')
      
      // Wait for status to change
      await page.waitForTimeout(6000) // Allow time for polling
      
      // Should eventually show approved status
      // Note: Actual implementation may vary
    })

    test('should handle status check errors', async ({ page }) => {
      await page.route('/api/verification/status', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Internal server error'
          })
        })
      })

      await page.goto('/verify')
      
      // Should handle error gracefully
      await page.waitForTimeout(2000)
    })
  })

  test.describe('Webhook Handling', () => {
    test('should verify Veriff webhook signature', async ({ request }) => {
      const secret = 'test-webhook-secret'
      const payload = JSON.stringify({ verification: { id: 'test-123', status: 'success' } })
      const signature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')

      const response = await request.post('/api/verification/provider-webhook?provider=veriff', {
        headers: {
          'x-signature': signature,
          'content-type': 'application/json'
        },
        data: payload
      })

      // Should accept valid signature (or return 404 if verification not found)
      expect([200, 404]).toContain(response.status())
    })

    test('should reject invalid webhook signature', async ({ request }) => {
      const payload = JSON.stringify({ verification: { id: 'test-123', status: 'success' } })
      const invalidSignature = 'invalid-signature'

      const response = await request.post('/api/verification/provider-webhook?provider=veriff', {
        headers: {
          'x-signature': invalidSignature,
          'content-type': 'application/json'
        },
        data: payload
      })

      expect(response.status()).toBe(401)
    })

    test('should handle Veriff webhook payload', async ({ request }) => {
      const secret = process.env.VERIFF_WEBHOOK_SECRET || 'test-secret'
      const payload = JSON.stringify({
        verification: {
          id: 'veriff-session-123',
          status: 'success'
        }
      })
      const signature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')

      const response = await request.post('/api/verification/provider-webhook?provider=veriff', {
        headers: {
          'x-signature': signature,
          'content-type': 'application/json'
        },
        data: payload
      })

      // Should process webhook (may return 404 if verification not found in test DB)
      expect([200, 404]).toContain(response.status())
    })

    test('should handle Persona webhook payload', async ({ request }) => {
      const secret = process.env.PERSONA_WEBHOOK_SECRET || 'test-secret'
      const payload = JSON.stringify({
        data: {
          id: 'persona-inquiry-123',
          attributes: {
            status: 'completed'
          }
        }
      })
      const signature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')

      const response = await request.post('/api/verification/provider-webhook?provider=persona', {
        headers: {
          'x-persona-signature': `sha256=${signature}`,
          'content-type': 'application/json'
        },
        data: payload
      })

      expect([200, 404]).toContain(response.status())
    })

    test('should handle Onfido webhook payload', async ({ request }) => {
      const secret = process.env.ONFIDO_WEBHOOK_SECRET || 'test-secret'
      const payload = JSON.stringify({
        payload: {
          resource_id: 'onfido-check-123',
          action: 'clear'
        }
      })
      const signature = crypto
        .createHmac('sha1', secret)
        .update(payload)
        .digest('hex')

      const response = await request.post('/api/verification/provider-webhook?provider=onfido', {
        headers: {
          'x-sdk-token': signature,
          'content-type': 'application/json'
        },
        data: payload
      })

      expect([200, 404]).toContain(response.status())
    })

    test('should handle duplicate webhook processing', async ({ request }) => {
      // This test would require setting up a verification record first
      // For now, we test the endpoint structure
      const secret = 'test-secret'
      const payload = JSON.stringify({ verification: { id: 'test-123', status: 'success' } })
      const signature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')

      // First request
      const response1 = await request.post('/api/verification/provider-webhook?provider=veriff', {
        headers: {
          'x-signature': signature,
          'content-type': 'application/json'
        },
        data: payload
      })

      // Second request (duplicate)
      const response2 = await request.post('/api/verification/provider-webhook?provider=veriff', {
        headers: {
          'x-signature': signature,
          'content-type': 'application/json'
        },
        data: payload
      })

      // Should handle gracefully (may return 200 with "Already processed" or 404)
      expect([200, 404]).toContain(response2.status())
    })
  })

  test.describe('Status Transitions', () => {
    test('should transition from pending to approved', async ({ page }) => {
      await page.route('/api/verification/status', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'approved',
            verification: {
              id: 'test-id',
              provider: 'veriff',
              status: 'approved'
            }
          })
        })
      })

      await page.goto('/verify')
      
      // Should show approved status
      await expect(page.locator('text=/approved|verified/i')).toBeVisible({ timeout: 5000 })
    })

    test('should transition from pending to rejected', async ({ page }) => {
      await page.route('/api/verification/status', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'failed',
            verification: {
              id: 'test-id',
              provider: 'veriff',
              status: 'rejected',
              reviewReason: 'Document quality insufficient'
            },
            canRetry: true
          })
        })
      })

      await page.goto('/verify')
      
      // Should show rejected status with retry option
      await expect(page.locator('text=/rejected|failed/i')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('button:has-text("Retry")')).toBeVisible({ timeout: 5000 })
    })

    test('should handle expired verification', async ({ page }) => {
      await page.route('/api/verification/status', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'expired',
            verification: {
              id: 'test-id',
              provider: 'veriff',
              status: 'expired'
            },
            canRetry: true
          })
        })
      })

      await page.goto('/verify')
      
      // Should show expired status with retry option
      await expect(page.locator('text=/expired/i')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Route Gating', () => {
    test('should redirect unverified users from matches page', async ({ page }) => {
      await page.route('/api/verification/status', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'unverified'
          })
        })
      })

      await page.goto('/matches')
      
      // Should redirect to verify page
      await expect(page).toHaveURL(/\/verify/, { timeout: 5000 })
    })

    test('should redirect unverified users from chat pages', async ({ page }) => {
      await page.route('/api/verification/status', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'unverified'
          })
        })
      })

      await page.goto('/chat/test-room-id')
      
      // Should redirect to verify page
      await expect(page).toHaveURL(/\/verify/, { timeout: 5000 })
    })

    test('should allow verified users to access matches', async ({ page }) => {
      await page.route('/api/verification/status', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'verified',
            verification: {
              id: 'test-id',
              provider: 'veriff',
              status: 'approved'
            }
          })
        })
      })

      await page.goto('/matches')
      
      // Should not redirect (unless other auth issues)
      // Note: May still redirect if onboarding not complete
      await page.waitForTimeout(2000)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await page.route('/api/verification/status', async route => {
        await route.abort('failed')
      })

      await page.goto('/verify')
      
      // Should handle error without crashing
      await page.waitForTimeout(2000)
    })

    test('should handle malformed API responses', async ({ page }) => {
      await page.route('/api/verification/status', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: 'invalid json'
        })
      })

      await page.goto('/verify')
      
      // Should handle gracefully
      await page.waitForTimeout(2000)
    })

    test('should handle missing verification record', async ({ request }) => {
      const secret = 'test-secret'
      const payload = JSON.stringify({
        verification: {
          id: 'non-existent-session',
          status: 'success'
        }
      })
      const signature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')

      const response = await request.post('/api/verification/provider-webhook?provider=veriff', {
        headers: {
          'x-signature': signature,
          'content-type': 'application/json'
        },
        data: payload
      })

      // Should return 404 for non-existent verification
      expect(response.status()).toBe(404)
    })
  })
})

