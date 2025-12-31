# Password Reset Email Troubleshooting Guide

This guide helps diagnose and fix issues with password reset emails not being received.

## Common Issues

### 1. Redirect URL Not Whitelisted in Supabase

**Problem**: Supabase will silently fail to send emails if the `redirectTo` URL is not whitelisted.

**Solution**:
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Under **Redirect URLs**, add the following URLs (for both development and production):
   - `http://localhost:3000/auth/callback`
   - `http://127.0.0.1:3000/auth/callback`
   - `https://your-production-domain.com/auth/callback`
   - `https://your-production-domain.com/auth/reset-password/confirm`
4. Set **Site URL** to your production domain (e.g., `https://your-domain.vercel.app`)

### 2. SMTP Not Configured in Production

**Problem**: Supabase's default email service has limitations and may not work reliably in production.

**Solution**:
1. Go to Supabase Dashboard → **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Configure a production SMTP provider (recommended options):
   - **SendGrid** (recommended)
   - **Mailgun**
   - **AWS SES**
   - **Postmark**

**Example SendGrid Configuration**:
- Host: `smtp.sendgrid.net`
- Port: `587`
- Username: `apikey`
- Password: Your SendGrid API Key
- Sender email: `noreply@yourdomain.com`
- Sender name: `Your App Name`

### 3. Email Template Not Configured

**Problem**: Supabase might be using a default template that gets caught by spam filters.

**Solution**:
1. Go to Supabase Dashboard → **Authentication** → **Email Templates**
2. Find **"Reset Password"** template
3. Customize the template to include:
   - Clear subject line
   - Professional HTML design
   - Your branding
   - Clear call-to-action button

### 4. Rate Limiting

**Problem**: Supabase has rate limits on email sending.

**Check**:
1. Go to Supabase Dashboard → **Project Settings** → **Auth** → **Rate Limits**
2. Default limit: 2 emails per hour per email address
3. If you're testing, wait at least 1 hour between attempts

### 5. Email Going to Spam

**Problem**: Emails are being sent but filtered as spam.

**Solutions**:
- Check spam/junk folder
- Configure SPF, DKIM, and DMARC records for your domain (if using custom SMTP)
- Use a reputable SMTP provider
- Avoid spam trigger words in email content

## Testing the Password Reset Flow

### Step 1: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Attempt to send a password reset email
4. Look for log messages:
   - `Attempting to send password reset email:` - Shows the request details
   - `Password reset response:` - Shows Supabase's response
   - Any error messages

### Step 2: Check Supabase Logs

1. Go to Supabase Dashboard → **Logs** → **Auth Logs**
2. Look for entries related to password reset
3. Check for any error messages

### Step 3: Test with Supabase Dashboard

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find a test user
3. Click the three dots → **Send password reset email**
4. Check if the email is received
5. If this works but your app doesn't, the issue is with the redirect URL configuration

## Code Changes Made

The reset password form has been updated with:
- Better error logging to console
- More detailed error messages
- Logging of request/response data for debugging

## Verification Checklist

- [ ] Redirect URLs are whitelisted in Supabase Dashboard
- [ ] Site URL is configured in Supabase Dashboard
- [ ] SMTP is configured (for production)
- [ ] Email template is customized
- [ ] No rate limiting issues (wait 1 hour between tests)
- [ ] Checked spam folder
- [ ] Browser console shows no errors
- [ ] Supabase Auth logs show the request

## Next Steps

If emails still don't arrive after checking all above:

1. **Verify SMTP Configuration**:
   - Test SMTP connection in Supabase Dashboard
   - Send a test email from Supabase Dashboard

2. **Check Email Provider**:
   - Some email providers (like university emails) may block automated emails
   - Try with a Gmail or personal email address

3. **Contact Supabase Support**:
   - If all configuration is correct but emails still don't send
   - Provide them with:
     - Project ID
     - Timestamp of failed attempts
     - Auth logs from that time period

## Production Deployment Notes

Before deploying to production:

1. **Configure Production SMTP**: Never rely on Supabase's default email service in production
2. **Whitelist Production URLs**: Add all production redirect URLs
3. **Set Site URL**: Must match your production domain
4. **Test Email Delivery**: Send test emails to verify delivery
5. **Monitor Auth Logs**: Set up alerts for failed email sends



