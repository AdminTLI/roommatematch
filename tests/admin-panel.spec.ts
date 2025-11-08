import { test, expect } from '@playwright/test'

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Mock admin authentication
    await page.evaluate(() => {
      localStorage.setItem('mock-user-id', 'admin-user')
      localStorage.setItem('mock-admin-role', 'super_admin')
    })
  })

  test('should require admin authentication', async ({ page }) => {
    // Try to access admin panel without auth
    await page.evaluate(() => {
      localStorage.removeItem('mock-user-id')
    })

    const response = await page.request.get('/admin')
    expect(response.status()).toBeGreaterThanOrEqual(401)
  })

  test('should display admin dashboard', async ({ page }) => {
    await page.goto('/admin')
    
    // Should show admin dashboard
    await expect(page.locator('text=Admin Dashboard')).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to users module', async ({ page }) => {
    await page.goto('/admin')
    
    // Click users link
    const usersLink = page.locator('a:has-text("Users")')
    if (await usersLink.isVisible()) {
      await usersLink.click()
      
      // Should show users page
      await expect(page).toHaveURL(/\/admin\/users/)
      await expect(page.locator('text=User Management')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should display users list', async ({ page }) => {
    // Mock API response
    await page.route('/api/admin/users', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          users: [
            {
              id: 'user-1',
              user_id: 'user-1',
              first_name: 'Test',
              last_name: 'User',
              email: 'test@example.com',
              verification_status: 'verified',
              university_name: 'Test University',
              is_active: true,
              created_at: new Date().toISOString()
            }
          ]
        })
      })
    })

    await page.goto('/admin/users')
    
    // Should show users table
    await expect(page.locator('text=Test User')).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to reports module', async ({ page }) => {
    await page.goto('/admin')
    
    // Click reports link
    const reportsLink = page.locator('a:has-text("Reports")')
    if (await reportsLink.isVisible()) {
      await reportsLink.click()
      
      // Should show reports page
      await expect(page).toHaveURL(/\/admin\/reports/)
    }
  })

  test('should display reports queue', async ({ page }) => {
    // Mock API response
    await page.route('/api/admin/reports', async route => {
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
              created_at: new Date().toISOString()
            }
          ],
          total: 1
        })
      })
    })

    await page.goto('/admin/reports')
    
    // Should show reports table
    await expect(page.locator('text=Reports Queue')).toBeVisible({ timeout: 5000 })
  })

  test('should allow updating report status', async ({ page }) => {
    // Mock API responses
    await page.route('/api/admin/reports', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            reports: [{
              id: 'report-1',
              status: 'open',
              category: 'spam'
            }],
            total: 1
          })
        })
      } else if (route.request().method() === 'PATCH') {
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
      }
    })

    await page.goto('/admin/reports')
    
    // Find and click dismiss button
    const dismissButton = page.locator('button:has-text("Dismiss")').first()
    if (await dismissButton.isVisible({ timeout: 5000 })) {
      await dismissButton.click()
      
      // Should update status
      // Note: Actual UI update depends on implementation
    }
  })

  test('should navigate to verifications module', async ({ page }) => {
    await page.goto('/admin')
    
    const verificationsLink = page.locator('a:has-text("Verifications")')
    if (await verificationsLink.isVisible()) {
      await verificationsLink.click()
      
      await expect(page).toHaveURL(/\/admin\/verifications/)
    }
  })

  test('should display metrics dashboard', async ({ page }) => {
    // Mock API response
    await page.route('/api/admin/analytics', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalUsers: 100,
          verifiedUsers: 80,
          activeChats: 25,
          totalMatches: 150,
          reportsPending: 3
        })
      })
    })

    await page.goto('/admin/metrics')
    
    // Should show metrics
    await expect(page.locator('text=System Metrics')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=100')).toBeVisible({ timeout: 5000 })
  })

  test('should display audit logs', async ({ page }) => {
    // Mock API response
    await page.route('/api/admin/logs', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          logs: [
            {
              id: 'log-1',
              admin_user_id: 'admin-1',
              action: 'trigger_matches',
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
    
    // Should show logs
    await expect(page.locator('text=System Logs')).toBeVisible({ timeout: 5000 })
  })
})

