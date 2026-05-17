-- Performance Advisor: unindexed_foreign_keys (lint 0001)
-- Covering index for platform_settings.updated_by -> auth.users(id)

CREATE INDEX IF NOT EXISTS idx_platform_settings_updated_by_fkey
  ON public.platform_settings (updated_by);
