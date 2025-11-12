#!/usr/bin/env tsx

/**
 * Backfill Study Months Script
 * 
 * This script infers missing study_start_month and graduation_month for existing users
 * based on their study_start_year and expected_graduation_year.
 * 
 * Usage:
 *   pnpm tsx scripts/backfill-study-months.ts
 * 
 * Environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key
 */

import { createClient } from '@supabase/supabase-js'
import { safeLogger } from '@/lib/utils/logger'

interface BackfillResult {
  userId: string
  email: string
  updated: boolean
  error?: string
  inferredMonths?: {
    study_start_month: number
    graduation_month: number
  }
}

async function backfillStudyMonths(): Promise<BackfillResult[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const results: BackfillResult[] = []

  console.log('🔍 Finding users with missing study months...')

  // Find users with missing study_start_month or graduation_month
  const { data: users, error: fetchError } = await supabase
    .from('user_academic')
    .select(`
      user_id,
      study_start_year,
      study_start_month,
      expected_graduation_year,
      graduation_month,
      degree_level,
      users!inner(email)
    `)
    .or('study_start_month.is.null,graduation_month.is.null')
    .not('study_start_year', 'is', null)
    .not('expected_graduation_year', 'is', null)

  if (fetchError) {
    throw new Error(`Failed to fetch users: ${fetchError.message}`)
  }

  console.log(`📊 Found ${users?.length || 0} users with missing study months`)

  if (!users || users.length === 0) {
    console.log('✅ No users need backfilling')
    return []
  }

  let updated = 0
  let skipped = 0
  let errors = 0

  for (const user of users) {
    const email = (user.users as any)?.email || 'unknown'
    const result: BackfillResult = {
      userId: user.user_id,
      email,
      updated: false
    }

    try {
      // Infer months based on degree level and graduation year
      let studyStartMonth = user.study_start_month
      let graduationMonth = user.graduation_month

      // Default graduation month to June (6) if missing
      if (!graduationMonth) {
        graduationMonth = 6
      }

      // Default study start month based on degree level
      if (!studyStartMonth) {
        // Most programmes start in September (month 9)
        // Master's programmes sometimes start in February (month 2)
        if (user.degree_level === 'master' || user.degree_level === 'premaster') {
          // Check if graduation is in summer (June-August), likely started in September
          // Otherwise, might have started in February
          if (graduationMonth >= 6 && graduationMonth <= 8) {
            studyStartMonth = 9 // Started in September, graduating in summer
          } else {
            studyStartMonth = 2 // Started in February
          }
        } else {
          // Bachelor's programmes typically start in September
          studyStartMonth = 9
        }
      }

      // Validate months are in valid range
      if (studyStartMonth < 1 || studyStartMonth > 12) {
        result.error = `Invalid study_start_month: ${studyStartMonth}`
        results.push(result)
        skipped++
        continue
      }

      if (graduationMonth < 1 || graduationMonth > 12) {
        result.error = `Invalid graduation_month: ${graduationMonth}`
        results.push(result)
        skipped++
        continue
      }

      // Update user_academic record
      const { error: updateError } = await supabase
        .from('user_academic')
        .update({
          study_start_month: studyStartMonth,
          graduation_month: graduationMonth,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user_id)

      if (updateError) {
        result.error = `Update failed: ${updateError.message}`
        results.push(result)
        errors++
        continue
      }

      result.updated = true
      result.inferredMonths = {
        study_start_month: studyStartMonth,
        graduation_month: graduationMonth
      }
      results.push(result)
      updated++

      console.log(`✅ ${email}: Updated with months (start: ${studyStartMonth}, grad: ${graduationMonth})`)
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error'
      results.push(result)
      errors++
      console.error(`❌ ${email}: ${result.error}`)
    }
  }

  console.log('')
  console.log('📊 Backfill Summary:')
  console.log(`   Total users: ${users.length}`)
  console.log(`   Updated: ${updated}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Errors: ${errors}`)

  return results
}

async function main() {
  try {
    console.log('🚀 Starting study months backfill...')
    console.log('')

    const results = await backfillStudyMonths()

    if (results.length === 0) {
      console.log('✅ No users needed backfilling')
      process.exit(0)
    }

    const updatedCount = results.filter(r => r.updated).length
    const errorCount = results.filter(r => r.error).length

    if (errorCount > 0) {
      console.log('')
      console.log('⚠️  Errors encountered:')
      results.filter(r => r.error).forEach(r => {
        console.log(`   ${r.email}: ${r.error}`)
      })
    }

    if (updatedCount > 0) {
      console.log('')
      console.log('✅ Backfill completed successfully')
      process.exit(0)
    } else {
      console.log('')
      console.log('⚠️  No users were updated')
      process.exit(1)
    }
  } catch (error) {
    console.error('')
    console.error('❌ Backfill failed:', error)
    safeLogger.error('Study months backfill failed', { error })
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { backfillStudyMonths }

