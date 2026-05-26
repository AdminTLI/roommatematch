# Institution admin invite emails

## Branded invite links

Invite emails should use your **Domu Match URL**, not the raw Supabase project URL.

In **Supabase Dashboard → Authentication → Email Templates → Invite user**, set the button link to:

```html
<a href="{{ .SiteURL }}/auth/accept-invitation?token_hash={{ .TokenHash }}&type=invite">Accept invitation</a>
```

The repo copy lives in `lib/email/templates/supabase/invite-user.html` — paste that HTML into the dashboard after each template change.

## Supabase URL configuration

1. **Site URL** (Authentication → URL Configuration): use your canonical production origin, e.g. `https://www.domumatch.com` (match `NEXT_PUBLIC_APP_URL` on Vercel).

2. **Redirect URLs** — add every variant you use:

```
https://www.domumatch.com/auth/callback
https://www.domumatch.com/auth/accept-invitation
https://www.domumatch.com/auth/callback?redirect=%2Finstitution%2Fonboarding
https://domumatch.com/auth/callback
https://domumatch.com/auth/accept-invitation
http://localhost:3000/auth/callback
http://localhost:3000/auth/accept-invitation
```

3. **Vercel** — set `NEXT_PUBLIC_APP_URL=https://www.domumatch.com` (same host as Site URL).

## How the flow works

1. Super Admin sends invite → API calls `inviteUserByEmail` with `redirectTo` = `/auth/callback?redirect=/institution/onboarding` (PKCE fallback).
2. Email button → `/auth/accept-invitation?token_hash=…&type=invite` (branded, no `supabase.co` in the visible link).
3. That page calls `verifyOtp`, sets the session cookie, redirects to `/institution/onboarding`.

## “Link expired” (`otp_expired`)

Invitation tokens are **single-use** and time-limited. Common causes:

- Clicking an old email after a **resend** (use only the latest email).
- Clicking the same link twice.
- Site URL / redirect URL mismatch (fixed by aligning settings above).

Resend from **Admin → Users → Role Management → Resend invite**, then use the **new** email only.

## Optional: custom auth domain

For links like `https://auth.domumatch.com/...` instead of `*.supabase.co`, enable **Custom Auth Domain** in Supabase (Pro). The in-app `/auth/accept-invitation` flow still works without it.
