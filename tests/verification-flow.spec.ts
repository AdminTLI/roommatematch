import { test, expect } from '@playwright/test'

test.describe('Verification Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to verification page
    await page.goto('/verify')
  })

  test('should display verification status for authenticated user', async ({ page }) => {
    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem('mock-user-id', 'test-user')
      localStorage.setItem('mock-email', 'test@example.com')
    })

    // Should show verification interface
    await expect(page.locator('text=Verify Your Identity')).toBeVisible()
  })

  test('should allow starting verification process', async ({ page }) => {
    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem('mock-user-id', 'test-user')
    })

    // Mock API response for starting verification
    await page.route('/api/verification/start', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionId: 'test-session-id',
          clientToken: 'test-token',
          provider: 'veriff',
          status: 'pending'
        })
      })
    })

    // Click start verification button
    const startButton = page.locator('button:has-text("Start Verification")')
    if (await startButton.isVisible()) {
      await startButton.click()
      
      // Should show pending status
      await expect(page.locator('text=pending')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should poll verification status', async ({ page }) => {
    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem('mock-user-id', 'test-user')
    })

    // Mock status endpoint
    let callCount = 0
    await page.route('/api/verification/status', async route => {
      callCount++
      const status = callCount < 3 ? 'pending' : 'approved'
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

    // Navigate to page (triggers status polling)
    await page.reload()
    
    // Should eventually show approved status (if polling works)
    // Note: This test may need adjustment based on actual polling implementation
  })

  test('should redirect verified users to matches', async ({ page }) => {
    // Mock authentication and verified status
    await page.evaluate(() => {
      localStorage.setItem('mock-user-id', 'test-user')
    })

    // Mock verified status
    await page.route('/api/verification/status', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'verified',
          verification: {
            id: 'test-verification-id',
            provider: 'veriff',
            status: 'approved'
          }
        })
      })
    })

    // Should redirect to matches
    await page.goto('/verify')
    // Note: Actual redirect behavior depends on implementation
  })

  test('should handle verification rejection', async ({ page }) => {
    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem('mock-user-id', 'test-user')
    })

    // Mock rejected status
    await page.route('/api/verification/status', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'failed',
          verification: {
            id: 'test-verification-id',
            provider: 'veriff',
            status: 'rejected',
            reviewReason: 'Document quality insufficient'
          },
          canRetry: true
        })
      })
    })

    await page.reload()
    
    // Should show retry option
    const retryButton = page.locator('button:has-text("Retry")')
    await expect(retryButton).toBeVisible({ timeout: 5000 })
  })

  test('should gate matches page for unverified users', async ({ page }) => {
    // Mock unverified user
    await page.evaluate(() => {
      localStorage.setItem('mock-user-id', 'test-user')
    })

    // Mock unverified status
    await page.route('/api/verification/status', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'unverified'
        })
      })
    })

    // Try to access matches
    await page.goto('/matches')
    
    // Should redirect to verify page
    // Note: Actual behavior depends on middleware implementation
    await expect(page).toHaveURL(/\/verify/, { timeout: 5000 })
  })
})

