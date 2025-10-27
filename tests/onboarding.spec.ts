import { test, expect } from '@playwright/test'

test.describe('Onboarding Questionnaire', () => {
  test('intro redirects and shows header', async ({ page }) => {
    await page.goto('/onboarding')
    await expect(page).toHaveURL(/\/onboarding\/intro$/)
    await expect(page.getByRole('heading', { name: 'Tell us about yourself' })).toBeVisible()
  })

  test('sleep & circadian autosaves', async ({ page }) => {
    await page.goto('/onboarding/sleep-circadian')
    // Trigger a change on a required item (MCQ quiet-hours start)
    await page.getByText('Preferred quiet-hours start (weekdays)').scrollIntoViewIfNeeded()
    await page.getByLabel('22:00').click({ force: true })
    // Toast appears
    await expect(page.getByText('Saved')).toBeVisible()
  })

  test('review allows download and submit', async ({ page }) => {
    await page.goto('/onboarding/review')
    await expect(page.getByRole('button', { name: 'Download Roommate Agreement Preview' })).toBeVisible()
  })

  test('should show campus field as required in basics step', async ({ page }) => {
    await page.goto('/onboarding')
    
    // Verify campus field is visible and required
    await expect(page.locator('[data-testid="campus-select"]')).toBeVisible()
    await expect(page.locator('label[for="campus"]')).toContainText('Campus *')
    
    // Try to proceed without selecting campus
    await page.selectOption('[data-testid="university-select"]', { label: 'University of Amsterdam' })
    await page.selectOption('[data-testid="degree-level-select"]', { label: "Master's (MSc/MA)" })
    await page.waitForSelector('[data-testid="program-select"]')
    await page.selectOption('[data-testid="program-select"]', { index: 1 })
    
    // Campus should be required - try to proceed without selecting
    await page.click('[data-testid="next-button"]')
    
    // Should show validation error or stay on same step
    await expect(page.locator('[data-testid="campus-select"]')).toBeVisible()
  })
  
  test('should allow profile updates via upsert on re-onboarding', async ({ page }) => {
    // This test verifies the upsert functionality works for profile updates
    await page.goto('/onboarding')
    
    // Complete onboarding first time
    await page.selectOption('[data-testid="university-select"]', { label: 'University of Amsterdam' })
    await page.selectOption('[data-testid="degree-level-select"]', { label: "Master's (MSc/MA)" })
    await page.waitForSelector('[data-testid="program-select"]')
    await page.selectOption('[data-testid="program-select"]', { index: 1 })
    await page.waitForSelector('[data-testid="campus-select"]')
    await page.selectOption('[data-testid="campus-select"]', { label: 'UvA — Science Park (Amsterdam)' })
    await page.selectOption('[data-testid="move-in-select"]', { label: 'Immediately' })
    
    // Complete rest of onboarding quickly
    await page.fill('[data-testid="budget-min-input"]', '500')
    await page.fill('[data-testid="budget-max-input"]', '800')
    await page.selectOption('[data-testid="commute-max-select"]', { label: '30 minutes' })
    await page.selectOption('[data-testid="lease-length-select"]', { label: '12 months' })
    await page.check('[data-testid="room-type-single"]')
    
    // Skip through remaining steps
    await page.click('[data-testid="next-button"]')
    await page.click('[data-testid="next-button"]')
    await page.click('[data-testid="next-button"]')
    await page.click('[data-testid="next-button"]')
    await page.click('[data-testid="next-button"]')
    await page.check('[data-testid="language-en"]')
    await page.click('[data-testid="next-button"]')
    await page.uncheck('[data-testid="smoking-checkbox"]')
    await page.check('[data-testid="pets-allowed-checkbox"]')
    await page.fill('[data-testid="parties-max-input"]', '5')
    await page.fill('[data-testid="guests-max-input"]', '6')
    
    await page.click('[data-testid="submit-button"]')
    await page.waitForURL('/dashboard', { timeout: 15000 })
    
    // Go back to onboarding to test upsert
    await page.goto('/onboarding')
    
    // Change some values to test upsert
    await page.selectOption('[data-testid="university-select"]', { label: 'University of Amsterdam' })
    await page.selectOption('[data-testid="degree-level-select"]', { label: "Bachelor's (BSc/BA)" })
    await page.waitForSelector('[data-testid="program-select"]')
    await page.selectOption('[data-testid="program-select"]', { index: 1 })
    await page.waitForSelector('[data-testid="campus-select"]')
    await page.selectOption('[data-testid="campus-select"]', { label: 'UvA — Roeterseiland (Amsterdam)' })
    await page.selectOption('[data-testid="move-in-select"]', { label: 'Within a month' })
    
    // Complete again with different values
    await page.fill('[data-testid="budget-min-input"]', '600')
    await page.fill('[data-testid="budget-max-input"]', '900')
    await page.selectOption('[data-testid="commute-max-select"]', { label: '45 minutes' })
    await page.selectOption('[data-testid="lease-length-select"]', { label: '6 months' })
    await page.check('[data-testid="room-type-shared"]')
    
    await page.click('[data-testid="next-button"]')
    await page.click('[data-testid="next-button"]')
    await page.click('[data-testid="next-button"]')
    await page.click('[data-testid="next-button"]')
    await page.click('[data-testid="next-button"]')
    await page.check('[data-testid="language-en"]')
    await page.click('[data-testid="next-button"]')
    await page.uncheck('[data-testid="smoking-checkbox"]')
    await page.check('[data-testid="pets-allowed-checkbox"]')
    await page.fill('[data-testid="parties-max-input"]', '3')
    await page.fill('[data-testid="guests-max-input"]', '4')
    
    // Submit again - should work without conflicts
    await page.click('[data-testid="submit-button"]')
    await page.waitForURL('/dashboard', { timeout: 15000 })
    
    // Verify dashboard still works
    await expect(page.locator('h1')).toContainText('Dashboard')
  })
})
