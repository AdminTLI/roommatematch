import { test, expect } from '@playwright/test'

test.describe('Matches', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated user with completed profile
    await page.goto('/matches')
  })

  test('should display matches page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Your Matches' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Group Matches' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Individual Matches' })).toBeVisible()
  })

  test('should show group matches by default', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Group Matches' })).toHaveAttribute('aria-selected', 'true')
  })

  test('should switch between tabs', async ({ page }) => {
    await page.getByRole('tab', { name: 'Individual Matches' }).click()
    await expect(page.getByRole('tab', { name: 'Individual Matches' })).toHaveAttribute('aria-selected', 'true')
  })

  test('should display match cards', async ({ page }) => {
    // Should show match cards with compatibility scores
    await expect(page.getByText(/Compatibility/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Accept' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Reject' })).toBeVisible()
  })

  test('should show compatibility breakdown', async ({ page }) => {
    // Click on a match card to see details
    await page.getByText('View Profile').first().click()
    
    // Should show compatibility breakdown
    await expect(page.getByText('Personality')).toBeVisible()
    await expect(page.getByText('Schedule')).toBeVisible()
    await expect(page.getByText('Lifestyle')).toBeVisible()
  })

  test('should filter matches', async ({ page }) => {
    await page.getByRole('button', { name: 'Filters' }).click()
    
    // Should show filter options
    await expect(page.getByLabel('University')).toBeVisible()
    await expect(page.getByLabel('Degree Level')).toBeVisible()
    await expect(page.getByLabel('Budget Range')).toBeVisible()
  })

  test('should apply filters', async ({ page }) => {
    await page.getByRole('button', { name: 'Filters' }).click()
    await page.getByLabel('University').selectOption('uva')
    await page.getByRole('button', { name: 'Apply Filters' }).click()
    
    // Should show filtered results
    await expect(page.getByText('Filters applied')).toBeVisible()
  })

  test('should handle match acceptance', async ({ page }) => {
    // Accept a match
    await page.getByRole('button', { name: 'Accept' }).first().click()
    
    // Should show confirmation dialog
    await expect(page.getByText('Are you sure you want to accept this match?')).toBeVisible()
    
    // Confirm
    await page.getByRole('button', { name: 'Confirm' }).click()
    
    // Should show success message
    await expect(page.getByText('Match accepted!')).toBeVisible()
  })

  test('should handle match rejection', async ({ page }) => {
    // Reject a match
    await page.getByRole('button', { name: 'Reject' }).first().click()
    
    // Should show confirmation dialog
    await expect(page.getByText('Are you sure you want to reject this match?')).toBeVisible()
    
    // Confirm
    await page.getByRole('button', { name: 'Confirm' }).click()
    
    // Should show success message
    await expect(page.getByText('Match rejected.')).toBeVisible()
  })

  test('should show no matches state', async ({ page }) => {
    // Clear all matches (mock scenario)
    await page.evaluate(() => {
      // Mock empty matches state
      localStorage.setItem('mock-empty-matches', 'true')
    })
    await page.reload()
    
    await expect(page.getByText('No matches found')).toBeVisible()
    await expect(page.getByText('Try adjusting your filters or check back later for new matches.')).toBeVisible()
  })

  test('should be accessible', async ({ page }) => {
    // Check for proper heading structure
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    
    // Check for tab navigation
    await expect(page.getByRole('tablist')).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Group Matches' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Individual Matches' })).toBeVisible()
    
    // Check keyboard navigation for tabs
    await page.getByRole('tab', { name: 'Group Matches' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('tab', { name: 'Individual Matches' })).toBeFocused()
  })

  test('should show group match details', async ({ page }) => {
    // Click on a group match card
    await page.getByText('View Profile').first().click()
    
    // Should show group information
    await expect(page.getByText(/members/)).toBeVisible()
    await expect(page.getByText('Average compatibility')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Accept Group' })).toBeVisible()
  })

  test('should show house rules suggestions', async ({ page }) => {
    // Click on a match card
    await page.getByText('View Profile').first().click()
    
    // Should show suggested house rules
    await expect(page.getByText('Suggested house rules')).toBeVisible()
    await expect(page.getByText(/Establish weekly cleaning schedule/)).toBeVisible()
  })
})
