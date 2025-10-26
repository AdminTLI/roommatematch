import { test, expect } from '@playwright/test'

test.describe('Matching Pipeline Integration', () => {
  test('should generate match suggestions after onboarding', async ({ page }) => {
    // Complete onboarding for user 1
    await page.goto('/onboarding')
    await completeOnboardingFlow(page, {
      university: 'University of Amsterdam',
      degree: 'master',
      program: 'Computer Science',
      budget: { min: 500, max: 800 },
      sleep: { start: 22, end: 8 },
      social: 6,
      personality: { extraversion: 7, agreeableness: 8, conscientiousness: 9, neuroticism: 3, openness: 8 },
      languages: ['en', 'nl'],
      smoking: false,
      pets: true
    })

    // Should redirect to matches page
    await expect(page).toHaveURL(/\/matches/)
    
    // Should show match suggestions
    await expect(page.getByText('Your Matches')).toBeVisible()
    
    // Check that match cards are displayed
    const matchCards = page.locator('[data-testid="match-card"]')
    await expect(matchCards).toHaveCount({ min: 1 })
    
    // Check that fit scores are displayed
    const fitScores = page.locator('[data-testid="fit-score"]')
    await expect(fitScores).toHaveCount({ min: 1 })
    
    // Check that section scores are displayed
    const sectionScores = page.locator('[data-testid="section-score"]')
    await expect(sectionScores).toHaveCount({ min: 1 })
  })

  test('should filter matches by compatibility', async ({ page }) => {
    // Complete onboarding with specific preferences
    await page.goto('/onboarding')
    await completeOnboardingFlow(page, {
      university: 'University of Amsterdam',
      degree: 'master',
      program: 'Computer Science',
      budget: { min: 500, max: 800 },
      sleep: { start: 22, end: 8 },
      social: 6,
      personality: { extraversion: 7, agreeableness: 8, conscientiousness: 9, neuroticism: 3, openness: 8 },
      languages: ['en', 'nl'],
      smoking: false,
      pets: true
    })

    // Check that all matches have reasonable fit scores
    const fitScores = page.locator('[data-testid="fit-score"]')
    const count = await fitScores.count()
    
    for (let i = 0; i < count; i++) {
      const score = await fitScores.nth(i).textContent()
      const numericScore = parseInt(score?.replace('%', '') || '0')
      expect(numericScore).toBeGreaterThan(0)
      expect(numericScore).toBeLessThanOrEqual(100)
    }
  })

  test('should show match details on click', async ({ page }) => {
    // Complete onboarding
    await page.goto('/onboarding')
    await completeOnboardingFlow(page, {
      university: 'University of Amsterdam',
      degree: 'master',
      program: 'Computer Science',
      budget: { min: 500, max: 800 },
      sleep: { start: 22, end: 8 },
      social: 6,
      personality: { extraversion: 7, agreeableness: 8, conscientiousness: 9, neuroticism: 3, openness: 8 },
      languages: ['en', 'nl'],
      smoking: false,
      pets: true
    })

    // Click on first match card
    const firstMatch = page.locator('[data-testid="match-card"]').first()
    await firstMatch.click()
    
    // Should show match details modal or page
    await expect(page.getByText('Match Details')).toBeVisible()
    
    // Should show compatibility breakdown
    await expect(page.getByText('Compatibility Breakdown')).toBeVisible()
    
    // Should show shared interests
    await expect(page.getByText('Shared Interests')).toBeVisible()
  })

  test('should handle empty match results gracefully', async ({ page }) => {
    // Complete onboarding with very specific preferences that might not match anyone
    await page.goto('/onboarding')
    await completeOnboardingFlow(page, {
      university: 'University of Amsterdam',
      degree: 'master',
      program: 'Computer Science',
      budget: { min: 500, max: 800 },
      sleep: { start: 22, end: 8 },
      social: 1, // Very low social level
      personality: { extraversion: 1, agreeableness: 1, conscientiousness: 1, neuroticism: 10, openness: 1 },
      languages: ['other'], // Very specific language
      smoking: false,
      pets: false
    })

    // Should show empty state message
    await expect(page.getByText('No matches found')).toBeVisible()
    await expect(page.getByText('Try adjusting your preferences')).toBeVisible()
  })
})

// Helper function to complete onboarding flow
async function completeOnboardingFlow(page: any, data: any) {
  // Step 1: Basics
  await page.getByLabel('University').selectOption({ index: 1 })
  await page.getByLabel('Degree Level').selectOption(data.degree)
  await page.getByLabel('Program of Study').fill(data.program)
  await page.getByLabel('When do you want to move in?').selectOption('immediate')
  await page.getByRole('button', { name: 'Next' }).click()

  // Step 2: Academic
  await page.getByLabel('Year of Study').selectOption({ index: 1 })
  await page.getByRole('button', { name: 'Next' }).click()

  // Step 3: Logistics
  await page.getByLabel('Minimum Budget').fill(data.budget.min.toString())
  await page.getByLabel('Maximum Budget').fill(data.budget.max.toString())
  await page.getByLabel('Maximum Commute Time').selectOption('30')
  await page.getByLabel('Preferred Lease Length').selectOption('12_months')
  await page.getByLabel('Single Room').check()
  await page.getByRole('button', { name: 'Next' }).click()

  // Step 4: Lifestyle
  await page.getByLabel('What time do you usually go to bed?').selectOption(data.sleep.start.toString())
  await page.getByLabel('What time do you usually wake up?').selectOption(data.sleep.end.toString())
  await page.getByRole('slider', { name: 'Study intensity' }).fill('7')
  await page.getByRole('slider', { name: 'Room cleanliness' }).fill('8')
  await page.getByRole('slider', { name: 'Kitchen cleanliness' }).fill('7')
  await page.getByRole('slider', { name: 'Noise tolerance' }).fill('6')
  await page.getByRole('slider', { name: 'Guest frequency' }).fill('5')
  await page.getByRole('slider', { name: 'Party frequency' }).fill('3')
  await page.getByRole('slider', { name: 'Chores preference' }).fill('6')
  await page.getByLabel('Do you smoke?').selectOption(data.smoking.toString())
  await page.getByLabel('Are you okay with pets in the house?').selectOption(data.pets.toString())
  await page.getByRole('slider', { name: 'Alcohol comfort' }).fill('4')
  await page.getByRole('slider', { name: 'Pets tolerance' }).fill('7')
  await page.getByRole('button', { name: 'Next' }).click()

  // Step 5: Social
  await page.getByRole('slider', { name: 'Social level' }).fill(data.social.toString())
  await page.getByRole('slider', { name: 'Food sharing' }).fill('5')
  await page.getByRole('slider', { name: 'Utensils sharing' }).fill('6')
  await page.getByRole('button', { name: 'Next' }).click()

  // Step 6: Personality
  await page.getByRole('slider', { name: 'Extraversion' }).fill(data.personality.extraversion.toString())
  await page.getByRole('slider', { name: 'Agreeableness' }).fill(data.personality.agreeableness.toString())
  await page.getByRole('slider', { name: 'Conscientiousness' }).fill(data.personality.conscientiousness.toString())
  await page.getByRole('slider', { name: 'Neuroticism' }).fill(data.personality.neuroticism.toString())
  await page.getByRole('slider', { name: 'Openness' }).fill(data.personality.openness.toString())
  await page.getByRole('slider', { name: 'Conflict style' }).fill('6')
  await page.getByRole('slider', { name: 'Communication preference' }).fill('7')
  await page.getByRole('button', { name: 'Next' }).click()

  // Step 7: Communication
  await page.getByRole('button', { name: 'Next' }).click()

  // Step 8: Languages
  for (const lang of data.languages) {
    await page.getByLabel(lang === 'en' ? 'English' : lang === 'nl' ? 'Dutch' : 'Other').check()
  }
  await page.getByRole('button', { name: 'Next' }).click()

  // Step 9: Deal Breakers
  await page.getByLabel('Do you smoke?').selectOption(data.smoking.toString())
  await page.getByLabel('Are you okay with pets in the house?').selectOption(data.pets.toString())
  await page.getByRole('slider', { name: 'Maximum party frequency' }).fill('5')
  await page.getByRole('slider', { name: 'Maximum guest frequency' }).fill('6')
  await page.getByRole('button', { name: 'Complete Setup' }).click()
}
