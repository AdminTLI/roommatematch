# Support playbook: GDPR Article 22 (automated matching)

## When a request arrives

- Type: `automated_decision_review` in Admin → DSAR.
- SLA: 30 days from `requested_at` (same as other DSAR types).

## What to send the user

1. Confirm the match is a **suggestion only**; the user chose whether to connect.
2. Share the **score breakdown** visible in the app (harmony, context, dimension scores).
3. If they disputed a specific pair, re-run or inspect `compute_compatibility_score` / match suggestion row.
4. State whether any **manual adjustment** is appropriate (e.g. refresh suggestions, block pair).

## Admin notes template

```
Factors used: harmony_score, context_score, [dimension_scores from metadata].
Human conclusion: [accepted / explained / no change].
User informed via: [email / in-app].
```

## Escalation

- Repeated fairness concerns → product + legal review of weighting.
- Do not share another user’s questionnaire answers without legal approval.

## In-app entry points

- Settings → Privacy → “Request human review of a match”
- Chat compatibility → “Question this score?”
