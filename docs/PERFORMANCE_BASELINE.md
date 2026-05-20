# Performance baseline (Realtime + compatibility)

Capture before/after deploying performance remediation.

## Supabase Dashboard (Query Performance)

| Query pattern | Baseline note |
|---------------|---------------|
| `realtime.list_changes` | % of total DB time, calls, mean_time |
| `compute_compatibility_score` (PostgREST) | calls, mean_time |
| `/api/match/suggestions/my` traffic | correlate with compatibility RPC spikes |

## App (admin)

`GET /api/admin/system-health` returns:

- `performance.realtime` — active shared channel count from `channelManager`
- `performance.scoreReadMode` — `stored_snapshot` (default) or `live_sync` if `MATCH_SCORES_LIVE_SYNC=1`

## Env flags

| Variable | Default | Effect |
|----------|---------|--------|
| `MATCH_SCORES_LIVE_SYNC` | off | When `1`, suggestions list re-syncs scores on every GET |
| `PERF_BASELINE_LOG` | off | When `1`, logs baseline snapshot to server console |

## Rollout checks

1. Dashboard and matches load without N× `compute_compatibility_score` on list fetch.
2. Chat still receives new messages in open conversation.
3. Notification bell + popup still fire for new notifications.
4. Maintenance cron reports `fit_index_fit_score_mismatch` / `missing_or_zero_fit_score` if any.
