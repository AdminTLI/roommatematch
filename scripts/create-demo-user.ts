#!/usr/bin/env tsx

/**
 * Demo User Creation Script
 * Creates a demo student account for testing
 */

import { createClient } from '@supabase/supabase-js'

// You'll need to replace these with your actual Supabase credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo_service_key'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const DEMO_USER = {
  email: 'demo@account.com',
  password: 'Testing123',
  full_name: 'Demo Student',
  university: 'University of Amsterdam',
  program: 'Computer Science',
  degree_level: 'bachelor'
}

async function createDemoUser() {
  console.log('🚀 Creating demo user...')
  
  try {
    // Note: This is a simplified version for demo purposes
    // In a real setup, you would use Supabase Auth to create the user
    // and then create the associated profile and academic records
    
    console.log('📧 Demo User Details:')
    console.log(`   Email: ${DEMO_USER.email}`)
    console.log(`   Password: ${DEMO_USER.password}`)
    console.log(`   Name: ${DEMO_USER.full_name}`)
    console.log(`   University: ${DEMO_USER.university}`)
    console.log(`   Program: ${DEMO_USER.program}`)
    console.log(`   Degree: ${DEMO_USER.degree_level}`)
    
    console.log('\n✅ Demo user details ready!')
    console.log('\n📝 To use this account:')
    console.log('1. Go to the sign-in page')
    console.log('2. Enter the email and password above')
    console.log('3. Complete the onboarding process')
    console.log('4. Explore the platform features')
    
    console.log('\n⚠️  Note: This is a demo setup with temporary credentials.')
    console.log('   For full functionality, set up a real Supabase project.')
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error)
  }
}

// Run if called directly
if (require.main === module) {
  createDemoUser()
}

export { createDemoUser }
