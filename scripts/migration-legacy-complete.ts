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

interface LegacyUser {
  user_id: string
  response_count: number
  has_submission: boolean
  email: string
}

interface MigrationResult {
  userId: string
  email: string
  responseCount: number
  hadSubmission: boolean
  createdSubmission: boolean
  error?: string
}

async function migrateLegacyUsers(): Promise<MigrationResult[]> {
  console.log('🔍 Finding legacy users with responses but no submissions...')
  
  // Get all users with responses
  const { data: responses, error: responsesError } = await supabase
    .from('responses')
    .select('user_id')
    .not('user_id', 'is', null)

  if (responsesError) {
    console.error('Error fetching responses:', responsesError)
    process.exit(1)
  }

  // Count responses per user
  const responseCounts = new Map<string, number>()
  for (const response of responses || []) {
    const count = responseCounts.get(response.user_id) || 0
    responseCounts.set(response.user_id, count + 1)
  }

  console.log(`Found ${responseCounts.size} users with responses`)

  // Get users with submissions
  const { data: submissions, error: submissionsError } = await supabase
    .from('onboarding_submissions')
    .select('user_id')

  if (submissionsError) {
    console.error('Error fetching submissions:', submissionsError)
    process.exit(1)
  }

  const submissionUserIds = new Set(submissions?.map(s => s.user_id) || [])
  console.log(`Found ${submissionUserIds.size} users with submissions`)

  const results: MigrationResult[] = []
  const userIds = Array.from(responseCounts.keys())

  for (const userId of userIds) {
    const responseCount = responseCounts.get(userId) || 0
    const hasSubmission = submissionUserIds.has(userId)

    // Get user email for logging
    const { data: user } = await supabase.auth.admin.getUserById(userId)
    const email = user?.user?.email || 'unknown'

    // Only process users without submissions who have a reasonable number of responses
    // Consider 15+ responses as "adequate" for legacy users (less than current 38 required)
    if (!hasSubmission && responseCount >= 15) {
      try {
        console.log(`📝 Creating submission for ${email} (${responseCount} responses)`)
        
        const { error: insertError } = await supabase
          .from('onboarding_submissions')
          .insert({
            user_id: userId,
            submitted_at: new Date().toISOString(),
            snapshot: [] // Empty snapshot for legacy users
          })

        if (insertError) {
          console.error(`❌ ${email}: Failed to create submission:`, insertError)
          results.push({
            userId,
            email,
            responseCount,
            hadSubmission: false,
            createdSubmission: false,
            error: insertError.message
          })
        } else {
          console.log(`✅ ${email}: Created submission for legacy user`)
          results.push({
            userId,
            email,
            responseCount,
            hadSubmission: false,
            createdSubmission: true
          })
        }
      } catch (error) {
        console.error(`❌ ${email}: Unexpected error:`, error)
        results.push({
          userId,
          email,
          responseCount,
          hadSubmission: false,
          createdSubmission: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    } else {
      // Log users we're skipping
      if (hasSubmission) {
        console.log(`⏭️  ${email}: Already has submission (${responseCount} responses)`)
      } else if (responseCount < 15) {
        console.log(`⏭️  ${email}: Too few responses (${responseCount} < 15)`)
      }
      
      results.push({
        userId,
        email,
        responseCount,
        hadSubmission: hasSubmission,
        createdSubmission: false
      })
    }
  }

  return results
}

async function generateReport(results: MigrationResult[]) {
  const total = results.length
  const alreadyHadSubmission = results.filter(r => r.hadSubmission).length
  const createdSubmission = results.filter(r => r.createdSubmission).length
  const skipped = results.filter(r => !r.hadSubmission && !r.createdSubmission).length
  const failed = results.filter(r => r.error).length

  console.log('\n📊 Migration Summary:')
  console.log(`Total users processed: ${total}`)
  console.log(`Already had submissions: ${alreadyHadSubmission}`)
  console.log(`Successfully created submissions: ${createdSubmission}`)
  console.log(`Skipped (insufficient responses): ${skipped}`)
  console.log(`Failed: ${failed}`)

  // Generate CSV report
  const csvHeader = 'userId,email,responseCount,hadSubmission,createdSubmission,error\n'
  const csvRows = results.map(r => 
    `${r.userId},${r.email},${r.responseCount},${r.hadSubmission},${r.createdSubmission},"${r.error || ''}"`
  ).join('\n')

  const csvContent = csvHeader + csvRows
  const reportPath = path.join(process.cwd(), 'migration-legacy-complete-report.csv')
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
    const results = await migrateLegacyUsers()
    await generateReport(results)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

main()
