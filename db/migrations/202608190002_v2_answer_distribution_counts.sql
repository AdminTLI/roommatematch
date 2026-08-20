-- GDPR-safe aggregate table for answer distribution analytics.
-- No user_id column — stores only counts per answer per question.

CREATE TABLE IF NOT EXISTS public.answer_distribution_counts (
  item_id     TEXT        NOT NULL,
  answer_key  TEXT        NOT NULL,
  count       BIGINT      NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ          DEFAULT now(),
  PRIMARY KEY (item_id, answer_key)
);

-- RLS: block all client access; only service_role / admin API may read/write
ALTER TABLE public.answer_distribution_counts ENABLE ROW LEVEL SECURITY;

-- No RLS policies granted to anon/authenticated — table is admin-only

-- ─── Trigger function ────────────────────────────────────────────────────────
-- On INSERT or UPDATE of onboarding_sections rows whose section is one of the
-- 5 v2 sections: upsert counts for each item answer.  On UPDATE we decrement
-- the old answer bucket first.

CREATE OR REPLACE FUNCTION public.sync_answer_distribution_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v2_sections TEXT[] := ARRAY[
    'logistics-context',
    'environment-rhythms',
    'cleanliness-operations',
    'communication-resolution',
    'social-spaces'
  ];
  elem       JSONB;
  item_key   TEXT;
  answer_val JSONB;
  bucket_key TEXT;
BEGIN
  -- Only process v2 sections
  IF NEW.section != ALL(v2_sections) THEN
    RETURN NEW;
  END IF;

  -- App stores answers as [{itemId, value}, ...] (array). Also tolerate legacy object shape.
  IF TG_OP = 'UPDATE' AND OLD.answers IS NOT NULL AND jsonb_typeof(OLD.answers) = 'array' THEN
    FOR elem IN SELECT * FROM jsonb_array_elements(OLD.answers)
    LOOP
      item_key := elem->>'itemId';
      answer_val := elem->'value';
      bucket_key := public.answer_distribution_bucket(item_key, answer_val);
      IF bucket_key IS NOT NULL AND item_key IS NOT NULL THEN
        UPDATE public.answer_distribution_counts
           SET count      = GREATEST(0, count - 1),
               updated_at = now()
         WHERE item_id = item_key
           AND answer_key = bucket_key;
      END IF;
    END LOOP;
  ELSIF TG_OP = 'UPDATE' AND OLD.answers IS NOT NULL AND jsonb_typeof(OLD.answers) = 'object' THEN
    FOR item_key, answer_val IN SELECT * FROM jsonb_each(OLD.answers)
    LOOP
      bucket_key := public.answer_distribution_bucket(item_key, answer_val);
      IF bucket_key IS NOT NULL THEN
        UPDATE public.answer_distribution_counts
           SET count      = GREATEST(0, count - 1),
               updated_at = now()
         WHERE item_id = item_key
           AND answer_key = bucket_key;
      END IF;
    END LOOP;
  END IF;

  IF NEW.answers IS NOT NULL AND jsonb_typeof(NEW.answers) = 'array' THEN
    FOR elem IN SELECT * FROM jsonb_array_elements(NEW.answers)
    LOOP
      item_key := elem->>'itemId';
      answer_val := elem->'value';
      bucket_key := public.answer_distribution_bucket(item_key, answer_val);
      IF bucket_key IS NOT NULL AND item_key IS NOT NULL THEN
        INSERT INTO public.answer_distribution_counts (item_id, answer_key, count, updated_at)
          VALUES (item_key, bucket_key, 1, now())
        ON CONFLICT (item_id, answer_key)
          DO UPDATE SET count      = answer_distribution_counts.count + 1,
                        updated_at = now();
      END IF;
    END LOOP;
  ELSIF NEW.answers IS NOT NULL AND jsonb_typeof(NEW.answers) = 'object' THEN
    FOR item_key, answer_val IN SELECT * FROM jsonb_each(NEW.answers)
    LOOP
      bucket_key := public.answer_distribution_bucket(item_key, answer_val);
      IF bucket_key IS NOT NULL THEN
        INSERT INTO public.answer_distribution_counts (item_id, answer_key, count, updated_at)
          VALUES (item_key, bucket_key, 1, now())
        ON CONFLICT (item_id, answer_key)
          DO UPDATE SET count      = answer_distribution_counts.count + 1,
                        updated_at = now();
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- ─── Helper: bucket an answer JSONB value into a stable string key ────────────
-- Buckets: MCQ/toggle → value as text; likert/bipolar → '1'–'5';
-- timeRange → hour slot ('HH'); number → banded (e.g. '0-500', '500-1000', …).
-- Returns NULL for unsupported kinds (skipped in trigger).

CREATE OR REPLACE FUNCTION public.answer_distribution_bucket(
  p_item_id TEXT,
  p_answer   JSONB
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  kind_val TEXT;
BEGIN
  kind_val := p_answer->>'kind';

  CASE kind_val
    WHEN 'mcq' THEN
      RETURN p_answer->>'value';
    WHEN 'toggle' THEN
      RETURN (p_answer->>'value')::TEXT;
    WHEN 'likert', 'bipolar' THEN
      RETURN (p_answer->>'value')::TEXT;
    WHEN 'timeRange' THEN
      -- bucket start hour only
      RETURN split_part(p_answer->>'start', ':', 1);
    WHEN 'number' THEN
      DECLARE
        n NUMERIC := (p_answer->>'value')::NUMERIC;
      BEGIN
        RETURN floor(n / 500) * 500 || '-' || (floor(n / 500) + 1) * 500;
      END;
    ELSE
      RETURN NULL;
  END CASE;
END;
$$;

-- ─── Attach trigger ───────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_sync_answer_distribution ON public.onboarding_sections;

CREATE TRIGGER trg_sync_answer_distribution
  AFTER INSERT OR UPDATE ON public.onboarding_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_answer_distribution_counts();
