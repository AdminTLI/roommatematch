#!/usr/bin/env tsx

/**
 * Production Seed Script
 * 
 * Seeds ONLY essential system data and the whitelisted demo user.
 * NO fake users, profiles, responses, or other demo entities.
 * 
 * Safe to run in production - idempotent and preserves existing data.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DEMO_USER_EMAIL = process.env.DEMO_USER_EMAIL || 'demo@account.com'
const DEMO_USER_PASSWORD = process.env.DEMO_USER_PASSWORD || 'Testing123'

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seedProduction() {
  console.log('🌱 Starting production seed...\n')

  try {
    // ============================================
    // 1. SEED UNIVERSITIES (System Data)
    // ============================================
    console.log('📚 Seeding universities...')
    
    const universities = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'University of Amsterdam',
        slug: 'uva',
        branding: {
          primary_color: '#003082',
          logo_url: '/logos/uva.png',
          welcome_message: 'Find your perfect roommate at UvA!'
        },
        eligibility_domains: ['student.uva.nl', 'uva.nl'],
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Delft University of Technology',
        slug: 'tudelft',
        branding: {
          primary_color: '#00a6d6',
          logo_url: '/logos/tudelft.png',
          welcome_message: 'Connect with fellow TU Delft students!'
        },
        eligibility_domains: ['student.tudelft.nl', 'tudelft.nl'],
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Erasmus University Rotterdam',
        slug: 'eur',
        branding: {
          primary_color: '#003366',
          logo_url: '/logos/eur.png',
          welcome_message: 'Your next roommate is waiting at EUR!'
        },
        eligibility_domains: ['student.eur.nl', 'eur.nl'],
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Utrecht University',
        slug: 'uu',
        branding: {
          primary_color: '#003c71',
          logo_url: '/logos/uu.png',
          welcome_message: 'Join the UU community!'
        },
        eligibility_domains: ['student.uu.nl', 'uu.nl'],
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'Leiden University',
        slug: 'leiden',
        branding: {
          primary_color: '#c41230',
          logo_url: '/logos/leiden.png',
          welcome_message: 'Find your perfect match at Leiden!'
        },
        eligibility_domains: ['student.leiden.edu', 'leiden.edu'],
        is_active: true
      }
    ]

    for (const uni of universities) {
      const { error } = await supabase
        .from('universities')
        .upsert(uni, { onConflict: 'id', ignoreDuplicates: false })
      
      if (error) {
        console.warn(`   ⚠️  Warning seeding ${uni.name}:`, error.message)
      } else {
        console.log(`   ✓ ${uni.name}`)
      }
    }

    // ============================================
    // 2. SEED QUESTION ITEMS (Domain Config)
    // ============================================
    console.log('\n📝 Seeding questionnaire items...')
    
    const questionItems = [
      // Basics section
      { key: 'degree_level', section: 'basics', type: 'single', options: '["bachelor", "master", "phd", "exchange", "other"]', weight: 1.0, is_hard: true },
      { key: 'program', section: 'basics', type: 'text', options: null, weight: 1.0, is_hard: false },
      { key: 'campus', section: 'basics', type: 'text', options: null, weight: 1.0, is_hard: false },
      { key: 'move_in_window', section: 'basics', type: 'single', options: '["immediate", "within_month", "within_3_months", "flexible"]', weight: 1.0, is_hard: false },
      
      // Logistics section
      { key: 'budget_min', section: 'logistics', type: 'single', options: '["300", "400", "500", "600", "700", "800", "900", "1000"]', weight: 1.0, is_hard: true },
      { key: 'budget_max', section: 'logistics', type: 'single', options: '["400", "500", "600", "700", "800", "900", "1000", "1200", "1500"]', weight: 1.0, is_hard: true },
      { key: 'commute_max', section: 'logistics', type: 'single', options: '["15", "30", "45", "60", "90"]', weight: 1.0, is_hard: true },
      { key: 'lease_length', section: 'logistics', type: 'single', options: '["3_months", "6_months", "12_months", "flexible"]', weight: 1.0, is_hard: false },
      { key: 'room_type', section: 'logistics', type: 'multiple', options: '["single", "shared", "studio", "flexible"]', weight: 1.0, is_hard: false },
      
      // Lifestyle section
      { key: 'sleep_start', section: 'lifestyle', type: 'single', options: '["20", "21", "22", "23", "24", "1", "2"]', weight: 1.0, is_hard: false },
      { key: 'sleep_end', section: 'lifestyle', type: 'single', options: '["6", "7", "8", "9", "10", "11", "12"]', weight: 1.0, is_hard: false },
      { key: 'study_intensity', section: 'lifestyle', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: false },
      { key: 'cleanliness_room', section: 'lifestyle', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: false },
      { key: 'cleanliness_kitchen', section: 'lifestyle', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: false },
      { key: 'noise_tolerance', section: 'lifestyle', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: false },
      { key: 'guests_frequency', section: 'lifestyle', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: false },
      { key: 'parties_frequency', section: 'lifestyle', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: false },
      { key: 'chores_preference', section: 'lifestyle', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: false },
      { key: 'alcohol_at_home', section: 'lifestyle', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: false },
      { key: 'pets_tolerance', section: 'lifestyle', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: false },
      
      // Social section
      { key: 'social_level', section: 'social', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: false },
      { key: 'food_sharing', section: 'social', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: false },
      { key: 'utensils_sharing', section: 'social', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: false },
      
      // Personality section (Big Five)
      { key: 'extraversion', section: 'personality', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: false },
      { key: 'agreeableness', section: 'personality', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: false },
      { key: 'conscientiousness', section: 'personality', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: false },
      { key: 'neuroticism', section: 'personality', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: false },
      { key: 'openness', section: 'personality', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: false },
      
      // Communication section
      { key: 'conflict_style', section: 'communication', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: false },
      { key: 'communication_preference', section: 'communication', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: false },
      
      // Languages
      { key: 'languages_daily', section: 'languages', type: 'multiple', options: '["en", "nl", "de", "fr", "es", "other"]', weight: 1.0, is_hard: true },
      
      // Deal breakers
      { key: 'smoking', section: 'deal_breakers', type: 'boolean', options: null, weight: 1.0, is_hard: true },
      { key: 'pets_allowed', section: 'deal_breakers', type: 'boolean', options: null, weight: 1.0, is_hard: true },
      { key: 'parties_max', section: 'deal_breakers', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: true },
      { key: 'guests_max', section: 'deal_breakers', type: 'slider', options: '{"min": 0, "max": 10, "step": 1}', weight: 1.0, is_hard: true }
    ]

    for (const item of questionItems) {
      const { error } = await supabase
        .from('question_items')
        .upsert(item, { onConflict: 'key', ignoreDuplicates: false })
      
      if (error) {
        console.warn(`   ⚠️  Warning seeding ${item.key}:`, error.message)
      }
    }
    console.log(`   ✓ Seeded ${questionItems.length} question items`)

    // ============================================
    // 3. CREATE WHITELISTED DEMO USER
    // ============================================
    console.log('\n👤 Creating whitelisted demo user...')
    console.log(`   Email: ${DEMO_USER_EMAIL}`)
    console.log(`   Password: [REDACTED]`)
    
    // Check if demo user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('   ❌ Error listing users:', listError.message)
    } else {
      const demoUser = existingUsers.users.find(u => u.email?.toLowerCase() === DEMO_USER_EMAIL.toLowerCase())
      
      let demoUserId: string | undefined
      
      if (demoUser) {
        console.log(`   ✓ Demo user already exists (ID: ${demoUser.id})`)
        console.log('   → Skipping creation (idempotent)')
        demoUserId = demoUser.id
      } else {
        // Create the demo user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: DEMO_USER_EMAIL,
          password: DEMO_USER_PASSWORD,
          email_confirm: true,
          user_metadata: {
            full_name: 'Demo User'
          }
        })
        
        if (createError) {
          console.error('   ❌ Error creating demo user:', createError.message)
        } else {
          console.log(`   ✓ Demo user created successfully (ID: ${newUser.user?.id})`)
          demoUserId = newUser.user?.id
          
          // Create profile for demo user
          if (newUser.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                user_id: newUser.user.id,
                university_id: '550e8400-e29b-41d4-a716-446655440001', // UvA
                first_name: 'Demo',
                degree_level: 'bachelor',
                program: 'Computer Science',
                campus: 'Science Park',
                languages: ['en', 'nl'],
                verification_status: 'verified'
              })
            
            if (profileError) {
              console.warn('   ⚠️  Warning creating profile:', profileError.message)
            } else {
              console.log('   ✓ Demo user profile created')
            }
          }
        }
      }

      // Ensure verification record exists (for both new and existing users)
      if (demoUserId) {
        // Check if verification already exists
        const { data: existingVerification } = await supabase
          .from('verifications')
          .select('id')
          .eq('user_id', demoUserId)
          .eq('provider', 'persona')
          .maybeSingle()

        if (existingVerification) {
          // Update existing verification
          const { error: verificationError } = await supabase
            .from('verifications')
            .update({
              status: 'approved',
              provider_data: {
                inquiry_id: `demo-inquiry-${demoUserId}`,
                persona_status: 'approved',
                demo_account: true
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', existingVerification.id)
          
          if (verificationError) {
            console.warn('   ⚠️  Warning updating verification record:', verificationError.message)
          } else {
            console.log('   ✓ Demo user verification record updated (fully verified)')
          }
        } else {
          // Create new verification
          const { error: verificationError } = await supabase
            .from('verifications')
            .insert({
              user_id: demoUserId,
              provider: 'persona',
              provider_session_id: `demo-verification-${demoUserId}`,
              status: 'approved',
              provider_data: {
                inquiry_id: `demo-inquiry-${demoUserId}`,
                persona_status: 'approved',
                demo_account: true
              }
            })
          
          if (verificationError) {
            console.warn('   ⚠️  Warning creating verification record:', verificationError.message)
          } else {
            console.log('   ✓ Demo user verification record created (fully verified)')
          }
        }

        // Ensure onboarding submission exists (required for accessing chat and other features)
        const { error: onboardingError } = await supabase
          .from('onboarding_submissions')
          .upsert({
            user_id: demoUserId,
            completed_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          })
        
        if (onboardingError) {
          console.warn('   ⚠️  Warning creating onboarding submission:', onboardingError.message)
        } else {
          console.log('   ✓ Demo user onboarding submission created/updated')
        }
      }
    }

    console.log('\n✅ Production seed completed successfully!')
    console.log('\n📋 Summary:')
    console.log('   - Universities: Seeded/Updated')
    console.log('   - Question Items: Seeded/Updated')
    console.log(`   - Demo User: ${DEMO_USER_EMAIL}`)
    console.log('\n⚠️  NOTE: This is the ONLY demo account in the system.')
    console.log('   All other users must sign up through the application.')

  } catch (error) {
    console.error('\n❌ Seed failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  seedProduction().then(() => process.exit(0))
}

export { seedProduction }

