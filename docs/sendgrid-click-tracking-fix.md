# Fixing Password Reset Links with SendGrid Click Tracking

## The Problem

SendGrid's click tracking feature wraps email links in tracking URLs, which can interfere with Supabase's password reset redirect flow. The tracking URL can strip or modify query parameters like `redirect_to`, causing users to be redirected to the wrong page.

## Solution 1: Disable Click Tracking (Recommended)

### Steps:

1. **Log into SendGrid Dashboard**
   - Go to [app.sendgrid.com](https://app.sendgrid.com)

2. **Navigate to Tracking Settings**
   - Go to **Settings** → **Tracking**
   - Or go to **Settings** → **Mail Settings** → **Click Tracking**

3. **Disable Click Tracking**
   - Toggle off **Click Tracking**
   - This will prevent SendGrid from wrapping your links

4. **Save Changes**
   - Click **Save** or the changes will auto-save

### Benefits:
- ✅ Password reset links work correctly
- ✅ No URL modification
- ✅ All query parameters preserved

### Trade-offs:
- ❌ You lose click tracking metrics for email links
- ❌ Can't see which users clicked the reset link

## Solution 2: Use Manual URL Construction (Alternative)

If you need click tracking, you can construct the URL manually in the Supabase email template, but this is more complex and less secure.

### Update Email Template:

Replace the button link in your Supabase email template:

**Instead of:**
```html
<a href="{{ .ConfirmationURL }}">Set New Password</a>
```

**Use:**
```html
<a href="https://your-project.supabase.co/auth/v1/verify?token={{ .TokenHash }}&type=recovery&redirect_to=https://domumatch.com/auth/reset-password/confirm">Set New Password</a>
```

**Note:** Replace `your-project.supabase.co` with your actual Supabase project URL.

## Recommendation

**Disable SendGrid click tracking** for password reset emails. The security and functionality of password reset is more important than click tracking metrics.

## Testing

After disabling click tracking:
1. Request a new password reset
2. Check the email link (should go directly to Supabase, not through SendGrid tracking)
3. Click the link
4. Should redirect to `/auth/reset-password/confirm`

