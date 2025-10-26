import { test, expect } from '@playwright/test'

test.describe('Onboarding Flow Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to onboarding page
    await page.goto('/onboarding')
  })

  test('should complete full onboarding flow', async ({ page }) => {
    // Wait for page to load
    await expect(page.getByRole('heading', { name: 'Tell us about yourself' })).toBeVisible()

    // Step 1: Basics
    await page.getByLabel('University').selectOption({ index: 1 })
    await page.getByLabel('Degree Level').selectOption('master')
    await page.getByLabel('Program of Study').fill('Computer Science')
    await page.getByLabel('When do you want to move in?').selectOption('immediate')
    await page.getByRole('button', { name: 'Next' }).click()

    // Step 2: Academic
    await page.getByLabel('Year of Study').selectOption({ index: 1 })
    await page.getByRole('button', { name: 'Next' }).click()

    // Step 3: Logistics
    await page.getByLabel('Minimum Budget').fill('500')
    await page.getByLabel('Maximum Budget').fill('800')
    await page.getByLabel('Maximum Commute Time').selectOption('30')
    await page.getByLabel('Preferred Lease Length').selectOption('12_months')
    await page.getByLabel('Single Room').check()
    await page.getByRole('button', { name: 'Next' }).click()

    // Step 4: Lifestyle
    await page.getByLabel('What time do you usually go to bed?').selectOption('22')
    await page.getByLabel('What time do you usually wake up?').selectOption('8')
    await page.getByRole('slider', { name: 'Study intensity' }).fill('7')
    await page.getByRole('slider', { name: 'Room cleanliness' }).fill('8')
    await page.getByRole('slider', { name: 'Kitchen cleanliness' }).fill('7')
    await page.getByRole('slider', { name: 'Noise tolerance' }).fill('6')
    await page.getByRole('slider', { name: 'Guest frequency' }).fill('5')
    await page.getByRole('slider', { name: 'Party frequency' }).fill('3')
    await page.getByRole('slider', { name: 'Chores preference' }).fill('6')
    await page.getByLabel('Do you smoke?').selectOption('false')
    await page.getByLabel('Are you okay with pets in the house?').selectOption('true')
    await page.getByRole('slider', { name: 'Alcohol comfort' }).fill('4')
    await page.getByRole('slider', { name: 'Pets tolerance' }).fill('7')
    await page.getByRole('button', { name: 'Next' }).click()

    // Step 5: Social
    await page.getByRole('slider', { name: 'Social level' }).fill('6')
    await page.getByRole('slider', { name: 'Food sharing' }).fill('5')
    await page.getByRole('slider', { name: 'Utensils sharing' }).fill('6')
    await page.getByRole('button', { name: 'Next' }).click()

    // Step 6: Personality
    await page.getByRole('slider', { name: 'Extraversion' }).fill('7')
    await page.getByRole('slider', { name: 'Agreeableness' }).fill('8')
    await page.getByRole('slider', { name: 'Conscientiousness' }).fill('9')
    await page.getByRole('slider', { name: 'Neuroticism' }).fill('3')
    await page.getByRole('slider', { name: 'Openness' }).fill('8')
    await page.getByRole('slider', { name: 'Conflict style' }).fill('6')
    await page.getByRole('slider', { name: 'Communication preference' }).fill('7')
    await page.getByRole('button', { name: 'Next' }).click()

    // Step 7: Communication
    await page.getByRole('button', { name: 'Next' }).click()

    // Step 8: Languages
    await page.getByLabel('English').check()
    await page.getByLabel('Dutch').check()
    await page.getByRole('button', { name: 'Next' }).click()

    // Step 9: Deal Breakers
    await page.getByLabel('Do you smoke?').selectOption('false')
    await page.getByLabel('Are you okay with pets in the house?').selectOption('true')
    await page.getByRole('slider', { name: 'Maximum party frequency' }).fill('5')
    await page.getByRole('slider', { name: 'Maximum guest frequency' }).fill('6')
    await page.getByRole('button', { name: 'Complete Setup' }).click()

    // Should redirect to matches page
    await expect(page).toHaveURL(/\/matches/)
    
    // Should show success toast
    await expect(page.getByText('Onboarding completed!')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    // Try to proceed without filling required fields
    await page.getByRole('button', { name: 'Next' }).click()
    
    // Should stay on the same step
    await expect(page.getByRole('heading', { name: 'Basics' })).toBeVisible()
  })

  test('should show validation errors for invalid data', async ({ page }) => {
    // Fill with invalid data
    await page.getByLabel('Minimum Budget').fill('-100')
    await page.getByLabel('Maximum Budget').fill('50') // Less than min
    
    // Try to submit
    await page.getByRole('button', { name: 'Complete Setup' }).click()
    
    // Should show validation error
    await expect(page.getByText('Validation failed')).toBeVisible()
  })

  test('should save progress automatically', async ({ page }) => {
    // Fill some data
    await page.getByLabel('University').selectOption({ index: 1 })
    await page.getByLabel('Degree Level').selectOption('master')
    
    // Wait for auto-save
    await expect(page.getByText('Saving...')).toBeVisible()
    await expect(page.getByText('Last saved:')).toBeVisible()
  })
})
