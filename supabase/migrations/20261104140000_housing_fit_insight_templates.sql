-- Curated applicant × listing fit reasoning templates + per-application insights.

CREATE TABLE IF NOT EXISTS public.housing_fit_insight_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dimension text NOT NULL CHECK (dimension IN ('lifestyle', 'budget', 'timeline', 'lifestyle_topic')),
  topic text NOT NULL,
  polarity text NOT NULL CHECK (polarity IN ('strength', 'watch', 'neutral')),
  body text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS housing_fit_insight_templates_dim_topic_idx
  ON public.housing_fit_insight_templates (dimension, topic)
  WHERE active;

ALTER TABLE public.housing_fit_insight_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS housing_fit_insight_templates_read ON public.housing_fit_insight_templates;
CREATE POLICY housing_fit_insight_templates_read
  ON public.housing_fit_insight_templates
  FOR SELECT
  TO authenticated
  USING (active = true);

ALTER TABLE public.housing_applications
  ADD COLUMN IF NOT EXISTS score_insights jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON TABLE public.housing_fit_insight_templates IS
  'Reusable copy bank for explaining lifestyle/budget/timeline fit between applicants and listings.';

COMMENT ON COLUMN public.housing_applications.score_insights IS
  'Per-dimension insight strings generated at apply time from housing_fit_insight_templates / scoring.';

INSERT INTO public.housing_fit_insight_templates (dimension, topic, polarity, body) VALUES
  ('lifestyle', 'lifestyle_overall', 'strength', 'Overall lifestyle signals line up well with this host''s preferences for the apartment.'),
  ('lifestyle', 'lifestyle_overall', 'strength', 'Day-to-day living style looks like a strong fit for how this home is meant to run.'),
  ('lifestyle', 'lifestyle_overall', 'neutral', 'Lifestyle fit is mixed: some habits match the host, others may need a short conversation.'),
  ('lifestyle', 'lifestyle_overall', 'neutral', 'You share some living preferences with this host, with a few soft gaps worth clarifying.'),
  ('lifestyle', 'lifestyle_overall', 'watch', 'Lifestyle preferences diverge from this host in a few key areas. Read the house rules carefully.'),
  ('lifestyle', 'lifestyle_overall', 'watch', 'Several living-style signals differ from what this listing asks for. Align expectations before applying.'),
  ('lifestyle_topic', 'cleanliness', 'strength', 'You and this host expect a similar level of day-to-day tidiness, so shared spaces should feel natural.'),
  ('lifestyle_topic', 'cleanliness', 'strength', 'Cleanliness standards line up closely with what the host wants for this home.'),
  ('lifestyle_topic', 'cleanliness', 'watch', 'Cleanliness expectations differ a bit from the host. Agree early on shared-area standards.'),
  ('lifestyle_topic', 'cleanliness', 'watch', 'You may not match the host''s tidy-home bar exactly. A simple cleaning rota usually closes the gap.'),
  ('lifestyle_topic', 'quiet_hours', 'strength', 'Quiet-hours importance matches the host, which helps evenings and study time feel calm.'),
  ('lifestyle_topic', 'quiet_hours', 'strength', 'You both treat noise the same way at home, a strong lifestyle fit signal for this listing.'),
  ('lifestyle_topic', 'quiet_hours', 'watch', 'Quiet-hours priorities differ from the host. Clarify evening noise and guest expectations before applying.'),
  ('lifestyle_topic', 'quiet_hours', 'watch', 'Noise tolerance may not match this home. Confirm quiet windows so nobody is surprised.'),
  ('lifestyle_topic', 'guests', 'strength', 'Guest frequency looks compatible with how this household likes to run.'),
  ('lifestyle_topic', 'guests', 'strength', 'Your guest habits sit close to the host''s preference for this apartment.'),
  ('lifestyle_topic', 'guests', 'watch', 'Guest habits differ from the host''s preference. Check overnight and weekday guest rules early.'),
  ('lifestyle_topic', 'guests', 'watch', 'Hosting friends may land differently here. Align on guest frequency before you apply.'),
  ('lifestyle_topic', 'parties', 'strength', 'Social hosting energy matches what this listing is set up for.'),
  ('lifestyle_topic', 'parties', 'strength', 'Party and gathering preferences line up with the host''s house rules vibe.'),
  ('lifestyle_topic', 'parties', 'watch', 'Gathering preferences differ from the host. Confirm what social nights look like in this home.'),
  ('lifestyle_topic', 'parties', 'watch', 'This listing may want a quieter social rhythm than you. Worth clarifying before you apply.'),
  ('lifestyle_topic', 'social', 'strength', 'Your social energy at home matches the host''s preference for this place.'),
  ('lifestyle_topic', 'social', 'strength', 'Day-to-day social level looks compatible with how this household likes to live.'),
  ('lifestyle_topic', 'social', 'watch', 'Home social energy differs from the host. Talk through alone-time vs shared hangouts early.'),
  ('lifestyle_topic', 'social', 'watch', 'You may want a different social rhythm than this home expects. A quick chat usually helps.'),
  ('lifestyle_topic', 'chores', 'strength', 'Chore expectations line up with the host, which keeps shared responsibilities clearer.'),
  ('lifestyle_topic', 'chores', 'strength', 'You and the host seem aligned on how much structure chores should have.'),
  ('lifestyle_topic', 'chores', 'watch', 'Chore expectations differ from the host. Agree on a light rota for kitchen and bathroom.'),
  ('lifestyle_topic', 'chores', 'watch', 'Household-task style may not match perfectly. Write down who owns which basics.'),
  ('lifestyle_topic', 'schedule', 'strength', 'Your daily schedule rhythm matches what the host prefers for this home.'),
  ('lifestyle_topic', 'schedule', 'strength', 'Morning/evening energy looks compatible with this listing''s preferred schedule.'),
  ('lifestyle_topic', 'schedule', 'watch', 'Schedule rhythm differs from the host. Soft closes and quiet mornings/evenings help a lot.'),
  ('lifestyle_topic', 'schedule', 'watch', 'Early-bird vs night-owl mismatch is possible here. Agree on quiet windows up front.'),
  ('budget', 'budget_comfortable', 'strength', 'Rent sits comfortably inside your budget, with headroom for utilities and daily costs.'),
  ('budget', 'budget_comfortable', 'strength', 'This listing leaves breathing room against your max rent, a strong budget fit.'),
  ('budget', 'budget_within', 'strength', 'Monthly rent fits within your stated budget range for this search.'),
  ('budget', 'budget_within', 'strength', 'Cost-wise this apartment aligns with what you said you can spend.'),
  ('budget', 'budget_tight', 'watch', 'Rent is close to your ceiling. Factor utilities and deposit before you apply.'),
  ('budget', 'budget_tight', 'watch', 'Budget fit is tight for this listing. Double-check total monthly cost including utilities.'),
  ('budget', 'budget_over', 'watch', 'Rent is above your current max. You may need to stretch budget or keep looking.'),
  ('budget', 'budget_over', 'watch', 'This listing sits over your stated rent limit, which weakens budget compatibility.'),
  ('budget', 'budget_unknown', 'neutral', 'Budget signals are limited, so this score uses a neutral estimate. Update your max rent for a sharper fit.'),
  ('budget', 'budget_unknown', 'neutral', 'Add a clear monthly budget in your profile to get a more precise cost match here.'),
  ('timeline', 'timeline_flexible', 'strength', 'Your move-in flexibility looks strong for this listing''s availability window.'),
  ('timeline', 'timeline_flexible', 'strength', 'Timing is a strength here: you can adapt enough to match when this home frees up.'),
  ('timeline', 'timeline_ok', 'neutral', 'Move-in timing is workable if dates stay close to what the host posted.'),
  ('timeline', 'timeline_ok', 'neutral', 'Timeline fit is moderate. Confirm the exact move-in date before you apply.'),
  ('timeline', 'timeline_tight', 'watch', 'Your move-in window looks tight for this listing. Confirm dates with the host early.'),
  ('timeline', 'timeline_tight', 'watch', 'Timing may be the weaker fit. Check availability and lease start before applying.'),
  ('timeline', 'timeline_stay', 'neutral', 'Stay-length expectations should still be checked against the host''s minimum lease.'),
  ('timeline', 'timeline_stay', 'neutral', 'Confirm min stay and your planned duration so timeline surprises do not show up later.');
