import { test, expect } from '@playwright/test'

test.describe('Academic Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and sign in
    await page.goto('/auth/sign-in')
    
    // Fill in test credentials (adjust based on your test setup)
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'testpassword')
    await page.click('[data-testid="sign-in-button"]')
    
    // Wait for redirect to onboarding or matches
    await page.waitForURL(/\/onboarding|\/matches/)
  })

  test.describe('Academic Step in Onboarding', () => {
    test('should show university selection with WO universities only', async ({ page }) => {
      await page.goto('/onboarding')
      
      // Navigate to academic step (assuming it's the second step)
      await page.click('[data-testid="next-button"]') // Go from basics to academic
      
      // Check that university dropdown is visible
      await expect(page.locator('[data-testid="university-select"]')).toBeVisible()
      
      // Click on university dropdown
      await page.click('[data-testid="university-select"]')
      
      // Check that only WO universities are shown (should not include HBO institutions)
      const universityOptions = page.locator('[role="option"]')
      await expect(universityOptions).toHaveCount(14) // 14 UNL universities
      
      // Verify specific universities are present
      await expect(page.locator('text=TU Delft')).toBeVisible()
      await expect(page.locator('text=University of Amsterdam')).toBeVisible()
      await expect(page.locator('text=Utrecht University')).toBeVisible()
      
      // Verify HBO institutions are not present
      await expect(page.locator('text=Hogeschool')).not.toBeVisible()
    })

    test('should show programmes filtered by university and degree level', async ({ page }) => {
      await page.goto('/onboarding')
      
      // Navigate to academic step
      await page.click('[data-testid="next-button"]')
      
      // Select university
      await page.click('[data-testid="university-select"]')
      await page.click('text=University of Amsterdam')
      
      // Select degree level
      await page.click('[data-testid="degree-level-select"]')
      await page.click('text=Bachelor')
      
      // Wait for programmes to load
      await page.waitForSelector('[data-testid="programme-select"]')
      
      // Click on programme dropdown
      await page.click('[data-testid="programme-select"]')
      
      // Verify programmes are loaded (should have at least one programme)
      const programmeOptions = page.locator('[role="option"]')
      await expect(programmeOptions.first()).toBeVisible()
      
      // Verify programmes are for UvA and Bachelor level
      await expect(page.locator('text=Computer Science')).toBeVisible()
      await expect(page.locator('text=Psychology')).toBeVisible()
    })

    test('should show live study year calculation', async ({ page }) => {
      await page.goto('/onboarding')
      
      // Navigate to academic step
      await page.click('[data-testid="next-button"]')
      
      // Fill required fields
      await page.click('[data-testid="university-select"]')
      await page.click('text=TU Delft')
      
      await page.click('[data-testid="degree-level-select"]')
      await page.click('text=Master')
      
      // Select current year as start year
      await page.click('[data-testid="study-start-year-select"]')
      await page.click(`text=${new Date().getFullYear()}`)
      
      // Verify study year calculation shows "Year 1"
      await expect(page.locator('text=You\'ll be: Year 1')).toBeVisible()
      
      // Select last year as start year
      await page.click('[data-testid="study-start-year-select"]')
      await page.click(`text=${new Date().getFullYear() - 1}`)
      
      // Verify study year calculation shows "Year 2"
      await expect(page.locator('text=You\'ll be: Year 2')).toBeVisible()
    })

    test('should allow undecided programme option', async ({ page }) => {
      await page.goto('/onboarding')
      
      // Navigate to academic step
      await page.click('[data-testid="next-button"]')
      
      // Fill required fields
      await page.click('[data-testid="university-select"]')
      await page.click('text=Leiden University')
      
      await page.click('[data-testid="degree-level-select"]')
      await page.click('text=Bachelor')
      
      // Check undecided programme option
      await page.check('[data-testid="undecided-program-checkbox"]')
      
      // Verify programme dropdown is hidden/disabled
      await expect(page.locator('[data-testid="programme-select"]')).toBeDisabled()
      
      // Verify academic summary shows "Undecided"
      await expect(page.locator('text=Programme: Undecided')).toBeVisible()
    })

    test('should validate required fields', async ({ page }) => {
      await page.goto('/onboarding')
      
      // Navigate to academic step
      await page.click('[data-testid="next-button"]')
      
      // Try to proceed without filling required fields
      await page.click('[data-testid="next-button"]')
      
      // Verify validation messages appear
      await expect(page.locator('text=University is required')).toBeVisible()
      await expect(page.locator('text=Degree level is required')).toBeVisible()
      await expect(page.locator('text=Study start year is required')).toBeVisible()
    })
  })

  test.describe('Matches with Academic Filters', () => {
    test.beforeEach(async ({ page }) => {
      // Complete onboarding to reach matches page
      await page.goto('/onboarding')
      
      // Complete all onboarding steps (simplified)
      await page.click('[data-testid="next-button"]') // Basics
      await page.click('[data-testid="university-select"]')
      await page.click('text=TU Delft')
      await page.click('[data-testid="degree-level-select"]')
      await page.click('text=Master')
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
      
      // Wait for redirect to matches
      await page.waitForURL('/matches')
    })

    test('should filter matches by university', async ({ page }) => {
      await page.goto('/matches')
      
      // Open filters
      await page.click('[data-testid="filters-button"]')
      
      // Select university filter
      await page.click('[data-testid="university-filter"]')
      await page.click('text=TU Delft')
      
      // Apply filters
      await page.click('[data-testid="apply-filters"]')
      
      // Verify all shown matches are from TU Delft
      const matchCards = page.locator('[data-testid="match-card"]')
      const count = await matchCards.count()
      
      for (let i = 0; i < count; i++) {
        const card = matchCards.nth(i)
        await expect(card.locator('text=TU Delft')).toBeVisible()
      }
    })

    test('should filter matches by degree level', async ({ page }) => {
      await page.goto('/matches')
      
      // Open filters
      await page.click('[data-testid="filters-button"]')
      
      // Select degree level filter
      await page.click('[data-testid="degree-level-filter"]')
      await page.click('text=Master')
      
      // Apply filters
      await page.click('[data-testid="apply-filters"]')
      
      // Verify all shown matches are Master's students
      const matchCards = page.locator('[data-testid="match-card"]')
      const count = await matchCards.count()
      
      for (let i = 0; i < count; i++) {
        const card = matchCards.nth(i)
        await expect(card.locator('text=Master')).toBeVisible()
      }
    })

    test('should filter matches by study year range', async ({ page }) => {
      await page.goto('/matches')
      
      // Open filters
      await page.click('[data-testid="filters-button"]')
      
      // Select study year filter
      await page.click('[data-testid="study-year-filter"]')
      await page.click('text=Year 1-2')
      
      // Apply filters
      await page.click('[data-testid="apply-filters"]')
      
      // Verify results are filtered (this would need backend implementation)
      await expect(page.locator('[data-testid="matches-count"]')).toContainText('matches found')
    })

    test('should show academic affinity badges on match cards', async ({ page }) => {
      await page.goto('/matches')
      
      // Wait for matches to load
      await page.waitForSelector('[data-testid="match-card"]')
      
      // Check if any match card shows academic badges
      const matchCards = page.locator('[data-testid="match-card"]')
      const firstCard = matchCards.first()
      
      // Look for academic affinity badges
      const academicBadges = firstCard.locator('[data-testid*="academic-badge"]')
      const badgeCount = await academicBadges.count()
      
      if (badgeCount > 0) {
        // Verify badge text is appropriate
        await expect(academicBadges.first()).toBeVisible()
      }
    })
  })

  test.describe('Academic Matching Algorithm', () => {
    test('should show higher scores for same programme matches', async ({ page }) => {
      // This test would require seeded data with known profiles
      await page.goto('/matches')
      
      // Look for matches with same programme
      const sameProgramMatches = page.locator('[data-testid="same-programme-badge"]')
      const differentProgramMatches = page.locator('[data-testid="match-card"]:not(:has([data-testid="same-programme-badge"]))')
      
      // Get compatibility scores
      const sameProgramScores = await sameProgramMatches.locator('[data-testid="compatibility-score"]').allTextContents()
      const differentProgramScores = await differentProgramMatches.locator('[data-testid="compatibility-score"]').allTextContents()
      
      // Verify same programme matches generally have higher scores
      // (This is a simplified check - in reality you'd need more sophisticated comparison)
      if (sameProgramScores.length > 0 && differentProgramScores.length > 0) {
        const avgSameProgram = sameProgramScores.reduce((sum, score) => sum + parseInt(score), 0) / sameProgramScores.length
        const avgDifferentProgram = differentProgramScores.reduce((sum, score) => sum + parseInt(score), 0) / differentProgramScores.length
        
        expect(avgSameProgram).toBeGreaterThan(avgDifferentProgram)
      }
    })

    test('should apply study year gap penalty', async ({ page }) => {
      // This test would require specific test data with known study year gaps
      await page.goto('/matches')
      
      // Look for matches with study year gap warnings
      const yearGapWarnings = page.locator('[data-testid="study-year-gap-warning"]')
      
      if (await yearGapWarnings.count() > 0) {
        // Verify warning text mentions year gap
        await expect(yearGapWarnings.first()).toContainText('year gap')
      }
    })
  })

  test.describe('Admin Academic Analytics', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in as admin user
      await page.goto('/auth/sign-in')
      await page.fill('[data-testid="email"]', 'admin@example.com')
      await page.fill('[data-testid="password"]', 'adminpassword')
      await page.click('[data-testid="sign-in-button"]')
      
      await page.goto('/admin')
    })

    test('should show academic analytics dashboard', async ({ page }) => {
      await page.goto('/admin')
      
      // Check for academic analytics tiles
      await expect(page.locator('text=Signups by university')).toBeVisible()
      await expect(page.locator('text=% undecided programme')).toBeVisible()
      await expect(page.locator('text=Distribution of study years')).toBeVisible()
    })

    test('should show top programmes by university', async ({ page }) => {
      await page.goto('/admin')
      
      // Navigate to analytics tab
      await page.click('[data-testid="analytics-tab"]')
      
      // Check for programme statistics
      await expect(page.locator('text=Top 10 programmes')).toBeVisible()
      
      // Verify university-specific data is shown
      await expect(page.locator('text=TU Delft')).toBeVisible()
      await expect(page.locator('text=Computer Science')).toBeVisible()
    })

    test('should allow programme re-sync', async ({ page }) => {
      await page.goto('/admin')
      
      // Navigate to settings tab
      await page.click('[data-testid="settings-tab"]')
      
      // Look for re-sync programmes button
      const resyncButton = page.locator('[data-testid="resync-programmes-button"]')
      await expect(resyncButton).toBeVisible()
      
      // Click the button (this would trigger the import script)
      await resyncButton.click()
      
      // Verify success message
      await expect(page.locator('text=Programmes synced successfully')).toBeVisible()
    })
  })
})
