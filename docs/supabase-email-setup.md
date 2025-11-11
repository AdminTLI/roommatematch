# Supabase Email Template Setup

This guide explains how to configure the professional email template for OTP verification in your Supabase project.

## Step 1: Access Supabase Dashboard

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your Domu Match project
3. Navigate to **Authentication** → **Email Templates**

## Step 2: Configure Confirm Signup Template

1. In the Email Templates section, find **"Confirm signup"**
2. Click on it to edit the template
3. Replace the default template with the custom HTML from `lib/email/templates/verification-otp.html`

## Step 3: Update Template Variables

The template uses these Supabase variables:
- `{{ .Token }}` - The 6-digit OTP code
- `{{ .Email }}` - The user's email address

## Step 4: Test the Template

1. Click **"Send test email"** in the Supabase dashboard
2. Enter a test email address
3. Verify the email looks professional and the OTP code is clearly visible

## Step 5: Configure Redirect URLs (Optional)

If you want to keep magic link support as a backup:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production domain: `https://your-domain.vercel.app`
3. Add to **Redirect URLs**: `https://your-domain.vercel.app/auth/callback`

## Email Template Features

The custom template includes:

- **Professional Design**: Clean, modern layout with brand colors
- **Responsive**: Works on mobile and desktop email clients
- **Clear OTP Display**: Large, monospace font for the 6-digit code
- **Expiration Notice**: 10-minute expiry warning
- **Branding**: Domu Match logo and colors
- **Support Links**: Help center, contact, and privacy policy links
- **Accessibility**: High contrast and readable fonts

## Troubleshooting

### Email Not Sending
- Check your Supabase project's email settings
- Verify SMTP configuration in Supabase dashboard
- Check spam folder for test emails

### Template Not Loading
- Ensure HTML is properly formatted
- Check that Supabase variables are correctly placed
- Verify no syntax errors in the template

### OTP Code Not Working
- Ensure the template uses `{{ .Token }}` variable
- Check that the code is clearly visible in the email
- Verify the OTP input component is working correctly

## Customization

To customize the email template:

1. Edit `lib/email/templates/verification-otp.html`
2. Update colors, fonts, or layout as needed
3. Copy the updated HTML to Supabase dashboard
4. Test the changes with a test email

## Production Checklist

Before going live:

- [ ] Email template configured in Supabase
- [ ] Test email sent and verified
- [ ] OTP input component working
- [ ] User flow tested end-to-end
- [ ] Error handling implemented
- [ ] Resend functionality working
- [ ] Mobile responsiveness verified
