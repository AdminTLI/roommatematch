-- Academic schema extensions for WO programmes and user academic data
-- Part of Domu Match MVP extension

-- Create programs table for WO programmes from Studiekeuzedatabase
CREATE TABLE IF NOT EXISTS programs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    croho_code text UNIQUE,
    name text NOT NULL,
    name_en text,
    degree_level text NOT NULL CHECK (degree_level IN ('bachelor', 'master', 'premaster')),
    language_codes text[] DEFAULT '{}',
    faculty text,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes for programs
CREATE INDEX IF NOT EXISTS idx_programs_university_degree ON programs(university_id, degree_level);
CREATE INDEX IF NOT EXISTS idx_programs_name ON programs(name);
CREATE INDEX IF NOT EXISTS idx_programs_croho ON programs(croho_code) WHERE croho_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_programs_active ON programs(active) WHERE active = true;

-- Create user_academic table for academic information
CREATE TABLE IF NOT EXISTS user_academic (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    university_id uuid NOT NULL REFERENCES universities(id),
    degree_level text NOT NULL CHECK (degree_level IN ('bachelor', 'master', 'premaster')),
    program_id uuid REFERENCES programs(id),
    undecided_program boolean DEFAULT false,
    study_start_year int NOT NULL CHECK (study_start_year >= 2015 AND study_start_year <= EXTRACT(YEAR FROM now()) + 1),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraints
    CONSTRAINT user_academic_program_or_undecided 
        CHECK ((program_id IS NOT NULL AND undecided_program = false) OR 
               (program_id IS NULL AND undecided_program = true))
);

-- Create index for user_academic
CREATE INDEX IF NOT EXISTS idx_user_academic_university ON user_academic(university_id);
CREATE INDEX IF NOT EXISTS idx_user_academic_degree ON user_academic(degree_level);
CREATE INDEX IF NOT EXISTS idx_user_academic_program ON user_academic(program_id);
CREATE INDEX IF NOT EXISTS idx_user_academic_start_year ON user_academic(study_start_year);

-- Create view for computed study year
CREATE OR REPLACE VIEW user_study_year_v AS
SELECT 
    user_id,
    GREATEST(1, EXTRACT(YEAR FROM now())::int - study_start_year + 1) AS study_year
FROM user_academic;

-- Create trigger for updated_at on programs
CREATE OR REPLACE FUNCTION update_programs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_programs_updated_at
    BEFORE UPDATE ON programs
    FOR EACH ROW
    EXECUTE FUNCTION update_programs_updated_at();

-- Create trigger for updated_at on user_academic
CREATE OR REPLACE FUNCTION update_user_academic_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_academic_updated_at
    BEFORE UPDATE ON user_academic
    FOR EACH ROW
    EXECUTE FUNCTION update_user_academic_updated_at();

-- RLS Policies for programs table
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Everyone can read active programs
CREATE POLICY "programs_read_active" ON programs
    FOR SELECT USING (active = true);

-- Service role can do everything (for imports)
CREATE POLICY "programs_service_role" ON programs
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for user_academic table
ALTER TABLE user_academic ENABLE ROW LEVEL SECURITY;

-- Users can manage their own academic data
CREATE POLICY "user_academic_own" ON user_academic
    FOR ALL USING (auth.uid() = user_id);

-- Admins can read aggregated academic data (for analytics)
CREATE POLICY "user_academic_admin_read" ON user_academic
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE user_id = auth.uid()
        )
    );

-- Grant necessary permissions
GRANT SELECT ON programs TO authenticated;
GRANT ALL ON user_academic TO authenticated;
GRANT SELECT ON user_study_year_v TO authenticated;

-- Grant service role permissions for imports
GRANT ALL ON programs TO service_role;
GRANT SELECT ON universities TO service_role;
