# Service role API route audit

Routes under `app/api/**` that call `createAdminClient()` or `createServiceClient()` bypass Row Level Security. Each route must enforce access **before** using the elevated client.

## Required patterns

| Route type | Guard |
|------------|--------|
| User data | `requireAuthenticatedUser()` then pass `user.id` into queries/RPCs |
| Admin | `requireAdminUser(request)` |
| Cron | `verifyCronRequest(request)` |
| Webhooks | Signature / provider secret |
| Public aggregates | Rate limit only (e.g. marketing stats) |

Helpers: [`lib/auth/server-route-guards.ts`](../lib/auth/server-route-guards.ts)

## Re-run audit

```bash
npx tsx scripts/audit-service-role-routes.ts
```

Exit code `1` means at least one route is flagged `needs-review`.

## Peer-scoped matching

Compatibility and match routes must use [`filterCompatibilityPeerIds`](../lib/matching/compatibility-peer-access.ts) so users cannot probe arbitrary profiles.

## Do not

- Expose `SUPABASE_SERVICE_ROLE_KEY` to the browser
- Use service role without a documented guard in new routes
