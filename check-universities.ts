import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUniversities() {
  console.log('\n=== Checking for "avans" in universities table ===')
  const { data: avans, error } = await supabase
    .from('universities')
    .select('*')
    .eq('slug', 'avans')
    .maybeSingle()
  
  if (error) {
    console.error('Error:', error)
  } else if (avans) {
    console.log('Found university:', JSON.stringify(avans, null, 2))
  } else {
    console.log('NO university found with slug "avans"')
  }
  
  console.log('\n=== All universities in table ===')
  const { data: all } = await supabase
    .from('universities')
    .select('id, name, slug')
    .limit(10)
  
  console.log(all)
}

checkUniversities()
