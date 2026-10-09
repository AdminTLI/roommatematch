# Core Web Vitals checklist

Internal targets (field / CrUX style, p75):

| Metric | Good |
|--------|------|
| LCP | &lt; 2.5s |
| INP | &lt; 200ms |
| CLS | &lt; 0.1 |

Measure on **mobile and desktop** after deploy. Prefer Chrome DevTools Performance + Lighthouse, plus Vercel Speed Insights for consented visitors.

## Routes to spot-check

1. `/` (homepage) — first paint text, no cookie reload on Accept/Reject
2. A blog article — hero image sizes/priority
3. `/housing` — card images, filters
4. `/dashboard` — deferred chat/bug widgets
5. `/matches` — tab switches stay responsive
6. `/verify` — Persona still loads; script not on other routes

## Consent path

- Accept / Reject / Save preferences must **not** full-reload the page
- Analytics + Speed Insights mount only after analytics consent
- Sentry starts/stops with error_tracking consent via `consent-changed`

## Follow-up (not required to ship)

- Lighthouse CI budgets in GitHub Actions
- CrUX / Search Console once traffic is sufficient
