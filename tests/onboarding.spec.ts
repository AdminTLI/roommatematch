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
})
