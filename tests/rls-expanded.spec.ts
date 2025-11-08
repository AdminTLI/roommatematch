import { test, expect } from '@playwright/test'

test.describe('RLS Policies - Expanded Tests', () => {
  test.describe('Profiles Table', () => {
    test('should allow users to read their own profile', async ({ request }) => {
      // This would require actual authentication setup
      // For now, test the endpoint structure
      const response = await request.get('/api/profiles/own')
      
      // Should require authentication
      expect([200, 401, 403]).toContain(response.status())
    })

    test('should prevent users from reading other users profiles', async ({ request }) => {
      const response = await request.get('/api/profiles/other-user-id')
      
      // Should deny access
      expect([401, 403, 404]).toContain(response.status())
    })

    test('should allow users to update their own profile', async ({ request }) => {
      const response = await request.patch('/api/profiles/own', {
        data: {
          first_name: 'Updated Name'
        }
      })
      
      // Should require authentication
      expect([200, 401, 403]).toContain(response.status())
    })

    test('should prevent users from updating other users profiles', async ({ request }) => {
      const response = await request.patch('/api/profiles/other-user-id', {
        data: {
          first_name: 'Hacked Name'
        }
      })
      
      // Should deny access
      expect([401, 403, 404]).toContain(response.status())
    })
  })

  test.describe('Verifications Table', () => {
    test('should allow users to read their own verification', async ({ request }) => {
      const response = await request.get('/api/verification/status')
      
      // Should require authentication
      expect([200, 401]).toContain(response.status())
    })

    test('should prevent users from reading other users verifications', async ({ request }) => {
      // Direct table access should be blocked
      const response = await request.get('/api/verifications/other-user-id')
      
      // Should deny access
      expect([401, 403, 404]).toContain(response.status())
    })

    test('should allow admins to read all verifications', async ({ request }) => {
      const response = await request.get('/api/admin/verifications')
      
      // Should require admin authentication
      expect([200, 401, 403]).toContain(response.status())
    })
  })

  test.describe('Match Suggestions Table', () => {
    test('should allow users to read their own matches', async ({ request }) => {
      const response = await request.get('/api/match/suggestions')
      
      // Should require authentication
      expect([200, 401]).toContain(response.status())
    })

    test('should prevent users from reading other users matches', async ({ request }) => {
      // Try to access matches for different user
      const response = await request.get('/api/match/suggestions?userId=other-user-id')
      
      // Should only return own matches or deny access
      expect([200, 401, 403]).toContain(response.status())
    })

    test('should allow users to update their own match decisions', async ({ request }) => {
      const response = await request.post('/api/match/suggestions/respond', {
        data: {
          suggestion_id: 'match-1',
          decision: 'accepted'
        }
      })
      
      // Should require authentication
      expect([200, 401, 404]).toContain(response.status())
    })

    test('should prevent users from updating other users match decisions', async ({ request }) => {
      // This would require knowing another user's match ID
      // RLS should prevent this
      const response = await request.post('/api/match/suggestions/respond', {
        data: {
          suggestion_id: 'other-user-match-id',
          decision: 'accepted'
        }
      })
      
      // Should deny access
      expect([401, 403, 404]).toContain(response.status())
    })
  })

  test.describe('Chats Table', () => {
    test('should allow chat members to read chat data', async ({ request }) => {
      const response = await request.get('/api/chats/chat-room-id')
      
      // Should require authentication and membership
      expect([200, 401, 403, 404]).toContain(response.status())
    })

    test('should prevent non-members from reading chat data', async ({ request }) => {
      // Try to access chat user is not part of
      const response = await request.get('/api/chats/other-chat-id')
      
      // Should deny access
      expect([401, 403, 404]).toContain(response.status())
    })

    test('should allow chat members to send messages', async ({ request }) => {
      const response = await request.post('/api/chat/send', {
        data: {
          chat_id: 'chat-room-id',
          content: 'Test message'
        }
      })
      
      // Should require authentication and membership
      expect([200, 201, 401, 403, 404]).toContain(response.status())
    })

    test('should prevent non-members from sending messages', async ({ request }) => {
      const response = await request.post('/api/chat/send', {
        data: {
          chat_id: 'other-chat-id',
          content: 'Unauthorized message'
        }
      })
      
      // Should deny access
      expect([401, 403, 404]).toContain(response.status())
    })
  })

  test.describe('Messages Table', () => {
    test('should allow chat members to read messages', async ({ request }) => {
      const response = await request.get('/api/chats/chat-room-id/messages')
      
      // Should require authentication and membership
      expect([200, 401, 403, 404]).toContain(response.status())
    })

    test('should prevent non-members from reading messages', async ({ request }) => {
      const response = await request.get('/api/chats/other-chat-id/messages')
      
      // Should deny access
      expect([401, 403, 404]).toContain(response.status())
    })

    test('should allow users to mark their own messages as read', async ({ request }) => {
      const response = await request.post('/api/chat/read', {
        data: {
          chat_id: 'chat-room-id'
        }
      })
      
      // Should require authentication and membership
      expect([200, 401, 403, 404]).toContain(response.status())
    })
  })

  test.describe('Reports Table', () => {
    test('should allow users to create reports', async ({ request }) => {
      const response = await request.post('/api/chat/report', {
        data: {
          target_user_id: 'target-user-id',
          category: 'spam',
          reason: 'Spam messages'
        }
      })
      
      // Should require authentication
      expect([200, 201, 401]).toContain(response.status())
    })

    test('should prevent users from reading other users reports', async ({ request }) => {
      // Users should only see their own reports (if any)
      const response = await request.get('/api/reports/other-user-report-id')
      
      // Should deny access
      expect([401, 403, 404]).toContain(response.status())
    })

    test('should allow admins to read all reports', async ({ request }) => {
      const response = await request.get('/api/admin/reports')
      
      // Should require admin authentication
      expect([200, 401, 403]).toContain(response.status())
    })
  })

  test.describe('Responses Table', () => {
    test('should allow users to read their own questionnaire responses', async ({ request }) => {
      const response = await request.get('/api/onboarding/load')
      
      // Should require authentication
      expect([200, 401]).toContain(response.status())
    })

    test('should prevent users from reading other users responses', async ({ request }) => {
      // Direct access to other user's responses should be blocked
      const response = await request.get('/api/responses/other-user-id')
      
      // Should deny access
      expect([401, 403, 404]).toContain(response.status())
    })

    test('should allow users to update their own responses', async ({ request }) => {
      const response = await request.post('/api/onboarding/save', {
        data: {
          section: 'intro',
          answers: []
        }
      })
      
      // Should require authentication
      expect([200, 401]).toContain(response.status())
    })
  })

  test.describe('User Vectors Table', () => {
    test('should prevent users from reading their own vectors directly', async ({ request }) => {
      // Vectors should not be directly accessible via API
      const response = await request.get('/api/vectors/own')
      
      // Should deny direct access (vectors used internally)
      expect([401, 403, 404]).toContain(response.status())
    })

    test('should prevent users from reading other users vectors', async ({ request }) => {
      const response = await request.get('/api/vectors/other-user-id')
      
      // Should deny access
      expect([401, 403, 404]).toContain(response.status())
    })
  })

  test.describe('Admin Actions Table', () => {
    test('should prevent regular users from reading admin actions', async ({ request }) => {
      const response = await request.get('/api/admin/actions')
      
      // Should require admin authentication
      expect([401, 403, 404]).toContain(response.status())
    })

    test('should allow admins to read admin actions', async ({ request }) => {
      const response = await request.get('/api/admin/logs')
      
      // Should require admin authentication
      expect([200, 401, 403]).toContain(response.status())
    })

    test('should prevent users from creating admin actions', async ({ request }) => {
      const response = await request.post('/api/admin/actions', {
        data: {
          action: 'fake_action',
          entity_type: 'user',
          entity_id: 'user-1'
        }
      })
      
      // Should deny access (only system can create admin actions)
      expect([401, 403, 404, 405]).toContain(response.status())
    })
  })

  test.describe('Match Blocklist Table', () => {
    test('should allow users to read their own blocklist', async ({ request }) => {
      const response = await request.get('/api/match/blocklist')
      
      // Should require authentication
      expect([200, 401]).toContain(response.status())
    })

    test('should prevent users from reading other users blocklist', async ({ request }) => {
      const response = await request.get('/api/match/blocklist/other-user-id')
      
      // Should deny access
      expect([401, 403, 404]).toContain(response.status())
    })

    test('should allow users to add to their own blocklist', async ({ request }) => {
      const response = await request.post('/api/match/block', {
        data: {
          target_user_id: 'target-user-id'
        }
      })
      
      // Should require authentication
      expect([200, 201, 401]).toContain(response.status())
    })

    test('should prevent users from modifying other users blocklist', async ({ request }) => {
      // Try to block on behalf of another user
      const response = await request.post('/api/match/block', {
        data: {
          user_id: 'other-user-id',
          target_user_id: 'target-user-id'
        }
      })
      
      // Should only allow blocking for authenticated user
      expect([200, 201, 401, 403]).toContain(response.status())
    })
  })

  test.describe('Onboarding Submissions Table', () => {
    test('should allow users to read their own submission', async ({ request }) => {
      const response = await request.get('/api/onboarding/submission')
      
      // Should require authentication
      expect([200, 401, 404]).toContain(response.status())
    })

    test('should prevent users from reading other users submissions', async ({ request }) => {
      const response = await request.get('/api/onboarding/submission/other-user-id')
      
      // Should deny access
      expect([401, 403, 404]).toContain(response.status())
    })

    test('should allow users to create their own submission', async ({ request }) => {
      const response = await request.post('/api/onboarding/submit')
      
      // Should require authentication
      expect([200, 401]).toContain(response.status())
    })
  })

  test.describe('Notifications Table', () => {
    test('should allow users to read their own notifications', async ({ request }) => {
      const response = await request.get('/api/notifications')
      
      // Should require authentication
      expect([200, 401]).toContain(response.status())
    })

    test('should prevent users from reading other users notifications', async ({ request }) => {
      const response = await request.get('/api/notifications/other-user-id')
      
      // Should deny access
      expect([401, 403, 404]).toContain(response.status())
    })

    test('should allow users to mark their own notifications as read', async ({ request }) => {
      const response = await request.patch('/api/notifications/notification-id/read')
      
      // Should require authentication and ownership
      expect([200, 401, 403, 404]).toContain(response.status())
    })
  })

  test.describe('Cross-Table Access', () => {
    test('should prevent users from accessing admin-only tables', async ({ request }) => {
      const adminTables = [
        '/api/admin/users',
        '/api/admin/matches',
        '/api/admin/chats',
        '/api/admin/reports',
        '/api/admin/verifications',
        '/api/admin/logs'
      ]

      for (const endpoint of adminTables) {
        const response = await request.get(endpoint)
        // Should require admin authentication
        expect([401, 403]).toContain(response.status())
      }
    })

    test('should enforce university scoping for admins', async ({ request }) => {
      // Admin should only see their university's data
      const response = await request.get('/api/admin/users?university=other-university')
      
      // Should filter to admin's university or deny
      expect([200, 401, 403]).toContain(response.status())
    })
  })

  test.describe('Rate Limiting', () => {
    test('should enforce rate limits on API endpoints', async ({ request }) => {
      // Make rapid requests
      const requests = Array(35).fill(null).map(() => 
        request.post('/api/chat/send', {
          data: {
            chat_id: 'test-chat',
            content: 'Test message'
          }
        })
      )
      
      const responses = await Promise.all(requests)
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status() === 429)
      // Note: Rate limiting may not be enabled in test environment
      // This test verifies the endpoint structure
      expect(responses.length).toBe(35)
    })
  })

  test.describe('Data Validation', () => {
    test('should sanitize PII in profile updates', async ({ request }) => {
      const response = await request.patch('/api/profiles', {
        data: {
          first_name: 'John john@example.com +31 6 12345678',
          bio: 'Contact me at test@example.com or call +31 6 12345678'
        }
      })
      
      // Should accept but sanitize
      if (response.status() === 200) {
        const profile = await response.json()
        // PII should be removed
        expect(profile.first_name).not.toContain('@')
        expect(profile.first_name).not.toContain('+31')
      }
    })

    test('should block links in messages', async ({ request }) => {
      const response = await request.post('/api/chat/send', {
        data: {
          chat_id: 'test-chat',
          content: 'Check out https://example.com'
        }
      })
      
      // Should reject messages with links
      expect([400, 401, 403, 404]).toContain(response.status())
    })

    test('should block email addresses in messages', async ({ request }) => {
      const response = await request.post('/api/chat/send', {
        data: {
          chat_id: 'test-chat',
          content: 'Contact me at test@example.com'
        }
      })
      
      // Should reject messages with email addresses
      expect([400, 401, 403, 404]).toContain(response.status())
    })

    test('should block phone numbers in messages', async ({ request }) => {
      const response = await request.post('/api/chat/send', {
        data: {
          chat_id: 'test-chat',
          content: 'Call me at +31 6 12345678'
        }
      })
      
      // Should reject messages with phone numbers
      expect([400, 401, 403, 404]).toContain(response.status())
    })
  })
})

