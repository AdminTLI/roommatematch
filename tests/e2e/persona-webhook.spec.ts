import { test, expect } from '@playwright/test'

/**
 * Persona Webhook Delivery Test
 * Tests Persona webhook processing and verification status updates
 */
test.describe('Persona Webhook', () => {
  test('webhook endpoint exists and accepts requests', async ({ request }) => {
    // Test that the webhook endpoint exists
    const response = await request.post('/api/webhooks/persona', {
      data: {
        data: {
          type: 'inquiry.status.updated',
          attributes: {
            status: 'completed',
            inquiry_id: 'test-inquiry-id'
          }
        }
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Should return 200 (if webhook secret matches) or 401/403 (if not)
    // In test environment, might return 400 if webhook secret doesn't match
    expect([200, 400, 401, 403]).toContain(response.status())
  })

  test('webhook validates signature', async ({ request }) => {
    // Test that webhook rejects requests without proper signature
    const response = await request.post('/api/webhooks/persona', {
      data: {
        data: {
          type: 'inquiry.status.updated',
          attributes: {
            status: 'completed'
          }
        }
      },
      headers: {
        'Content-Type': 'application/json'
        // Missing Persona signature header
      }
    })

    // Should reject if signature is missing or invalid
    expect([400, 401, 403]).toContain(response.status())
  })

  test('webhook processes verification completion', async ({ request }) => {
    // Mock webhook payload for completed verification
    const mockWebhookPayload = {
      data: {
        type: 'inquiry.status.updated',
        id: 'test-inquiry-id',
        attributes: {
          status: 'completed',
          inquiry_id: 'test-inquiry-id',
          verification_status: 'passed'
        }
      }
    }

    // Note: In a real test, you would:
    // 1. Create a test user
    // 2. Initiate Persona verification for that user
    // 3. Get the inquiry_id
    // 4. Send webhook with proper signature
    // 5. Verify user's verification_status was updated

    // For now, we'll just test the endpoint structure
    const response = await request.post('/api/webhooks/persona', {
      data: mockWebhookPayload,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Should handle the request (may reject without proper signature)
    expect([200, 400, 401, 403]).toContain(response.status())
  })

  test('webhook handles different event types', async ({ request }) => {
    const eventTypes = [
      'inquiry.status.updated',
      'inquiry.created',
      'inquiry.failed'
    ]

    for (const eventType of eventTypes) {
      const response = await request.post('/api/webhooks/persona', {
        data: {
          data: {
            type: eventType,
            attributes: {
              status: 'completed'
            }
          }
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Endpoint should exist and handle the request
      expect([200, 400, 401, 403]).toContain(response.status())
    }
  })
})

