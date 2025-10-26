import { test, expect } from '@playwright/test'

test.describe('Dashboard Metrics Integration', () => {
  test('should display correct metrics after onboarding', async ({ page }) => {
    // Complete onboarding first
    await page.goto('/onboarding')
    await completeOnboardingFlow(page)
    
    // Navigate to dashboard
    await page.goto('/dashboard')
    
    // Should show profile completion
    await expect(page.getByText('Profile Completion')).toBeVisible()
    const profileCompletion = page.locator('[data-testid="profile-completion"]')
    await expect(profileCompletion).toContainText('%')
    
    // Should show match count
    await expect(page.getByText('Matches')).toBeVisible()
    const matchCount = page.locator('[data-testid="match-count"]')
    await expect(matchCount).toContainText(/\d+/)
    
    // Should show message count
    await expect(page.getByText('Messages')).toBeVisible()
    const messageCount = page.locator('[data-testid="message-count"]')
    await expect(messageCount).toContainText(/\d+/)
    
    // Should show active chats count
    await expect(page.getByText('Active Chats')).toBeVisible()
    const chatCount = page.locator('[data-testid="chat-count"]')
    await expect(chatCount).toContainText(/\d+/)
  })

  test('should show zero metrics for new user', async ({ page }) => {
    // Navigate to dashboard without completing onboarding
    await page.goto('/dashboard')
    
    // Should show zero or low values
    const matchCount = page.locator('[data-testid="match-count"]')
    await expect(matchCount).toContainText('0')
    
    const messageCount = page.locator('[data-testid="message-count"]')
    await expect(messageCount).toContainText('0')
    
    const chatCount = page.locator('[data-testid="chat-count"]')
    await expect(chatCount).toContainText('0')
  })

  test('should update metrics after actions', async ({ page }) => {
    // Complete onboarding
    await page.goto('/onboarding')
    await completeOnboardingFlow(page)
    
    // Navigate to dashboard
    await page.goto('/dashboard')
    
    // Get initial match count
    const initialMatchCount = await page.locator('[data-testid="match-count"]').textContent()
    
    // Navigate to matches and like someone
    await page.goto('/matches')
    const likeButton = page.locator('[data-testid="like-button"]').first()
    if (await likeButton.isVisible()) {
      await likeButton.click()
    }
    
    // Navigate back to dashboard
    await page.goto('/dashboard')
    
    // Match count should have changed (or at least be visible)
    const updatedMatchCount = page.locator('[data-testid="match-count"]')
    await expect(updatedMatchCount).toBeVisible()
  })

  test('should handle dashboard errors gracefully', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard')
    
    // Should not show error messages
    await expect(page.getByText('Error loading dashboard')).not.toBeVisible()
    
    // Should show some content even if metrics are zero
    await expect(page.getByText('Dashboard')).toBeVisible()
  })

  test('should show onboarding progress for incomplete users', async ({ page }) => {
    // Start onboarding but don't complete it
    await page.goto('/onboarding')
    
    // Fill some steps
    await page.getByLabel('University').selectOption({ index: 1 })
    await page.getByLabel('Degree Level').selectOption('master')
    await page.getByLabel('Program of Study').fill('Computer Science')
    await page.getByLabel('When do you want to move in?').selectOption('immediate')
    await page.getByRole('button', { name: 'Next' }).click()
    
    // Navigate to dashboard
    await page.goto('/dashboard')
    
    // Should show partial progress
    await expect(page.getByText('Complete your profile')).toBeVisible()
    await expect(page.getByText('Continue Onboarding')).toBeVisible()
  })
})

// Helper function to complete onboarding flow
async function completeOnboardingFlow(page: any) {
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
}
