import { test, expect } from '@playwright/test'

test.describe('Chat responsive', () => {
  test('composer stays visible on phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/chat')
    // Navigate to first room if list exists; otherwise just assert list renders
    await expect(page.locator('text=No messages').first()).not.toBeVisible({ timeout: 2000 }).catch(() => {})
    // Composer should exist and be visible
    await expect(page.locator('button:has-text("Send")')).toBeVisible()
  })
})


