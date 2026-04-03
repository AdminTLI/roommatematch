#!/usr/bin/env tsx

/**
 * Development Seed Script
 * 
 * Seeds optional mock data for local development ONLY.
 * Guarded by ALLOW_DEV_SEED environment variable.
 * 
 * NEVER runs in production.
 * Creates fake users, profiles, responses for testing.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ALLOW_DEV_SEED = process.env.ALLOW_DEV_SEED === 'true'
const NODE_ENV = process.env.NODE_ENV

// Safety check: Never run in production
if (NODE_ENV === 'production') {
  console.error('❌ FATAL: Development seed cannot run in production!')
  console.error('   This script is for local development only.')
  process.exit(1)
}

if (!ALLOW_DEV_SEED) {
  console.log('ℹ️  Development seed skipped (ALLOW_DEV_SEED not set to true)')
  console.log('   To enable: Set ALLOW_DEV_SEED=true in your .env.local')
  process.exit(0)
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const DEV_SEED_USER_PASSWORD = process.env.DEV_SEED_USER_PASSWORD
if (!DEV_SEED_USER_PASSWORD) {
  console.error('❌ DEV_SEED_USER_PASSWORD is required when ALLOW_DEV_SEED=true')
  console.error('   Set a strong dev-only password in .env.local (never use production passwords).')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seedDevelopment() {
  console.log('🔧 Starting development seed...')
  console.log('⚠️  WARNING: This creates FAKE data for testing only!\n')

  try {
    // ============================================
    // 1. CREATE TEST USERS
    // ============================================
    console.log('👥 Creating test users...')
    
    const testUsers = [
      {
        email: 'seed-local-1@example.com',
        password: DEV_SEED_USER_PASSWORD,
        metadata: { full_name: 'Test Student 1' },
        profile: {
          university_id: '550e8400-e29b-41d4-a716-446655440001',
          first_name: 'Test',
          degree_level: 'bachelor',
          program: 'Computer Science',
          campus: 'Science Park',
          languages: ['en', 'nl'],
          verification_status: 'verified'
        }
      },
      {
        email: 'seed-local-2@example.com',
        password: DEV_SEED_USER_PASSWORD,
        metadata: { full_name: 'Test Student 2' },
        profile: {
          university_id: '550e8400-e29b-41d4-a716-446655440001',
          first_name: 'Test',
          degree_level: 'master',
          program: 'Psychology',
          campus: 'Roeterseiland',
          languages: ['en', 'nl'],
          verification_status: 'verified'
        }
      },
      {
        email: 'seed-local-3@example.com',
        password: DEV_SEED_USER_PASSWORD,
        metadata: { full_name: 'Test Student 3' },
        profile: {
          university_id: '550e8400-e29b-41d4-a716-446655440002',
          first_name: 'Test',
          degree_level: 'master',
          program: 'Aerospace Engineering',
          campus: 'Main Campus',
          languages: ['en'],
          verification_status: 'verified'
        }
      }
    ]

    for (const testUser of testUsers) {
      // Check if already exists
      const { data: existing } = await supabase.auth.admin.listUsers()
      const userExists = existing?.users.find(u => u.email === testUser.email)
      
      if (userExists) {
        console.log(`   → ${testUser.email} already exists, skipping`)
        continue
      }

      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
        user_metadata: testUser.metadata
      })

      if (error) {
        console.warn(`   ⚠️  Warning creating ${testUser.email}:`, error.message)
      } else if (newUser.user) {
        console.log(`   ✓ Created ${testUser.email}`)
        
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: newUser.user.id,
            ...testUser.profile
          })
        
        if (profileError) {
          console.warn(`   ⚠️  Warning creating profile:`, profileError.message)
        }
      }
    }

    console.log('\n✅ Development seed completed!')
    console.log('\n📋 Test Accounts Created:')
    testUsers.forEach(u => {
      console.log(`   - ${u.email} (password from DEV_SEED_USER_PASSWORD)`)
    })
    console.log('\n⚠️  Remember: These are FAKE accounts for testing only.')
    console.log('   Run cleanup script before deploying to production.')

  } catch (error) {
    console.error('\n❌ Development seed failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  seedDevelopment().then(() => process.exit(0))
}

export { seedDevelopment }

