import { test, expect } from '@playwright/test'

test.describe('Responsive navigation', () => {
  const viewports = [
    { name: 'phone', width: 375, height: 812 },
    { name: 'tablet', width: 834, height: 1112 },
    { name: 'desktop', width: 1366, height: 768 },
  ]

  for (const vp of viewports) {
    test(`dashboard navigation - ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/dashboard')

      if (vp.name === 'phone') {
        // Bottom tab bar visible
        await expect(page.locator('nav[role="navigation"]')).toBeVisible()
      }

      // Top nav should be present
      await expect(page.locator('header')).toBeVisible()
    })
  }
})


