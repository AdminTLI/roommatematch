// Supabase implementation of MatchRepo
// Handles all database operations for the matching system

// SECURITY NOTE: This repository uses the admin/service-role client to bypass RLS.
// This is safe because:
// 1. All methods are only called from server-side API routes that authenticate users
// 2. Results are filtered before returning to clients (e.g., listSuggestionsForUser filters by userId)
// 3. Blocklists are checked server-side and never exposed to clients
// 4. Matching requires cross-user access to find eligible candidates and create suggestions
// The admin client is necessary because matching operations need to:
// - Query all eligible users across the platform (not just current user)
// - Write match suggestions/records to central tables
// - Check blocklists for both users in a pair
// - Update match status across multiple user records

import { createAdminClient } from '@/lib/supabase/server'
import type { MatchRepo, CohortFilter, MatchRecord, Candidate, MatchRun } from './repo'
import type { MatchSuggestion } from './types'
import { isEligibleForMatching } from './completeness'
import { safeLogger } from '@/lib/utils/logger'

export class SupabaseMatchRepo implements MatchRepo {
  private async getSupabase() {
    // Use admin client to bypass RLS for matching operations
    // This allows cross-user queries and writes needed for the matching system
    return await createAdminClient()
  }

  async getCandidateByUserId(userId: string): Promise<Candidate | null> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        profiles!inner(
          first_name,
          university_id,
          degree_level,
          campus,
          verification_status
        ),
        user_academic!inner(
          university_id,
          degree_level,
          program_id,
          undecided_program,
          study_start_year,
          study_start_month,
          expected_graduation_year,
          graduation_month
        ),
        responses(
          question_key,
          value
        ),
        user_vectors(
          vector
        )
      `)
      .eq('id', userId)
      .single()

    if (error || !data) {
      safeLogger.error('Error fetching candidate by user ID', error)
      return null
    }

    // Build answers object from responses
    let answers: Record<string, any> = data.responses?.reduce((acc: Record<string, any>, r: any) => {
      acc[r.question_key] = r.value
      return acc
    }, {}) || {}

    // If responses are missing or incomplete, also check onboarding_sections as fallback
    // This handles cases where users have saved but not yet submitted, or where submission
    // didn't properly write to responses table
    if (!data.responses || data.responses.length === 0) {
      safeLogger.debug('[getCandidateByUserId] No responses found, checking onboarding_sections', { userId })
      const { data: sections } = await supabase
        .from('onboarding_sections')
        .select('section, answers')
        .eq('user_id', userId)

      if (sections && sections.length > 0) {
        safeLogger.debug('[getCandidateByUserId] Found onboarding_sections', {
          sectionCount: sections.length,
          sections: sections.map(s => s.section)
        })
        // Transform answers from onboarding_sections format to responses format
        const { transformAnswer } = await import('@/lib/question-key-mapping')
        let transformedCount = 0
        for (const section of sections) {
          if (section.answers && Array.isArray(section.answers)) {
            for (const answer of section.answers) {
              const transformed = transformAnswer(answer)
              if (transformed) {
                answers[transformed.question_key] = transformed.value
                transformedCount++
              }
            }
          }
        }
        safeLogger.debug('[getCandidateByUserId] Transformed answers from onboarding_sections', {
          transformedCount,
          answerKeys: Object.keys(answers).length
        })
      } else {
        safeLogger.debug('[getCandidateByUserId] No onboarding_sections found either', { userId })
      }
    }

    // Normalize answers: enrich with data from profiles/user_academic where applicable
    // Some required fields may be stored in profile tables rather than responses
    const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
    const academic = Array.isArray(data.user_academic) ? data.user_academic[0] : data.user_academic

    // Map profile/academic fields to question keys if missing in responses
    if (!answers.degree_level) {
      answers.degree_level = academic?.degree_level || profile?.degree_level
    }
    if (!answers.campus || answers.campus === '') {
      answers.campus = profile?.campus || null // Use null instead of empty string
    }
    if (!answers.program) {
      // Handle undecided program case - use "undecided" as value
      if (academic?.undecided_program) {
        answers.program = 'undecided'
      } else if (academic?.program_id) {
        answers.program = academic.program_id
      }
    }

    // Apply defaults for fields used in matching engine (matching engine has defaults for these)
    // This prevents users from being excluded if they have core compatibility data
    if (!answers.study_intensity) {
      answers.study_intensity = 5 // Default from toEngineProfile
    }
    if (!answers.pets_tolerance) {
      answers.pets_tolerance = 5 // Reasonable default
    }
    if (!answers.food_sharing) {
      answers.food_sharing = 'sometimes' // Reasonable default
    }
    if (!answers.utensils_sharing) {
      answers.utensils_sharing = 'sometimes' // Reasonable default
    }
    if (!answers.parties_max) {
      answers.parties_max = 2 // Reasonable default (2 per month)
    }
    if (!answers.guests_max) {
      answers.guests_max = 4 // Reasonable default (4 per month)
    }

    safeLogger.debug('[DEBUG] getCandidateByUserId - User responses', {
      answersCount: Object.keys(answers).length,
      answerKeys: Object.keys(answers).sort(),
      hasDegreeLevel: !!answers.degree_level,
      hasCampus: !!answers.campus,
      hasProgram: !!answers.program
    })

    const eligible = await isEligibleForMatching(answers)
    if (!eligible) {
      const { getMissingFields } = await import('./completeness')
      const missing = getMissingFields(answers)
      safeLogger.debug('[DEBUG] User not eligible - missing fields', {
        missingCount: missing.length,
        missingFields: missing
      })
      return null
    }

    // Transform to Candidate format
    const academicData = Array.isArray(data.user_academic) ? data.user_academic[0] : data.user_academic
    const profileData = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles

    return {
      id: data.id,
      email: data.email,
      firstName: profileData?.first_name || 'User',
      universityId: profileData?.university_id,
      degreeLevel: profileData?.degree_level,
      programmeId: academicData?.program_id,
      campusCity: profileData?.campus,
      answers,
      vector: data.user_vectors?.[0]?.vector,
      createdAt: new Date().toISOString()
    }
  }

  async loadCandidates(filter: CohortFilter): Promise<Candidate[]> {
    const supabase = await this.getSupabase()

    // Debug logging for filter analysis
    safeLogger.debug('[DEBUG] loadCandidates - Filter input', {
      campusCity: filter.campusCity,
      institutionId: filter.institutionId,
      degreeLevel: filter.degreeLevel,
      programmeId: filter.programmeId,
      onlyActive: filter.onlyActive,
      excludeAlreadyMatched: filter.excludeAlreadyMatched,
      excludeUserIds: filter.excludeUserIds,
      limit: filter.limit
    })

    // Build query for users with their onboarding data
    // Note: Using LEFT joins instead of INNER to handle cases where users might not have profiles/academic yet
    // We'll filter out invalid users later in the transformation step
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        profiles(
          first_name,
          university_id,
          degree_level,
          campus,
          verification_status
        ),
        user_academic(
          university_id,
          degree_level,
          program_id,
          undecided_program,
          study_start_year,
          study_start_month,
          expected_graduation_year,
          graduation_month
        ),
        responses(
          question_key,
          value
        ),
        user_vectors(
          vector
        )
      `)

    // Apply filters
    if (filter.campusCity) {
      query = query.eq('profiles.campus', filter.campusCity)
      safeLogger.debug('[DEBUG] loadCandidates - Applied campusCity filter')
    }

    if (filter.institutionId) {
      query = query.eq('user_academic.university_id', filter.institutionId)
      safeLogger.debug('[DEBUG] loadCandidates - Applied institutionId filter')
    }

    if (filter.degreeLevel) {
      query = query.eq('user_academic.degree_level', filter.degreeLevel)
      safeLogger.debug('[DEBUG] loadCandidates - Applied degreeLevel filter')
    }

    if (filter.programmeId) {
      query = query.eq('user_academic.program_id', filter.programmeId)
      safeLogger.debug('[DEBUG] loadCandidates - Applied programmeId filter')
    }

    if (filter.graduationYearFrom) {
      query = query.gte('user_academic.study_start_year', filter.graduationYearFrom)
    }

    if (filter.graduationYearTo) {
      query = query.lte('user_academic.study_start_year', filter.graduationYearTo)
    }

    if (filter.onlyActive) {
      query = query.eq('profiles.verification_status', 'verified')
      safeLogger.debug('[DEBUG] loadCandidates - Applied onlyActive filter (verified only)')
    } else {
      safeLogger.debug('[DEBUG] loadCandidates - onlyActive is false, including unverified users')
    }

    if (filter.excludeUserIds?.length) {
      query = query.not('id', 'in', `(${filter.excludeUserIds.join(',')})`)
      safeLogger.debug('[DEBUG] loadCandidates - Excluding user IDs', { count: filter.excludeUserIds?.length || 0 })
    }

    // Note: Email verification is checked via profiles.verification_status
    // email_confirmed_at is in auth.users table and not accessible here

    if (filter.limit) {
      query = query.limit(filter.limit)
    }

    const { data, error } = await query

    if (error) {
      safeLogger.error('[DEBUG] loadCandidates - Query error', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw new Error(`Failed to load candidates: ${error.message}`)
    }

    safeLogger.debug('[DEBUG] loadCandidates - Raw query results', {
      count: data?.length || 0
    })

    // If joins didn't return academic/profile data, fetch them separately
    // This can happen if Supabase relationship resolution isn't working correctly
    const usersMissingAcademic = (data || []).filter((u: any) => !u.user_academic?.[0]).map((u: any) => u.id)
    const usersMissingProfile = (data || []).filter((u: any) => !u.profiles?.[0]).map((u: any) => u.id)

    // Fetch missing academic data in parallel
    let academicDataMap = new Map<string, any>()
    if (usersMissingAcademic.length > 0) {
      safeLogger.debug(`[DEBUG] loadCandidates - Fetching missing academic data for ${usersMissingAcademic.length} users`)
      const adminClient = await this.getSupabase()
      const { data: academicData, error: academicError } = await adminClient
        .from('user_academic')
        .select('user_id, university_id, degree_level, program_id, undecided_program, study_start_year, study_start_month, expected_graduation_year, graduation_month')
        .in('user_id', usersMissingAcademic)

      if (!academicError && academicData) {
        academicData.forEach((a: any) => academicDataMap.set(a.user_id, a))
        safeLogger.debug(`[DEBUG] loadCandidates - Fetched ${academicData.length} academic records`)
      }
    }

    // Fetch missing profile data in parallel
    let profileDataMap = new Map<string, any>()
    if (usersMissingProfile.length > 0) {
      safeLogger.debug(`[DEBUG] loadCandidates - Fetching missing profile data for ${usersMissingProfile.length} users`)
      const adminClient = await this.getSupabase()
      const { data: profileData, error: profileError } = await adminClient
        .from('profiles')
        .select('user_id, first_name, university_id, degree_level, campus, verification_status')
        .in('user_id', usersMissingProfile)

      if (!profileError && profileData) {
        profileData.forEach((p: any) => profileDataMap.set(p.user_id, p))
        safeLogger.debug(`[DEBUG] loadCandidates - Fetched ${profileData.length} profile records`)
      }
    }

    // Fetch missing vector data in parallel
    // Check which users don't have vectors from the join
    const usersMissingVector = (data || []).filter((u: any) => !u.user_vectors?.[0]?.vector).map((u: any) => u.id)
    let vectorDataMap = new Map<string, any>()
    if (usersMissingVector.length > 0) {
      safeLogger.debug(`[DEBUG] loadCandidates - Fetching missing vector data for ${usersMissingVector.length} users`)
      const adminClient = await this.getSupabase()
      const { data: vectorData, error: vectorError } = await adminClient
        .from('user_vectors')
        .select('user_id, vector')
        .in('user_id', usersMissingVector)

      if (!vectorError && vectorData) {
        vectorData.forEach((v: any) => vectorDataMap.set(v.user_id, v.vector))
        safeLogger.debug(`[DEBUG] loadCandidates - Fetched ${vectorData.length} vector records`)
      }
    }

    // Transform the data into Candidate format
    const transformedCandidates = (data || [])
      .map((user: any) => {
        // Try to get profile/academic/vector from join result first, then fallback to separate fetch
        let profile = user.profiles?.[0] || profileDataMap.get(user.id)
        let academic = user.user_academic?.[0] || academicDataMap.get(user.id)
        const responses = user.responses || []
        const vector = user.user_vectors?.[0]?.vector || vectorDataMap.get(user.id)

        // Convert responses array to answers object
        const answers = responses.reduce((acc: Record<string, any>, response: any) => {
          acc[response.question_key] = response.value
          return acc
        }, {})

        // Log pre-normalization state to diagnose issues (no PII)
        safeLogger.debug('[DEBUG] loadCandidates - Pre-normalization', {
          hasAcademic: !!academic,
          hasProfile: !!profile,
          hasDegreeLevel: !!academic?.degree_level || !!profile?.degree_level,
          hasProgram: !!academic?.program_id || !!academic?.undecided_program,
          hasCampus: !!profile?.campus,
          answersBeforeNorm: {
            hasDegreeLevel: !!answers.degree_level,
            hasProgram: !!answers.program,
            hasCampus: !!answers.campus
          }
        })

        // Normalize answers: enrich with data from profiles/user_academic where applicable
        // Some required fields may be stored in profile tables rather than responses
        if (!answers.degree_level) {
          answers.degree_level = academic?.degree_level || profile?.degree_level
          if (answers.degree_level) {
            safeLogger.debug('[DEBUG] Normalized degree_level')
          }
        }
        if (!answers.campus || answers.campus === '') {
          answers.campus = profile?.campus || null // Use null instead of empty string
          if (answers.campus) {
            safeLogger.debug('[DEBUG] Normalized campus')
          }
        }
        if (!answers.program) {
          // Handle undecided program case - use "undecided" as value
          if (academic?.undecided_program) {
            answers.program = 'undecided'
            safeLogger.debug('[DEBUG] Set program to undecided')
          } else if (academic?.program_id) {
            answers.program = academic.program_id
            safeLogger.debug('[DEBUG] Normalized program')
          }
        }

        // Log post-normalization state (no PII)
        safeLogger.debug('[DEBUG] loadCandidates - Post-normalization', {
          answersAfterNorm: {
            hasDegreeLevel: !!answers.degree_level,
            hasProgram: !!answers.program,
            hasCampus: !!answers.campus,
            hasStudyIntensity: !!answers.study_intensity
          }
        })

        // Apply defaults for fields used in matching engine (matching engine has defaults for these)
        // This prevents users from being excluded if they have core compatibility data
        if (!answers.study_intensity) {
          answers.study_intensity = 5 // Default from toEngineProfile
        }
        if (!answers.pets_tolerance) {
          answers.pets_tolerance = 5 // Reasonable default
        }
        if (!answers.food_sharing) {
          answers.food_sharing = 'sometimes' // Reasonable default
        }
        if (!answers.utensils_sharing) {
          answers.utensils_sharing = 'sometimes' // Reasonable default
        }
        if (!answers.parties_max) {
          answers.parties_max = 2 // Reasonable default (2 per month)
        }
        if (!answers.guests_max) {
          answers.guests_max = 4 // Reasonable default (4 per month)
        }

        return {
          id: user.id,
          email: user.email,
          firstName: profile?.first_name || '',
          universityId: academic?.university_id,
          degreeLevel: academic?.degree_level,
          programmeId: academic?.program_id,
          campusCity: profile?.campus,
          graduationYear: academic?.study_start_year,
          answers,
          vector,
          isMatched: false, // TODO: Check if user is already matched
          createdAt: new Date().toISOString()
        }
      })

    safeLogger.debug('[DEBUG] loadCandidates - After transformation', {
      transformedCount: transformedCandidates.length
    })

    // First pass: filter by eligibility
    const eligibleCandidates = transformedCandidates.filter(candidate => {
      // Filter out users without complete responses
      const eligible = isEligibleForMatching(candidate.answers)
      if (!eligible) {
        const { getMissingFields } = require('./completeness')
        const missing = getMissingFields(candidate.answers)
        safeLogger.debug('[DEBUG] loadCandidates - Candidate not eligible', {
          missingFieldsCount: missing.length,
          missingFields: missing,
          hasVector: !!candidate.vector
        })
        return false
      }
      return true
    })

    // Auto-generate missing vectors for eligible candidates
    const candidatesMissingVectors = eligibleCandidates.filter(c => !c.vector)
    if (candidatesMissingVectors.length > 0) {
      safeLogger.debug(`[DEBUG] loadCandidates - Auto-generating ${candidatesMissingVectors.length} missing vectors...`)
      const supabase = await this.getSupabase()

      // Generate vectors in parallel
      const vectorPromises = candidatesMissingVectors.map(async (candidate) => {
        try {
          const { error } = await supabase.rpc('compute_user_vector_and_store', {
            p_user_id: candidate.id
          })
          if (error) {
            safeLogger.error(`[DEBUG] Failed to generate vector`, error)
            return null
          }
          return candidate.id
        } catch (err) {
          safeLogger.error(`[DEBUG] Error generating vector`, err)
          return null
        }
      })

      const generatedUserIds = (await Promise.all(vectorPromises)).filter(id => id !== null)
      safeLogger.debug(`[DEBUG] Generated ${generatedUserIds.length} vectors successfully`)

      // Refetch vectors for users we just generated
      if (generatedUserIds.length > 0) {
        const { data: newVectors, error: vectorError } = await supabase
          .from('user_vectors')
          .select('user_id, vector')
          .in('user_id', generatedUserIds)

        if (!vectorError && newVectors) {
          const vectorMap = new Map(newVectors.map(v => [v.user_id, v.vector]))

          // Update candidates with newly generated vectors
          eligibleCandidates.forEach(candidate => {
            if (vectorMap.has(candidate.id)) {
              candidate.vector = vectorMap.get(candidate.id)
            }
          })
        }
      }
    }

    // Filter: only return candidates with vectors
    const candidatesWithVectors = eligibleCandidates.filter(candidate => {
      if (!candidate.vector) {
        safeLogger.debug('[DEBUG] loadCandidates - Candidate still missing vector after generation')
        return false
      }
      return true
    })

    // Filter: exclude already-matched users if requested
    let finalCandidates = candidatesWithVectors
    if (filter.excludeAlreadyMatched) {
      safeLogger.debug('[DEBUG] loadCandidates - Excluding already-matched users')
      
      // Get list of user IDs that are already matched
      // A user is considered "matched" if they have:
      // 1. A locked match_record (confirmed match from old system), OR
      // 2. A confirmed match_suggestion (confirmed match from new system)
      const candidateIds = candidatesWithVectors.map(c => c.id)
      
      if (candidateIds.length > 0) {
        try {
          // Check for locked match_records
          const { data: lockedMatches, error: lockedError } = await supabase
            .from('match_records')
            .select('user_ids')
            .eq('locked', true)
            .limit(1000) // Reasonable limit
          
          const matchedUserIdsFromRecords = new Set<string>()
          if (!lockedError && lockedMatches) {
            lockedMatches.forEach((match: any) => {
              if (match.user_ids && Array.isArray(match.user_ids)) {
                match.user_ids.forEach((userId: string) => matchedUserIdsFromRecords.add(userId))
              }
            })
          }
          
          // Check for confirmed match_suggestions
          // We need to check if any candidate ID is in any confirmed suggestion's member_ids
          // This is tricky with Supabase, so we'll fetch all confirmed pair suggestions
          // and filter in code (there shouldn't be too many)
          const { data: confirmedSuggestions, error: confirmedError } = await supabase
            .from('match_suggestions')
            .select('member_ids, accepted_by')
            .eq('status', 'confirmed')
            .eq('kind', 'pair')
            .limit(1000) // Reasonable limit
          
          const matchedUserIdsFromSuggestions = new Set<string>()
          if (!confirmedError && confirmedSuggestions) {
            const candidateIdsSet = new Set(candidateIds)
            confirmedSuggestions.forEach((suggestion: any) => {
              if (suggestion.member_ids && Array.isArray(suggestion.member_ids)) {
                // Only mark as matched if all members have accepted
                if (suggestion.accepted_by && 
                    Array.isArray(suggestion.accepted_by) &&
                    suggestion.accepted_by.length === suggestion.member_ids.length) {
                  // Only include users that are in our candidate list
                  suggestion.member_ids.forEach((userId: string) => {
                    if (candidateIdsSet.has(userId)) {
                      matchedUserIdsFromSuggestions.add(userId)
                    }
                  })
                }
              }
            })
          }
          
          // Combine both sets (only for users in our candidate list)
          const candidateIdsSet = new Set(candidateIds)
          const allMatchedUserIds = new Set<string>()
          matchedUserIdsFromRecords.forEach(id => {
            if (candidateIdsSet.has(id)) allMatchedUserIds.add(id)
          })
          matchedUserIdsFromSuggestions.forEach(id => {
            if (candidateIdsSet.has(id)) allMatchedUserIds.add(id)
          })
          
          // Filter out matched users
          const beforeCount = finalCandidates.length
          finalCandidates = finalCandidates.filter(candidate => !allMatchedUserIds.has(candidate.id))
          const excludedCount = beforeCount - finalCandidates.length
          
          safeLogger.debug('[DEBUG] loadCandidates - Excluded already-matched users', {
            matchedFromRecords: matchedUserIdsFromRecords.size,
            matchedFromSuggestions: matchedUserIdsFromSuggestions.size,
            totalMatched: allMatchedUserIds.size,
            excluded: excludedCount,
            remaining: finalCandidates.length
          })
        } catch (excludeError) {
          safeLogger.error('[DEBUG] loadCandidates - Error excluding already-matched users', {
            error: excludeError
          })
          // Continue without exclusion if error occurs (fail gracefully)
        }
      }
    }

    safeLogger.debug('[DEBUG] loadCandidates - Final eligible candidates', {
      eligibleCount: finalCandidates.length,
      filteredOut: transformedCandidates.length - finalCandidates.length
    })

    return finalCandidates
  }

  async saveMatchRun(run: Omit<MatchRun, 'id' | 'createdAt'>): Promise<void> {
    const supabase = await this.getSupabase()
    const { error } = await supabase
      .from('match_runs')
      .insert({
        run_id: run.runId,
        mode: run.mode,
        cohort_filter: run.cohortFilter,
        match_count: run.matchCount
      })

    if (error) {
      throw new Error(`Failed to save match run: ${error.message}`)
    }
  }

  async getMatchRun(runId: string): Promise<MatchRun | null> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('match_runs')
      .select('*')
      .eq('run_id', runId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to get match run: ${error.message}`)
    }

    return {
      id: data.id,
      runId: data.run_id,
      mode: data.mode,
      cohortFilter: data.cohort_filter,
      matchCount: data.match_count,
      createdAt: data.created_at
    }
  }

  async listMatchRuns(limit = 50): Promise<MatchRun[]> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('match_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to list match runs: ${error.message}`)
    }

    return (data || []).map((run: any) => ({
      id: run.id,
      runId: run.run_id,
      mode: run.mode,
      cohortFilter: run.cohort_filter,
      matchCount: run.match_count,
      createdAt: run.created_at
    }))
  }

  async saveMatches(matches: MatchRecord[]): Promise<void> {
    const records = matches.map(match => ({
      run_id: match.runId,
      kind: match.kind,
      user_ids: match.kind === 'pair' ? [match.aId, match.bId] : match.memberIds,
      fit_score: match.kind === 'pair' ? match.fit : match.avgFit,
      fit_index: match.fitIndex,
      section_scores: match.kind === 'pair' ? match.sectionScores : null,
      reasons: match.kind === 'pair' ? match.reasons : [],
      locked: match.locked
    }))

    const supabase = await this.getSupabase()
    const { error } = await supabase
      .from('match_records')
      .insert(records)

    if (error) {
      throw new Error(`Failed to save matches: ${error.message}`)
    }
  }

  async listMatches(runId?: string, locked?: boolean): Promise<MatchRecord[]> {
    const supabase = await this.getSupabase()
    let query = supabase
      .from('match_records')
      .select('*')
      .order('fit_score', { ascending: false })

    if (runId) {
      query = query.eq('run_id', runId)
    }

    if (locked !== undefined) {
      query = query.eq('locked', locked)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to list matches: ${error.message}`)
    }

    return (data || []).map((record: any) => {
      if (record.kind === 'pair') {
        return {
          kind: 'pair',
          aId: record.user_ids[0],
          bId: record.user_ids[1],
          fit: record.fit_score,
          fitIndex: record.fit_index,
          sectionScores: record.section_scores || {},
          reasons: record.reasons || [],
          runId: record.run_id,
          locked: record.locked,
          createdAt: record.created_at
        }
      } else {
        return {
          kind: 'group',
          memberIds: record.user_ids,
          avgFit: record.fit_score,
          fitIndex: record.fit_index,
          runId: record.run_id,
          locked: record.locked,
          createdAt: record.created_at
        }
      }
    })
  }

  async lockMatch(ids: string[], runId: string): Promise<void> {
    const supabase = await this.getSupabase()
    const { error } = await supabase
      .from('match_records')
      .update({ locked: true })
      .in('user_ids', ids)
      .eq('run_id', runId)

    if (error) {
      throw new Error(`Failed to lock match: ${error.message}`)
    }
  }

  async markUsersMatched(userIds: string[], runId: string): Promise<void> {
    // Mark users as matched in the profiles table or a separate matched_users table
    // For now, we'll use a simple approach by updating a field in profiles
    const supabase = await this.getSupabase()
    const { error } = await supabase
      .from('profiles')
      .update({
        // Add a field to track if user is matched
        // This could be a JSONB field with match info
        updated_at: new Date().toISOString()
      })
      .in('user_id', userIds)

    if (error) {
      throw new Error(`Failed to mark users as matched: ${error.message}`)
    }
  }

  async isUserMatched(userId: string): Promise<boolean> {
    // Check if user is already in a locked match or has a confirmed match_suggestion
    const supabase = await this.getSupabase()
    
    // Check for locked match_records
    const { data: lockedMatches, error: lockedError } = await supabase
      .from('match_records')
      .select('id')
      .contains('user_ids', [userId])
      .eq('locked', true)
      .limit(1)

    if (lockedError) {
      throw new Error(`Failed to check if user is matched (locked matches): ${lockedError.message}`)
    }

    if (lockedMatches && lockedMatches.length > 0) {
      return true
    }

    // Check for confirmed match_suggestions where all members have accepted
    const { data: confirmedSuggestions, error: confirmedError } = await supabase
      .from('match_suggestions')
      .select('id, member_ids, accepted_by')
      .eq('status', 'confirmed')
      .eq('kind', 'pair')
      .contains('member_ids', [userId])
      .limit(1)

    if (confirmedError) {
      throw new Error(`Failed to check if user is matched (confirmed suggestions): ${confirmedError.message}`)
    }

    if (confirmedSuggestions && confirmedSuggestions.length > 0) {
      // Verify that all members have accepted
      const suggestion = confirmedSuggestions[0]
      if (suggestion.accepted_by && 
          Array.isArray(suggestion.accepted_by) &&
          suggestion.member_ids &&
          Array.isArray(suggestion.member_ids) &&
          suggestion.accepted_by.length === suggestion.member_ids.length) {
        return true
      }
    }

    return false
  }

  // Suggestions (student flow)
  async createSuggestions(sugs: MatchSuggestion[]): Promise<void> {
    if (sugs.length === 0) {
      safeLogger.debug('[DEBUG] createSuggestions - No suggestions to create')
      return
    }

    const records = sugs.map(sug => ({
      id: sug.id,
      run_id: sug.runId,
      kind: sug.kind,
      member_ids: sug.memberIds,
      fit_score: sug.fitIndex / 100,
      fit_index: sug.fitIndex,
      section_scores: sug.sectionScores,
      reasons: sug.reasons,
      personalized_explanation: sug.personalizedExplanation,
      expires_at: sug.expiresAt,
      status: sug.status,
      accepted_by: sug.acceptedBy,
      created_at: sug.createdAt
    }))

    safeLogger.debug(`[DEBUG] createSuggestions - Inserting ${records.length} suggestions`, {
      count: records.length
    })

    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('match_suggestions')
      .insert(records)
      .select()

    if (error) {
      safeLogger.error('[DEBUG] createSuggestions - Error details', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        records: records.map(r => ({ id: r.id, member_ids: r.member_ids }))
      })
      throw new Error(`Failed to create suggestions: ${error.message}`)
    }

    safeLogger.debug(`[DEBUG] createSuggestions - Successfully created ${data?.length || 0} suggestions`)
  }

  async listSuggestionsForUser(userId: string, includeExpired = false, limit?: number, offset?: number): Promise<MatchSuggestion[]> {
    // SECURITY: This method uses admin client but filters results by userId parameter
    // which is passed from authenticated API routes. Users can only see suggestions
    // that include their own userId in memberIds array.
    // Use server-side deduplication function for efficiency
    const supabase = await this.getSupabase()

    // Try to use the deduplication function if available, fallback to client-side dedupe
    try {
      const { data, error } = await supabase.rpc('get_deduplicated_suggestions', {
        p_user_id: userId,
        p_include_expired: includeExpired,
        p_limit: limit || null,
        p_offset: offset || 0
      })

      if (error) {
        // If function doesn't exist or fails, fall back to client-side deduplication
        safeLogger.warn('[MatchRepo] Deduplication function not available, using client-side dedupe', { error: error.message })
        return this.listSuggestionsForUserFallback(userId, includeExpired, limit, offset)
      }

      // Map database records to MatchSuggestion format
      return (data || []).map((record: any) => ({
        id: record.id,
        runId: record.run_id,
        kind: record.kind,
        memberIds: record.member_ids,
        fitIndex: record.fit_index,
        sectionScores: record.section_scores,
        reasons: record.reasons,
        personalizedExplanation: record.personalized_explanation,
        expiresAt: record.expires_at,
        status: record.status,
        acceptedBy: record.accepted_by,
        createdAt: record.created_at
      }))
    } catch (error) {
      // Fallback to client-side deduplication if RPC fails
      safeLogger.warn('[MatchRepo] Error calling deduplication function, using fallback', { error })
      return this.listSuggestionsForUserFallback(userId, includeExpired, limit, offset)
    }
  }

  // Fallback method for client-side deduplication (used if RPC function unavailable)
  private async listSuggestionsForUserFallback(userId: string, includeExpired = false, limit?: number, offset?: number): Promise<MatchSuggestion[]> {
    const supabase = await this.getSupabase()
    let query = supabase
      .from('match_suggestions')
      .select('*')
      .contains('member_ids', [userId])
      .order('created_at', { ascending: false })

    if (!includeExpired) {
      query = query.neq('status', 'declined')
    }

    if (limit !== undefined && offset !== undefined) {
      query = query.range(offset, offset + limit - 1)
    } else if (limit !== undefined) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to list suggestions for user: ${error.message}`)
    }

    let suggestions = (data || []).map((record: any) => ({
      id: record.id,
      runId: record.run_id,
      kind: record.kind,
      memberIds: record.member_ids,
      fitIndex: record.fit_index,
      sectionScores: record.section_scores,
      reasons: record.reasons,
      personalizedExplanation: record.personalized_explanation,
      expiresAt: record.expires_at,
      status: record.status,
      acceptedBy: record.accepted_by,
      createdAt: record.created_at
    }))

    // Filter out confirmed matches when includeExpired is false
    // Note: Confirmed matches should have status = 'confirmed'
    // Matches with status = 'accepted' where all members accepted are also considered confirmed
    if (!includeExpired) {
      suggestions = suggestions.filter(s => {
        // Always include confirmed matches (status = 'confirmed')
        if (s.status === 'confirmed') return true
        // Exclude declined matches (already filtered by query, but be defensive)
        if (s.status === 'declined') return false
        // Exclude accepted matches where all members have accepted (these are confirmed but not yet marked as 'confirmed')
        if (s.status === 'accepted' &&
          s.acceptedBy &&
          s.memberIds &&
          s.acceptedBy.length === s.memberIds.length) {
          return false
        }
        return true
      })
    }

    // Client-side dedupe: keep only the best suggestion per counterpart
    // Prefer confirmed suggestions over newer non-confirmed ones
    const seenOtherIds = new Map<string, MatchSuggestion>()
    for (const sug of suggestions) {
      const otherId = sug.memberIds.find(id => id !== userId)
      if (!otherId) continue

      const existing = seenOtherIds.get(otherId)
      if (!existing) {
        seenOtherIds.set(otherId, sug)
      } else {
        // Prefer confirmed over non-confirmed
        const isCurrentConfirmed = sug.status === 'confirmed'
        const isExistingConfirmed = existing.status === 'confirmed'
        
        if (isCurrentConfirmed && !isExistingConfirmed) {
          // Current is confirmed, existing is not - prefer current
          seenOtherIds.set(otherId, sug)
        } else if (!isCurrentConfirmed && isExistingConfirmed) {
          // Existing is confirmed, current is not - keep existing
          // Do nothing
        } else {
          // Both same status - prefer latest
          if (new Date(sug.createdAt) > new Date(existing.createdAt)) {
            seenOtherIds.set(otherId, sug)
          }
        }
      }
    }

    // Return deduped suggestions, sorted by fitIndex descending
    return Array.from(seenOtherIds.values()).sort((a, b) => b.fitIndex - a.fitIndex)
  }

  async countSuggestionsForUser(userId: string, includeExpired = false): Promise<number> {
    // Count suggestions for user using efficient COUNT query
    // Note: This counts before deduplication, so actual count may be lower after dedupe
    // But it's much more efficient than fetching all records
    const supabase = await this.getSupabase()
    let query = supabase
      .from('match_suggestions')
      .select('*', { count: 'exact', head: true })
      .contains('member_ids', [userId])

    if (!includeExpired) {
      query = query.neq('status', 'declined')
    }

    const { count, error } = await query

    if (error) {
      throw new Error(`Failed to count suggestions for user: ${error.message}`)
    }

    return count || 0
  }

  async listSuggestionsByRun(runId: string): Promise<MatchSuggestion[]> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('match_suggestions')
      .select('*')
      .eq('run_id', runId)
      .order('fit_index', { ascending: false })

    if (error) {
      throw new Error(`Failed to list suggestions by run: ${error.message}`)
    }

    return (data || []).map((record: any) => ({
      id: record.id,
      runId: record.run_id,
      kind: record.kind,
      memberIds: record.member_ids,
      fitIndex: record.fit_index,
      sectionScores: record.section_scores,
      reasons: record.reasons,
      personalizedExplanation: record.personalized_explanation,
      expiresAt: record.expires_at,
      status: record.status,
      acceptedBy: record.accepted_by,
      createdAt: record.created_at
    }))
  }

  async getSuggestionById(id: string): Promise<MatchSuggestion | null> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('match_suggestions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new Error(`Failed to get suggestion: ${error.message}`)
    }

    return {
      id: data.id,
      runId: data.run_id,
      kind: data.kind,
      memberIds: data.member_ids,
      fitIndex: data.fit_index,
      sectionScores: data.section_scores,
      reasons: data.reasons,
      personalizedExplanation: data.personalized_explanation,
      expiresAt: data.expires_at,
      status: data.status,
      acceptedBy: data.accepted_by,
      createdAt: data.created_at
    }
  }

  async updateSuggestion(s: MatchSuggestion): Promise<void> {
    const supabase = await this.getSupabase()

    // Prepare update object - ensure acceptedBy is always an array (not null)
    const updateData: any = {
      status: s.status
    }

    // Only include accepted_by if it's defined (use empty array if null/undefined)
    updateData.accepted_by = s.acceptedBy || []

    safeLogger.debug('[UpdateSuggestion] Updating suggestion', {
      id: s.id,
      status: updateData.status,
      accepted_by: updateData.accepted_by
    })

    const { error } = await supabase
      .from('match_suggestions')
      .update(updateData)
      .eq('id', s.id)

    if (error) {
      safeLogger.error('[UpdateSuggestion] Failed to update', {
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        suggestionId: s.id,
        status: updateData.status,
        acceptedBy: updateData.accepted_by
      })
      throw new Error(`Failed to update suggestion: ${error.message} (code: ${error.code})`)
    }

    safeLogger.debug('[UpdateSuggestion] Successfully updated suggestion', {
      id: s.id
    })
  }

  async expireOldSuggestionsForUser(userId: string): Promise<number> {
    const supabase = await this.getSupabase()
    // Only expire suggestions that are already past their expiry time
    const nowIso = new Date().toISOString()
    const { data, error } = await supabase
      .from('match_suggestions')
      .select('id, expires_at, status')
      .contains('member_ids', [userId])
      .in('status', ['pending', 'accepted'])
      .lte('expires_at', nowIso)

    if (error) {
      throw new Error(`Failed to query old suggestions: ${error.message}`)
    }

    if (!data || data.length === 0) return 0

    const ids = data.map((r: any) => r.id)
    const { error: updErr } = await supabase
      .from('match_suggestions')
      .update({ status: 'expired' })
      .in('id', ids)

    if (updErr) {
      throw new Error(`Failed to expire old suggestions: ${updErr.message}`)
    }

    return ids.length
  }

  async expireAllOldSuggestions(): Promise<number> {
    const supabase = await this.getSupabase()
    const nowIso = new Date().toISOString()

    // Use set-based SQL UPDATE to expire all suggestions that are pending/accepted and past expiry
    // This is much more efficient than fetching and updating individually
    const { data, error } = await supabase
      .from('match_suggestions')
      .update({ status: 'expired' })
      .in('status', ['pending', 'accepted'])
      .lte('expires_at', nowIso)
      .select('id')

    if (error) {
      throw new Error(`Failed to expire all old suggestions: ${error.message}`)
    }

    return data?.length || 0
  }

  async getSuggestionsForPair(userAId: string, userBId: string, includeExpired = false): Promise<MatchSuggestion[]> {
    // Prevent self-matching queries
    if (userAId === userBId) {
      return []
    }

    const supabase = await this.getSupabase()

    // Fetch all pair suggestions, then filter in JavaScript to find pairs with both users
    // This is more reliable than complex Supabase array queries
    let query = supabase
      .from('match_suggestions')
      .select('*')
      .eq('kind', 'pair')
      .order('created_at', { ascending: false })

    if (!includeExpired) {
      query = query.neq('status', 'expired')
    }

    const { data, error } = await query
    if (error) throw new Error(`Failed to get suggestions for pair: ${error.message}`)

    // Filter to only suggestions that contain BOTH users
    const filtered = (data || []).filter((record: any) => {
      const memberIds = record.member_ids as string[]
      return memberIds &&
        Array.isArray(memberIds) &&
        memberIds.includes(userAId) &&
        memberIds.includes(userBId)
    })

    safeLogger.debug(`[DEBUG] getSuggestionsForPair - Found ${filtered.length} suggestions for pair out of ${data?.length || 0} total pair suggestions`, {
      includeExpired,
      totalPairSuggestions: data?.length || 0,
      filteredCount: filtered.length,
      filteredSuggestions: filtered.map(s => ({
        id: s.id,
        status: s.status,
        acceptedByCount: (s.accepted_by || []).length,
        memberCount: (s.member_ids || []).length,
        createdAt: s.created_at,
        runId: s.run_id
      }))
    })

    return filtered.map((record: any) => ({
      id: record.id,
      runId: record.run_id,
      kind: record.kind,
      memberIds: record.member_ids,
      fitIndex: record.fit_index,
      sectionScores: record.section_scores,
      reasons: record.reasons,
      personalizedExplanation: record.personalized_explanation,
      expiresAt: record.expires_at,
      status: record.status,
      acceptedBy: record.accepted_by || [],
      createdAt: record.created_at
    }))
  }

  async updateSuggestionAcceptedByAndStatus(id: string, acceptedBy: string[], status: 'pending' | 'accepted' | 'declined' | 'expired' | 'confirmed'): Promise<void> {
    const supabase = await this.getSupabase()
    const { error } = await supabase
      .from('match_suggestions')
      .update({ accepted_by: acceptedBy, status })
      .eq('id', id)

    if (error) throw new Error(`Failed to update suggestion (acceptedBy/status): ${error.message}`)
  }

  // Blocklist
  async getBlocklist(userId: string): Promise<string[]> {
    // SECURITY: This method uses admin client to read any user's blocklist.
    // This is necessary for matching to check if users have blocked each other.
    // Blocklists are never exposed to clients - only checked server-side during
    // suggestion generation. The userId parameter comes from server-side matching logic.
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('match_blocklist')
      .select('blocked_user_id')
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to get blocklist: ${error.message}`)
    }

    return (data || []).map((record: any) => record.blocked_user_id)
  }

  async addToBlocklist(userId: string, otherId: string): Promise<void> {
    // SECURITY: This method uses admin client but should only be called from
    // authenticated API routes where userId matches the authenticated user.
    // The API route must verify userId === auth.uid() before calling this.
    const supabase = await this.getSupabase()

    // Use upsert with onConflict to handle unique constraint violations gracefully
    // If the blocklist entry already exists, that's fine - we just want to ensure it exists
    const { error } = await supabase
      .from('match_blocklist')
      .upsert(
        {
          user_id: userId,
          blocked_user_id: otherId
        },
        {
          onConflict: 'user_id,blocked_user_id'
        }
      )

    if (error) {
      // If it's a unique constraint violation, that's okay - the entry already exists
      if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
        safeLogger.debug('[Blocklist] Entry already exists, ignoring', {
          userId,
          otherId
        })
        return
      }
      throw new Error(`Failed to add to blocklist: ${error.message} (code: ${error.code})`)
    }
  }

  // Optimization V2
  async findBestMatchesV2(userId: string, limit = 20): Promise<any[]> {
    const supabase = await this.getSupabase()
    const { data, error } = await supabase.rpc('find_best_matches_v2', {
      p_user_id: userId,
      p_limit: limit,
      p_candidates_limit: 200,
      p_min_score: 0.6
    })

    if (error) {
      safeLogger.error('[MatchRepo] findBestMatchesV2 failed', error)
      return []
    }

    return data || []
  }
}
