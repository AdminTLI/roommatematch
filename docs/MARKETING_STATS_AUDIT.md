# Marketing stats audit

The **Live platform stats** section on the marketing/landing page shows real-time numbers from `/api/marketing/stats`. This doc explains what each stat means, where the data comes from, and caveats so you can confirm they still match the current platform.

## Data source overview

- **Users:** `users` table (`is_active = true`), `created_at` from this table for “first match” timing.
- **Matches:** `match_suggestions` (pair, status in `pending` / `accepted` / `confirmed`) and `match_records` (pair, `locked = true`). Pairs are **deduped** so the same pair from both sources is counted once.
- **Chats:** 1:1 chats from `chats` + `chat_members`; no use of `chats.match_id` (column dropped). Pair identity is inferred from `chat_members` (two users per chat).
- **Scores:** `fit_score` is stored as `DECIMAL(4,3)` in range 0.000–1.000; API converts to 0–100 for display. Values > 1 are treated as 0–100 scale and normalized so both scales work.
- **Verified:** `profiles.verification_status = 'verified'` **or** Supabase Auth `email_confirmed_at`. So “verified” = email verified **or** ID (Persona) verified.
- **Universities/programmes:** `user_academic` (distinct `university_id` and `program_id`).

Time window for most metrics: **last 12 months** (from suggestion/record `created_at` and `expires_at`). Verified % and universities/programmes use **all-time** active users / academic data.

---

## Stat-by-stat

### 1. Get a match in &lt;24 hours (and X% within 48 hours)

- **Meaning:** Of users who got their **first** match in the last 12 months, what % got that first match within 24h (and 48h) of **account creation** (`users.created_at`).
- **Logic:** First match per user is derived from **all** pair suggestions (pending/accepted/confirmed) with `expires_at >= oneYearAgo`; then restricted to users whose first match **date** falls in the last 12 months. Delays are computed from `users.created_at` to that first match date.
- **Caveats:** “First match” only considers suggestions that are still non-expired at the cutoff (`expires_at >= oneYearAgo`). Very old, long-expired suggestions are excluded, so “first match” is effectively “first non-expired match in the considered window.”

### 2. Average compatibility of confirmed roommates (vs X% across all matches)

- **Meaning:** Average compatibility **score** (0–100) for **confirmed** pairs vs average for **all** pair suggestions in the last 12 months.
- **Confirmed:** Union of `match_suggestions` (status = `confirmed`) and `match_records` (kind = pair, locked = true), **deduped by user pair** (one score per pair).
- **All matches:** All pair suggestions in the last 12 months (pending/accepted/confirmed, non-expired).
- **Caveats:** `fit_score` comes from the DB as 0–1 (or, if ever stored as 0–100, is normalized). Both “85%” and “81%” use the same `avg()` so they are comparable. If the same pair exists in both `match_suggestions` and `match_records`, it is counted once (suggestion preferred for score when both exist). Confirmed can be higher than “all” because people tend to confirm higher-scoring matches.

### 3. Matches that turn into a chat (within the first 24 hours)

- **Meaning:** Of **confirmed** pairs (deduped), what % have a 1:1 chat where the **first message** was sent within 24 hours of the **match date** (suggestion or locked record `created_at`).
- **Logic:** Confirmed pairs from both `match_suggestions` and `match_records`, deduped by pair. Chats are identified by user pair from `chat_members` (no `chats.match_id`). For each such chat, the first message time is taken from `messages`; match date is the `created_at` of the suggestion or record we kept for that pair.
- **Caveats:** Chats are created on demand (e.g. when a user opens the conversation), so “match date” is the suggestion/record creation, not the chat creation. The 24h window is “first message within 24h of that match date,” which is the intended behaviour.

### 4. Verified students (email or ID verified community)

- **Meaning:** % of **active** users who are “verified”: either `profiles.verification_status = 'verified'` (ID/Persona) or Supabase Auth `email_confirmed_at` set.
- **Caveats:** So “100%” can mean everyone has at least email verification (e.g. if signup requires verified email). The UI copy (“email or ID verified”) matches this definition.

### 5. Universities represented (X+ study programmes on Domu Match)

- **Meaning:** Distinct count of **universities** (`user_academic.university_id`) and distinct count of **programmes** (`user_academic.program_id`), from users who have `user_academic` with a non-null `university_id`.
- **Caveats:** Counts are all-time, not limited to the last 12 months. “X+ study programmes” uses the programme count; the big number shown is the universities count (see `live-stats.tsx`).

---

## Implementation notes (after audit)

- **Deduplication:** Confirmed pairs from both `match_suggestions` and `match_records` are deduped by user pair for (1) average confirmed score and (2) “matches that turn into a chat.” This avoids double-counting when the same pair exists in both tables.
- **Chat pairing:** The API does not use `chats.match_id` (column removed); it infers 1:1 chats and pairs from `chat_members` only.
- **First message:** First message per chat is computed from `messages` ordered by `created_at`; the first occurrence per `chat_id` is used. No DB-side `DISTINCT ON`; for very large message sets, consider optimizing later.

**Verifying the compatibility stats (85% vs 81%):** Both numbers use the same average over `fit_score`: “85%” = average score of **confirmed** pairs (deduped); “81%” = average score of **all** pair suggestions in the last 12 months. In the DB, `match_suggestions.fit_score` is 0–1 (e.g. 0.85); the app shows `fit_index` 0–100 (e.g. 85) on cards. So the marketing stat should align with what users see. To spot-check: run `SELECT status, AVG(fit_score)::numeric(5,2) FROM match_suggestions WHERE kind = 'pair' AND created_at >= NOW() - INTERVAL '1 year' GROUP BY status` and compare confirmed vs others; or use Admin → Matches and compare average scores for confirmed vs all.

If you change how matches, chats, or verification work, revisit this doc and the logic in `app/api/marketing/stats/route.ts` and `app/(marketing)/components/live-stats.tsx`.
