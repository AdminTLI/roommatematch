import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  // Check what data we have for the failing user
  const { data: intro } = await supabase
    .from('onboarding_sections')
    .select('answers')
    .eq('section', 'intro')
    .eq('user_id', '11111111-1111-4111-8111-111111111104')
    .maybeSingle()
  
  console.log('Intro data for failing user:')
  console.log(JSON.stringify(intro, null, 2))
  
  // Try to insert with a valid year
  const { error } = await supabase
    .from('user_academic')
    .insert({
      user_id: '11111111-1111-4111-8111-111111111104',
      university_id: '550e8400-e29b-41d4-a716-446655440001', // example UvA id from seed fixtures — replace for your DB
      degree_level: 'bachelor',
      program_id: null,
      undecided_program: true,
      study_start_year: 2024, // Try with 2024
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  
  if (error) {
    console.log('Error with 2024:', error)
  } else {
    console.log('Success with 2024')
  }
}

checkSchema()
