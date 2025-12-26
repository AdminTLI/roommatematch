# Password Reset Direct Fix

## Problem
Password reset links were redirecting to the home page instead of the reset password confirmation page.

## Root Cause
The callback route (`/auth/callback`) was not reliably detecting password reset flows, even with enhanced detection logic. Supabase may not always include the `type=recovery` parameter, or the email template might be using the Site URL instead of our callback URL.

## Solution
**Bypass the callback route entirely** by pointing password reset emails directly to the confirm page, which handles the code exchange itself.

### Changes Made

1. **Reset Password Form** (`components/auth/reset-password-form.tsx`):
   - Changed `redirectTo` from `/auth/callback` to `/auth/reset-password/confirm`
   - This ensures Supabase sends users directly to the confirm page

2. **Reset Password Confirm Form** (`components/auth/reset-password-confirm-form.tsx`):
   - Added code exchange logic in the `useEffect` hook
   - If a `code` parameter is found in the URL, it exchanges it for a session before checking for a valid session
   - This allows the confirm page to handle the entire flow without relying on the callback route

3. **Callback Route** (`app/auth/callback/route.ts`):
   - Enhanced detection logic remains as a fallback
   - Added better logging for debugging

## How It Works Now

1. User requests password reset → enters email
2. `resetPasswordForEmail()` is called with `redirectTo: /auth/reset-password/confirm`
3. Supabase sends email with link: `https://your-domain.com/auth/reset-password/confirm?code=xxx&type=recovery`
4. User clicks link → goes directly to confirm page
5. Confirm page detects `code` in URL → exchanges code for session
6. User enters new password → password updated
7. User redirected to sign-in page

## Supabase Configuration Required

**Important**: You must add the confirm page URL to Supabase redirect URLs:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add to **Redirect URLs**:
   ```
   https://domumatch.com/auth/reset-password/confirm
   http://localhost:3000/auth/reset-password/confirm
   ```

Also ensure the base callback URL is still there (for other auth flows):
```
https://domumatch.com/auth/callback
http://localhost:3000/auth/callback
```

## Testing

1. Request a new password reset (old links won't work with new redirect)
2. Click the link in the email
3. Should go directly to `/auth/reset-password/confirm`
4. Should be able to enter new password
5. Should redirect to sign-in after successful reset

## Benefits

- ✅ More reliable - doesn't depend on callback route detection
- ✅ Simpler flow - one less redirect
- ✅ Better user experience - direct to the page they need
- ✅ Easier to debug - code exchange happens where it's needed

## Fallback

The callback route still has enhanced detection logic in case Supabase uses it for any reason, but the primary flow now bypasses it entirely.

