# Password Changed Email Template

## Overview

This email template is sent to users after they successfully change their password. It provides confirmation and security information.

## Template Location

The template is located at: `docs/supabase-password-changed-email-template.html`

## Implementation Options

### Option 1: Supabase Email Template (If Available)

If Supabase adds support for a "Password Changed" email template:

1. Go to Supabase Dashboard → **Authentication** → **Email Templates**
2. Look for **"Password Changed"** or **"Change Email"** template
3. Copy the content from `docs/supabase-password-changed-email-template.html`
4. Paste into Supabase editor
5. Save

**Note:** Supabase currently doesn't have a built-in "password changed" email template, so this option may not be available yet.

### Option 2: Send Manually via API Route (Recommended)

Since Supabase doesn't automatically send password changed emails, you can send it manually after password update:

1. Create an API route to send the email
2. Call it after successful password update
3. Use SendGrid or your email service to send the template

#### Example Implementation

Create `app/api/auth/send-password-changed-email/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send' // Your email sending function

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.email) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 })
  }

  try {
    // Read the email template
    const template = await fs.readFile(
      path.join(process.cwd(), 'docs/supabase-password-changed-email-template.html'),
      'utf-8'
    )
    
    // Replace template variables
    const html = template.replace(/\{\{ \.Email \}\}/g, user.email)
    
    // Send email via SendGrid or your email service
    await sendEmail({
      to: user.email,
      subject: 'Password Changed - Domu Match',
      html: html
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending password changed email:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
```

Then call it from the reset password confirm form after successful password update.

### Option 3: Use Supabase Edge Function

You could also create a Supabase Edge Function that triggers on password change and sends the email.

## Template Variables

The template uses:
- `{{ .Email }}` - User's email address

Replace this with the actual email when sending manually.

## Email Features

- ✅ Professional design matching brand
- ✅ Success confirmation with checkmark icon
- ✅ Security notice if change wasn't authorized
- ✅ Sign in button for easy access
- ✅ Responsive design for mobile/desktop
- ✅ Clean HTML without broken CSS

## Testing

1. Change a password through the reset flow
2. Check email inbox
3. Verify email displays correctly
4. Test the "Sign In" button link

## Security Note

This email serves as a security notification. If users receive this email but didn't change their password, they should contact support immediately.

