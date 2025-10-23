// Playwright smoke test for housing page
// Tests core functionality and user interactions

import { test, expect } from '@playwright/test'

test.describe('Housing Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to housing page
    await page.goto('/housing')
  })

  test('should load housing page with listings', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Housing/)
    
    // Check for main elements
    await expect(page.locator('h1')).toContainText('Housing')
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="filters-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="sort-dropdown"]')).toBeVisible()
    await expect(page.locator('[data-testid="view-toggle"]')).toBeVisible()
  })

  test('should display listings in grid', async ({ page }) => {
    // Wait for listings to load
    await page.waitForSelector('[data-testid="listing-card"]', { timeout: 10000 })
    
    // Check that listings are displayed
    const listingCards = page.locator('[data-testid="listing-card"]')
    await expect(listingCards).toHaveCount.greaterThan(0)
    
    // Check first listing has required elements
    const firstListing = listingCards.first()
    await expect(firstListing.locator('[data-testid="listing-title"]')).toBeVisible()
    await expect(firstListing.locator('[data-testid="listing-price"]')).toBeVisible()
    await expect(firstListing.locator('[data-testid="listing-address"]')).toBeVisible()
  })

  test('should open and apply filters', async ({ page }) => {
    // Click filters button
    await page.click('[data-testid="filters-button"]')
    
    // Check filters drawer is open
    await expect(page.locator('[data-testid="filters-drawer"]')).toBeVisible()
    
    // Apply university verified filter
    await page.check('[data-testid="university-verified-checkbox"]')
    
    // Click apply filters
    await page.click('[data-testid="apply-filters-button"]')
    
    // Check URL contains filter parameter
    await expect(page).toHaveURL(/universityVerifiedOnly=true/)
    
    // Check active filter chip is displayed
    await expect(page.locator('[data-testid="active-filter-chip"]')).toContainText('University-verified')
  })

  test('should search listings', async ({ page }) => {
    // Type in search input
    await page.fill('[data-testid="search-input"]', 'Amsterdam')
    
    // Wait for search to complete
    await page.waitForTimeout(500)
    
    // Check URL contains search parameter
    await expect(page).toHaveURL(/q=Amsterdam/)
  })

  test('should change sort order', async ({ page }) => {
    // Click sort dropdown
    await page.click('[data-testid="sort-dropdown"]')
    
    // Select price ascending
    await page.click('[data-testid="sort-option-price-asc"]')
    
    // Check URL contains sort parameter
    await expect(page).toHaveURL(/sort=priceAsc/)
  })

  test('should toggle view modes', async ({ page }) => {
    // Test list view
    await page.click('[data-testid="view-toggle-list"]')
    await expect(page).toHaveURL(/view=list/)
    
    // Test map view
    await page.click('[data-testid="view-toggle-map"]')
    await expect(page).toHaveURL(/view=map/)
    
    // Check map is visible
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible()
    
    // Test split view
    await page.click('[data-testid="view-toggle-split"]')
    await expect(page).toHaveURL(/view=split/)
  })

  test('should open listing detail modal', async ({ page }) => {
    // Wait for listings to load
    await page.waitForSelector('[data-testid="listing-card"]', { timeout: 10000 })
    
    // Click on first listing
    await page.click('[data-testid="listing-card"]:first-child')
    
    // Check modal is open
    await expect(page.locator('[data-testid="listing-detail-modal"]')).toBeVisible()
    
    // Check modal content
    await expect(page.locator('[data-testid="listing-detail-title"]')).toBeVisible()
    await expect(page.locator('[data-testid="listing-detail-price"]')).toBeVisible()
    
    // Close modal
    await page.click('[data-testid="close-modal-button"]')
    
    // Check modal is closed
    await expect(page.locator('[data-testid="listing-detail-modal"]')).not.toBeVisible()
  })

  test('should save and unsave listings', async ({ page }) => {
    // Wait for listings to load
    await page.waitForSelector('[data-testid="listing-card"]', { timeout: 10000 })
    
    // Click save button on first listing
    const saveButton = page.locator('[data-testid="save-button"]').first()
    await saveButton.click()
    
    // Check button state changes
    await expect(saveButton).toHaveClass(/saved/)
    
    // Click again to unsave
    await saveButton.click()
    
    // Check button state changes back
    await expect(saveButton).not.toHaveClass(/saved/)
  })

  test('should show empty state when no results', async ({ page }) => {
    // Apply very restrictive filters
    await page.click('[data-testid="filters-button"]')
    await page.fill('[data-testid="price-min-input"]', '999999')
    await page.click('[data-testid="apply-filters-button"]')
    
    // Check empty state is shown
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible()
    await expect(page.locator('[data-testid="empty-state"]')).toContainText('No listings found')
    
    // Check action buttons are present
    await expect(page.locator('[data-testid="broaden-location-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="lower-compatibility-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="create-alert-button"]')).toBeVisible()
  })

  test('should handle mobile view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check mobile layout
    await expect(page.locator('[data-testid="mobile-tabs"]')).toBeVisible()
    
    // Test tab switching
    await page.click('[data-testid="mobile-tab-map"]')
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible()
    
    await page.click('[data-testid="mobile-tab-list"]')
    await expect(page.locator('[data-testid="listings-grid"]')).toBeVisible()
  })

  test('should show loading states', async ({ page }) => {
    // Navigate to page and check for loading skeletons
    await page.goto('/housing')
    
    // Check loading skeletons are shown initially
    await expect(page.locator('[data-testid="listing-skeleton"]')).toBeVisible()
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="listing-card"]', { timeout: 10000 })
    
    // Check skeletons are gone
    await expect(page.locator('[data-testid="listing-skeleton"]')).not.toBeVisible()
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/housing/listings**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      })
    })
    
    // Navigate to page
    await page.goto('/housing')
    
    // Check error state is shown
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-state"]')).toContainText('Failed to load listings')
    
    // Check retry button is present
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
  })

  test('should maintain state in URL', async ({ page }) => {
    // Apply filters and search
    await page.fill('[data-testid="search-input"]', 'Amsterdam')
    await page.click('[data-testid="filters-button"]')
    await page.check('[data-testid="university-verified-checkbox"]')
    await page.click('[data-testid="apply-filters-button"]')
    await page.click('[data-testid="sort-dropdown"]')
    await page.click('[data-testid="sort-option-price-asc"]')
    
    // Get current URL
    const url = page.url()
    
    // Navigate away and back
    await page.goto('/')
    await page.goto(url)
    
    // Check state is maintained
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('Amsterdam')
    await expect(page.locator('[data-testid="active-filter-chip"]')).toContainText('University-verified')
    await expect(page).toHaveURL(/sort=priceAsc/)
  })
})
