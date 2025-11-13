import { AppShell } from '@/components/app/shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsContent } from './components/settings-content'
import { getUserProfile } from '@/lib/auth/user-profile'
import { checkUserVerificationStatus, getVerificationRedirectUrl } from '@/lib/auth/verification-check'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  // Force refresh the user session to get latest data
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  console.log('[Settings] User data:', {
    id: user?.id,
    email: user?.email,
    email_confirmed_at: user?.email_confirmed_at,
    userError
  })

  if (!user) {
    redirect('/auth/sign-in')
  }

  // Check verification status (backup check - middleware also enforces this)
  const verificationStatus = await checkUserVerificationStatus(user)
  const redirectUrl = getVerificationRedirectUrl(verificationStatus)
  if (redirectUrl) {
    if (redirectUrl === '/auth/verify-email' && user.email) {
      redirect(`/auth/verify-email?email=${encodeURIComponent(user.email)}&auto=1`)
    } else {
      redirect(redirectUrl)
    }
  }

  // Fetch user profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // Fetch academic data with joins for readable names
  let { data: academic } = await supabase
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
    .eq('user_id', user.id)
    .maybeSingle()

  // Fetch study year from view separately (Supabase doesn't support direct view joins)
  let studyYear: number | null = null
  if (academic) {
    const { data: studyYearData } = await supabase
      .from('user_study_year_v')
      .select('study_year')
      .eq('user_id', user.id)
      .maybeSingle()
    studyYear = studyYearData?.study_year ?? null
  }

  // If missing, try to derive from intro answers for display purposes
  if (!academic) {
    console.log('[Settings] No user_academic found, checking intro section...')
    const { data: intro } = await supabase
      .from('onboarding_sections')
      .select('answers')
      .eq('user_id', user.id)
      .eq('section', 'intro')
      .maybeSingle()
    
    console.log('[Settings] Intro section:', intro)
    
    if (intro?.answers) {
      let institution_slug: string | undefined
      let university_id: string | undefined
      let degree_level: string | undefined
      let program_id: string | undefined
      let study_start_year: number | undefined
      let study_start_month: number | null = null
      let expected_graduation_year: number | undefined
      let graduation_month: number | null = null
      let undecided_program: boolean = false
      
      // Extract all fields from intro section
      for (const a of intro.answers) {
        console.log('[Settings] Checking answer:', a)
        switch (a.itemId) {
          case 'institution_slug':
            institution_slug = a.value
            break
          case 'university_id':
            // Only set if it's a valid UUID (not empty string)
            if (a.value && typeof a.value === 'string' && a.value.trim() !== '') {
              university_id = a.value
            }
            break
          case 'degree_level':
            degree_level = a.value
            break
          case 'program_id':
            program_id = a.value
            break
          case 'study_start_year':
            study_start_year = a.value ? parseInt(a.value) : undefined
            break
          case 'study_start_month':
            study_start_month = a.value ? parseInt(a.value) : null
            break
          case 'expected_graduation_year':
            expected_graduation_year = a.value ? parseInt(a.value) : undefined
            break
          case 'graduation_month':
            graduation_month = a.value ? parseInt(a.value) : null
            break
          case 'undecided_program':
            undecided_program = a.value === true
            break
        }
      }
      
      console.log('[Settings] Extracted from intro:', { 
        institution_slug, 
        university_id, 
        degree_level, 
        program_id, 
        study_start_year,
        study_start_month,
        expected_graduation_year,
        graduation_month,
        undecided_program
      })
      
      // Calculate study_start_year if not present but we have expected_graduation_year
      if (!study_start_year && expected_graduation_year && degree_level && institution_slug) {
        const { getInstitutionType } = await import('@/lib/getInstitutionType')
        const institutionType = getInstitutionType(institution_slug) as 'wo' | 'hbo'
        
        if (institutionType) {
          if (study_start_month !== null && graduation_month !== null) {
            // Use month-aware calculation
            const graduationAcademicYear = expected_graduation_year + (graduation_month >= 9 ? 1 : 0)
            const startAcademicYear = graduationAcademicYear - (institutionType === 'wo' ? 3 : 4) + 1
            study_start_year = startAcademicYear - (study_start_month >= 9 ? 1 : 0)
          } else {
            // Fallback calculation
            let calculatedStartYear = expected_graduation_year - 3 // Default for bachelor
            
            if (degree_level === 'master' || degree_level === 'premaster') {
              calculatedStartYear = expected_graduation_year - 1
            } else if (degree_level === 'bachelor') {
              const bachelorDuration = institutionType === 'hbo' ? 4 : 3
              calculatedStartYear = expected_graduation_year - bachelorDuration
            }
            
            // Clamp to DB constraints
            const currentYear = new Date().getFullYear()
            const minYear = 2015
            const maxYear = currentYear + 1
            study_start_year = Math.max(minYear, Math.min(maxYear, calculatedStartYear))
          }
          console.log('[Settings] Calculated study_start_year:', study_start_year)
        }
      }
      
      // Look up university_id from institution_slug if not present
      if (!university_id && institution_slug && institution_slug !== 'other') {
        console.log('[Settings] Looking up university for slug:', institution_slug)
        const { data: university, error: uniError } = await supabase
          .from('universities')
          .select('id, slug, name')
          .eq('slug', institution_slug)
          .maybeSingle()
        
        if (uniError) {
          console.error('[Settings] Error looking up university:', uniError)
        } else if (university) {
          university_id = university.id
          console.log('[Settings] Found university UUID:', university_id, 'for slug:', institution_slug, 'name:', university.name)
        } else {
          console.warn('[Settings] University not found for slug:', institution_slug)
          // Try case-insensitive lookup as fallback
          const { data: universities } = await supabase
            .from('universities')
            .select('id, slug, name')
            .ilike('slug', institution_slug)
            .limit(5)
          
          if (universities && universities.length > 0) {
            console.log('[Settings] Found universities with similar slug:', universities.map(u => ({ slug: u.slug, name: u.name })))
            // Use the first match
            university_id = universities[0].id
            console.log('[Settings] Using university:', university_id, 'for slug:', institution_slug)
          } else {
            console.error('[Settings] No university found even with case-insensitive lookup for slug:', institution_slug)
          }
        }
      }
      
      // Only create academic object if we have minimum required fields
      if (university_id && degree_level && study_start_year) {
        academic = {
          user_id: user.id,
          university_id: university_id,
          degree_level: degree_level,
          program_id: program_id || null,
          study_start_year: study_start_year,
          study_start_month: study_start_month,
          expected_graduation_year: expected_graduation_year || null,
          graduation_month: graduation_month,
          undecided_program: undecided_program,
          created_at: null,
          updated_at: null,
        } as any
        console.log('[Settings] Derived academic data from intro:', academic)
      } else {
        console.warn('[Settings] Cannot derive academic data - missing required fields:', {
          hasUniversityId: !!university_id,
          hasDegreeLevel: !!degree_level,
          hasStudyStartYear: !!study_start_year,
          institution_slug
        })
      }
    } else {
      console.warn('[Settings] Intro section exists but has no answers')
    }
  } else {
    console.log('[Settings] Found user_academic:', academic)
  }

  // Check questionnaire progress
  const { data: sections } = await supabase
    .from('onboarding_sections')
    .select('section, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const { data: submission } = await supabase
    .from('onboarding_submissions')
    .select('submitted_at')
    .eq('user_id', user.id)
    .maybeSingle()
  
  // If user_academic is still missing but submission exists, attempt to diagnose
  if (!academic && submission) {
    console.warn('[Settings] user_academic is missing but submission exists - this indicates a data inconsistency')
    console.warn('[Settings] User should have user_academic record after submission. Attempting to diagnose...')
    
    // Check if we can extract data from submission snapshot
    const { data: submissionData } = await supabase
      .from('onboarding_submissions')
      .select('snapshot')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (submissionData?.snapshot?.raw_sections) {
      const introSection = submissionData.snapshot.raw_sections.find((s: any) => s.section === 'intro')
      if (introSection?.answers) {
        console.log('[Settings] Found intro section in submission snapshot, attempting to extract academic data...')
        // Use the same extraction logic as above, but this time try to actually create the record
        // Note: We'll just log for now - actual backfill should be done via API endpoint
        console.warn('[Settings] Academic data can be recovered from submission snapshot, but requires backfill')
      }
    }
  }

  // Define the actual required sections (9 total, excluding 'intro')
  const requiredSections = [
    'location-commute',
    'personality-values',
    'sleep-circadian',
    'noise-sensory',
    'home-operations',
    'social-hosting-language',
    'communication-conflict',
    'privacy-territoriality',
    'reliability-logistics'
  ]

  // Count only the required sections that are completed
  const completedRequiredSections = sections?.filter(s => 
    requiredSections.includes(s.section)
  ) || []

  console.log('[Settings] All sections from database:', sections?.map(s => s.section))
  console.log('[Settings] Required sections:', requiredSections)
  console.log('[Settings] Completed required sections:', completedRequiredSections.map(s => s.section))
  
  console.log('[Settings] Progress calculation:', {
    totalSections: sections?.length,
    requiredSections: requiredSections.length,
    completedRequired: completedRequiredSections.length,
    isSubmitted: !!submission,
    allSections: sections?.map(s => s.section)
  })

  const progressData = {
    completedSections: completedRequiredSections.map(s => s.section),
    totalSections: requiredSections.length, // Should be 9
    isFullySubmitted: !!submission,
    lastUpdated: sections?.[0]?.updated_at || null,
    submittedAt: submission?.submitted_at || null
  }

  // Get user profile with proper name
  const userProfile = await getUserProfile(user.id)
  if (!userProfile) {
    redirect('/auth/sign-in')
  }

  // Add study year to academic data for display
  const academicWithStudyYear = academic ? { ...academic, study_year: studyYear } : academic

  return (
    <AppShell user={userProfile}>
      <SettingsContent 
        user={user}
        profile={profile}
        academic={academicWithStudyYear}
        progressData={progressData}
      />
    </AppShell>
  )
}
