# Studiekeuzedatabase attribution for public content

Use this when citing SKDB data in blog posts, social copy, or marketing pages.

## Required citation (English)

> Source: Studiekeuzedatabase (LCSK), release {skdbRelease}, peildatum {peildatum}.

Replace placeholders with values from `data/blog/skdb-facts-latest.json`.

## Required citation (Dutch)

> Bron: Studiekeuzedatabase (LCSK), release {skdbRelease}, peildatum {peildatum}.

## Rules

1. Use only numbers present in `data/blog/skdb-facts-latest.json` or verified web sources. Do not invent statistics.
2. Do not republish raw SKDB tables or full database dumps.
3. Aggregates (counts, percentages by sector/cluster) are acceptable for editorial use.
4. Confirm your SKDB licence allows public marketing use. Contact [info@lcsk.nl](mailto:info@lcsk.nl) if unsure.
5. Link to [studiekeuzedatabase.nl](https://www.studiekeuzedatabase.nl/) when appropriate.

## Refreshing facts

```bash
pnpm sync:skdb-blog-facts
```

Set optional env vars:

- `SKDB_RELEASE=26.3`
- `SKDB_PEILDATUM=2026-04-07`

After each SKDB release (see `docs/PROGRAMME_DATA.md` release calendar), re-run sync before weekly blog automation.

## Internal API

`GET /api/internal/blog-facts` (requires `CRON_SECRET` Bearer token) returns SKDB facts plus optional Domu marketing stats.
