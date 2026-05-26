# Domu Match - email design system

This document describes how every Domu Match email is built. If you’re
adding a new email or editing an existing one, start here.

## File map

```
lib/email/
  brand.ts                 # tokens, URLs, slogan, social, support email
  layout.ts                # renderEmailLayout(), renderButton(), renderInfoBox(), renderOtpDigits()
  unsubscribe-token.ts     # HMAC token helpers for one-click unsubscribe links
  onboarding-sequences.ts  # welcome / completion / verification reminder / first match
  notification-digests.ts  # matches / messages / platform updates digests
  workflows.ts             # sendEmail() Mailjet transport + ticket email senders
  templates/
    supabase/              # static HTML for Supabase Auth pastes
      verify-otp.html
      password-reset.html
      magic-link.html
      email-change.html
      invite-user.html
      reauthentication.html
      SUBJECTS.txt

app/api/dev/email-preview/route.ts   # renders every template via shared helpers
app/dev/email-preview/               # admin-only gallery UI
app/api/unsubscribe/route.ts         # GET/POST signed-token preference resolver
app/unsubscribe/                     # public, token-gated preferences page
supabase/migrations/20260524150000_email_unsubscribe_events.sql
```

## Two channels

1. **Supabase Auth emails** - confirm signup, magic link, password reset,
   email change, invite. HTML lives in `lib/email/templates/supabase/` and
   is **pasted into the Supabase dashboard**. Variables (`{{ .Token }}`,
   `{{ .ConfirmationURL }}`, etc.) are filled by Supabase at send time.
2. **App-sent emails** - every other email (digests, onboarding, tickets,
   inactivity warnings). Built in code via `renderEmailLayout()` and sent
   through Mailjet by `sendEmail()` in `workflows.ts`.

Both channels use the same visual chrome (header band + body card + footer)
and the same colors from `brand.ts`.

## Brand tokens

| Token | Value | Where it shows |
|-------|-------|-----------------|
| `COLORS.primary` | `#7c3aed` | CTAs, OTP digits, link accents |
| `COLORS.primarySoft` | `#f5f3ff` | Header band, OTP container, footer pills |
| `COLORS.primaryInk` | `#5b21b6` | Logo wordmark, pill text |
| `COLORS.page` | `#f8fafc` | Page background |
| `COLORS.card` | `#ffffff` | Body card |
| `COLORS.textHeading` | `#0f172a` | `<h1>` |
| `COLORS.textMuted` | `#64748b` | Subtitles and helper text |
| `BRAND.logoUrl` | `https://domumatch.com/images/logo.png` | Logo image |
| `BRAND.tagline` | *The smartest way to find compatible roommates…* | Footer line |
| `BRAND.supportEmail` | `domumatch@gmail.com` | Public contact (mailto + footer) |
| `BRAND.fromAddress` | `info@domumatch.com` | "Sent from" line in footer |

## How to add a new email

```ts
import { renderEmailLayout, renderButton, renderInfoBox } from '@/lib/email/layout'
import { BRAND, COLORS, URLS, buildUnsubscribeUrl } from '@/lib/email/brand'
import { createUnsubscribeToken } from '@/lib/email/unsubscribe-token'
import { sendEmail } from '@/lib/email/workflows'

export async function sendCoolNewEmail(userId: string, email: string, name?: string) {
  const niceName = name?.trim() || 'there'

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${COLORS.textHeading};text-align:center;">
      Cool new email
    </h1>
    <p style="margin:0 0 20px;text-align:center;color:${COLORS.textMuted};font-size:15px;">
      Hey ${niceName} - here's the thing.
    </p>
    <div style="margin:24px 0;">
      ${renderButton('Take action', `${URLS.home}/wherever`)}
    </div>
    ${renderInfoBox('Optional tip / context block.', 'neutral')}
  `

  const html = renderEmailLayout({
    preheader: 'A short preview line that appears next to the subject in Gmail.',
    title: 'Cool new email',
    bodyHtml,
    recipientEmail: email,
    includeUnsubscribe: true,
    unsubscribeUrl: buildUnsubscribeUrl(createUnsubscribeToken(userId)),
  })

  return sendEmail({ to: email, subject: 'Cool new email', html, text: '...' })
}
```

Then add a preview case in `app/api/dev/email-preview/route.ts` so the new
email shows up in `/dev/email-preview`.

## Cross-client constraints (don't break these)

- **Tables, not flexbox/grid**. Inline `role="presentation"` on layout tables.
- **Inline CSS only**. Gmail strips `<style>` and class selectors.
- **Web-safe fonts only** - `FONT_STACK` in `brand.ts`. No `@font-face`.
- **600px max width**, fluid below via single-column tables.
- **Absolute `https://…` URLs** for images, with explicit `width`, `height`,
  `alt`.
- **CTA buttons** must be built via `renderButton()` (bulletproof
  `<td bgcolor="…">` wrapper for Outlook).
- **Preheader** is mandatory - visible preview text in Gmail/Apple Mail
  next to the subject.
- **Light mode only** for now - `meta color-scheme: light only`. No dark
  mode overrides until we have time to test.

## Transactional vs lifecycle

- **Transactional** - password reset, OTP, ticket reply, security alert,
  inactivity-anonymization warning, verification complete. Always sent.
  No unsubscribe link.
- **Lifecycle / marketing** - welcome, verification reminder, onboarding
  nudge, first match alert, digests (matches / messages / platform updates).
  Always include `includeUnsubscribe: true` and respect
  `profiles.notification_preferences` (use `canSendLifecycleEmail(userId)`
  for nudges; digests already gate on per-channel keys).

## Preferences model

`profiles.notification_preferences` JSONB:

```jsonc
{
  "emailMatches": true,    // matches digest, first-match alert
  "emailMessages": true,   // messages digest
  "emailUpdates": true,    // platform updates + all lifecycle/marketing nudges
  "pushMatches": true,
  "pushMessages": true
}
```

The `/unsubscribe` page edits all five keys via a signed HMAC token; the
in-app settings page edits the same keys for signed-in users.

## Sender identity

| Header | Value |
|--------|-------|
| From | `Domu Match <info@domumatch.com>` (set via `SMTP_FROM_EMAIL` env) |
| Reply-To | not set - replies bounce / are unmonitored |
| Footer disclosure | "Sent from info@domumatch.com, an unmonitored address - please don’t reply. For help, email domumatch@gmail.com." |

If you ever need a monitored reply, set the per-message `replyTo` argument
on `sendEmail()`.

## Required env vars

| Var | Purpose | Notes |
|-----|---------|-------|
| `MAILJET_API_KEY` / `MAILJET_SECRET_KEY` | Mailjet send API | Required to actually send |
| `SMTP_FROM_EMAIL` | From: address | Defaults to `domumatch@gmail.com`; prod should be `info@domumatch.com` |
| `SMTP_FROM_NAME` | Friendly From name | Defaults to `Domu Match` |
| `EMAIL_UNSUBSCRIBE_SECRET` | HMAC secret for unsubscribe tokens | Falls back to `CRON_SECRET` or service role key if unset, but should be explicit in prod |
| `NEXT_PUBLIC_APP_URL` | Used for building URLs in emails | e.g. `https://domumatch.com` |

## Internal-only emails (alerts, contact form, careers, demo requests)

`lib/monitoring/alerts.ts`, `lib/monitoring/health-alerts.ts`,
`app/api/contact/route.ts`, `app/api/careers/apply/route.ts`,
`app/api/universities/request-demo/route.ts` send to support / admin
addresses, not end users. They intentionally keep plain HTML - branding
them is optional and not part of v1.
