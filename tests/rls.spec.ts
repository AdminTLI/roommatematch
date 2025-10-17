import { test, expect } from '@playwright/test'

test.describe('Row Level Security (RLS)', () => {
  test('should prevent unauthorized access to profiles', async ({ page }) => {
    // Try to access profile data without authentication
    const response = await page.request.get('/api/profiles')
    expect(response.status()).toBe(401)
  })

  test('should prevent cross-user data access', async ({ page }) => {
    // Mock user A authentication
    await page.evaluate(() => {
      localStorage.setItem('mock-user-id', 'user-a')
    })
    
    // Try to access user B's profile data
    const response = await page.request.get('/api/profiles/user-b')
    expect(response.status()).toBe(403)
  })

  test('should prevent access to other users messages', async ({ page }) => {
    // Mock user authentication
    await page.evaluate(() => {
      localStorage.setItem('mock-user-id', 'user-a')
    })
    
    // Try to access messages from a chat user A is not part of
    const response = await page.request.get('/api/chats/chat-b/messages')
    expect(response.status()).toBe(403)
  })

  test('should allow users to access their own data', async ({ page }) => {
    // Mock user authentication
    await page.evaluate(() => {
      localStorage.setItem('mock-user-id', 'user-a')
    })
    
    // Should be able to access own profile
    const response = await page.request.get('/api/profiles/user-a')
    expect(response.status()).toBe(200)
  })

  test('should allow chat members to access chat data', async ({ page }) => {
    // Mock user authentication
    await page.evaluate(() => {
      localStorage.setItem('mock-user-id', 'user-a')
    })
    
    // Should be able to access chat data for chats they're part of
    const response = await page.request.get('/api/chats/chat-a/messages')
    expect(response.status()).toBe(200)
  })

  test('should enforce questionnaire cooldown', async ({ page }) => {
    // Mock user with recent questionnaire update
    await page.evaluate(() => {
      localStorage.setItem('mock-user-id', 'user-recent-update')
    })
    
    // Try to update questionnaire
    const response = await page.request.patch('/api/profiles/questionnaire', {
      data: { degree_level: 'phd' }
    })
    
    expect(response.status()).toBe(400)
    expect(await response.text()).toContain('Questionnaire answers cannot be changed within 30 days')
  })

  test('should allow questionnaire update after cooldown', async ({ page }) => {
    // Mock user with old questionnaire update
    await page.evaluate(() => {
      localStorage.setItem('mock-user-id', 'user-old-update')
    })
    
    // Should be able to update questionnaire
    const response = await page.request.patch('/api/profiles/questionnaire', {
      data: { degree_level: 'phd' }
    })
    
    expect(response.status()).toBe(200)
  })

  test('should sanitize PII in profile updates', async ({ page }) => {
    // Mock user authentication
    await page.evaluate(() => {
      localStorage.setItem('mock-user-id', 'user-a')
    })
    
    // Try to update profile with PII
    const response = await page.request.patch('/api/profiles', {
      data: { 
        first_name: 'John john@example.com',
        program: 'Computer Science +31 6 12345678'
      }
    })
    
    expect(response.status()).toBe(200)
    
    // Check that PII was sanitized
    const profileResponse = await page.request.get('/api/profiles/user-a')
    const profile = await profileResponse.json()
    
    expect(profile.first_name).not.toContain('@')
    expect(profile.program).not.toContain('+31')
  })

  test('should block links in messages', async ({ page }) => {
    // Mock user authentication
    await page.evaluate(() => {
      localStorage.setItem('mock-user-id', 'user-a')
    })
    
    // Try to send message with link
    const response = await page.request.post('/api/chats/chat-a/messages', {
      data: { content: 'Check out https://example.com' }
    })
    
    expect(response.status()).toBe(400)
    expect(await response.text()).toContain('Messages cannot contain links')
  })

  test('should allow admin access to university data', async ({ page }) => {
    // Mock admin authentication
    await page.evaluate(() => {
      localStorage.setItem('mock-user-id', 'admin-uva')
      localStorage.setItem('mock-admin-university', 'uva')
    })
    
    // Should be able to access university users
    const response = await page.request.get('/api/admin/users')
    expect(response.status()).toBe(200)
  })

  test('should prevent admin access to other universities', async ({ page }) => {
    // Mock admin from different university
    await page.evaluate(() => {
      localStorage.setItem('mock-user-id', 'admin-uva')
      localStorage.setItem('mock-admin-university', 'uva')
    })
    
    // Try to access users from different university
    const response = await page.request.get('/api/admin/users?university=tudelft')
    expect(response.status()).toBe(403)
  })

  test('should enforce rate limiting', async ({ page }) => {
    // Mock user authentication
    await page.evaluate(() => {
      localStorage.setItem('mock-user-id', 'user-a')
    })
    
    // Make multiple rapid requests
    const requests = Array(35).fill(null).map(() => 
      page.request.post('/api/messages', {
        data: { content: 'Test message' }
      })
    )
    
    const responses = await Promise.all(requests)
    
    // Some requests should be rate limited
    const rateLimitedResponses = responses.filter(r => r.status() === 429)
    expect(rateLimitedResponses.length).toBeGreaterThan(0)
  })

  test('should validate user permissions for reports', async ({ page }) => {
    // Mock user authentication
    await page.evaluate(() => {
      localStorage.setItem('mock-user-id', 'user-a')
    })
    
    // Should be able to create reports
    const response = await page.request.post('/api/reports', {
      data: {
        target_user_id: 'user-b',
        reason: 'spam',
        details: 'Sending spam messages'
      }
    })
    
    expect(response.status()).toBe(201)
  })

  test('should prevent users from accessing admin reports', async ({ page }) => {
    // Mock regular user authentication
    await page.evaluate(() => {
      localStorage.setItem('mock-user-id', 'user-a')
    })
    
    // Try to access admin reports
    const response = await page.request.get('/api/admin/reports')
    expect(response.status()).toBe(403)
  })
})
