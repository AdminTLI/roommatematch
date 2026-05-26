# Supabase Auth - email template setup

This guide explains how to install the redesigned Domu Match auth email
templates in the Supabase dashboard. All template HTML is versioned in
`lib/email/templates/supabase/` and is the source of truth.

## Templates to install

| Supabase template | File | Subject (paste in dashboard Subject field) |
|-------------------|------|---------------------------------------------|
| Confirm signup    | `verify-otp.html` | `Your Domu Match verification code` |
| Magic link or OTP | `magic-link.html` | `Sign in to Domu Match` |
| Change email address | `email-change.html` | `Confirm your new email - Domu Match` |
| Reset password    | `password-reset.html` | `Reset your Domu Match password` |
| Invite user       | `invite-user.html` | `You're invited to Domu Match` |
| Reauthentication  | `reauthentication.html` | `{{ .Token }} is your Domu Match verification code` |

All paths are under `lib/email/templates/supabase/`. Subjects are also listed in `SUBJECTS.txt` and as HTML comments at the top of each file.

## How to install (per template)

1. **Open** the Supabase dashboard → **Authentication → Email Templates**.
2. **Select** the template (e.g. *Confirm signup*).
3. **Preview** the new design first by visiting
   [`/dev/email-preview`](#preview-templates-locally) in the running app and
   clicking the matching item in the left rail.
4. From `/dev/email-preview`, click **Copy raw HTML**, or copy the file
   contents directly from
   `lib/email/templates/supabase/<file>.html`.
5. **Paste** into the Supabase HTML body editor (replace the entire body).
6. Copy the **Subject** from the HTML comment at the top of the file (or from `SUBJECTS.txt`) into the Supabase **Subject** field — do not put the subject inside the HTML body.
7. Click **Send test email** and confirm it renders correctly in Gmail web
   and at least one other client (Apple Mail or Outlook).
8. **Save**.

## Variables used

| Template | Supabase variables expected |
|----------|------------------------------|
| Confirm signup (OTP) | `{{ .Token }}`, `{{ .Email }}` |
| Magic link or OTP | `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .Email }}` |
| Email change | `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .NewEmail }}` |
| Reset password | `{{ .ConfirmationURL }}`, `{{ .Email }}` |
| Invite user | `{{ .ConfirmationURL }}`, `{{ .Email }}` |
| Reauthentication | `{{ .Token }}`, `{{ .Email }}` |

**Logo images:** templates use `https://www.domumatch.com/images/logo.png` (with `www`) so email clients and the Supabase preview do not hit a redirect on the bare domain.

The dev preview substitutes realistic samples for these so you can see the
final visual output.

## Preview templates locally

Run the app and open `/dev/email-preview`. The page is dev-open and admin-only
in production. Each Supabase template has a **Copy raw HTML** button - that
copy still contains the `{{ .Token }}` etc. variables (the iframe renders
substituted values, but the copy gives you the original for Supabase paste).

You can also fetch HTML directly:

```bash
curl 'http://localhost:3000/api/dev/email-preview?kind=supabase-verify' | open -f
```

## Post-install checklist

- [ ] All 6 templates pasted into Supabase (HTML + subject) and saved
- [ ] *Send test email* from each template, check Gmail (web) inbox
- [ ] Test on Apple Mail (mobile + desktop)
- [ ] Test on Outlook.com webmail
- [ ] Real-world signup → OTP arrives correctly
- [ ] Real-world password reset → link arrives and works
- [ ] Confirm From address in Supabase SMTP settings is `info@domumatch.com`
- [ ] Confirm SendGrid/Mailjet **click tracking is disabled** for password
  reset links (otherwise the redirect query params can be stripped - see
  `docs/sendgrid-click-tracking-fix.md`)

## When you change brand chrome

The Supabase templates are static HTML and duplicate the header / footer
chrome defined in `lib/email/layout.ts`. If you change the brand chrome:

1. Update `lib/email/layout.ts` (affects all app-sent emails immediately).
2. Manually re-apply the same change to all 6 files under
   `lib/email/templates/supabase/`.
3. Re-paste each into Supabase from the dev preview’s **Copy raw HTML**
   button.

A future improvement is to generate the Supabase files from the same layout
helper - for now they’re hand-synced and the docs in
`docs/email-design-system.md` describe why.

## Troubleshooting

- **OTP not arriving** → check Supabase Auth logs and Mailjet activity log.
- **Reset link redirects to the wrong page** → see
  `docs/password-reset-direct-fix.md` and confirm the URL pattern matches
  what’s pasted in the *Reset Password* template.
- **Email looks unstyled in Outlook desktop** → make sure you pasted the
  raw HTML (not just the body) and that no extra `<style>` block was
  inserted by the Supabase editor.

## Past references

The legacy template lived at `lib/email/templates/verification-otp.html` and
has been replaced by the files above.
