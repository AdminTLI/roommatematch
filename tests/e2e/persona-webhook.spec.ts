import { test, expect } from '@playwright/test'
import crypto from 'crypto'

const WEBHOOK_PATH = '/api/verification/provider-webhook?provider=persona'

/**
 * Persona Webhook Delivery Test
 * Targets the real provider-webhook route (not the legacy /api/webhooks/persona path).
 */
test.describe('Persona Webhook', () => {
  test('webhook endpoint rejects missing signature when secret is configured', async ({
    request,
  }) => {
    const response = await request.post(WEBHOOK_PATH, {
      data: {
        data: {
          id: 'inq_test',
          type: 'inquiry',
          attributes: { status: 'completed' },
        },
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // 401 invalid signature, 503 secret missing, or 400 invalid payload
    expect([400, 401, 503]).toContain(response.status())
  })

  test('webhook rejects invalid signature', async ({ request }) => {
    const response = await request.post(WEBHOOK_PATH, {
      data: {
        data: {
          id: 'inq_test',
          type: 'inquiry',
          attributes: { status: 'completed' },
        },
      },
      headers: {
        'Content-Type': 'application/json',
        'x-persona-signature': 'sha256=deadbeef',
      },
    })

    expect([401, 503]).toContain(response.status())
  })

  test('webhook accepts valid HMAC when secret matches env', async ({ request }) => {
    const secret = process.env.PERSONA_WEBHOOK_SECRET
    if (!secret) {
      test.skip()
      return
    }

    const payload = JSON.stringify({
      data: {
        id: 'inq_e2e_nonexistent',
        type: 'inquiry',
        attributes: { status: 'completed' },
      },
    })
    const signature =
      'sha256=' + crypto.createHmac('sha256', secret).update(payload).digest('hex')

    const response = await request.post(WEBHOOK_PATH, {
      data: JSON.parse(payload),
      headers: {
        'Content-Type': 'application/json',
        'x-persona-signature': signature,
      },
    })

    // Unknown inquiry → 404 after signature OK; schema fail → 400
    expect([200, 400, 404]).toContain(response.status())
  })
})
