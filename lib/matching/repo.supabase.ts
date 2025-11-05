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
          study_start_year
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
      console.error('Error fetching candidate by user ID:', error)
      return null
    }

    // Build answers object from responses
    const answers = data.responses?.reduce((acc: Record<string, any>, r: any) => {
      acc[r.question_key] = r.value
      return acc
    }, {}) || {}

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

    console.log('[DEBUG] getCandidateByUserId - User responses:', {
      userId,
      answersCount: Object.keys(answers).length,
      answerKeys: Object.keys(answers).sort(),
      sampleAnswers: Object.fromEntries(Object.entries(answers).slice(0, 5)),
      normalizedFromProfile: {
        degree_level: answers.degree_level,
        campus: answers.campus,
        program: answers.program
      }
    })

    const eligible = await isEligibleForMatching(answers)
    if (!eligible) {
      const { getMissingFields } = await import('./completeness')
      const missing = getMissingFields(answers)
      console.log('[DEBUG] User not eligible - missing fields:', {
        userId,
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
    console.log('[DEBUG] loadCandidates - Filter input:', {
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
          study_start_year
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
      console.log('[DEBUG] loadCandidates - Applied campusCity filter:', filter.campusCity)
    }
    
    if (filter.institutionId) {
      query = query.eq('user_academic.university_id', filter.institutionId)
      console.log('[DEBUG] loadCandidates - Applied institutionId filter:', filter.institutionId)
    }
    
    if (filter.degreeLevel) {
      query = query.eq('user_academic.degree_level', filter.degreeLevel)
      console.log('[DEBUG] loadCandidates - Applied degreeLevel filter:', filter.degreeLevel)
    }
    
    if (filter.programmeId) {
      query = query.eq('user_academic.program_id', filter.programmeId)
      console.log('[DEBUG] loadCandidates - Applied programmeId filter:', filter.programmeId)
    }
    
    if (filter.graduationYearFrom) {
      query = query.gte('user_academic.study_start_year', filter.graduationYearFrom)
    }
    
    if (filter.graduationYearTo) {
      query = query.lte('user_academic.study_start_year', filter.graduationYearTo)
    }
    
    if (filter.onlyActive) {
      query = query.eq('profiles.verification_status', 'verified')
      console.log('[DEBUG] loadCandidates - Applied onlyActive filter (verified only)')
    } else {
      console.log('[DEBUG] loadCandidates - onlyActive is false, including unverified users')
    }

    if (filter.excludeUserIds?.length) {
      query = query.not('id', 'in', `(${filter.excludeUserIds.join(',')})`)
      console.log('[DEBUG] loadCandidates - Excluding user IDs:', filter.excludeUserIds)
    }

    // Note: Email verification is checked via profiles.verification_status
    // email_confirmed_at is in auth.users table and not accessible here

    if (filter.limit) {
      query = query.limit(filter.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('[DEBUG] loadCandidates - Query error:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw new Error(`Failed to load candidates: ${error.message}`)
    }
    
    console.log('[DEBUG] loadCandidates - Raw query results:', {
      count: data?.length || 0,
      userIds: data?.map((u: any) => u.id) || []
    })

    // If joins didn't return academic/profile data, fetch them separately
    // This can happen if Supabase relationship resolution isn't working correctly
    const usersMissingAcademic = (data || []).filter((u: any) => !u.user_academic?.[0]).map((u: any) => u.id)
    const usersMissingProfile = (data || []).filter((u: any) => !u.profiles?.[0]).map((u: any) => u.id)

    // Fetch missing academic data in parallel
    let academicDataMap = new Map<string, any>()
    if (usersMissingAcademic.length > 0) {
      console.log('[DEBUG] loadCandidates - Fetching missing academic data for', usersMissingAcademic.length, 'users')
      const adminClient = await this.getSupabase()
      const { data: academicData, error: academicError } = await adminClient
        .from('user_academic')
        .select('user_id, university_id, degree_level, program_id, undecided_program, study_start_year')
        .in('user_id', usersMissingAcademic)
      
      if (!academicError && academicData) {
        academicData.forEach((a: any) => academicDataMap.set(a.user_id, a))
        console.log('[DEBUG] loadCandidates - Fetched', academicData.length, 'academic records')
      }
    }

    // Fetch missing profile data in parallel
    let profileDataMap = new Map<string, any>()
    if (usersMissingProfile.length > 0) {
      console.log('[DEBUG] loadCandidates - Fetching missing profile data for', usersMissingProfile.length, 'users')
      const adminClient = await this.getSupabase()
      const { data: profileData, error: profileError } = await adminClient
        .from('profiles')
        .select('user_id, first_name, university_id, degree_level, campus, verification_status')
        .in('user_id', usersMissingProfile)
      
      if (!profileError && profileData) {
        profileData.forEach((p: any) => profileDataMap.set(p.user_id, p))
        console.log('[DEBUG] loadCandidates - Fetched', profileData.length, 'profile records')
      }
    }

    // Fetch missing vector data in parallel
    // Check which users don't have vectors from the join
    const usersMissingVector = (data || []).filter((u: any) => !u.user_vectors?.[0]?.vector).map((u: any) => u.id)
    let vectorDataMap = new Map<string, any>()
    if (usersMissingVector.length > 0) {
      console.log('[DEBUG] loadCandidates - Fetching missing vector data for', usersMissingVector.length, 'users')
      const adminClient = await this.getSupabase()
      const { data: vectorData, error: vectorError } = await adminClient
        .from('user_vectors')
        .select('user_id, vector')
        .in('user_id', usersMissingVector)
      
      if (!vectorError && vectorData) {
        vectorData.forEach((v: any) => vectorDataMap.set(v.user_id, v.vector))
        console.log('[DEBUG] loadCandidates - Fetched', vectorData.length, 'vector records')
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

        // Log pre-normalization state to diagnose issues
        console.log('[DEBUG] loadCandidates - Pre-normalization:', {
          userId: user.id,
          email: user.email,
          hasAcademic: !!academic,
          hasProfile: !!profile,
          academicData: academic ? {
            degree_level: academic.degree_level,
            program_id: academic.program_id,
            undecided_program: academic.undecided_program
          } : null,
          profileData: profile ? {
            degree_level: profile.degree_level,
            campus: profile.campus
          } : null,
          answersBeforeNorm: {
            degree_level: answers.degree_level,
            program: answers.program,
            campus: answers.campus
          }
        })

        // Normalize answers: enrich with data from profiles/user_academic where applicable
        // Some required fields may be stored in profile tables rather than responses
        if (!answers.degree_level) {
          answers.degree_level = academic?.degree_level || profile?.degree_level
          if (answers.degree_level) {
            console.log('[DEBUG] Normalized degree_level to:', answers.degree_level)
          }
        }
        if (!answers.campus || answers.campus === '') {
          answers.campus = profile?.campus || null // Use null instead of empty string
          if (answers.campus) {
            console.log('[DEBUG] Normalized campus to:', answers.campus)
          }
        }
        if (!answers.program) {
          // Handle undecided program case - use "undecided" as value
          if (academic?.undecided_program) {
            answers.program = 'undecided'
            console.log('[DEBUG] Set program to undecided')
          } else if (academic?.program_id) {
            answers.program = academic.program_id
            console.log('[DEBUG] Normalized program to:', academic.program_id)
          }
        }

        // Log post-normalization state
        console.log('[DEBUG] loadCandidates - Post-normalization:', {
          userId: user.id,
          answersAfterNorm: {
            degree_level: answers.degree_level,
            program: answers.program,
            campus: answers.campus,
            study_intensity: answers.study_intensity
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
    
    console.log('[DEBUG] loadCandidates - After transformation:', {
      transformedCount: transformedCandidates.length,
      userIds: transformedCandidates.map(c => c.id)
    })
    
    // Filter by eligibility and vector requirement
    const eligibleCandidates = transformedCandidates.filter(candidate => {
        // Filter out users without complete responses
        const eligible = isEligibleForMatching(candidate.answers)
        if (!eligible) {
          const { getMissingFields } = require('./completeness')
          const missing = getMissingFields(candidate.answers)
          console.log('[DEBUG] loadCandidates - Candidate not eligible:', {
            userId: candidate.id,
            email: candidate.email,
            missingFields: missing,
            hasVector: !!candidate.vector
          })
          return false
        }
        
        // Filter out users without vectors
        if (!candidate.vector) {
          console.log('[DEBUG] loadCandidates - Candidate missing vector:', {
            userId: candidate.id,
            email: candidate.email
          })
          return false
        }
        
        return true
      })
    
    console.log('[DEBUG] loadCandidates - Final eligible candidates:', {
      eligibleCount: eligibleCandidates.length,
      filteredOut: transformedCandidates.length - eligibleCandidates.length,
      eligibleUserIds: eligibleCandidates.map(c => c.id)
    })
    
    return eligibleCandidates
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
    // Check if user is already in a locked match
    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from('match_records')
      .select('id')
      .contains('user_ids', [userId])
      .eq('locked', true)
      .limit(1)

    if (error) {
      throw new Error(`Failed to check if user is matched: ${error.message}`)
    }

    return (data || []).length > 0
  }

  // Suggestions (student flow)
  async createSuggestions(sugs: MatchSuggestion[]): Promise<void> {
    const records = sugs.map(sug => ({
      id: sug.id,
      run_id: sug.runId,
      kind: sug.kind,
      member_ids: sug.memberIds,
      fit_score: sug.fitIndex / 100,
      fit_index: sug.fitIndex,
      section_scores: sug.sectionScores,
      reasons: sug.reasons,
      expires_at: sug.expiresAt,
      status: sug.status,
      accepted_by: sug.acceptedBy,
      created_at: sug.createdAt
    }))

    const supabase = await this.getSupabase()
    const { error } = await supabase
      .from('match_suggestions')
      .insert(records)

    if (error) {
      throw new Error(`Failed to create suggestions: ${error.message}`)
    }
  }

  async listSuggestionsForUser(userId: string, includeExpired = false): Promise<MatchSuggestion[]> {
    // SECURITY: This method uses admin client but filters results by userId parameter
    // which is passed from authenticated API routes. Users can only see suggestions
    // that include their own userId in memberIds array.
    const supabase = await this.getSupabase()
    let query = supabase
      .from('match_suggestions')
      .select('*')
      .contains('member_ids', [userId])
      .order('fit_index', { ascending: false })

    if (!includeExpired) {
      query = query
        .neq('status', 'expired')
        .gt('expires_at', new Date().toISOString())
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to list suggestions for user: ${error.message}`)
    }

    return (data || []).map((record: any) => ({
      id: record.id,
      runId: record.run_id,
      kind: record.kind,
      memberIds: record.member_ids,
      fitIndex: record.fit_index,
      sectionScores: record.section_scores,
      reasons: record.reasons,
      expiresAt: record.expires_at,
      status: record.status,
      acceptedBy: record.accepted_by,
      createdAt: record.created_at
    }))
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
      expiresAt: data.expires_at,
      status: data.status,
      acceptedBy: data.accepted_by,
      createdAt: data.created_at
    }
  }

  async updateSuggestion(s: MatchSuggestion): Promise<void> {
    const supabase = await this.getSupabase()
    const { error } = await supabase
      .from('match_suggestions')
      .update({
        status: s.status,
        accepted_by: s.acceptedBy
      })
      .eq('id', s.id)

    if (error) {
      throw new Error(`Failed to update suggestion: ${error.message}`)
    }
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
    const { error } = await supabase
      .from('match_blocklist')
      .upsert({
        user_id: userId,
        blocked_user_id: otherId
      })

    if (error) {
      throw new Error(`Failed to add to blocklist: ${error.message}`)
    }
  }
}
