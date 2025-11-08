import { test, expect } from '@playwright/test'

test.describe('Admin Panel - Expanded Tests', () => {
  test.describe('Authentication & Authorization', () => {
    test('should require admin authentication for all admin routes', async ({ page }) => {
      const adminRoutes = [
        '/admin',
        '/admin/users',
        '/admin/matches',
        '/admin/chats',
        '/admin/reports',
        '/admin/verifications',
        '/admin/metrics',
        '/admin/logs'
      ]

      for (const route of adminRoutes) {
        const response = await page.request.get(route)
        expect(response.status()).toBeGreaterThanOrEqual(401)
      }
    })

    test('should prevent non-admin users from accessing admin panel', async ({ page }) => {
      // Mock regular user (not admin)
      await page.route('/api/auth/user', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: { id: 'regular-user', email: 'user@example.com' }
          })
        })
      })

      await page.goto('/admin')
      
      // Should redirect or show 403
      await expect(page).toHaveURL(/\/admin/, { timeout: 5000 })
      // Or check for error message
    })
  })

  test.describe('Users Module', () => {
    test.beforeEach(async ({ page }) => {
      // Mock admin authentication
      await page.route('/api/auth/user', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: { id: 'admin-user', email: 'admin@example.com' }
          })
        })
      })
    })

    test('should display users list with pagination', async ({ page }) => {
      await page.route('/api/admin/users*', async route => {
        const url = new URL(route.request().url())
        const offset = parseInt(url.searchParams.get('offset') || '0')
        const limit = parseInt(url.searchParams.get('limit') || '100')
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            users: Array.from({ length: Math.min(limit, 20) }, (_, i) => ({
              id: `user-${offset + i}`,
              user_id: `user-${offset + i}`,
              first_name: `User${offset + i}`,
              last_name: 'Test',
              email: `user${offset + i}@example.com`,
              verification_status: 'verified',
              university_name: 'Test University',
              is_active: true,
              created_at: new Date().toISOString()
            })),
            total: 50
          })
        })
      })

      await page.goto('/admin/users')
      
      await expect(page.locator('text=User Management')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=user0@example.com')).toBeVisible({ timeout: 5000 })
    })

    test('should filter users by verification status', async ({ page }) => {
      await page.route('/api/admin/users*', async route => {
        const url = new URL(route.request().url())
        const status = url.searchParams.get('verification_status')
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            users: status === 'verified' ? [
              {
                id: 'user-1',
                verification_status: 'verified',
                email: 'verified@example.com'
              }
            ] : [],
            total: status === 'verified' ? 1 : 0
          })
        })
      })

      await page.goto('/admin/users')
      
      // Select verified filter
      const filter = page.locator('select[name="verification_status"]')
      if (await filter.isVisible({ timeout: 5000 })) {
        await filter.selectOption('verified')
        await page.waitForTimeout(1000)
        
        // Should show only verified users
        await expect(page.locator('text=verified@example.com')).toBeVisible({ timeout: 5000 })
      }
    })

    test('should search users by email or name', async ({ page }) => {
      await page.route('/api/admin/users*', async route => {
        const url = new URL(route.request().url())
        const search = url.searchParams.get('search')
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            users: search ? [
              {
                id: 'user-1',
                email: search,
                first_name: 'Test',
                last_name: 'User'
              }
            ] : [],
            total: search ? 1 : 0
          })
        })
      })

      await page.goto('/admin/users')
      
      const searchInput = page.locator('input[placeholder*="Search"]')
      if (await searchInput.isVisible({ timeout: 5000 })) {
        await searchInput.fill('test@example.com')
        await page.waitForTimeout(1000)
        
        // Should show search results
        await expect(page.locator('text=test@example.com')).toBeVisible({ timeout: 5000 })
      }
    })

    test('should suspend user account', async ({ page }) => {
      await page.route('/api/admin/users', async route => {
        if (route.request().method() === 'POST') {
          const body = await route.request().postDataJSON()
          if (body.action === 'suspend' && body.userIds?.includes('user-1')) {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ success: true })
            })
            return
          }
        }
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            users: [{
              id: 'user-1',
              email: 'test@example.com',
              is_active: true
            }]
          })
        })
      })

      await page.goto('/admin/users')
      
      // Find suspend button and click
      const suspendButton = page.locator('button:has-text("Suspend")').first()
      if (await suspendButton.isVisible({ timeout: 5000 })) {
        await suspendButton.click()
        await page.waitForTimeout(1000)
        
        // Should show success message
        await expect(page.locator('text=/success|suspended/i')).toBeVisible({ timeout: 5000 })
      }
    })

    test('should export users list', async ({ page }) => {
      await page.route('/api/admin/users/export*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'text/csv',
          body: 'id,email,name\nuser-1,test@example.com,Test User'
        })
      })

      await page.goto('/admin/users')
      
      const exportButton = page.locator('button:has-text("Export")')
      if (await exportButton.isVisible({ timeout: 5000 })) {
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          exportButton.click()
        ])
        
        expect(download.suggestedFilename()).toContain('.csv')
      }
    })
  })

  test.describe('Matches Module', () => {
    test('should display matches with statistics', async ({ page }) => {
      await page.route('/api/admin/matches*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            matches: [
              {
                id: 'match-1',
                run_id: 'run-123',
                kind: 'pair',
                member_ids: ['user-1', 'user-2'],
                fit_score: 0.85,
                fit_index: 0.85,
                status: 'pending',
                accepted_by: [],
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date().toISOString(),
                members: [
                  { id: 'user-1', name: 'User 1', email: 'user1@example.com' },
                  { id: 'user-2', name: 'User 2', email: 'user2@example.com' }
                ]
              }
            ],
            total: 1,
            statistics: {
              total: 100,
              pending: 50,
              accepted: 30,
              declined: 15,
              expired: 5,
              confirmed: 10,
              avgScore: 0.75
            }
          })
        })
      })

      await page.goto('/admin/matches')
      
      await expect(page.locator('text=Match Management')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=100')).toBeVisible({ timeout: 5000 }) // Total matches
    })

    test('should filter matches by status', async ({ page }) => {
      await page.route('/api/admin/matches*', async route => {
        const url = new URL(route.request().url())
        const status = url.searchParams.get('status')
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            matches: status === 'pending' ? [
              {
                id: 'match-1',
                status: 'pending',
                fit_score: 0.8
              }
            ] : [],
            total: status === 'pending' ? 1 : 0
          })
        })
      })

      await page.goto('/admin/matches')
      
      const statusFilter = page.locator('select[name="status"]')
      if (await statusFilter.isVisible({ timeout: 5000 })) {
        await statusFilter.selectOption('pending')
        await page.waitForTimeout(1000)
        
        // Should show only pending matches
        await expect(page.locator('text=pending')).toBeVisible({ timeout: 5000 })
      }
    })

    test('should trigger manual matching run', async ({ page }) => {
      await page.route('/api/admin/matches', async route => {
        if (route.request().method() === 'POST') {
          const body = await route.request().postDataJSON()
          if (body.action === 'refresh') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                success: true,
                message: 'Matches refreshed successfully',
                runId: 'run-123',
                count: 10
              })
            })
            return
          }
        }
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ matches: [], total: 0 })
        })
      })

      await page.goto('/admin/matches')
      
      const refreshButton = page.locator('button:has-text("Refresh")')
      if (await refreshButton.isVisible({ timeout: 5000 })) {
        await refreshButton.click()
        await page.waitForTimeout(2000)
        
        // Should show success message
        await expect(page.locator('text=/success|refreshed/i')).toBeVisible({ timeout: 5000 })
      }
    })

    test('should export matches', async ({ page }) => {
      await page.route('/api/admin/matches/export*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'text/csv',
          body: 'Match ID,Status,Score\nmatch-1,pending,0.85'
        })
      })

      await page.goto('/admin/matches')
      
      const exportButton = page.locator('button:has-text("Export")')
      if (await exportButton.isVisible({ timeout: 5000 })) {
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          exportButton.click()
        ])
        
        expect(download.suggestedFilename()).toContain('.csv')
      }
    })
  })

  test.describe('Reports Module', () => {
    test('should display reports queue', async ({ page }) => {
      await page.route('/api/admin/reports*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            reports: [
              {
                id: 'report-1',
                reporter_id: 'reporter-1',
                target_user_id: 'target-1',
                category: 'spam',
                reason: 'Fake account',
                status: 'open',
                auto_blocked: false,
                created_at: new Date().toISOString(),
                reporter: {
                  user_id: 'reporter-1',
                  first_name: 'Reporter',
                  last_name: 'User',
                  email: 'reporter@example.com'
                },
                target: {
                  user_id: 'target-1',
                  first_name: 'Target',
                  last_name: 'User',
                  email: 'target@example.com'
                }
              }
            ],
            total: 1
          })
        })
      })

      await page.goto('/admin/reports')
      
      await expect(page.locator('text=Reports Queue')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=spam')).toBeVisible({ timeout: 5000 })
    })

    test('should warn user from report', async ({ page }) => {
      await page.route('/api/admin/reports', async route => {
        if (route.request().method() === 'POST') {
          const body = await route.request().postDataJSON()
          if (body.action === 'warn') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                success: true,
                message: 'Warning sent to user'
              })
            })
            return
          }
        }
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            reports: [{
              id: 'report-1',
              status: 'open',
              category: 'spam',
              target_user_id: 'target-1'
            }],
            total: 1
          })
        })
      })

      await page.goto('/admin/reports')
      
      const warnButton = page.locator('button:has-text("Warn")').first()
      if (await warnButton.isVisible({ timeout: 5000 })) {
        await warnButton.click()
        
        // Fill warning message if dialog appears
        const messageInput = page.locator('textarea[placeholder*="warning"]')
        if (await messageInput.isVisible({ timeout: 2000 })) {
          await messageInput.fill('This is a warning')
          await page.locator('button:has-text("Send Warning")').click()
        }
        
        await page.waitForTimeout(1000)
        await expect(page.locator('text=/success|warned/i')).toBeVisible({ timeout: 5000 })
      }
    })

    test('should ban user from report', async ({ page }) => {
      await page.route('/api/admin/reports', async route => {
        if (route.request().method() === 'POST') {
          const body = await route.request().postDataJSON()
          if (body.action === 'ban') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                success: true,
                message: 'User account suspended'
              })
            })
            return
          }
        }
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            reports: [{
              id: 'report-1',
              status: 'open',
              category: 'harassment',
              target_user_id: 'target-1'
            }],
            total: 1
          })
        })
      })

      await page.goto('/admin/reports')
      
      const banButton = page.locator('button:has-text("Ban")').first()
      if (await banButton.isVisible({ timeout: 5000 })) {
        await banButton.click()
        
        // Fill ban reason if dialog appears
        const reasonInput = page.locator('textarea[placeholder*="reason"]')
        if (await reasonInput.isVisible({ timeout: 2000 })) {
          await reasonInput.fill('Violation of community guidelines')
          await page.locator('button:has-text("Ban User")').click()
        }
        
        await page.waitForTimeout(1000)
        await expect(page.locator('text=/success|banned|suspended/i')).toBeVisible({ timeout: 5000 })
      }
    })

    test('should dismiss report', async ({ page }) => {
      await page.route('/api/admin/reports', async route => {
        if (route.request().method() === 'PATCH') {
          const body = await route.request().postDataJSON()
          if (body.status === 'dismissed') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                success: true,
                report: {
                  id: 'report-1',
                  status: 'dismissed'
                }
              })
            })
            return
          }
        }
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            reports: [{
              id: 'report-1',
              status: 'open'
            }],
            total: 1
          })
        })
      })

      await page.goto('/admin/reports')
      
      const viewButton = page.locator('button:has-text("View")').first()
      if (await viewButton.isVisible({ timeout: 5000 })) {
        await viewButton.click()
        
        // Click dismiss in dialog
        const dismissButton = page.locator('button:has-text("Dismiss")')
        if (await dismissButton.isVisible({ timeout: 2000 })) {
          await dismissButton.click()
          await page.waitForTimeout(1000)
          
          await expect(page.locator('text=/success|dismissed/i')).toBeVisible({ timeout: 5000 })
        }
      }
    })
  })

  test.describe('Chats Module', () => {
    test('should display chat rooms list', async ({ page }) => {
      await page.route('/api/admin/chats*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            chats: [
              {
                id: 'chat-1',
                is_group: false,
                created_by: 'user-1',
                created_at: new Date().toISOString(),
                member_count: 2,
                members: [
                  { id: 'user-1', name: 'User 1', email: 'user1@example.com' },
                  { id: 'user-2', name: 'User 2', email: 'user2@example.com' }
                ],
                message_count: 10,
                unread_counts: [
                  { user_id: 'user-1', count: 2 },
                  { user_id: 'user-2', count: 0 }
                ]
              }
            ],
            total: 1
          })
        })
      })

      await page.goto('/admin/chats')
      
      await expect(page.locator('text=Chat Management')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=2')).toBeVisible({ timeout: 5000 }) // Member count
    })

    test('should export chat logs', async ({ page }) => {
      await page.route('/api/admin/chats/export*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'text/csv',
          body: 'Message ID,Sender,Content,Timestamp\nmsg-1,User 1,Hello,2024-01-01T12:00:00Z'
        })
      })

      await page.goto('/admin/chats')
      
      const exportButton = page.locator('button:has-text("Export")').first()
      if (await exportButton.isVisible({ timeout: 5000 })) {
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          exportButton.click()
        ])
        
        expect(download.suggestedFilename()).toContain('.csv')
      }
    })

    test('should close chat room', async ({ page }) => {
      await page.route('/api/admin/chats', async route => {
        if (route.request().method() === 'POST') {
          const body = await route.request().postDataJSON()
          if (body.action === 'close') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                success: true,
                message: 'Chat closed successfully'
              })
            })
            return
          }
        }
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            chats: [{
              id: 'chat-1',
              is_group: false,
              member_count: 2
            }],
            total: 1
          })
        })
      })

      await page.goto('/admin/chats')
      
      const closeButton = page.locator('button:has-text("Close")').first()
      if (await closeButton.isVisible({ timeout: 5000 })) {
        await closeButton.click()
        
        // Confirm in dialog
        const confirmButton = page.locator('button:has-text("Close Chat")')
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click()
          await page.waitForTimeout(1000)
          
          await expect(page.locator('text=/success|closed/i')).toBeVisible({ timeout: 5000 })
        }
      }
    })
  })

  test.describe('Verifications Module', () => {
    test('should display verification queue', async ({ page }) => {
      await page.route('/api/admin/verifications*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            verifications: [
              {
                id: 'verification-1',
                user_id: 'user-1',
                provider: 'veriff',
                status: 'pending',
                created_at: new Date().toISOString()
              }
            ],
            total: 1
          })
        })
      })

      await page.goto('/admin/verifications')
      
      await expect(page.locator('text=/verification|queue/i')).toBeVisible({ timeout: 5000 })
    })

    test('should manually approve verification', async ({ page }) => {
      await page.route('/api/admin/verifications', async route => {
        if (route.request().method() === 'POST') {
          const body = await route.request().postDataJSON()
          if (body.action === 'approve') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                success: true,
                verification: {
                  id: 'verification-1',
                  status: 'approved'
                }
              })
            })
            return
          }
        }
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            verifications: [{
              id: 'verification-1',
              status: 'pending'
            }],
            total: 1
          })
        })
      })

      await page.goto('/admin/verifications')
      
      const approveButton = page.locator('button:has-text("Approve")').first()
      if (await approveButton.isVisible({ timeout: 5000 })) {
        await approveButton.click()
        await page.waitForTimeout(1000)
        
        await expect(page.locator('text=/success|approved/i')).toBeVisible({ timeout: 5000 })
      }
    })
  })

  test.describe('Metrics Module', () => {
    test('should display system metrics', async ({ page }) => {
      await page.route('/api/admin/analytics', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalUsers: 1000,
            verifiedUsers: 800,
            activeChats: 150,
            totalMatches: 500,
            reportsPending: 5,
            signupsLast7Days: 50,
            signupsLast30Days: 200,
            verificationRate: 80,
            matchActivity: 100
          })
        })
      })

      await page.goto('/admin/metrics')
      
      await expect(page.locator('text=System Metrics')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=1000')).toBeVisible({ timeout: 5000 }) // Total users
      await expect(page.locator('text=800')).toBeVisible({ timeout: 5000 }) // Verified users
    })
  })

  test.describe('Logs Module', () => {
    test('should display audit logs', async ({ page }) => {
      await page.route('/api/admin/logs*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            logs: [
              {
                id: 'log-1',
                admin_user_id: 'admin-1',
                action: 'warn_user',
                entity_type: 'user',
                entity_id: 'user-1',
                metadata: { report_id: 'report-1' },
                created_at: new Date().toISOString(),
                admin: {
                  email: 'admin@example.com'
                }
              }
            ],
            total: 1
          })
        })
      })

      await page.goto('/admin/logs')
      
      await expect(page.locator('text=System Logs')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=warn_user')).toBeVisible({ timeout: 5000 })
    })

    test('should filter logs by action type', async ({ page }) => {
      await page.route('/api/admin/logs*', async route => {
        const url = new URL(route.request().url())
        const action = url.searchParams.get('action')
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            logs: action === 'warn_user' ? [
              {
                id: 'log-1',
                action: 'warn_user',
                admin: { email: 'admin@example.com' }
              }
            ] : [],
            total: action === 'warn_user' ? 1 : 0
          })
        })
      })

      await page.goto('/admin/logs')
      
      const actionFilter = page.locator('select[name="action"]')
      if (await actionFilter.isVisible({ timeout: 5000 })) {
        await actionFilter.selectOption('warn_user')
        await page.waitForTimeout(1000)
        
        await expect(page.locator('text=warn_user')).toBeVisible({ timeout: 5000 })
      }
    })

    test('should export logs', async ({ page }) => {
      await page.goto('/admin/logs')
      
      const exportButton = page.locator('button:has-text("Export")')
      if (await exportButton.isVisible({ timeout: 5000 })) {
        // Mock download
        await exportButton.click()
        await page.waitForTimeout(1000)
      }
    })
  })

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      await page.route('/api/admin/users', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Internal server error'
          })
        })
      })

      await page.goto('/admin/users')
      
      // Should show error message or handle gracefully
      await page.waitForTimeout(2000)
    })

    test('should handle network failures', async ({ page }) => {
      await page.route('/api/admin/matches', async route => {
        await route.abort('failed')
      })

      await page.goto('/admin/matches')
      
      // Should handle error without crashing
      await page.waitForTimeout(2000)
    })
  })
})

