import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-in')
  })

  test('should display sign in form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    await expect(page.getByLabel('Email address')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel('Email address').fill('test@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.getByText('Invalid email or password')).toBeVisible()
  })

  test('should navigate to sign up page', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign up here' }).click()
    await expect(page).toHaveURL('/auth/sign-up')
  })

  test('should navigate to forgot password page', async ({ page }) => {
    await page.getByRole('link', { name: 'Forgot your password?' }).click()
    await expect(page).toHaveURL('/auth/reset-password')
  })

  test('should be accessible', async ({ page }) => {
    // Check for proper heading structure
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    
    // Check for form labels
    await expect(page.getByLabel('Email address')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    
    // Check for proper button roles
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    
    // Check keyboard navigation
    await page.keyboard.press('Tab')
    await expect(page.getByLabel('Email address')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.getByLabel('Password')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeFocused()
  })
})

test.describe('Sign Up', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/sign-up')
  })

  test('should display sign up form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
    await expect(page.getByLabel('Email address')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByLabel('Confirm password')).toBeVisible()
    await expect(page.getByRole('checkbox')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Account' }).click()
    
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
    await expect(page.getByText('You must agree to the terms and conditions')).toBeVisible()
  })

  test('should validate password confirmation', async ({ page }) => {
    await page.getByLabel('Email address').fill('test@student.uva.nl')
    await page.getByLabel('Password').fill('password123')
    await page.getByLabel('Confirm password').fill('differentpassword')
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Create Account' }).click()

    await expect(page.getByText('Passwords do not match')).toBeVisible()
  })

  test('should validate password strength', async ({ page }) => {
    await page.getByLabel('Email address').fill('test@student.uva.nl')
    await page.getByLabel('Password').fill('123')
    await page.getByLabel('Confirm password').fill('123')
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Create Account' }).click()

    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
  })

  test('should navigate to sign in page', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign in here' }).click()
    await expect(page).toHaveURL('/auth/sign-in')
  })

  test('should be accessible', async ({ page }) => {
    // Check for proper heading structure
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    
    // Check for form labels
    await expect(page.getByLabel('Email address')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByLabel('Confirm password')).toBeVisible()
    
    // Check for proper button roles
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible()
    await expect(page.getByRole('checkbox')).toBeVisible()
  })
})

test.describe('Password Reset', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/reset-password')
  })

  test('should display reset password form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible()
    await expect(page.getByLabel('Email address')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send reset link' })).toBeVisible()
  })

  test('should show validation error for empty email', async ({ page }) => {
    await page.getByRole('button', { name: 'Send reset link' }).click()
    await expect(page.getByText('Email is required')).toBeVisible()
  })

  test('should navigate back to sign in', async ({ page }) => {
    await page.getByRole('link', { name: 'Back to sign in' }).click()
    await expect(page).toHaveURL('/auth/sign-in')
  })
})
