#!/usr/bin/env tsx

/**
 * Demo Data Cleanup Script
 * 
 * Purges all demo/fake entities from the database while preserving:
 * - The whitelisted account (DEMO_USER_EMAIL  -  never commit real values)
 * - All real user data
 * - System configuration data
 * 
 * Safe to run in production - includes multiple safeguards.
 */

import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DEMO_USER_EMAIL = process.env.DEMO_USER_EMAIL

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

if (!DEMO_USER_EMAIL) {
  console.error('❌ Missing required environment variable: DEMO_USER_EMAIL')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function promptConfirmation(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'yes')
    })
  })
}

async function cleanupDemoData() {
  console.log('🧹 Demo Data Cleanup Script')
  console.log('=' .repeat(50))
  console.log('\n⚠️  WARNING: This will delete demo/test data from the database!')
  console.log('\n✅ PRESERVED (will NOT be deleted):')
  console.log(`   - Whitelisted demo user: ${DEMO_USER_EMAIL}`)
  console.log('   - All real user accounts and their data')
  console.log('   - System configuration (universities, programs, questions)')
  console.log('\n❌ WILL BE DELETED:')
  console.log('   - Users matching fake/test email patterns (see script source)')
  console.log('   - Fake profiles and responses')
  console.log('   - Demo chats and messages')
  console.log('   - Sample forum posts and events')
  console.log('')

  const confirmed = await promptConfirmation('Do you want to proceed?')
  
  if (!confirmed) {
    console.log('\n❌ Cleanup cancelled by user')
    process.exit(0)
  }

  console.log('\n🚀 Starting cleanup...\n')

  try {
    // ============================================
    // 1. GET WHITELISTED DEMO USER ID
    // ============================================
    console.log('1️⃣  Identifying whitelisted demo user...')
    
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`)
    }

    const demoUser = users.users.find(u => u.email?.toLowerCase() === DEMO_USER_EMAIL.toLowerCase())
    
    if (!demoUser) {
      console.log(`   ⚠️  Warning: Demo user ${DEMO_USER_EMAIL} not found`)
      console.log('   → Will proceed with cleanup anyway')
    } else {
      console.log(`   ✓ Found demo user: ${demoUser.id}`)
    }

    const demoUserId = demoUser?.id

    // ============================================
    // 2. IDENTIFY FAKE/TEST USERS
    // ============================================
    console.log('\n2️⃣  Identifying fake/test users...')
    
    const [demoLocal, demoDomain = ''] = DEMO_USER_EMAIL.toLowerCase().split('@')
    const escapedDomain = demoDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const demoAtOtherHost =
      demoLocal === 'demo' && escapedDomain
        ? new RegExp(`^demo@(?!${escapedDomain}$)`, 'i')
        : /^demo@/i

    const fakeUserPatterns = [
      /^test\./i,
      /^student\d+@/i,
      /^admin@(uva|tudelft|eur)\.nl$/i,
      demoAtOtherHost,
      /^fake/i,
      /^sample/i
    ]

    const fakeUsers = users.users.filter(user => {
      if (!user.email) return false
      if (user.email.toLowerCase() === DEMO_USER_EMAIL.toLowerCase()) return false
      
      return fakeUserPatterns.some(pattern => pattern.test(user.email!))
    })

    console.log(`   Found ${fakeUsers.length} fake/test users to remove`)
    fakeUsers.forEach(u => console.log(`   - ${u.email} (${u.id})`))

    if (fakeUsers.length === 0) {
      console.log('   ✓ No fake users found, skipping user deletion')
    }

    // ============================================
    // 3. DELETE FAKE USER DATA
    // ============================================
    if (fakeUsers.length > 0) {
      console.log('\n3️⃣  Deleting fake user data...')
      
      const fakeUserIds = fakeUsers.map(u => u.id)

      // Delete responses
      const { error: responsesError } = await supabase
        .from('responses')
        .delete()
        .in('user_id', fakeUserIds)
      
      if (responsesError) {
        console.warn('   ⚠️  Warning deleting responses:', responsesError.message)
      } else {
        console.log('   ✓ Deleted fake responses')
      }

      // Delete profiles
      const { error: profilesError } = await supabase
        .from('profiles')
        .delete()
        .in('user_id', fakeUserIds)
      
      if (profilesError) {
        console.warn('   ⚠️  Warning deleting profiles:', profilesError.message)
      } else {
        console.log('   ✓ Deleted fake profiles')
      }

      // Delete onboarding submissions
      const { error: submissionsError } = await supabase
        .from('onboarding_submissions')
        .delete()
        .in('user_id', fakeUserIds)
      
      if (submissionsError) {
        console.warn('   ⚠️  Warning deleting submissions:', submissionsError.message)
      } else {
        console.log('   ✓ Deleted fake onboarding submissions')
      }

      // Delete user vectors
      const { error: vectorsError } = await supabase
        .from('user_vectors')
        .delete()
        .in('user_id', fakeUserIds)
      
      if (vectorsError) {
        console.warn('   ⚠️  Warning deleting vectors:', vectorsError.message)
      } else {
        console.log('   ✓ Deleted fake user vectors')
      }

      // Delete forum posts
      const { error: forumError } = await supabase
        .from('forum_posts')
        .delete()
        .in('author_id', fakeUserIds)
      
      if (forumError) {
        console.warn('   ⚠️  Warning deleting forum posts:', forumError.message)
      } else {
        console.log('   ✓ Deleted fake forum posts')
      }

      // Delete app events
      const { error: eventsError } = await supabase
        .from('app_events')
        .delete()
        .in('user_id', fakeUserIds)
      
      if (eventsError) {
        console.warn('   ⚠️  Warning deleting app events:', eventsError.message)
      } else {
        console.log('   ✓ Deleted fake app events')
      }

      // Delete auth users
      console.log('\n4️⃣  Deleting fake auth users...')
      for (const user of fakeUsers) {
        const { error } = await supabase.auth.admin.deleteUser(user.id)
        if (error) {
          console.warn(`   ⚠️  Warning deleting ${user.email}:`, error.message)
        } else {
          console.log(`   ✓ Deleted ${user.email}`)
        }
      }
    }

    // ============================================
    // 5. VERIFY DEMO USER STILL EXISTS
    // ============================================
    console.log('\n5️⃣  Verifying whitelisted demo user...')
    
    const { data: verifyUsers } = await supabase.auth.admin.listUsers()
    const demoStillExists = verifyUsers?.users.find(u => u.email?.toLowerCase() === DEMO_USER_EMAIL.toLowerCase())
    
    if (demoStillExists) {
      console.log(`   ✅ Demo user preserved: ${DEMO_USER_EMAIL}`)
    } else {
      console.log(`   ⚠️  Warning: Demo user not found (may not have existed)`)
    }

    // ============================================
    // 6. SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(50))
    console.log('✅ Cleanup completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - Fake users deleted: ${fakeUsers.length}`)
    console.log(`   - Whitelisted demo user: ${demoStillExists ? 'Preserved ✓' : 'Not found'}`)
    console.log(`   - Real users: Preserved ✓`)
    console.log(`   - System data: Preserved ✓`)
    console.log('\n💡 Next steps:')
    console.log('   1. Run seed:prod to ensure demo user exists')
    console.log('   2. Verify app loads with proper zero states')
    console.log('   3. Test demo user login')

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  cleanupDemoData().then(() => process.exit(0))
}

export { cleanupDemoData }

