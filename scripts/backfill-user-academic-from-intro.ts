#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface BackfillResult {
  userId: string
  email: string
  hasIntroData: boolean
  hasAcademicRecord: boolean
  backfilled: boolean
  error?: string
}

async function backfillUserAcademicFromIntro(): Promise<BackfillResult[]> {
  console.log('🔍 Finding users with intro data but no academic records...')
  
  // Get all users with intro section data
  const { data: introSections, error: introError } = await supabase
    .from('onboarding_sections')
    .select('user_id, answers')
    .eq('section', 'intro')

  if (introError) {
    console.error('Error fetching intro sections:', introError)
    process.exit(1)
  }

  console.log(`Found ${introSections?.length || 0} users with intro data`)

  // Get users who already have academic records
  const { data: existingAcademic } = await supabase
    .from('user_academic')
    .select('user_id')

  const existingAcademicUserIds = new Set(existingAcademic?.map(a => a.user_id) || [])
  console.log(`Found ${existingAcademicUserIds.size} users with existing academic records`)

  const results: BackfillResult[] = []

  for (const introSection of introSections || []) {
    // Get user email for logging
    const { data: user } = await supabase.auth.admin.getUserById(introSection.user_id)
    const email = user?.user?.email || 'unknown'

    const hasAcademicRecord = existingAcademicUserIds.has(introSection.user_id)

    if (hasAcademicRecord) {
      console.log(`⏭️  ${email}: Already has academic record`)
      results.push({
        userId: introSection.user_id,
        email,
        hasIntroData: true,
        hasAcademicRecord: true,
        backfilled: false
      })
      continue
    }

    // Extract academic data from intro answers
    const academicData: any = {}
    for (const answer of introSection.answers || []) {
      if (answer.itemId === 'institution_slug') {
        academicData.institution_slug = answer.value
      } else if (answer.itemId === 'degree_level') {
        academicData.degree_level = answer.value
      } else if (answer.itemId === 'program_id') {
        academicData.program_id = answer.value
      } else if (answer.itemId === 'expected_graduation_year') {
        academicData.expected_graduation_year = parseInt(answer.value)
        // Calculate study_start_year based on graduation year and degree level
        const graduationYear = parseInt(answer.value)
        const degreeLevel = academicData.degree_level
        let studyStartYear = graduationYear - 3 // Default for bachelor
        
        if (degreeLevel === 'master') {
          studyStartYear = graduationYear - 1
        } else if (degreeLevel === 'premaster') {
          studyStartYear = graduationYear - 1
        } else if (degreeLevel === 'bachelor') {
          studyStartYear = graduationYear - 3
        }
        
        // Ensure reasonable year range
        studyStartYear = Math.max(2020, Math.min(2030, studyStartYear))
        academicData.study_start_year = studyStartYear
      } else if (answer.itemId === 'undecided_program') {
        academicData.undecided_program = answer.value
      }
    }

    // Validate we have the required data
    if (!academicData.institution_slug || !academicData.degree_level || !academicData.study_start_year) {
      console.log(`⚠️  ${email}: Incomplete intro data, skipping`)
      results.push({
        userId: introSection.user_id,
        email,
        hasIntroData: true,
        hasAcademicRecord: false,
        backfilled: false,
        error: 'Incomplete intro data'
      })
      continue
    }

    // Look up university_id from slug
    let university_id = null
    if (academicData.institution_slug && academicData.institution_slug !== 'other') {
      const { data: uniData, error: uniError } = await supabase
        .from('universities')
        .select('id')
        .eq('slug', academicData.institution_slug)
        .maybeSingle()

      if (!uniError && uniData) {
        university_id = uniData.id
      } else {
        console.log(`⚠️  ${email}: University slug '${academicData.institution_slug}' not found`)
        results.push({
          userId: introSection.user_id,
          email,
          hasIntroData: true,
          hasAcademicRecord: false,
          backfilled: false,
          error: `University slug '${academicData.institution_slug}' not found`
        })
        continue
      }
    }

    // Create user_academic record
    try {
      console.log(`📝 Creating academic record for ${email}...`)
      
      const { error: insertError } = await supabase
        .from('user_academic')
        .insert({
          user_id: introSection.user_id,
          university_id: university_id,
          degree_level: academicData.degree_level,
          program_id: null, // Set to null since we can't map program codes to UUIDs
          undecided_program: true, // Mark as undecided since we have a program code but no UUID
          study_start_year: academicData.study_start_year,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        console.error(`❌ ${email}: Failed to create academic record:`, insertError)
        results.push({
          userId: introSection.user_id,
          email,
          hasIntroData: true,
          hasAcademicRecord: false,
          backfilled: false,
          error: insertError.message
        })
      } else {
        console.log(`✅ ${email}: Created academic record successfully`)
        results.push({
          userId: introSection.user_id,
          email,
          hasIntroData: true,
          hasAcademicRecord: false,
          backfilled: true
        })
      }
    } catch (error) {
      console.error(`❌ ${email}: Unexpected error:`, error)
      results.push({
        userId: introSection.user_id,
        email,
        hasIntroData: true,
        hasAcademicRecord: false,
        backfilled: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return results
}

async function generateReport(results: BackfillResult[]) {
  const total = results.length
  const alreadyHadAcademic = results.filter(r => r.hasAcademicRecord).length
  const backfilled = results.filter(r => r.backfilled).length
  const skipped = results.filter(r => !r.hasAcademicRecord && !r.backfilled).length
  const failed = results.filter(r => r.error).length

  console.log('\n📊 Backfill Summary:')
  console.log(`Total users processed: ${total}`)
  console.log(`Already had academic records: ${alreadyHadAcademic}`)
  console.log(`Successfully backfilled: ${backfilled}`)
  console.log(`Skipped (incomplete data): ${skipped}`)
  console.log(`Failed: ${failed}`)

  // Generate CSV report
  const csvHeader = 'userId,email,hasIntroData,hasAcademicRecord,backfilled,error\n'
  const csvRows = results.map(r => 
    `${r.userId},${r.email},${r.hasIntroData},${r.hasAcademicRecord},${r.backfilled},"${r.error || ''}"`
  ).join('\n')

  const csvContent = csvHeader + csvRows
  const reportPath = path.join(process.cwd(), 'backfill-user-academic-from-intro-report.csv')
  fs.writeFileSync(reportPath, csvContent)
  console.log(`\n📄 Report saved to: ${reportPath}`)

  if (failed > 0) {
    console.log('\n❌ Failed users:')
    results.filter(r => r.error).forEach(r => {
      console.log(`  ${r.email}: ${r.error}`)
    })
  }
}

async function main() {
  try {
    const results = await backfillUserAcademicFromIntro()
    await generateReport(results)
  } catch (error) {
    console.error('Backfill failed:', error)
    process.exit(1)
  }
}

main()
