import { test, expect } from '@playwright/test'

test.describe('Onboarding Questionnaire', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication state
    await page.goto('/onboarding')
  })

  test('should display questionnaire wizard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tell us about yourself' })).toBeVisible()
    await expect(page.getByText('Step 1 of 8')).toBeVisible()
  })

  test('should show progress indicator', async ({ page }) => {
    await expect(page.getByRole('progressbar')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    // Try to proceed without filling required fields
    await page.getByRole('button', { name: 'Next' }).click()
    
    // Should show validation errors
    await expect(page.getByText('This field is required')).toBeVisible()
  })

  test('should allow navigation between steps', async ({ page }) => {
    // Fill basic information
    await page.getByLabel('Degree Level').selectOption('master')
    await page.getByLabel('Program/Field of Study').fill('Computer Science')
    await page.getByLabel('Campus').fill('Science Park')
    
    // Navigate to next step
    await page.getByRole('button', { name: 'Next' }).click()
    
    // Should be on step 2
    await expect(page.getByText('Step 2 of 8')).toBeVisible()
    
    // Navigate back
    await page.getByRole('button', { name: 'Back' }).click()
    
    // Should be back on step 1
    await expect(page.getByText('Step 1 of 8')).toBeVisible()
  })

  test('should save progress automatically', async ({ page }) => {
    // Fill some information
    await page.getByLabel('Degree Level').selectOption('bachelor')
    await page.getByLabel('Program/Field of Study').fill('Psychology')
    
    // Wait for auto-save indicator
    await expect(page.getByText('Saved!')).toBeVisible()
  })

  test('should show time estimate', async ({ page }) => {
    await expect(page.getByText(/This will take about \d+ minutes/)).toBeVisible()
  })

  test('should be accessible', async ({ page }) => {
    // Check for proper heading structure
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    
    // Check for form labels
    await expect(page.getByLabel('Degree Level')).toBeVisible()
    
    // Check for proper button roles
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible()
    
    // Check keyboard navigation
    await page.keyboard.press('Tab')
    await expect(page.getByLabel('Degree Level')).toBeFocused()
  })

  test('should handle slider inputs', async ({ page }) => {
    // Navigate to lifestyle section (step 3)
    await page.getByLabel('Degree Level').selectOption('master')
    await page.getByLabel('Program/Field of Study').fill('Computer Science')
    await page.getByLabel('Campus').fill('Science Park')
    await page.getByRole('button', { name: 'Next' }).click()
    
    // Fill logistics
    await page.getByLabel('Minimum budget').selectOption('500')
    await page.getByLabel('Maximum budget').selectOption('800')
    await page.getByRole('button', { name: 'Next' }).click()
    
    // Should be on lifestyle section with sliders
    await expect(page.getByText('Lifestyle & Habits')).toBeVisible()
    await expect(page.getByRole('slider')).toBeVisible()
  })

  test('should show completion summary', async ({ page }) => {
    // Complete all steps (simplified)
    await page.getByLabel('Degree Level').selectOption('master')
    await page.getByLabel('Program/Field of Study').fill('Computer Science')
    await page.getByLabel('Campus').fill('Science Park')
    
    // Navigate through all steps
    for (let i = 0; i < 7; i++) {
      await page.getByRole('button', { name: 'Next' }).click()
    }
    
    // Should show completion page
    await expect(page.getByText('Complete Profile')).toBeVisible()
  })
})
