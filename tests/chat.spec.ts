import { test, expect } from '@playwright/test'

test.describe('Chat', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated user with accepted matches
    await page.goto('/chat')
  })

  test('should display chat interface', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Chat' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Type a message...' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send' })).toBeVisible()
  })

  test('should show chat list', async ({ page }) => {
    // Should show list of chat conversations
    await expect(page.getByText('Recent conversations')).toBeVisible()
    await expect(page.getByRole('listitem')).toBeVisible()
  })

  test('should send messages', async ({ page }) => {
    const messageInput = page.getByRole('textbox', { name: 'Type a message...' })
    const sendButton = page.getByRole('button', { name: 'Send' })
    
    // Type a message
    await messageInput.fill('Hello, how are you?')
    await sendButton.click()
    
    // Message should appear in chat
    await expect(page.getByText('Hello, how are you?')).toBeVisible()
    
    // Input should be cleared
    await expect(messageInput).toHaveValue('')
  })

  test('should block links in messages', async ({ page }) => {
    const messageInput = page.getByRole('textbox', { name: 'Type a message...' })
    const sendButton = page.getByRole('button', { name: 'Send' })
    
    // Try to send a message with a link
    await messageInput.fill('Check out https://example.com')
    await sendButton.click()
    
    // Should show error message
    await expect(page.getByText('Links are not allowed for safety reasons')).toBeVisible()
    
    // Message should not be sent
    await expect(page.getByText('Check out https://example.com')).not.toBeVisible()
  })

  test('should block PII in messages', async ({ page }) => {
    const messageInput = page.getByRole('textbox', { name: 'Type a message...' })
    const sendButton = page.getByRole('button', { name: 'Send' })
    
    // Try to send a message with email
    await messageInput.fill('Contact me at test@example.com')
    await sendButton.click()
    
    // Should show error message
    await expect(page.getByText('Messages cannot contain personal information')).toBeVisible()
  })

  test('should show typing indicators', async ({ page }) => {
    // Start typing
    await page.getByRole('textbox', { name: 'Type a message...' }).fill('Typing...')
    
    // Should show typing indicator (mocked)
    await expect(page.getByText('Someone is typing...')).toBeVisible()
  })

  test('should show message status', async ({ page }) => {
    // Send a message
    await page.getByRole('textbox', { name: 'Type a message...' }).fill('Test message')
    await page.getByRole('button', { name: 'Send' }).click()
    
    // Should show message status
    await expect(page.getByText('Delivered')).toBeVisible()
  })

  test('should handle message rate limiting', async ({ page }) => {
    const messageInput = page.getByRole('textbox', { name: 'Type a message...' })
    const sendButton = page.getByRole('button', { name: 'Send' })
    
    // Send multiple messages quickly
    for (let i = 0; i < 35; i++) {
      await messageInput.fill(`Message ${i}`)
      await sendButton.click()
    }
    
    // Should show rate limit error
    await expect(page.getByText('You\'re sending messages too quickly. Please slow down.')).toBeVisible()
  })

  test('should show online status', async ({ page }) => {
    // Should show online indicators for users
    await expect(page.getByText('Online')).toBeVisible()
  })

  test('should show last seen time', async ({ page }) => {
    // Should show last seen information
    await expect(page.getByText(/Last seen/)).toBeVisible()
  })

  test('should handle chat actions', async ({ page }) => {
    // Click on chat menu
    await page.getByRole('button', { name: 'Chat options' }).click()
    
    // Should show action menu
    await expect(page.getByRole('menuitem', { name: 'Leave Chat' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Report User' })).toBeVisible()
  })

  test('should confirm chat actions', async ({ page }) => {
    // Try to leave chat
    await page.getByRole('button', { name: 'Chat options' }).click()
    await page.getByRole('menuitem', { name: 'Leave Chat' }).click()
    
    // Should show confirmation dialog
    await expect(page.getByText('Are you sure you want to leave this chat?')).toBeVisible()
  })

  test('should show safety tips', async ({ page }) => {
    // Should display safety tips
    await expect(page.getByText('Chat Safety Tips')).toBeVisible()
    await expect(page.getByText('Never share personal information')).toBeVisible()
  })

  test('should be accessible', async ({ page }) => {
    // Check for proper heading structure
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    
    // Check for form controls
    await expect(page.getByRole('textbox', { name: 'Type a message...' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send' })).toBeVisible()
    
    // Check keyboard navigation
    await page.getByRole('textbox', { name: 'Type a message...' }).focus()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Send' })).toBeFocused()
  })

  test('should show no conversations state', async ({ page }) => {
    // Mock empty chat state
    await page.evaluate(() => {
      localStorage.setItem('mock-empty-chats', 'true')
    })
    await page.reload()
    
    await expect(page.getByText('No conversations yet')).toBeVisible()
    await expect(page.getByText('Accept a match to start chatting!')).toBeVisible()
    await expect(page.getByRole('link', { name: 'View Matches' })).toBeVisible()
  })

  test('should handle group chats', async ({ page }) => {
    // Should show group chat indicators
    await expect(page.getByText('Group Chat')).toBeVisible()
    
    // Should show multiple participants
    await expect(page.getByText(/members/)).toBeVisible()
  })
})
