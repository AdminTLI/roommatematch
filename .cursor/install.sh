#!/usr/bin/env bash
#
# Cloud Agent environment bootstrap for Domu Match (roommatematch).
#
# Idempotent: safe to run repeatedly. Installs Node dependencies and prepares a
# working .env.local so `next dev` / `next build` boot without real third-party
# credentials. Real credentials (e.g. a live Supabase project) can be supplied
# later via environment secrets, which take precedence over the demo defaults
# written here.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> Installing npm dependencies"
npm install --no-audit --no-fund

ENV_FILE="$REPO_ROOT/.env.local"

# Seed .env.local from the tracked example on first run.
if [[ ! -f "$ENV_FILE" ]]; then
  echo "==> Creating .env.local from env.example"
  cp "$REPO_ROOT/env.example" "$ENV_FILE"
fi

# Replace a placeholder value only when the key still holds its placeholder, so
# real secrets injected by the user are never overwritten.
set_if_placeholder() {
  local key="$1" value="$2"
  local current
  current="$(grep -E "^${key}=" "$ENV_FILE" | head -n1 | cut -d= -f2- || true)"
  if [[ -z "$current" || "$current" == your_* || "$current" == *your-project* || "$current" == *localhost:5432* ]]; then
    if grep -qE "^${key}=" "$ENV_FILE"; then
      # Escape ampersands/backslashes/pipes for sed replacement.
      local escaped
      escaped="$(printf '%s' "$value" | sed -e 's/[\\&|]/\\&/g')"
      sed -i "s|^${key}=.*|${key}=${escaped}|" "$ENV_FILE"
    else
      printf '%s=%s\n' "$key" "$value" >> "$ENV_FILE"
    fi
    echo "==> Set ${key} to a generated/demo value"
  fi
}

rand_hex() { openssl rand -hex 32; }

# Demo Supabase HTTP endpoint: non-placeholder so client construction succeeds
# and the marketing UI renders. Database-backed features require a real project.
set_if_placeholder NEXT_PUBLIC_SUPABASE_URL "https://demo.supabase.co"
set_if_placeholder NEXT_PUBLIC_SUPABASE_ANON_KEY "demo-anon-key"
set_if_placeholder SUPABASE_SERVICE_ROLE_KEY "demo-service-role-key"

# Secrets that must be real random strings for middleware / admin / cron auth.
set_if_placeholder CSRF_SECRET "$(rand_hex)"
set_if_placeholder ADMIN_SEED_TOKEN "$(rand_hex)"
set_if_placeholder ADMIN_SHARED_SECRET "$(rand_hex)"
set_if_placeholder CRON_SECRET "$(rand_hex)"
set_if_placeholder NEXTAUTH_SECRET "$(rand_hex)"

echo "==> Environment bootstrap complete"
