-- Raise minimum age requirement from 17 to 18

CREATE OR REPLACE FUNCTION meets_minimum_age(birth_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
  IF birth_date IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN calculate_age(birth_date) >= 18;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION verify_user_age()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date_of_birth IS NOT NULL THEN
    IF NOT meets_minimum_age(NEW.date_of_birth) THEN
      RAISE EXCEPTION 'User must be at least 18 years old to use this platform';
    END IF;

    IF NEW.age_verified_at IS NULL THEN
      NEW.age_verified_at := NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
