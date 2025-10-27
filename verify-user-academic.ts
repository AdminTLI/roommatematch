import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyUserAcademic() {
  const { data: academic, error } = await supabase
    .from('user_academic')
    .select(`
      *,
      universities!user_academic_university_id_fkey(
        id,
        name,
        slug
      ),
      programs!user_academic_program_id_fkey(
        id,
        name,
        croho_code
      )
    `)
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('User academic records:')
    academic?.forEach(record => {
      console.log(`\nUser: ${record.user_id}`)
      console.log(`University: ${record.universities?.name || 'N/A'} (${record.universities?.slug || 'N/A'})`)
      console.log(`Degree Level: ${record.degree_level}`)
      console.log(`Program: ${record.programs?.name || 'Undecided'} (${record.programs?.croho_code || 'N/A'})`)
      console.log(`Study Start Year: ${record.study_start_year}`)
      console.log(`Undecided Program: ${record.undecided_program}`)
    })
  }
}

verifyUserAcademic()
