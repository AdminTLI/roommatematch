# Fix Supabase Password Reset Email Template

## The Problem

Supabase's `{{ .ConfirmationURL }}` variable is using the Site URL (`https://domumatch.com`) instead of respecting the `redirectTo` parameter we pass in `resetPasswordForEmail()`.

## The Solution

Update the Supabase email template to manually construct the URL with the correct `redirect_to` parameter.

## Steps to Fix

1. **Go to Supabase Dashboard**
   - Navigate to **Authentication** → **Email Templates**
   - Find **"Reset Password"** template
   - Click to edit it

2. **Update the Button Link**

   **Current (broken):**
   ```html
   <a href="{{ .ConfirmationURL }}" style="...">Set New Password</a>
   ```

   **Updated (working):**
   ```html
   <a href="https://nffdthkwduxgrfadszbl.supabase.co/auth/v1/verify?token={{ .TokenHash }}&type=recovery&redirect_to=https://domumatch.com/auth/callback?redirect=%2Fauth%2Freset-password%2Fconfirm" style="...">Set New Password</a>
   ```

   **Important:** Replace `nffdthkwduxgrfadszbl` with your actual Supabase project reference (found in your Supabase URL).

3. **Alternative: Use Template Variables**

   If Supabase supports it, you can try:
   ```html
   <a href="https://{{ .SiteURL }}/auth/v1/verify?token={{ .TokenHash }}&type=recovery&redirect_to=https://domumatch.com/auth/callback?redirect=%2Fauth%2Freset-password%2Fconfirm" style="...">Set New Password</a>
   ```

   But you'll need to replace `{{ .SiteURL }}` with your actual Supabase project URL.

## Full Updated Template

Here's the complete updated template with the fix:

```html
<div style="background-color: #f9fafb; padding: 40px 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 40px; border: 1px solid #e5e7eb;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #7c3aed; margin: 0; font-size: 24px; font-weight: 800;">Domu Match</h1>
    </div>

    <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 16px; text-align: center;">Password Reset</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 32px; text-align: center;">
      We received a request to reset the password for <strong>{{ .Email }}</strong>. If this was you, click the button below:
    </p>

    <div style="text-align: center; margin-bottom: 32px;">
      <a href="https://nffdthkwduxgrfadszbl.supabase.co/auth/v1/verify?token={{ .TokenHash }}&type=recovery&redirect_to=https://domumatch.com/auth/callback?redirect=%2Fauth%2Freset-password%2Fconfirm" style="background-color: #111827; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block;">Set New Password</a>
    </div>

    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
    </p>
  </div>
  <div style="text-align: center; margin-top: 24px;">
    <p style="color: #9ca3af; font-size: 12px;">&copy; 2025 Domu Match. All rights reserved.</p>
  </div>
</div>
```

## URL Encoding

Note: The `redirect_to` parameter is URL-encoded:
- `/auth/reset-password/confirm` becomes `%2Fauth%2Freset-password%2Fconfirm`
- The full callback URL is: `https://domumatch.com/auth/callback?redirect=%2Fauth%2Freset-password%2Fconfirm`

## Testing

After updating the template:
1. Request a new password reset
2. Check the email link
3. Should go to: `https://nffdthkwduxgrfadszbl.supabase.co/auth/v1/verify?token=xxx&type=recovery&redirect_to=https://domumatch.com/auth/callback?redirect=%2Fauth%2Freset-password%2Fconfirm`
4. Clicking should redirect through callback → confirm page

## Alternative: Dynamic Supabase URL

If you want to make it more maintainable, you can check if Supabase has a variable for the project URL. Otherwise, hardcode it as shown above.




