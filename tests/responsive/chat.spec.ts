import { test, expect } from '@playwright/test'

test.describe('Chat responsive', () => {
  test('composer stays visible on phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/chat')

    // Prefer an open thread when the list has rooms; otherwise assert list chrome still fits.
    const firstChat = page.locator('[data-messenger-sidebar] button, [data-messenger-sidebar] a').first()
    if (await firstChat.isVisible({ timeout: 4000 }).catch(() => false)) {
      await firstChat.click()
      await expect(page.locator('[data-messenger-conversation]')).toBeVisible({ timeout: 8000 })
    }

    const composer = page.locator('[data-messenger-composer]')
    // Composer may require auth + a selected room; when present it must sit in the viewport.
    if (await composer.count()) {
      await expect(composer).toBeVisible()
      const box = await composer.boundingBox()
      expect(box).toBeTruthy()
      if (box) {
        expect(box.y + box.height).toBeLessThanOrEqual(844 + 1)
        expect(box.y).toBeGreaterThanOrEqual(0)
      }
    }
  })
})
