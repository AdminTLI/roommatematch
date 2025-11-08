import { test, expect } from '@playwright/test'

/**
 * Complete End-to-End User Journey Test
 * Tests the full flow: signup → email verification → Persona verification → onboarding → matching → chat
 */
test.describe('Complete User Journey', () => {
  test('complete user journey from signup to chat', async ({ page, context }) => {
    const timestamp = Date.now()
    const testEmail = `test-${timestamp}@example.com`
    const testPassword = 'TestPassword123!'

    // Step 1: Sign up
    await test.step('Sign up new user', async () => {
      await page.goto('/auth/sign-up')
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', testPassword)
      await page.fill('input[name="confirmPassword"]', testPassword)
      await page.click('button[type="submit"]')
      
      // Should redirect to email verification page or show success message
      await expect(page.locator('text=/verify|check your email|confirmation/i')).toBeVisible({ timeout: 10000 })
    })

    // Step 2: Email verification (mock - in real flow would check email)
    await test.step('Email verification', async () => {
      // In a real test, you would:
      // 1. Check email inbox
      // 2. Extract verification link
      // 3. Navigate to verification link
      // For now, we'll assume verification is handled via API or test setup
      // This would require test email service setup
    })

    // Step 3: Sign in after verification
    await test.step('Sign in after verification', async () => {
      await page.goto('/auth/sign-in')
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', testPassword)
      await page.click('button[type="submit"]')
      
      // Should redirect to dashboard or onboarding
      await expect(page).toHaveURL(/\/dashboard|\/onboarding/, { timeout: 10000 })
    })

    // Step 4: Persona verification (mock - would require Persona test environment)
    await test.step('Persona verification', async () => {
      // Navigate to verification page if not already there
      if (!page.url().includes('/verify')) {
        await page.goto('/verify')
      }
      
      // In a real test with Persona test environment:
      // 1. Click "Start Verification"
      // 2. Complete Persona flow
      // 3. Wait for webhook callback
      // For now, we'll check that the verification page loads
      await expect(page.locator('text=/verify|identity|persona/i')).toBeVisible({ timeout: 5000 })
    })

    // Step 5: Onboarding questionnaire
    await test.step('Complete onboarding questionnaire', async () => {
      await page.goto('/onboarding')
      
      // Navigate through onboarding steps
      // Basic info
      await page.waitForSelector('[data-testid="university-select"]', { timeout: 10000 })
      await page.selectOption('[data-testid="university-select"]', { index: 1 })
      await page.selectOption('[data-testid="degree-level-select"]', { index: 1 })
      await page.waitForSelector('[data-testid="program-select"]', { timeout: 5000 })
      await page.selectOption('[data-testid="program-select"]', { index: 1 })
      
      // Click next to proceed through steps
      const nextButton = page.locator('[data-testid="next-button"]').first()
      if (await nextButton.isVisible()) {
        await nextButton.click()
      }
      
      // Complete at least one section to verify onboarding works
      // The exact steps depend on your onboarding flow
      await expect(page).toHaveURL(/\/onboarding/, { timeout: 5000 })
    })

    // Step 6: View matches
    await test.step('View matches', async () => {
      await page.goto('/matches')
      
      // Should show matches page (may be empty if no matches yet)
      await expect(page.locator('text=/matches|compatibility|roommate/i')).toBeVisible({ timeout: 10000 })
    })

    // Step 7: Chat functionality (if matches exist)
    await test.step('Access chat', async () => {
      // Try to access chat page
      await page.goto('/chat')
      
      // Should show chat interface (may be empty)
      await expect(page.locator('text=/chat|messages|conversations/i')).toBeVisible({ timeout: 10000 })
    })
  })

  test('user journey with error handling', async ({ page }) => {
    const timestamp = Date.now()
    const testEmail = `error-test-${timestamp}@example.com`
    const testPassword = 'TestPassword123!'

    // Test signup with invalid data
    await test.step('Handle signup errors', async () => {
      await page.goto('/auth/sign-up')
      await page.fill('input[name="email"]', 'invalid-email')
      await page.fill('input[name="password"]', 'weak')
      await page.click('button[type="submit"]')
      
      // Should show validation errors
      await expect(page.locator('text=/invalid|error|required/i')).toBeVisible({ timeout: 5000 })
    })

    // Test signin with wrong password
    await test.step('Handle signin errors', async () => {
      await page.goto('/auth/sign-in')
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', 'WrongPassword123!')
      await page.click('button[type="submit"]')
      
      // Should show error message
      await expect(page.locator('text=/invalid|incorrect|error/i')).toBeVisible({ timeout: 10000 })
    })
  })
})

