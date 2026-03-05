# Email Troubleshooting: OTP, Password Reset & App Emails

This project has **two separate email systems**. If OTP codes, password reset, or other emails are not arriving, use this guide to find and fix the right one.

---

## 1. Auth emails (OTP, password reset, signup verification)

**Who sends them:** **Supabase** — not your app. Your code only calls `signInWithOtp`, `resetPasswordForEmail`, or `resend({ type: 'signup' })`. Supabase’s backend is responsible for sending the actual email.

**If these never arrive, the cause is almost always Supabase configuration**, not application code.

### Fix checklist (Supabase Dashboard)

Do these in order:

#### A. Enable custom SMTP (required for reliable delivery)

Supabase’s built-in mailer is rate-limited and unreliable. You must configure your own SMTP.

1. **Supabase Dashboard** → your project → **Project Settings** (gear) → **Auth**.
2. Scroll to **SMTP Settings**.
3. Turn **Enable Custom SMTP** **ON**.
4. Fill in your provider (e.g. SendGrid):
   - **Host:** `smtp.sendgrid.net`
   - **Port:** `587`
   - **Username:** `apikey`
   - **Password:** Your SendGrid API key (or app password for other providers)
   - **Sender email:** e.g. `noreply@yourdomain.com` (must be allowed by your provider)
   - **Sender name:** e.g. `Domu Match`

Without this, auth emails may not send or may be delayed/blocked.

#### B. Whitelist redirect URLs

If redirect URLs are not allowed, Supabase can refuse or “succeed” without sending.

1. **Authentication** → **URL Configuration**.
2. **Site URL:** set to your app origin (e.g. `https://your-domain.com` or `http://localhost:3000`).
3. **Redirect URLs:** add every URL your app uses for auth callbacks, one per line, e.g.:
   - `http://localhost:3000/auth/callback`
   - `http://127.0.0.1:3000/auth/callback`
   - `https://your-domain.com/auth/callback`
   - `https://your-domain.com/auth/reset-password/confirm`

#### C. Email templates (OTP and reset link)

1. **Authentication** → **Email Templates**.
2. **Confirm signup** (used for OTP):
   - Must include the 6-digit code: use `{{ .Token }}` in the body.
   - Subject and body can be customized; keep `{{ .Token }}` and `{{ .Email }}` where needed.
3. **Reset Password**:
   - Must include the link: use `{{ .ConfirmationURL }}`.
   - Ensure subject and copy are clear so it’s less likely to be marked as spam.

#### D. Rate limits

1. **Project Settings** → **Auth** → **Rate Limits**.
2. Default is often 2 emails per hour per address; adjust if you need more for testing.

#### E. Verify in Dashboard

- **Authentication** → **Users** → pick a user → ⋮ → **Send password reset email**.  
  If this doesn’t deliver either, the problem is SMTP/templates/redirects, not your app code.

---

## 2. App-level emails (e.g. support tickets)

**Who sends them:** Your app, via `lib/email/workflows.ts`, using **SendGrid’s HTTP API** (or SMTP if you configure it).

**Required:** Either set **SendGrid API key** in env, or full SMTP env vars. See below.

### Env vars (app emails)

In `.env` (or Vercel/hosting env):

- **Option A – SendGrid API (recommended)**  
  - `SENDGRID_API_KEY=SG.xxx`  
  - Optional: `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME` (defaults used if unset).

- **Option B – SMTP-style (used for SendGrid API in current code)**  
  - `SMTP_PASS` = SendGrid API key (used as Bearer token).  
  - `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME` optional.  
  - Other SMTP_* vars can be set for compatibility but are not used for SendGrid API.

If none of these are set, `getEmailConfig()` returns `null` and app-level emails are skipped (with a log).

---

## 3. Quick diagnosis

| Symptom | Likely cause | Where to fix |
|--------|---------------|--------------|
| OTP / verification code never arrives | Supabase not sending | Supabase Dashboard: SMTP + templates + redirect URLs |
| Password reset email never arrives | Same as above | Same |
| “Success” but no email (auth) | Supabase accepted request but didn’t deliver | Enable custom SMTP; check spam; check Auth logs |
| Support/ticket emails not sent | App email config missing/invalid | Set `SENDGRID_API_KEY` or `SMTP_PASS`; check server logs |

---

## 4. Supabase Auth logs

To confirm whether Supabase is trying to send and if it errors:

1. **Supabase Dashboard** → **Logs** → **Auth Logs**.
2. Trigger OTP or password reset and look for corresponding entries and any error messages.

---

## 5. Summary

- **OTP and password reset:** Configure **Supabase** (SMTP, redirect URLs, email templates). No amount of app code changes will send these if Supabase isn’t configured.
- **App emails:** Configure **env** (`SENDGRID_API_KEY` or `SMTP_PASS` and optional from-address) and ensure your SendGrid (or SMTP) account can send from the sender address.

For more detail on password reset only, see `docs/password-reset-troubleshooting.md` and `docs/password-reset-setup.md`.
