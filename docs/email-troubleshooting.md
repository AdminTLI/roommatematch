# Email Troubleshooting: OTP, Password Reset & App Emails

This project has **two separate email systems**. If OTP codes, password reset, or other emails are not arriving, use this guide to find and fix the right one.

---

## 1. Auth emails (OTP, password reset, signup verification)

**Who sends them:** **Supabase**  -  not your app. Your code only calls `signInWithOtp`, `resetPasswordForEmail`, or `resend({ type: 'signup' })`. Supabase’s backend is responsible for sending the actual email.

**If these never arrive, the cause is almost always Supabase configuration**, not application code.

### Fix checklist (Supabase Dashboard)

Do these in order:

#### A. Enable custom SMTP (required for reliable delivery)

Supabase’s built-in mailer is rate-limited and unreliable. You must configure your own SMTP.

1. **Supabase Dashboard** → your project → **Project Settings** (gear) → **Auth**.
2. Scroll to **SMTP Settings**.
3. Turn **Enable Custom SMTP** **ON**.
4. Fill in your provider. **Mailjet** (recommended for this project):
   - **Host:** `in-v3.mailjet.com`
   - **Port:** `587` (recommended; supports STARTTLS)
   - **Username:** Your **Mailjet API Key** (from Mailjet → Account settings → SMTP and SEND API settings)
   - **Password:** Your **Mailjet Secret Key** (same page; shown only once at creation - regenerate if lost)
   - **Sender email:** Must be a validated sender in Mailjet (e.g. `contact@your-domain.example`). In Mailjet: **Sender addresses & domains** → add/verify your sender and ensure the From address is allowed.
   - **Sender name:** e.g. `Domu Match`

Without this, auth emails may not send or may be delayed/blocked. [Mailjet SMTP reference](https://documentation.mailjet.com/hc/en-us/articles/360043229473-How-can-I-configure-my-SMTP-parameters).

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

**Who sends them:** Your app, via `lib/email/workflows.ts`, using **Mailjet's Send API v3.1**.

**Required:** Set **Mailjet API Key** and **Secret Key** in env.

### Env vars (app emails)

In `.env` (or Vercel/hosting env):

- **Mailjet** (get from Mailjet → Account settings → SMTP and SEND API settings):
  - `MAILJET_API_KEY=your_api_key`
  - `MAILJET_SECRET_KEY=your_secret_key`
  - Optional: `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME` (or `MAILJET_FROM_EMAIL`, `MAILJET_FROM_NAME`). Defaults: `noreply@domumatch.nl`, `Domu Match`.

If either key is missing, `getEmailConfig()` returns `null` and app-level emails will be skipped (with a log).

---

## 3. Quick diagnosis

| Symptom | Likely cause | Where to fix |
|--------|---------------|--------------|
| OTP / verification code never arrives | Supabase not sending | Supabase Dashboard: SMTP + templates + redirect URLs |
| Password reset email never arrives | Same as above | Same |
| “Success” but no email (auth) | Supabase accepted request but didn’t deliver | Enable custom SMTP; check spam; check Auth logs |
| Support/ticket emails not sent | App email config missing/invalid | Set `MAILJET_API_KEY` and `MAILJET_SECRET_KEY`; check server logs |

---

## 4. Supabase Auth logs

To confirm whether Supabase is trying to send and if it errors:

1. **Supabase Dashboard** → **Logs** → **Auth Logs**.
2. Trigger OTP or password reset and look for corresponding entries and any error messages.

---

## 5. OTP still not working after SMTP is set (e.g. Mailjet)

If you have already enabled custom SMTP in Supabase and OTP/signup confirmation still fails with "Error sending confirmation email", work through this list.

### 5.1 Get the real error (do this first)

1. **Supabase Dashboard** → **Logs** → **Auth Logs** (or **Log Explorer** → filter by `auth`).
2. Trigger a signup from your app, then find the log entry for that signup.
3. Open the entry and read the error message. Common values:
   - **535** = SMTP authentication failed (wrong API Key / Secret Key, or wrong Username/Password field in Supabase).
   - **Connection refused / timeout** = wrong Host or Port (for Mailjet use `in-v3.mailjet.com` and `587`).
   - **Sender not allowed / 550** = the "Sender email" in Supabase is not a validated sender in Mailjet.

The exact text in the log will tell you whether the problem is Supabase→Mailjet connection or Mailjet rejecting the message.

### 5.2 Supabase SMTP fields (Mailjet)

- **Host:** `in-v3.mailjet.com` (no typo; not `in.mailjet.com` or `api.mailjet.com`).
- **Port:** `587`.
- **Username:** Your **Mailjet API Key** only (the long string from Account settings → SMTP and SEND API). Not your Mailjet account email.
- **Password:** Your **Mailjet Secret Key** only (the other string on the same page). Not the API key again.
- **Sender email:** Must be **exactly** one of the sender addresses you added and validated in Mailjet (Sender addresses & domains). Domain DNS (e.g. Namecheap) verifies the domain; you still need the specific From address (e.g. `noreply@yourdomain.com`) added and validated as a sender in Mailjet.
- **Sender name:** Any label (e.g. `Domu Match`).

### 5.3 Mailjet side

- **Sender addresses & domains:** Add the same address you use as "Sender email" in Supabase. Complete domain verification (SPF/DKIM) for that domain. Ensure the sender shows as validated/active.
- **Activity / Statistics:** In Mailjet, check whether Supabase’s sends appear (accepted, delivered, bounced, blocked). If nothing appears, Supabase is likely not reaching Mailjet (check Host/Port/Username/Password again).

### 5.4 Other causes

- **Database triggers on `auth.users`:** If you have triggers on `auth.users` (e.g. on INSERT or UPDATE) that call a function, a failure in that function can sometimes surface as a 500 from Auth. Temporarily disable the trigger or fix the function and test again.
- **Rate limits:** Supabase **Project Settings** → **Auth** → **Rate Limits** (e.g. increase "Emails sent per hour" if you hit the limit). Mailjet has its own sending limits; check your plan and activity.

### 5.5 Test from Supabase

- **Authentication** → **Users** → pick a user → ⋮ → **Send password reset email**. If this also fails, the same SMTP/sender issue applies; use Auth logs and Mailjet activity to narrow it down.

---

## 6. Summary

- **OTP and password reset:** Configure **Supabase** (SMTP, redirect URLs, email templates). No amount of app code changes will send these if Supabase isn’t configured.
- **App emails:** Configure **env** (`MAILJET_API_KEY`, `MAILJET_SECRET_KEY`, and optional from-address) and ensure your Mailjet sender is validated.
- **Still failing:** Use **Supabase Auth logs** to get the real error (e.g. 535, sender not allowed), then check Section 5 above.

For more detail on password reset only, see `docs/password-reset-troubleshooting.md` and `docs/password-reset-setup.md`.
