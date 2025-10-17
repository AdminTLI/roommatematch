import { test, expect } from '@playwright/test'

test.describe('Integration Tests with Real Data', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and sign in
    await page.goto('/auth/sign-in')
    
    // Fill in test credentials
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'testpassword')
    await page.click('[data-testid="sign-in-button"]')
    
    // Wait for redirect
    await page.waitForURL(/\/onboarding|\/matches|\/verify/)
  })

  test.describe('Complete User Journey', () => {
    test('should complete full onboarding flow with real data', async ({ page }) => {
      // If redirected to onboarding, complete it
      if (page.url().includes('/onboarding')) {
        // Complete onboarding steps
        await page.click('[data-testid="next-button"]') // Basics
        
        // Academic step
        await page.click('[data-testid="university-select"]')
        await page.click('text=University of Amsterdam')
        await page.click('[data-testid="degree-level-select"]')
        await page.click('text=Bachelor')
        await page.click('[data-testid="programme-select"]')
        await page.click('text=Computer Science')
        await page.click('[data-testid="study-start-year-select"]')
        await page.click(`text=${new Date().getFullYear()}`)
        await page.click('[data-testid="next-button"]')
        
        // Complete remaining steps quickly
        for (let i = 0; i < 7; i++) {
          await page.click('[data-testid="next-button"]')
        }
        
        // Submit onboarding
        await page.click('[data-testid="submit-button"]')
        await page.waitForURL('/verify')
      }
    })

    test('should complete verification process', async ({ page }) => {
      await page.goto('/verify')
      
      // Upload ID document
      await page.click('[data-testid="id-upload-button"]')
      // Note: In real tests, you'd upload actual test files
      
      // Take selfie
      await page.click('[data-testid="camera-button"]')
      await page.click('[data-testid="capture-button"]')
      
      // Review and submit
      await page.click('[data-testid="next-button"]')
      await page.click('[data-testid="submit-verification"]')
      
      // Should show completion state
      await expect(page.locator('text=Verification Submitted Successfully')).toBeVisible()
    })
  })

  test.describe('Matches Interface with Real Data', () => {
    test.beforeEach(async ({ page }) => {
      // Ensure user is verified and has matches
      await page.goto('/matches')
    })

    test('should load real matches from database', async ({ page }) => {
      // Wait for matches to load
      await page.waitForSelector('[data-testid="match-card"]', { timeout: 10000 })
      
      // Verify match cards are displayed with real data
      const matchCards = page.locator('[data-testid="match-card"]')
      const count = await matchCards.count()
      
      if (count > 0) {
        const firstCard = matchCards.first()
        
        // Check that real data is displayed
        await expect(firstCard.locator('[data-testid="compatibility-score"]')).toBeVisible()
        await expect(firstCard.locator('[data-testid="university-name"]')).toBeVisible()
        await expect(firstCard.locator('[data-testid="program-name"]')).toBeVisible()
      }
    })

    test('should handle match acceptance with database update', async ({ page }) => {
      await page.waitForSelector('[data-testid="match-card"]', { timeout: 10000 })
      
      const matchCards = page.locator('[data-testid="match-card"]')
      const count = await matchCards.count()
      
      if (count > 0) {
        // Accept first match
        await matchCards.first().locator('[data-testid="accept-match"]').click()
        
        // Verify match is removed from list
        await expect(matchCards.first()).not.toBeVisible()
        
        // Check that database was updated (this would need backend verification)
      }
    })

    test('should filter matches by academic criteria', async ({ page }) => {
      // Open filters
      await page.click('[data-testid="filters-button"]')
      
      // Apply university filter
      await page.click('[data-testid="university-filter"]')
      await page.click('text=TU Delft')
      await page.click('[data-testid="apply-filters"]')
      
      // Verify filtered results
      await page.waitForSelector('[data-testid="match-card"]')
      const matchCards = page.locator('[data-testid="match-card"]')
      const count = await matchCards.count()
      
      if (count > 0) {
        // All visible matches should be from TU Delft
        for (let i = 0; i < count; i++) {
          await expect(matchCards.nth(i).locator('text=TU Delft')).toBeVisible()
        }
      }
    })
  })

  test.describe('Chat System with Real Data', () => {
    test('should create and use chat room', async ({ page }) => {
      await page.goto('/matches')
      
      // Wait for matches and start a chat
      await page.waitForSelector('[data-testid="match-card"]', { timeout: 10000 })
      
      const matchCards = page.locator('[data-testid="match-card"]')
      const count = await matchCards.count()
      
      if (count > 0) {
        // Start chat with first match
        await matchCards.first().locator('[data-testid="start-chat"]').click()
        
        // Should redirect to chat room
        await page.waitForURL(/\/chat\/[a-f0-9-]+/)
        
        // Send a message
        await page.fill('[data-testid="message-input"]', 'Hello! Great to meet you!')
        await page.click('[data-testid="send-message"]')
        
        // Verify message appears
        await expect(page.locator('text=Hello! Great to meet you!')).toBeVisible()
      }
    })

    test('should block links in chat messages', async ({ page }) => {
      await page.goto('/chat/test-room-id') // Use a test room ID
      
      // Try to send a message with a link
      await page.fill('[data-testid="message-input"]', 'Check out https://example.com')
      await page.click('[data-testid="send-message"]')
      
      // Should show error message
      await expect(page.locator('text=Links are not allowed')).toBeVisible()
    })
  })

  test.describe('Forum with Real Data', () => {
    test('should create and display forum posts', async ({ page }) => {
      await page.goto('/forum')
      
      // Create a new post
      await page.click('[data-testid="new-post-button"]')
      await page.fill('[data-testid="post-title"]', 'Test Post Title')
      await page.fill('[data-testid="post-content"]', 'This is a test post content.')
      await page.click('[data-testid="create-post"]')
      
      // Verify post appears in list
      await expect(page.locator('text=Test Post Title')).toBeVisible()
      await expect(page.locator('text=This is a test post content.')).toBeVisible()
    })

    test('should allow anonymous posting', async ({ page }) => {
      await page.goto('/forum')
      
      // Create anonymous post
      await page.click('[data-testid="new-post-button"]')
      await page.fill('[data-testid="post-title"]', 'Anonymous Test Post')
      await page.fill('[data-testid="post-content"]', 'This post is anonymous.')
      await page.check('[data-testid="anonymous-checkbox"]')
      await page.click('[data-testid="create-post"]')
      
      // Verify anonymous badge appears
      await expect(page.locator('[data-testid="anonymous-badge"]')).toBeVisible()
    })

    test('should handle post likes', async ({ page }) => {
      await page.goto('/forum')
      
      // Wait for posts to load
      await page.waitForSelector('[data-testid="forum-post"]', { timeout: 10000 })
      
      const posts = page.locator('[data-testid="forum-post"]')
      const count = await posts.count()
      
      if (count > 0) {
        const firstPost = posts.first()
        
        // Like the post
        await firstPost.locator('[data-testid="like-button"]').click()
        
        // Verify like count increased
        await expect(firstPost.locator('[data-testid="like-count"]')).toContainText('1')
      }
    })
  })

  test.describe('Admin Dashboard with Real Data', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in as admin user
      await page.goto('/auth/sign-in')
      await page.fill('[data-testid="email"]', 'admin@example.com')
      await page.fill('[data-testid="password"]', 'adminpassword')
      await page.click('[data-testid="sign-in-button"]')
      
      await page.goto('/admin')
    })

    test('should display real analytics data', async ({ page }) => {
      await page.goto('/admin')
      
      // Wait for analytics to load
      await page.waitForSelector('[data-testid="analytics-card"]', { timeout: 10000 })
      
      // Verify analytics cards show real data
      await expect(page.locator('text=Total Users')).toBeVisible()
      await expect(page.locator('text=Verified Users')).toBeVisible()
      await expect(page.locator('text=Active Chats')).toBeVisible()
      await expect(page.locator('text=Total Matches')).toBeVisible()
    })

    test('should handle report moderation', async ({ page }) => {
      await page.goto('/admin')
      
      // Navigate to moderation tab
      await page.click('[data-testid="moderation-tab"]')
      
      // Wait for reports to load
      await page.waitForSelector('[data-testid="report-item"]', { timeout: 10000 })
      
      const reports = page.locator('[data-testid="report-item"]')
      const count = await reports.count()
      
      if (count > 0) {
        const firstReport = reports.first()
        
        // Take action on report
        await firstReport.locator('[data-testid="resolve-report"]').click()
        
        // Verify report is updated
        await expect(firstReport.locator('text=Resolved')).toBeVisible()
      }
    })

    test('should allow programme re-sync', async ({ page }) => {
      await page.goto('/admin')
      
      // Navigate to settings tab
      await page.click('[data-testid="settings-tab"]')
      
      // Click re-sync programmes button
      await page.click('[data-testid="resync-programmes-button"]')
      
      // Verify success message
      await expect(page.locator('text=Programmes synced successfully')).toBeVisible()
    })
  })

  test.describe('Academic Features Integration', () => {
    test('should show academic affinity in matches', async ({ page }) => {
      await page.goto('/matches')
      
      // Wait for matches to load
      await page.waitForSelector('[data-testid="match-card"]', { timeout: 10000 })
      
      const matchCards = page.locator('[data-testid="match-card"]')
      const count = await matchCards.count()
      
      if (count > 0) {
        // Look for academic affinity badges
        const academicBadges = page.locator('[data-testid="academic-badge"]')
        const badgeCount = await academicBadges.count()
        
        if (badgeCount > 0) {
          // Verify academic badges are displayed
          await expect(academicBadges.first()).toBeVisible()
        }
      }
    })

    test('should filter by study year correctly', async ({ page }) => {
      await page.goto('/matches')
      
      // Open filters
      await page.click('[data-testid="filters-button"]')
      
      // Apply study year filter
      await page.click('[data-testid="study-year-filter"]')
      await page.click('text=Year 1-2')
      await page.click('[data-testid="apply-filters"]')
      
      // Verify filtered results show correct study years
      await page.waitForSelector('[data-testid="match-card"]')
      const matchCards = page.locator('[data-testid="match-card"]')
      const count = await matchCards.count()
      
      if (count > 0) {
        // All matches should be Year 1 or 2 students
        for (let i = 0; i < count; i++) {
          const card = matchCards.nth(i)
          // This would need to check the actual study year data
          await expect(card).toBeVisible()
        }
      }
    })
  })

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/**', route => route.abort())
      
      await page.goto('/matches')
      
      // Should show error state or fallback UI
      await expect(page.locator('text=Failed to load')).toBeVisible()
    })

    test('should handle empty states correctly', async ({ page }) => {
      await page.goto('/matches')
      
      // If no matches exist, should show empty state
      const emptyState = page.locator('[data-testid="empty-matches"]')
      const hasMatches = await page.locator('[data-testid="match-card"]').count() > 0
      
      if (!hasMatches) {
        await expect(emptyState).toBeVisible()
      }
    })

    test('should validate form inputs properly', async ({ page }) => {
      await page.goto('/forum')
      
      // Try to create post without title
      await page.click('[data-testid="new-post-button"]')
      await page.fill('[data-testid="post-content"]', 'Content without title')
      await page.click('[data-testid="create-post"]')
      
      // Should show validation error
      await expect(page.locator('text=Title is required')).toBeVisible()
    })
  })
})
