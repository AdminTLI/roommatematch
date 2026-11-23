-- Fix: host_profiles PII leak via overpermissive RLS policy
-- [CRITICAL BUG - PII/GDPR LEAK]
--
-- The original migration (20261103173000_landlord_marketplace_mvp.sql) created:
--   CREATE POLICY "Public can read host display fields" ON public.host_profiles
--     FOR SELECT TO authenticated USING (true);
--
-- PostgreSQL RLS combines multiple permissive policies with OR, so USING(true) on any
-- SELECT policy allows every authenticated user to read ALL rows and ALL columns,
-- including PII fields: phone, agency_license, and internal identity-review fields
-- (identity_review_message, identity_review_notes, identity_review_matched_org, etc.).
--
-- Fix: Drop the permissive policy. The listing detail page (app/housing/[id]/page.tsx)
-- is updated to use createAdminClient() for the host_profiles join, so no user-facing
-- page relies on this open RLS policy. Hosts still read their own full row via the
-- existing "Hosts can read own profile" policy.

DROP POLICY IF EXISTS "Public can read host display fields" ON public.host_profiles;
