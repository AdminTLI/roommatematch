#!/usr/bin/env tsx

/**
 * Demo User Seed Script
 * 
 * This script creates a complete demo user profile with all necessary data
 * for testing the full application flow.
 * 
 * Usage: npx tsx scripts/seed-demo-user.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Demo user data
const DEMO_USER_EMAIL = 'demo@account.com'
const DEMO_USER_PASSWORD = 'Testing123'

// University and program IDs (these should exist from the schema setup)
const UVA_ID = '550e8400-e29b-41d4-a716-446655440001'
const CS_PROGRAM_ID = '660e8400-e29b-41d4-a716-446655440001'

async function createDemoUser() {
  console.log('🚀 Starting demo user creation...')

  try {
    // 1. Create auth user
    console.log('📧 Creating auth user...')
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: DEMO_USER_EMAIL,
      password: DEMO_USER_PASSWORD,
      email_confirm: true
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ Demo user already exists, fetching...')
        const { data: existingUser } = await supabase.auth.admin.getUserByEmail(DEMO_USER_EMAIL)
        if (!existingUser.user) {
          throw new Error('Failed to fetch existing demo user')
        }
        var userId = existingUser.user.id
      } else {
        throw authError
      }
    } else {
      var userId = authUser.user!.id
      console.log('✅ Auth user created:', userId)
    }

    // 2. Create user record
    console.log('👤 Creating user record...')
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: DEMO_USER_EMAIL,
        is_active: true
      })

    if (userError) {
      console.log('⚠️  User record already exists or error:', userError.message)
    } else {
      console.log('✅ User record created')
    }

    // 3. Create profile
    console.log('👤 Creating profile...')
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        university_id: UVA_ID,
        first_name: 'Demo Student',
        last_name: 'User',
        degree_level: 'master',
        program: 'Computer Science',
        campus: 'Science Park',
        languages: ['en', 'nl'],
        verification_status: 'verified', // Mark as verified for demo
        minimal_public: true
      })

    if (profileError) {
      console.log('⚠️  Profile already exists or error:', profileError.message)
    } else {
      console.log('✅ Profile created')
    }

    // 3.5. Create verification record (fully verified with Persona)
    console.log('✅ Creating verification record...')
    // Check if verification already exists
    const { data: existingVerification } = await supabase
      .from('verifications')
      .select('id')
      .eq('user_id', userId)
      .eq('provider', 'persona')
      .maybeSingle()

    if (existingVerification) {
      // Update existing verification
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
        console.log('⚠️  Error updating verification record:', verificationError.message)
      } else {
        console.log('✅ Verification record updated (fully verified)')
      }
    } else {
      // Create new verification
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
        console.log('⚠️  Error creating verification record:', verificationError.message)
      } else {
        console.log('✅ Verification record created (fully verified)')
      }
    }

    // 4. Create academic record
    console.log('🎓 Creating academic record...')
    const { error: academicError } = await supabase
      .from('user_academic')
      .upsert({
        user_id: userId,
        university_id: UVA_ID,
        degree_level: 'master',
        program_id: CS_PROGRAM_ID,
        undecided_program: false,
        study_start_year: 2024
      })

    if (academicError) {
      console.log('⚠️  Academic record already exists or error:', academicError.message)
    } else {
      console.log('✅ Academic record created')
    }

    // 5. Create questionnaire responses
    console.log('📝 Creating questionnaire responses...')
    const responses = [
      // Basics
      { question_key: 'degree_level', value: 'master' },
      { question_key: 'program', value: 'Computer Science' },
      { question_key: 'campus', value: 'Science Park' },
      { question_key: 'move_in_window', value: 'within_month' },
      
      // Logistics
      { question_key: 'budget_min', value: 600 },
      { question_key: 'budget_max', value: 900 },
      { question_key: 'commute_max', value: 30 },
      { question_key: 'lease_length', value: '12_months' },
      { question_key: 'room_type', value: ['single', 'shared'] },
      
      // Lifestyle
      { question_key: 'sleep_start', value: 23 },
      { question_key: 'sleep_end', value: 8 },
      { question_key: 'study_intensity', value: 8 },
      { question_key: 'cleanliness_room', value: 8 },
      { question_key: 'cleanliness_kitchen', value: 7 },
      { question_key: 'noise_tolerance', value: 6 },
      { question_key: 'guests_frequency', value: 5 },
      { question_key: 'parties_frequency', value: 3 },
      { question_key: 'chores_preference', value: 7 },
      { question_key: 'alcohol_at_home', value: 4 },
      { question_key: 'pets_tolerance', value: 6 },
      
      // Social
      { question_key: 'social_level', value: 7 },
      { question_key: 'food_sharing', value: 5 },
      { question_key: 'utensils_sharing', value: 6 },
      
      // Personality (Big Five)
      { question_key: 'extraversion', value: 7 },
      { question_key: 'agreeableness', value: 8 },
      { question_key: 'conscientiousness', value: 8 },
      { question_key: 'neuroticism', value: 3 },
      { question_key: 'openness', value: 7 },
      
      // Communication
      { question_key: 'conflict_style', value: 6 },
      { question_key: 'communication_preference', value: 7 },
      
      // Languages
      { question_key: 'languages_daily', value: ['en', 'nl'] },
      
      // Deal breakers
      { question_key: 'smoking', value: false },
      { question_key: 'pets_allowed', value: true },
      { question_key: 'parties_max', value: 5 },
      { question_key: 'guests_max', value: 6 }
    ]

    // Clear existing responses
    await supabase
      .from('responses')
      .delete()
      .eq('user_id', userId)

    // Insert new responses
    const { error: responsesError } = await supabase
      .from('responses')
      .insert(responses.map(r => ({
        user_id: userId,
        question_key: r.question_key,
        value: r.value
      })))

    if (responsesError) {
      console.error('❌ Failed to create responses:', responsesError)
      throw responsesError
    } else {
      console.log('✅ Questionnaire responses created')
    }

    // 6. Create user vector
    console.log('🧮 Computing user vector...')
    const { error: vectorError } = await supabase
      .rpc('compute_user_vector_and_store', { p_user_id: userId })

    if (vectorError) {
      console.error('❌ Failed to create user vector:', vectorError)
      // Don't throw, as this might fail if question_items don't exist
    } else {
      console.log('✅ User vector created')
    }

    // 7. Create onboarding submission
    console.log('📋 Creating onboarding submission...')
    const { error: submissionError } = await supabase
      .from('onboarding_submissions')
      .upsert({
        user_id: userId,
        completed_at: new Date().toISOString()
      })

    if (submissionError) {
      console.log('⚠️  Onboarding submission already exists or error:', submissionError.message)
    } else {
      console.log('✅ Onboarding submission created')
    }

    // 8. Create housing preferences
    console.log('🏠 Creating housing preferences...')
    const { error: housingError } = await supabase
      .from('user_housing_preferences')
      .upsert({
        user_id: userId,
        preferred_cities: ['Amsterdam', 'Amstelveen'],
        max_commute_minutes: 30,
        near_university: true,
        preferred_property_types: ['apartment', 'studio'],
        preferred_room_type: 'shared',
        min_square_meters: 12,
        max_square_meters: 25,
        max_rent_monthly: 900.00,
        utilities_preference: 'included',
        required_amenities: ['wifi', 'heating', 'washing_machine'],
        preferred_amenities: ['balcony', 'parking', 'dishwasher'],
        pet_friendly_required: true,
        smoking_preference: 'no_smoking',
        min_stay_months: 12,
        max_stay_months: 24,
        move_in_flexibility_days: 30,
        prefer_matched_roommates: true,
        max_roommates: 2,
        gender_preference: 'any'
      })

    if (housingError) {
      console.log('⚠️  Housing preferences already exist or error:', housingError.message)
    } else {
      console.log('✅ Housing preferences created')
    }

    // 9. Create some sample matches (optional)
    console.log('💕 Creating sample matches...')
    
    // First, create some other demo users for matching
    const otherUsers = [
      {
        email: 'demo2@account.com',
        name: 'Alex Johnson',
        program: 'Psychology',
        responses: [
          { question_key: 'social_level', value: 6 },
          { question_key: 'cleanliness_room', value: 7 },
          { question_key: 'sleep_start', value: 22 },
          { question_key: 'sleep_end', value: 7 }
        ]
      },
      {
        email: 'demo3@account.com', 
        name: 'Sam Chen',
        program: 'Biology',
        responses: [
          { question_key: 'social_level', value: 8 },
          { question_key: 'cleanliness_room', value: 9 },
          { question_key: 'sleep_start', value: 24 },
          { question_key: 'sleep_end', value: 9 }
        ]
      }
    ]

    for (const otherUser of otherUsers) {
      // Create other demo users (simplified)
      const { data: otherAuthUser } = await supabase.auth.admin.createUser({
        email: otherUser.email,
        password: DEMO_USER_PASSWORD,
        email_confirm: true
      })

      if (otherAuthUser.user) {
        const otherUserId = otherAuthUser.user.id

        // Create basic profile
        await supabase.from('profiles').upsert({
          user_id: otherUserId,
          university_id: UVA_ID,
          first_name: otherUser.name,
          degree_level: 'master',
          program: otherUser.program,
          campus: 'Science Park',
          verification_status: 'verified'
        })

        // Create academic record
        await supabase.from('user_academic').upsert({
          user_id: otherUserId,
          university_id: UVA_ID,
          degree_level: 'master',
          study_start_year: 2024
        })

        // Create responses
        await supabase.from('responses').insert(
          otherUser.responses.map(r => ({
            user_id: otherUserId,
            question_key: r.question_key,
            value: r.value
          }))
        )

        // Create match
        await supabase.from('matches').upsert({
          a_user: userId,
          b_user: otherUserId,
          score: 0.85,
          explanation: {
            compatibility: 'high',
            reasons: ['same_university', 'similar_cleanliness', 'compatible_schedule']
          },
          status: 'pending'
        })
      }
    }

    console.log('✅ Sample matches created')

    // 10. Create sample chat
    console.log('💬 Creating sample chat...')
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert({
        is_group: false,
        created_by: userId
      })
      .select()
      .single()

    if (chat && !chatError) {
      // Add demo user to chat
      await supabase.from('chat_members').insert({
        chat_id: chat.id,
        user_id: userId
      })

      // Add some sample messages
      await supabase.from('messages').insert([
        {
          chat_id: chat.id,
          user_id: userId,
          content: 'Hi! I saw we were matched as potential roommates. How are you?'
        },
        {
          chat_id: chat.id,
          user_id: userId,
          content: 'I\'m looking for a place near Science Park. What about you?'
        }
      ])

      console.log('✅ Sample chat created')
    }

    console.log('🎉 Demo user setup completed successfully!')
    console.log('')
    console.log('📧 Email:', DEMO_USER_EMAIL)
    console.log('🔑 Password:', DEMO_USER_PASSWORD)
    console.log('🆔 User ID:', userId)
    console.log('')
    console.log('You can now test the full application flow with this demo account.')

  } catch (error) {
    console.error('❌ Demo user creation failed:', error)
    process.exit(1)
  }
}

// Run the script
createDemoUser()
