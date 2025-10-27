import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkIntroData() {
  const { data: sections, error } = await supabase
    .from('onboarding_sections')
    .select('user_id, section, answers')
    .eq('section', 'intro')
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('\n=== INTRO SECTION DATA ===')
  for (const section of sections || []) {
    const { data: user } = await supabase.auth.admin.getUserById(section.user_id)
    console.log(`\nUser: ${user?.user?.email}`)
    console.log('Answers:', JSON.stringify(section.answers, null, 2))
  }
  
  console.log('\n=== USER_ACADEMIC TABLE ===')
  const { data: academic } = await supabase
    .from('user_academic')
    .select('*')
  
  for (const record of academic || []) {
    const { data: user } = await supabase.auth.admin.getUserById(record.user_id)
    console.log(`\nUser: ${user?.user?.email}`)
    console.log('Academic record:', JSON.stringify(record, null, 2))
  }
}

checkIntroData()
