-- Performance Advisor INFO: unindexed_foreign_keys (lint 0001)
-- Add covering indexes for FKs that lacked a leading-column index.

CREATE INDEX IF NOT EXISTS idx_admin_role_assignments_assigned_by
  ON public.admin_role_assignments (assigned_by);

CREATE INDEX IF NOT EXISTS idx_admin_role_assignments_institution_id
  ON public.admin_role_assignments (institution_id);

CREATE INDEX IF NOT EXISTS idx_bug_reports_admin_id
  ON public.bug_reports (admin_id);

CREATE INDEX IF NOT EXISTS idx_lab_co_creator_badges_wish_id
  ON public.lab_co_creator_badges (wish_id);

CREATE INDEX IF NOT EXISTS idx_lab_wish_reports_reporter_id
  ON public.lab_wish_reports (reporter_id);

CREATE INDEX IF NOT EXISTS idx_profile_access_control_requesting_user_id
  ON public.profile_access_control (requesting_user_id);

CREATE INDEX IF NOT EXISTS idx_profile_access_control_target_user_id
  ON public.profile_access_control (target_user_id);

CREATE INDEX IF NOT EXISTS idx_university_email_claims_released_by
  ON public.university_email_claims (released_by);

CREATE INDEX IF NOT EXISTS idx_university_email_reuse_flags_reviewed_by
  ON public.university_email_reuse_flags (reviewed_by);
