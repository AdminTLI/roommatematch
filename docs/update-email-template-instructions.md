# Update Supabase Password Reset Email Template

## The Problem

The current email template has broken HTML/CSS showing in Gmail, making it look unprofessional.

## The Solution

Replace the email template in Supabase with the clean version provided.

## Steps to Fix

1. **Go to Supabase Dashboard**
   - Navigate to **Authentication** → **Email Templates**
   - Find **"Reset Password"** template
   - Click to edit it

2. **Copy the Clean Template**

   Open the file `docs/supabase-password-reset-email-template.html` and copy the entire content.

3. **Replace in Supabase**

   - Delete all existing content in the Supabase email template editor
   - Paste the new template content
   - Click **Save**

## What's Fixed

- ✅ Clean HTML structure (no broken CSS showing)
- ✅ Properly formatted button link
- ✅ Correct redirect URL with callback route
- ✅ Professional styling
- ✅ Responsive design

## Important Notes

- The template uses `{{ .TokenHash }}` and `{{ .Email }}` which are Supabase template variables
- The redirect URL is hardcoded to use your callback route: `https://domumatch.com/auth/callback?redirect=%2Fauth%2Freset-password%2Fconfirm`
- Replace `nffdthkwduxgrfadszbl` with your actual Supabase project reference if different

## Testing

After updating:
1. Request a new password reset
2. Check the email in Gmail
3. Should see clean, professional email without broken CSS
4. Button should work correctly

