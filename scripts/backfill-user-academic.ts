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

interface UserProfile {
  user_id: string
  university_id: string | null
  degree_level: string | null
  program: string | null
  campus: string | null
}

interface BackfillResult {
  userId: string
  email: string
  hasProfile: boolean
  hasAcademic: boolean
  backfilled: boolean
  error?: string
}

async function backfillUserAcademic(): Promise<BackfillResult[]> {
  console.log('🔍 Finding users with profiles but no academic data...')
  
  // Get all users with profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id, university_id, degree_level, program, campus')
    .not('university_id', 'is', null) // Only users with university data

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
    process.exit(1)
  }

  console.log(`Found ${profiles?.length || 0} users with profiles`)

  const results: BackfillResult[] = []

  for (const profile of profiles || []) {
    // Get user email for logging
    const { data: user } = await supabase.auth.admin.getUserById(profile.user_id)
    const email = user?.user?.email || 'unknown'

    // Check if user already has academic data
    const { data: existingAcademic } = await supabase
      .from('user_academic')
      .select('user_id')
      .eq('user_id', profile.user_id)
      .maybeSingle()

    const hasAcademic = !!existingAcademic

    if (hasAcademic) {
      console.log(`✅ ${email}: Already has academic data`)
      results.push({
        userId: profile.user_id,
        email,
        hasProfile: true,
        hasAcademic: true,
        backfilled: false
      })
      continue
    }

    // Backfill academic data
    try {
      const { error: insertError } = await supabase
        .from('user_academic')
        .insert({
          user_id: profile.user_id,
          university_id: profile.university_id,
          degree_level: profile.degree_level,
          program_id: profile.program || null,
          undecided_program: !profile.program,
          study_start_year: null // Not available in profiles
        })

      if (insertError) {
        console.error(`❌ ${email}: Failed to insert academic data:`, insertError)
        results.push({
          userId: profile.user_id,
          email,
          hasProfile: true,
          hasAcademic: false,
          backfilled: false,
          error: insertError.message
        })
      } else {
        console.log(`✅ ${email}: Backfilled academic data`)
        results.push({
          userId: profile.user_id,
          email,
          hasProfile: true,
          hasAcademic: false,
          backfilled: true
        })
      }
    } catch (error) {
      console.error(`❌ ${email}: Unexpected error:`, error)
      results.push({
        userId: profile.user_id,
        email,
        hasProfile: true,
        hasAcademic: false,
        backfilled: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return results
}

async function generateReport(results: BackfillResult[]) {
  const total = results.length
  const alreadyHadAcademic = results.filter(r => r.hasAcademic).length
  const backfilled = results.filter(r => r.backfilled).length
  const failed = results.filter(r => !r.backfilled && !r.hasAcademic).length

  console.log('\n📊 Backfill Summary:')
  console.log(`Total users processed: ${total}`)
  console.log(`Already had academic data: ${alreadyHadAcademic}`)
  console.log(`Successfully backfilled: ${backfilled}`)
  console.log(`Failed: ${failed}`)

  // Generate CSV report
  const csvHeader = 'userId,email,hasProfile,hasAcademic,backfilled,error\n'
  const csvRows = results.map(r => 
    `${r.userId},${r.email},${r.hasProfile},${r.hasAcademic},${r.backfilled},"${r.error || ''}"`
  ).join('\n')

  const csvContent = csvHeader + csvRows
  const reportPath = path.join(process.cwd(), 'backfill-user-academic-report.csv')
  fs.writeFileSync(reportPath, csvContent)
  console.log(`\n📄 Report saved to: ${reportPath}`)

  if (failed > 0) {
    console.log('\n❌ Failed users:')
    results.filter(r => !r.backfilled && !r.hasAcademic).forEach(r => {
      console.log(`  ${r.email}: ${r.error}`)
    })
  }
}

async function main() {
  try {
    const results = await backfillUserAcademic()
    await generateReport(results)
  } catch (error) {
    console.error('Backfill failed:', error)
    process.exit(1)
  }
}

main()
