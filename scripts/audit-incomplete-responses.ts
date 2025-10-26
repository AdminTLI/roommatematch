#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { questionSchemas } from '../lib/onboarding/validation'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface AuditResult {
  userId: string
  email: string
  hasSubmission: boolean
  responseCount: number
  missingKeys: string[]
  needsReOnboarding: boolean
}

async function auditIncompleteResponses(): Promise<AuditResult[]> {
  console.log('🔍 Auditing incomplete responses...')
  
  // Get all users with submissions
  const { data: submissions, error: submissionsError } = await supabase
    .from('onboarding_submissions')
    .select('user_id, submitted_at')
    .order('submitted_at', { ascending: false })

  if (submissionsError) {
    console.error('Error fetching submissions:', submissionsError)
    process.exit(1)
  }

  console.log(`Found ${submissions?.length || 0} users with submissions`)

  const results: AuditResult[] = []
  const requiredKeys = Object.keys(questionSchemas)

  for (const submission of submissions || []) {
    // Get user email
    const { data: user } = await supabase.auth.admin.getUserById(submission.user_id)
    const email = user?.user?.email || 'unknown'

    // Get responses for this user
    const { data: responses } = await supabase
      .from('responses')
      .select('question_key')
      .eq('user_id', submission.user_id)

    const responseCount = responses?.length || 0
    const responseKeys = new Set(responses?.map(r => r.question_key) || [])
    const missingKeys = requiredKeys.filter(key => !responseKeys.has(key))
    const needsReOnboarding = missingKeys.length > 0

    results.push({
      userId: submission.user_id,
      email,
      hasSubmission: true,
      responseCount,
      missingKeys,
      needsReOnboarding
    })

    if (needsReOnboarding) {
      console.log(`❌ ${email}: Missing ${missingKeys.length} keys (${missingKeys.slice(0, 3).join(', ')}${missingKeys.length > 3 ? '...' : ''})`)
    } else {
      console.log(`✅ ${email}: Complete (${responseCount} responses)`)
    }
  }

  return results
}

async function generateReport(results: AuditResult[]) {
  const incomplete = results.filter(r => r.needsReOnboarding)
  const complete = results.filter(r => !r.needsReOnboarding)

  console.log('\n📊 Audit Summary:')
  console.log(`Total users: ${results.length}`)
  console.log(`Complete: ${complete.length}`)
  console.log(`Incomplete: ${incomplete.length}`)
  console.log(`Completion rate: ${((complete.length / results.length) * 100).toFixed(1)}%`)

  // Generate CSV report
  const csvHeader = 'userId,email,hasSubmission,responseCount,missingKeys,needsReOnboarding\n'
  const csvRows = results.map(r => 
    `${r.userId},${r.email},${r.hasSubmission},${r.responseCount},"${r.missingKeys.join(';')}",${r.needsReOnboarding}`
  ).join('\n')

  const csvContent = csvHeader + csvRows
  const reportPath = path.join(process.cwd(), 'audit-report.csv')
  fs.writeFileSync(reportPath, csvContent)
  console.log(`\n📄 Report saved to: ${reportPath}`)

  // Generate detailed missing keys report
  const missingKeysCount: Record<string, number> = {}
  incomplete.forEach(user => {
    user.missingKeys.forEach(key => {
      missingKeysCount[key] = (missingKeysCount[key] || 0) + 1
    })
  })

  const sortedMissingKeys = Object.entries(missingKeysCount)
    .sort(([,a], [,b]) => b - a)

  console.log('\n🔍 Most commonly missing keys:')
  sortedMissingKeys.slice(0, 10).forEach(([key, count]) => {
    console.log(`  ${key}: ${count} users`)
  })
}

async function main() {
  try {
    const results = await auditIncompleteResponses()
    await generateReport(results)
  } catch (error) {
    console.error('Audit failed:', error)
    process.exit(1)
  }
}

main()
