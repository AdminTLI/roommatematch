# Password Reset Configuration Guide

This guide explains how to configure Supabase and SendGrid (SMTP) to ensure the password reset functionality works correctly.

## Overview

When a user clicks "Forgot Password", they receive an email with a reset link. This link must be properly configured in both Supabase and SendGrid to redirect users to the correct password reset page.

## Supabase Configuration

### 1. Configure Redirect URLs

1. Go to your Supabase Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Set the **Site URL** to your production domain:
   - Production: `https://your-domain.com` (or `https://your-domain.vercel.app`)
   - Development: `http://localhost:3000`
5. Add the following to **Redirect URLs** (one per line):
   ```
   https://your-domain.com/auth/callback
   http://localhost:3000/auth/callback
   ```
   
   **Important**: Supabase only accepts base URLs without query parameters. The `redirect` query parameter is handled dynamically by your application code.

### 2. Configure Email Templates (Optional but Recommended)

1. Navigate to **Authentication** → **Email Templates**
2. Find the **"Reset Password"** template
3. You can customize the email template, but ensure the reset link uses the Supabase variable:
   ```
   {{ .ConfirmationURL }}
   ```
   This variable automatically includes the correct redirect URL and authentication code.

### 3. Verify Email Settings

1. Navigate to **Authentication** → **Settings**
2. Ensure the following are configured:
   - **Enable email confirmations**: Should be enabled for security
   - **Secure password change**: Can be enabled for additional security (requires re-authentication)
   - **Email rate limit**: Configured appropriately (default is usually fine)

## SendGrid Configuration (SMTP)

### 1. Set Up SendGrid API Key

1. Go to SendGrid Dashboard: [https://app.sendgrid.com](https://app.sendgrid.com)
2. Navigate to **Settings** → **API Keys**
3. Create a new API key with **Full Access** or **Mail Send** permissions
4. Copy the API key (you'll only see it once)

### 2. Configure SMTP in Supabase

1. In Supabase Dashboard, go to **Project Settings** → **Auth** → **SMTP Settings**
2. Enable **Custom SMTP**
3. Fill in the following details:
   - **Host**: `smtp.sendgrid.net`
   - **Port**: `587` (for TLS) or `465` (for SSL)
   - **Username**: `apikey` (literal string, not your API key)
   - **Password**: Your SendGrid API key
   - **Sender email**: Your verified sender email in SendGrid
   - **Sender name**: Your application name (e.g., "Domu Match")
4. Click **Save**

### 3. Verify Sender in SendGrid

1. In SendGrid Dashboard, go to **Settings** → **Sender Authentication**
2. Verify your sender email address (Single Sender Verification) or set up Domain Authentication (recommended for production)
3. Ensure the sender email matches what you configured in Supabase SMTP settings

## Troubleshooting Chunk Load Errors (Development)

If you encounter a `ChunkLoadError` in development (e.g., "Loading chunk app/layout failed"):

1. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Clear node_modules and reinstall** (if step 1 doesn't work):
   ```bash
   rm -rf .next node_modules
   npm install
   npm run dev
   ```

3. **Check for port conflicts**: Ensure port 3000 is not in use by another process

4. **Restart the dev server**: Sometimes a simple restart fixes transient chunk loading issues

This error is typically a Next.js development server issue and not related to the password reset functionality.

## Testing the Configuration

### 1. Test Password Reset Flow

1. Go to your application's sign-in page
2. Click "Forgot password?"
3. Enter a valid email address
4. Check your email for the reset link
5. Click the link in the email
6. **Expected behavior**: You should be redirected to `/auth/reset-password/confirm` page
7. Enter a new password and confirm it
8. **Expected behavior**: Password should be updated and you should be redirected to sign-in page
9. Try signing in with the new password
10. **Expected behavior**: Sign-in should succeed
11. Try signing in with the old password
12. **Expected behavior**: Should show "Incorrect email or password" error

### 2. Verify Email Delivery

- Check your inbox (and spam folder) for the password reset email
- Verify the email contains a clickable link
- Verify the link redirects to the correct page

### 3. Common Issues and Solutions

#### Issue: Link redirects to home page instead of reset page
**Solution**: 
- Verify the redirect URL is added to Supabase Redirect URLs
- Check that the `redirectTo` parameter in the reset email includes `/auth/reset-password/confirm`
- Verify the callback route is handling the redirect correctly

#### Issue: Email not being sent
**Solution**:
- Check SendGrid API key is correct and has proper permissions
- Verify SMTP settings in Supabase are correct
- Check SendGrid activity logs for delivery issues
- Verify sender email is authenticated in SendGrid

#### Issue: "Invalid or expired reset link" error
**Solution**:
- Password reset links expire after 1 hour (default)
- Request a new reset link
- Verify the link hasn't been used already (one-time use)

#### Issue: Password update fails
**Solution**:
- Ensure the user has a valid session (clicked the email link)
- Check password requirements (minimum 8 characters, uppercase, lowercase, number)
- Verify Supabase password requirements are met

## Security Considerations

1. **Redirect URLs**: Only add trusted domains to Supabase redirect URLs to prevent open redirect vulnerabilities
2. **Email Rate Limiting**: Supabase has built-in rate limiting for password reset emails (default: 1 per hour per email)
3. **Link Expiration**: Password reset links expire after 1 hour for security
4. **One-Time Use**: Each reset link can only be used once
5. **HTTPS**: Always use HTTPS in production for secure password reset links

## Environment Variables

Ensure these environment variables are set in your production environment:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

The SMTP configuration is done in Supabase Dashboard, not via environment variables.

## Additional Notes

- The password reset flow uses Supabase's built-in authentication system
- The reset link includes a secure token that's exchanged for a session
- After password reset, users are automatically signed out and must sign in with the new password
- Old passwords are immediately invalidated after a successful reset

