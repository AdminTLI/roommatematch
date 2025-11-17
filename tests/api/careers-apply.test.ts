import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase service client
vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: () => ({
    from: () => ({
      insert: vi.fn().mockResolvedValue({ error: null })
    })
  })
}))

// Mock email workflow
vi.mock('@/lib/email/workflows', () => ({
  sendEmail: vi.fn().mockResolvedValue(true)
}))

describe('POST /api/careers/apply', async () => {
  const { POST } = await import('@/app/api/careers/apply/route')

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 for invalid body', async () => {
    const req = new Request('http://localhost/api/careers/apply', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' }
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 for valid body', async () => {
    const valid = {
      track: 'experienced',
      name: 'Alex Doe',
      email: 'alex@example.com',
      skills: 'Next.js, Research',
      tools: 'Figma',
      timeCommitment: '3-5 hrs/week',
      exampleProject: 'Improve onboarding questionnaire',
      notes: '',
      preferredArea: 'Product & Operations',
      courseProgram: 'MSc HCI'
    }
    const req = new Request('http://localhost/api/careers/apply', {
      method: 'POST',
      body: JSON.stringify(valid),
      headers: { 'Content-Type': 'application/json' }
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toMatchObject({ success: true })
  })
})


