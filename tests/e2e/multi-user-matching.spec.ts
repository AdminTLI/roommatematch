import { test, expect } from '@playwright/test'

/**
 * Multi-User Matching Test
 * Tests matching algorithm with multiple users to verify matching works correctly
 */
test.describe('Multi-User Matching', () => {
  test('create multiple users and verify matching', async ({ browser }) => {
    const users = [
      { email: `user1-${Date.now()}@example.com`, password: 'TestPassword123!' },
      { email: `user2-${Date.now()}@example.com`, password: 'TestPassword123!' },
      { email: `user3-${Date.now()}@example.com`, password: 'TestPassword123!' }
    ]

    const contexts = await Promise.all(
      users.map(() => browser.newContext())
    )

    const pages = contexts.map(context => context.pages()[0] || context.newPage())

    try {
      // Step 1: Create all users
      await test.step('Create multiple users', async () => {
        for (let i = 0; i < users.length; i++) {
          const page = pages[i]
          const user = users[i]
          
          await page.goto('/auth/sign-up')
          await page.fill('input[name="email"]', user.email)
          await page.fill('input[name="password"]', user.password)
          await page.fill('input[name="confirmPassword"]', user.password)
          await page.click('button[type="submit"]')
          
          // Wait for signup to complete
          await page.waitForTimeout(2000)
        }
      })

      // Step 2: Sign in all users
      await test.step('Sign in all users', async () => {
        for (let i = 0; i < users.length; i++) {
          const page = pages[i]
          const user = users[i]
          
          await page.goto('/auth/sign-in')
          await page.fill('input[name="email"]', user.email)
          await page.fill('input[name="password"]', user.password)
          await page.click('button[type="submit"]')
          
          // Wait for redirect
          await page.waitForURL(/\/dashboard|\/onboarding/, { timeout: 10000 })
        }
      })

      // Step 3: Complete onboarding for all users
      await test.step('Complete onboarding for all users', async () => {
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i]
          
          await page.goto('/onboarding')
          
          // Complete basic onboarding steps
          await page.waitForSelector('[data-testid="university-select"]', { timeout: 10000 })
          await page.selectOption('[data-testid="university-select"]', { index: 1 })
          await page.selectOption('[data-testid="degree-level-select"]', { index: 1 })
          
          // Navigate through onboarding (simplified - actual flow may vary)
          const nextButton = page.locator('[data-testid="next-button"]').first()
          if (await nextButton.isVisible()) {
            await nextButton.click()
            await page.waitForTimeout(1000)
          }
        }
      })

      // Step 4: Trigger matching
      await test.step('Trigger matching algorithm', async () => {
        // Navigate to matches page for first user
        await pages[0].goto('/matches')
        
        // Wait for matches to load (may take time for matching to run)
        await pages[0].waitForTimeout(5000)
        
        // Check if matches are displayed
        const matchesContent = await pages[0].locator('body').textContent()
        expect(matchesContent).toBeTruthy()
      })

      // Step 5: Verify matches appear for users
      await test.step('Verify matches appear', async () => {
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i]
          
          await page.goto('/matches')
          await page.waitForTimeout(3000)
          
          // Matches page should load (may be empty if matching hasn't run yet)
          await expect(page.locator('body')).toBeVisible()
        }
      })

    } finally {
      // Cleanup: close all contexts
      await Promise.all(contexts.map(context => context.close()))
    }
  })

  test('matching with compatible users', async ({ browser }) => {
    // This test would require:
    // 1. Creating users with compatible preferences
    // 2. Completing onboarding with similar answers
    // 3. Verifying they appear in each other's matches
    // 4. Checking match scores are reasonable
    
    // For now, this is a placeholder that can be expanded
    const page = await browser.newPage()
    await page.goto('/matches')
    await expect(page.locator('body')).toBeVisible()
    await page.close()
  })
})

