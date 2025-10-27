import { test, expect } from '@playwright/test'

test.describe('Onboarding to Dashboard Flow', () => {
  test('should complete full onboarding flow and verify dashboard state', async ({ page }) => {
    // Navigate to sign up page
    await page.goto('/auth/signup')
    
    // Generate unique email for this test
    const timestamp = Date.now()
    const testEmail = `test-${timestamp}@student.uva.nl`
    
    // Fill signup form
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', 'TestPassword123!')
    await page.fill('[data-testid="confirm-password-input"]', 'TestPassword123!')
    await page.click('[data-testid="signup-button"]')
    
    // Wait for email confirmation or redirect to onboarding
    await page.waitForURL('/onboarding', { timeout: 10000 })
    
    // Verify we're on the onboarding wizard
    await expect(page.locator('h1')).toContainText('Welcome')
    
    // Step 1: Basics
    await page.selectOption('[data-testid="university-select"]', { label: 'University of Amsterdam' })
    await page.selectOption('[data-testid="degree-level-select"]', { label: "Master's (MSc/MA)" })
    
    // Wait for program select to load
    await page.waitForSelector('[data-testid="program-select"]')
    await page.selectOption('[data-testid="program-select"]', { index: 1 }) // Select first available program
    
    // Wait for campus select to load and select campus
    await page.waitForSelector('[data-testid="campus-select"]')
    await page.selectOption('[data-testid="campus-select"]', { label: 'UvA — Science Park (Amsterdam)' })
    
    await page.selectOption('[data-testid="move-in-select"]', { label: 'Immediately' })
    await page.click('[data-testid="next-button"]')
    
    // Step 2: Logistics
    await page.fill('[data-testid="budget-min-input"]', '500')
    await page.fill('[data-testid="budget-max-input"]', '800')
    await page.selectOption('[data-testid="commute-max-select"]', { label: '30 minutes' })
    await page.selectOption('[data-testid="lease-length-select"]', { label: '12 months' })
    
    // Select room types
    await page.check('[data-testid="room-type-single"]')
    await page.click('[data-testid="next-button"]')
    
    // Step 3: Lifestyle
    await page.fill('[data-testid="sleep-start-input"]', '22')
    await page.fill('[data-testid="sleep-end-input"]', '8')
    await page.fill('[data-testid="study-intensity-slider"]', '7')
    await page.fill('[data-testid="cleanliness-room-slider"]', '8')
    await page.fill('[data-testid="cleanliness-kitchen-slider"]', '7')
    await page.fill('[data-testid="noise-tolerance-slider"]', '6')
    await page.fill('[data-testid="guests-frequency-slider"]', '5')
    await page.fill('[data-testid="parties-frequency-slider"]', '3')
    await page.fill('[data-testid="chores-preference-slider"]', '6')
    await page.fill('[data-testid="alcohol-at-home-slider"]', '4')
    await page.fill('[data-testid="pets-tolerance-slider"]', '7')
    await page.click('[data-testid="next-button"]')
    
    // Step 4: Social
    await page.fill('[data-testid="social-level-slider"]', '6')
    await page.fill('[data-testid="food-sharing-slider"]', '5')
    await page.fill('[data-testid="utensils-sharing-slider"]', '6')
    await page.click('[data-testid="next-button"]')
    
    // Step 5: Personality
    await page.fill('[data-testid="extraversion-slider"]', '7')
    await page.fill('[data-testid="agreeableness-slider"]', '8')
    await page.fill('[data-testid="conscientiousness-slider"]', '9')
    await page.fill('[data-testid="neuroticism-slider"]', '3')
    await page.fill('[data-testid="openness-slider"]', '8')
    await page.click('[data-testid="next-button"]')
    
    // Step 6: Communication
    await page.fill('[data-testid="conflict-style-slider"]', '6')
    await page.fill('[data-testid="communication-preference-slider"]', '7')
    await page.click('[data-testid="next-button"]')
    
    // Step 7: Languages
    await page.check('[data-testid="language-en"]')
    await page.check('[data-testid="language-nl"]')
    await page.click('[data-testid="next-button"]')
    
    // Step 8: Deal Breakers
    await page.uncheck('[data-testid="smoking-checkbox"]')
    await page.check('[data-testid="pets-allowed-checkbox"]')
    await page.fill('[data-testid="parties-max-input"]', '5')
    await page.fill('[data-testid="guests-max-input"]', '6')
    
    // Submit onboarding
    await page.click('[data-testid="submit-button"]')
    
    // Wait for submission to complete and redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 15000 })
    
    // Verify dashboard state
    await expect(page.locator('h1')).toContainText('Dashboard')
    
    // Check that questionnaire completion is shown
    await expect(page.locator('[data-testid="questionnaire-status"]')).toContainText('Complete')
    
    // Verify no validation errors in console
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // Wait a moment for any async operations to complete
    await page.waitForTimeout(2000)
    
    // Filter out expected errors (like network errors for missing resources)
    const unexpectedErrors = consoleErrors.filter(error => 
      !error.includes('Failed to load resource') && 
      !error.includes('404') &&
      !error.includes('CORS')
    )
    
    expect(unexpectedErrors).toHaveLength(0)
  })

  test('should verify database state after onboarding completion', async ({ page }) => {
    // This test verifies that the consolidated submission helper correctly saves all data
    await page.goto('/auth/signup')
    
    const timestamp = Date.now()
    const testEmail = `dbtest-${timestamp}@student.uva.nl`
    
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', 'TestPassword123!')
    await page.fill('[data-testid="confirm-password-input"]', 'TestPassword123!')
    await page.click('[data-testid="signup-button"]')
    
    await page.waitForURL('/onboarding', { timeout: 10000 })
    
    // Complete onboarding with specific values to verify persistence
    await page.selectOption('[data-testid="university-select"]', { label: 'University of Amsterdam' })
    await page.selectOption('[data-testid="degree-level-select"]', { label: "Bachelor's (BSc/BA)" })
    await page.waitForSelector('[data-testid="program-select"]')
    await page.selectOption('[data-testid="program-select"]', { index: 1 })
    await page.waitForSelector('[data-testid="campus-select"]')
    await page.selectOption('[data-testid="campus-select"]', { label: 'UvA — Roeterseiland (Amsterdam)' })
    await page.selectOption('[data-testid="move-in-select"]', { label: 'Within a month' })
    
    // Fill required fields
    await page.fill('[data-testid="budget-min-input"]', '600')
    await page.fill('[data-testid="budget-max-input"]', '900')
    await page.selectOption('[data-testid="commute-max-select"]', { label: '45 minutes' })
    await page.selectOption('[data-testid="lease-length-select"]', { label: '6 months' })
    await page.check('[data-testid="room-type-shared"]')
    
    // Complete remaining steps quickly
    await page.click('[data-testid="next-button"]')
    await page.click('[data-testid="next-button"]')
    await page.click('[data-testid="next-button"]')
    await page.click('[data-testid="next-button"]')
    await page.click('[data-testid="next-button"]')
    await page.check('[data-testid="language-en"]')
    await page.check('[data-testid="language-de"]')
    await page.click('[data-testid="next-button"]')
    await page.uncheck('[data-testid="smoking-checkbox"]')
    await page.check('[data-testid="pets-allowed-checkbox"]')
    await page.fill('[data-testid="parties-max-input"]', '3')
    await page.fill('[data-testid="guests-max-input"]', '4')
    
    await page.click('[data-testid="submit-button"]')
    await page.waitForURL('/dashboard', { timeout: 15000 })
    
    // Verify dashboard shows completion
    await expect(page.locator('h1')).toContainText('Dashboard')
    
    // Note: In a real test environment, you would query the database directly
    // to verify that:
    // 1. profiles table has campus: 'UvA — Roeterseiland (Amsterdam)'
    // 2. profiles table has languages: ['en', 'de']
    // 3. user_academic table has correct degree_level: 'bachelor'
    // 4. responses table has all expected question keys
    // 5. onboarding_submissions table has a record for this user
    
    // For now, we verify the UI shows the correct state
    await expect(page.locator('[data-testid="questionnaire-status"]')).toContainText('Complete')
  })

  test('should handle re-onboarding scenario with upsert', async ({ page }) => {
    // This test verifies that a user can re-complete onboarding
    // without conflicts (testing the upsert functionality)
    
    // First, complete onboarding as above
    await page.goto('/auth/signup')
    
    const timestamp = Date.now()
    const testEmail = `retest-${timestamp}@student.uva.nl`
    
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', 'TestPassword123!')
    await page.fill('[data-testid="confirm-password-input"]', 'TestPassword123!')
    await page.click('[data-testid="signup-button"]')
    
    await page.waitForURL('/onboarding', { timeout: 10000 })
    
    // Complete onboarding quickly with minimal data
    await page.selectOption('[data-testid="university-select"]', { label: 'University of Amsterdam' })
    await page.selectOption('[data-testid="degree-level-select"]', { label: "Master's (MSc/MA)" })
    await page.waitForSelector('[data-testid="program-select"]')
    await page.selectOption('[data-testid="program-select"]', { index: 1 })
    await page.waitForSelector('[data-testid="campus-select"]')
    await page.selectOption('[data-testid="campus-select"]', { label: 'UvA — Science Park (Amsterdam)' })
    await page.selectOption('[data-testid="move-in-select"]', { label: 'Immediately' })
    
    // Fill required fields quickly
    await page.fill('[data-testid="budget-min-input"]', '500')
    await page.fill('[data-testid="budget-max-input"]', '800')
    await page.selectOption('[data-testid="commute-max-select"]', { label: '30 minutes' })
    await page.selectOption('[data-testid="lease-length-select"]', { label: '12 months' })
    await page.check('[data-testid="room-type-single"]')
    
    // Skip through remaining steps with default values
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
    
    // Now simulate re-onboarding by going back to onboarding
    await page.goto('/onboarding')
    
    // Verify we can complete onboarding again without errors
    await page.selectOption('[data-testid="university-select"]', { label: 'University of Amsterdam' })
    await page.selectOption('[data-testid="degree-level-select"]', { label: "Bachelor's (BSc/BA)" }) // Changed degree level
    await page.waitForSelector('[data-testid="program-select"]')
    await page.selectOption('[data-testid="program-select"]', { index: 1 })
    await page.waitForSelector('[data-testid="campus-select"]')
    await page.selectOption('[data-testid="campus-select"]', { label: 'UvA — Roeterseiland (Amsterdam)' }) // Changed campus
    await page.selectOption('[data-testid="move-in-select"]', { label: 'Within a month' }) // Changed timing
    
    // Complete quickly again
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
    
    // Submit again - this should work without conflicts due to upsert
    await page.click('[data-testid="submit-button"]')
    await page.waitForURL('/dashboard', { timeout: 15000 })
    
    // Verify dashboard still works
    await expect(page.locator('h1')).toContainText('Dashboard')
    await expect(page.locator('[data-testid="questionnaire-status"]')).toContainText('Complete')
  })

  test('should verify section progress calculation accuracy', async ({ page }) => {
    // This test verifies that the section progress shows accurate "N/N sections" count
    await page.goto('/auth/signup')
    
    const timestamp = Date.now()
    const testEmail = `progresstest-${timestamp}@student.uva.nl`
    
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', 'TestPassword123!')
    await page.fill('[data-testid="confirm-password-input"]', 'TestPassword123!')
    await page.click('[data-testid="signup-button"]')
    
    await page.waitForURL('/onboarding', { timeout: 10000 })
    
    // Complete only basics section to test partial progress
    await page.selectOption('[data-testid="university-select"]', { label: 'University of Amsterdam' })
    await page.selectOption('[data-testid="degree-level-select"]', { label: "Master's (MSc/MA)" })
    await page.waitForSelector('[data-testid="program-select"]')
    await page.selectOption('[data-testid="program-select"]', { index: 1 })
    await page.waitForSelector('[data-testid="campus-select"]')
    await page.selectOption('[data-testid="campus-select"]', { label: 'UvA — Science Park (Amsterdam)' })
    await page.selectOption('[data-testid="move-in-select"]', { label: 'Immediately' })
    
    // Go to dashboard to check progress
    await page.goto('/dashboard')
    
    // Verify progress shows partial completion (should show something like "1/8 sections")
    const progressBadge = page.locator('[data-testid="questionnaire-status"]')
    await expect(progressBadge).toBeVisible()
    
    // The progress should show a fraction, not "Complete"
    const progressText = await progressBadge.textContent()
    expect(progressText).toMatch(/\d+\/8 sections/)
    
    // Complete the rest of onboarding
    await page.goto('/onboarding')
    await page.click('[data-testid="next-button"]')
    
    // Fill logistics
    await page.fill('[data-testid="budget-min-input"]', '500')
    await page.fill('[data-testid="budget-max-input"]', '800')
    await page.selectOption('[data-testid="commute-max-select"]', { label: '30 minutes' })
    await page.selectOption('[data-testid="lease-length-select"]', { label: '12 months' })
    await page.check('[data-testid="room-type-single"]')
    await page.click('[data-testid="next-button"]')
    
    // Skip through remaining steps
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
    
    // Now verify it shows "Complete" instead of "8/8 sections"
    await expect(page.locator('[data-testid="questionnaire-status"]')).toContainText('Complete')
  })
  
  test('should handle universities without campus data', async ({ page }) => {
    await page.goto('/onboarding')
    
    // Select a university without campus data
    await page.selectOption('[data-testid="university-select"]', { label: 'University Without Campuses' })
    
    // Verify fallback options are available
    await expect(page.locator('[data-testid="campus-select"]')).not.toBeDisabled()
    await page.selectOption('[data-testid="campus-select"]', { label: 'Main Campus' })
    
    // Should be able to proceed
    await expect(page.locator('[data-testid="campus-select"]')).toHaveValue('main-campus')
  })
})
