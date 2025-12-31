# Fixing Supabase Site URL for Password Reset

## The Problem

The `{{ .ConfirmationURL }}` variable in Supabase email templates uses the **Site URL** from your Supabase dashboard settings as the base URL. If your Site URL is set to your home page (e.g., `https://domumatch.com`), password reset links will redirect there first.

## The Solution

You need to check and potentially update your **Site URL** in Supabase. The Site URL should be your base domain, and the `redirectTo` parameter we pass should handle the specific route.

### Step 1: Check Your Current Site URL

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Check what your **Site URL** is set to

### Step 2: Update Site URL (if needed)

Your Site URL should be set to your base domain:
- **Production**: `https://domumatch.com`
- **Development**: `http://localhost:3000`

**Important**: The Site URL should be your base domain, NOT a specific page like `/dashboard` or `/auth/callback`.

### Step 3: Verify Redirect URLs

Make sure these are in your **Redirect URLs** list:
```
https://domumatch.com/auth/reset-password/confirm
https://domumatch.com/auth/callback
http://localhost:3000/auth/reset-password/confirm
http://localhost:3000/auth/callback
```

### Step 4: How {{ .ConfirmationURL }} Works

The `{{ .ConfirmationURL }}` variable generates a URL like:
```
https://your-project.supabase.co/auth/v1/verify?token=xxx&type=recovery&redirect_to=https://domumatch.com/auth/reset-password/confirm
```

This URL:
1. Goes to Supabase's auth endpoint first
2. Supabase verifies the token
3. Supabase redirects to the `redirect_to` parameter (our confirm page)

### Step 5: Test

1. Request a new password reset
2. Check the email link
3. The link should go through Supabase's auth endpoint, then redirect to `/auth/reset-password/confirm`

## Alternative: Custom Email Template

If the above doesn't work, you could modify the email template to use a direct link, but this is **NOT recommended** as it bypasses Supabase's security:

```html
<!-- NOT RECOMMENDED - Only if absolutely necessary -->
<a href="https://domumatch.com/auth/reset-password/confirm?token={{ .Token }}&type=recovery">
  Set New Password
</a>
```

**Why not recommended**: This bypasses Supabase's token verification flow and could be less secure.

## Current Implementation

Our code passes:
```javascript
redirectTo: 'https://domumatch.com/auth/reset-password/confirm'
```

Supabase should use this in the `redirect_to` parameter of `{{ .ConfirmationURL }}`. If it's not working, the issue is likely:
1. Site URL is set incorrectly
2. Redirect URL is not in the allowed list
3. Supabase is not respecting the redirectTo parameter

## Debugging

To debug, check the actual URL in the email:
1. Request a password reset
2. Right-click the button/link in the email
3. Copy the link address
4. Check if it includes `redirect_to=https://domumatch.com/auth/reset-password/confirm`

If it doesn't include the redirect_to parameter, Supabase might not be using our redirectTo value.


