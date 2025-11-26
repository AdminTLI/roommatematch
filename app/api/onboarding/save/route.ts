import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SectionKey } from '@/types/questionnaire'
import { checkRateLimit, getUserRateLimitKey } from '@/lib/rate-limit'
import { trackEvent, EVENT_TYPES } from '@/lib/events'
import { extractSubmissionDataFromIntro, upsertProfileAndAcademic } from '@/lib/onboarding/submission'

type SaveBody = { section: SectionKey; answers: any[] }

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limiting: 100 requests per 15 minutes per user
  const rateLimitKey = getUserRateLimitKey('api', user.id)
  const rateLimitResult = await checkRateLimit('api', rateLimitKey)
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { 
        error: 'Too many requests',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        }
      }
    )
  }

  const body = (await request.json()) as SaveBody
  if (!body?.section || !Array.isArray(body?.answers)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // When the intro (academic) section is updated, resolve and save university_id before saving
  let answersToSave = [...body.answers]
  let resolvedUniversityId: string | undefined = undefined
  
  if (body.section === 'intro') {
    try {
      // Check if university_id is already in the answers
      const universityIdAnswer = answersToSave.find((a) => a.itemId === 'university_id')
      resolvedUniversityId = universityIdAnswer?.value
      
      // Only lookup if university_id is missing and we have an institution slug
      if ((!resolvedUniversityId || typeof resolvedUniversityId !== 'string' || resolvedUniversityId.trim() === '') && answersToSave) {
        const institutionAnswer = answersToSave.find((a) => a.itemId === 'institution_slug')
        const institutionSlug = typeof institutionAnswer?.value === 'string' ? institutionAnswer.value : ''

        if (institutionSlug && institutionSlug !== 'other') {
          // Use service role client to bypass RLS to avoid infinite recursion in admins policy
          const { createServiceClient } = await import('@/lib/supabase/service')
          const serviceSupabase = createServiceClient()
          
          // Try exact match first
          let { data: university } = await serviceSupabase
            .from('universities')
            .select('id, slug, name')
            .eq('slug', institutionSlug)
            .maybeSingle()

          if (!university) {
            // Try case-insensitive lookup as fallback
            const { data: universities } = await serviceSupabase
              .from('universities')
              .select('id, slug, name')
              .ilike('slug', institutionSlug)
              .limit(1)
            
            if (universities && universities.length > 0) {
              university = universities[0]
            }
          }

          if (university?.id) {
            resolvedUniversityId = university.id
            // Update the answers to include university_id
            const universityIdIndex = answersToSave.findIndex((a) => a.itemId === 'university_id')
            if (universityIdIndex >= 0) {
              answersToSave[universityIdIndex] = { itemId: 'university_id', value: resolvedUniversityId }
            } else {
              answersToSave.push({ itemId: 'university_id', value: resolvedUniversityId })
            }
            console.log('[Onboarding Save] Resolved university_id:', resolvedUniversityId, 'for slug:', institutionSlug)
          } else {
            console.warn('[Onboarding Save] University not found for slug:', institutionSlug)
          }
        }
      }
    } catch (lookupError) {
      console.error('[Onboarding Save] Error resolving university_id:', lookupError)
      // Continue with saving even if lookup fails
    }
  }

  // Save the section with potentially updated answers (including university_id)
  const { error } = await supabase
    .from('onboarding_sections')
    .upsert(
      {
        user_id: user.id,
        section: body.section,
        answers: answersToSave,
        version: 'rmq-v1',
      },
      { onConflict: 'user_id,section' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // When the intro (academic) section is updated, immediately sync user_academic/profile data
  if (body.section === 'intro') {
    try {
      const submissionData = extractSubmissionDataFromIntro(answersToSave, user)

      // Use university_id from answers (should be set above if it was missing)
      const universityIdAnswer = answersToSave.find((a) => a.itemId === 'university_id')
      let finalUniversityId = universityIdAnswer?.value || resolvedUniversityId || submissionData.university_id
      
      // Final validation - ensure we have a valid university_id
      if (!finalUniversityId || typeof finalUniversityId !== 'string' || finalUniversityId.trim() === '') {
        const institutionAnswer = answersToSave.find((a) => a.itemId === 'institution_slug')
        const institutionSlug = typeof institutionAnswer?.value === 'string' ? institutionAnswer.value : ''
        
        if (institutionSlug && institutionSlug !== 'other') {
          console.warn('[Onboarding Save] university_id still missing after lookup for slug:', institutionSlug)
        }
      }

      const hasRequiredFields =
        finalUniversityId &&
        typeof finalUniversityId === 'string' &&
        finalUniversityId.trim() !== '' &&
        submissionData.degree_level &&
        submissionData.degree_level.trim() !== '' &&
        submissionData.study_start_year

      if (hasRequiredFields) {
        // Use service role client for upsert to bypass RLS
        const { createServiceClient } = await import('@/lib/supabase/service')
        const serviceSupabase = createServiceClient()
        
        // Convert program_id from RIO code to UUID if needed (same logic as submit route)
        let programUUID: string | undefined = submissionData.program_id
        if (submissionData.program_id && typeof submissionData.program_id === 'string' && submissionData.program_id.trim() !== '') {
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(submissionData.program_id)
          
          if (!isUUID) {
            // Not a UUID, try RIO code lookup in programmes table
            console.log('[Onboarding Save] Looking up program - trying RIO code first:', submissionData.program_id)
            
            const { data: programme } = await serviceSupabase
              .from('programmes')
              .select('id, rio_code, croho_code, name, level, institution_slug')
              .eq('rio_code', submissionData.program_id)
              .maybeSingle()
            
            if (programme && programme.croho_code) {
              // Found in programmes table, now look up in programs table by CROHO code
              console.log('[Onboarding Save] Found programme by RIO code, looking up in programs table by CROHO:', programme.croho_code)
              const { data: programData } = await serviceSupabase
                .from('programs')
                .select('id')
                .eq('croho_code', programme.croho_code)
                .maybeSingle()
              
              if (programData?.id) {
                programUUID = programData.id
                console.log('[Onboarding Save] Found program UUID via programmes->programs lookup:', programUUID)
              } else {
                console.warn('[Onboarding Save] Programme found but no matching program in programs table by CROHO code')
                // Try to find by name, university, and level as fallback
                if (finalUniversityId && programme.level) {
                  const { data: programByName } = await serviceSupabase
                    .from('programs')
                    .select('id')
                    .eq('university_id', finalUniversityId)
                    .eq('degree_level', programme.level)
                    .ilike('name', programme.name)
                    .maybeSingle()
                  
                  if (programByName) {
                    programUUID = programByName.id
                    console.log('[Onboarding Save] Found program UUID via name/university/level match:', programUUID)
                  } else {
                    console.warn('[Onboarding Save] Could not find matching program, setting to undecided')
                    programUUID = undefined
                    submissionData.undecided_program = true
                  }
                } else {
                  programUUID = undefined
                  submissionData.undecided_program = true
                }
              }
            } else {
              // Not found in programmes table, try direct CROHO code lookup in programs table
              console.log('[Onboarding Save] Not found in programmes table, trying CROHO code lookup in programs table')
              const { data: programData } = await serviceSupabase
                .from('programs')
                .select('id')
                .eq('croho_code', submissionData.program_id)
                .maybeSingle()
              
              if (programData?.id) {
                programUUID = programData.id
                console.log('[Onboarding Save] Found program UUID by CROHO code:', programUUID)
              } else {
                console.warn('[Onboarding Save] Program not found by RIO or CROHO code, setting to undecided')
                programUUID = undefined
                submissionData.undecided_program = true
              }
            }
          }
        }
        
        try {
          await upsertProfileAndAcademic(serviceSupabase, {
            user_id: user.id,
            university_id: finalUniversityId,
            first_name: submissionData.first_name,
            degree_level: submissionData.degree_level,
            program_id: programUUID,
            program: submissionData.program,
            campus: submissionData.campus,
            languages_daily: [],
            study_start_year: submissionData.study_start_year,
            study_start_month: submissionData.study_start_month,
            expected_graduation_year: submissionData.expected_graduation_year,
            graduation_month: submissionData.graduation_month,
            programme_duration_months: submissionData.programme_duration_months,
            undecided_program: submissionData.undecided_program
          })
          console.log('[Onboarding Save] Successfully synced academic data to user_academic for user:', user.id)
        } catch (upsertError) {
          console.error('[Onboarding Save] Failed to upsert academic data:', upsertError)
          // Don't fail the save if upsert fails - user can still save and submit later
        }
      } else {
        console.warn('[Onboarding Save] Intro section saved without complete academic data, skipping immediate sync', {
          hasUniversityId: !!finalUniversityId && typeof finalUniversityId === 'string' && finalUniversityId.trim() !== '',
          hasDegreeLevel: !!submissionData.degree_level && submissionData.degree_level.trim() !== '',
          hasStudyStartYear: !!submissionData.study_start_year,
          finalUniversityId: finalUniversityId
        })
      }
    } catch (syncError) {
      console.error('[Onboarding Save] Failed to sync academic data from intro save', syncError)
    }
  }

  // Track section completion analytics
  try {
    await trackEvent(EVENT_TYPES.QUESTIONNAIRE_SECTION_COMPLETED, {
      section: body.section,
      answer_count: answersToSave.length,
      user_id: user.id
    }, user.id)
  } catch (analyticsError) {
    // Don't fail the save if analytics fails
    console.error('Failed to track analytics:', analyticsError)
  }

  // Automatically generate/update user vector when section is saved
  // This ensures vectors are up-to-date for matching
  try {
    await supabase.rpc('compute_user_vector_and_store', { p_user_id: user.id })
  } catch (vectorError) {
    // Don't fail the save if vector generation fails
    console.error('Failed to generate user vector:', vectorError)
  }

  const lastSavedAt = new Date().toISOString()
  return NextResponse.json({ lastSavedAt })
}
