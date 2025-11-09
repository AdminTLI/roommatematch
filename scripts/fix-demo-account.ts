#!/usr/bin/env tsx

/**
 * Fix Demo Account Script
 * 
 * Ensures the demo account has all required records:
 * - Verification record (approved)
 * - Profile with verified status
 * - Onboarding submission
 * 
 * Usage: npx tsx scripts/fix-demo-account.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import * as path from 'path'

// Load .env.local if it exists
try {
  const envPath = path.join(process.cwd(), '.env.local')
  if (existsSync(envPath)) {
    const envFile = readFileSync(envPath, 'utf-8')
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
          if (!process.env[key]) {
            process.env[key] = value
          }
        }
      }
    }
  }
} catch (error) {
  // Silently fail if .env.local doesn't exist or can't be read
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const DEMO_USER_EMAIL = 'demo@account.com'

async function fixDemoAccount() {
  console.log('🔧 Fixing demo account...\n')

  try {
    // 1. Get demo user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`)
    }

    const demoUser = users.find(u => u.email?.toLowerCase() === DEMO_USER_EMAIL.toLowerCase())
    if (!demoUser) {
      console.error(`❌ Demo user not found: ${DEMO_USER_EMAIL}`)
      console.log('💡 Run the seed script first to create the demo user.')
      process.exit(1)
    }

    const userId = demoUser.id
    console.log(`✓ Found demo user: ${userId}`)

    // 2. Ensure profile exists with verified status
    console.log('\n📝 Ensuring profile exists...')
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        university_id: '550e8400-e29b-41d4-a716-446655440001', // UvA
        first_name: 'Demo',
        last_name: 'User',
        degree_level: 'bachelor',
        program: 'Computer Science',
        campus: 'Science Park',
        languages: ['en', 'nl'],
        verification_status: 'verified'
      }, {
        onConflict: 'user_id'
      })

    if (profileError) {
      console.warn(`⚠️  Profile error: ${profileError.message}`)
    } else {
      console.log('✓ Profile updated')
    }

    // 3. Ensure verification record exists
    console.log('\n✅ Ensuring verification record exists...')
    const { data: existingVerification } = await supabase
      .from('verifications')
      .select('id')
      .eq('user_id', userId)
      .eq('provider', 'persona')
      .maybeSingle()

    if (existingVerification) {
      const { error: verificationError } = await supabase
        .from('verifications')
        .update({
          status: 'approved',
          provider_data: {
            inquiry_id: `demo-inquiry-${userId}`,
            persona_status: 'approved',
            demo_account: true
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', existingVerification.id)

      if (verificationError) {
        console.warn(`⚠️  Verification update error: ${verificationError.message}`)
      } else {
        console.log('✓ Verification record updated')
      }
    } else {
      const { error: verificationError } = await supabase
        .from('verifications')
        .insert({
          user_id: userId,
          provider: 'persona',
          provider_session_id: `demo-verification-${userId}`,
          status: 'approved',
          provider_data: {
            inquiry_id: `demo-inquiry-${userId}`,
            persona_status: 'approved',
            demo_account: true
          }
        })

      if (verificationError) {
        console.warn(`⚠️  Verification insert error: ${verificationError.message}`)
      } else {
        console.log('✓ Verification record created')
      }
    }

    // 4. Ensure onboarding submission exists (THIS IS THE KEY FIX!)
    console.log('\n📋 Ensuring onboarding submission exists...')
    // Check if submission already exists
    const { data: existingSubmission } = await supabase
      .from('onboarding_submissions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (existingSubmission) {
      console.log('✓ Onboarding submission already exists')
    } else {
      // Create new submission with required fields
      const { error: onboardingError } = await supabase
        .from('onboarding_submissions')
        .insert({
          user_id: userId,
          snapshot: {}, // Empty snapshot is fine - just marks as completed
          submitted_at: new Date().toISOString()
        })

      if (onboardingError) {
        console.error(`❌ Onboarding submission error: ${onboardingError.message}`)
        throw onboardingError
      } else {
        console.log('✓ Onboarding submission created')
      }
    }

    console.log('\n✅ Demo account fixed successfully!')
    console.log('\n📋 Summary:')
    console.log(`   - User ID: ${userId}`)
    console.log('   - Profile: ✓ Verified')
    console.log('   - Verification: ✓ Approved (Persona)')
    console.log('   - Onboarding: ✓ Completed')
    console.log('\n💡 You can now access the chat page and other features.')

  } catch (error) {
    console.error('\n❌ Failed to fix demo account:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  fixDemoAccount().then(() => process.exit(0))
}

export { fixDemoAccount }

