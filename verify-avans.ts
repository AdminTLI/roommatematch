import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyAvans() {
  const { data: avans, error } = await supabase
    .from('universities')
    .select('*')
    .eq('slug', 'avans')
    .maybeSingle()
  
  if (error) {
    console.error('Error:', error)
  } else if (avans) {
    console.log('✅ Found Avans:', JSON.stringify(avans, null, 2))
  } else {
    console.log('❌ Avans not found')
  }
  
  // Check total count
  const { count } = await supabase
    .from('universities')
    .select('*', { count: 'exact', head: true })
  
  console.log(`\n📊 Total universities: ${count}`)
}

verifyAvans()
