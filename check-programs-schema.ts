import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPrograms() {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .limit(3)
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Programs table structure:')
    console.log(JSON.stringify(data, null, 2))
  }
  
  // Check if we have the specific program
  const { data: specific } = await supabase
    .from('programs')
    .select('*')
    .eq('code', '1001O2693')
    .maybeSingle()
  
  console.log('\nLooking for program 1001O2693:')
  console.log(JSON.stringify(specific, null, 2))
}

checkPrograms()
