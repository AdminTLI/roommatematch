// Supabase implementation of MatchRepo
// Handles all database operations for the matching system

import { createClient } from '@/lib/supabase/server'
import type { MatchRepo, CohortFilter, MatchRecord, Candidate, MatchRun } from './repo'
import type { MatchSuggestion } from './types'
import { isEligibleForMatching } from './completeness'

export class SupabaseMatchRepo implements MatchRepo {
  private async getSupabase() {
    return await createClient()
  }

  async getCandidateByUserId(userId: string): Promise<Candidate | null> {
    const supabase = await createClient()
    
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

    // Check if user is eligible for matching
    const answers = data.responses?.reduce((acc: Record<string, any>, r: any) => {
      acc[r.question_key] = r.value
      return acc
    }, {}) || {}

    const eligible = await isEligibleForMatching(answers)
    if (!eligible) {
      return null
    }

    // Transform to Candidate format
    return {
      id: data.id,
      email: data.email,
      firstName: data.profiles?.first_name || 'User',
      universityId: data.profiles?.university_id,
      degreeLevel: data.profiles?.degree_level,
      programmeId: data.user_academic?.program_id,
      campusCity: data.profiles?.campus,
      answers,
      vector: data.user_vectors?.[0]?.vector,
      createdAt: new Date().toISOString()
    }
  }

  async loadCandidates(filter: CohortFilter): Promise<Candidate[]> {
    const supabase = await this.getSupabase()
    // Build query for users with their onboarding data
    let query = supabase
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
    }
    
    if (filter.institutionId) {
      query = query.eq('user_academic.university_id', filter.institutionId)
    }
    
    if (filter.degreeLevel) {
      query = query.eq('user_academic.degree_level', filter.degreeLevel)
    }
    
    if (filter.programmeId) {
      query = query.eq('user_academic.program_id', filter.programmeId)
    }
    
    if (filter.graduationYearFrom) {
      query = query.gte('user_academic.study_start_year', filter.graduationYearFrom)
    }
    
    if (filter.graduationYearTo) {
      query = query.lte('user_academic.study_start_year', filter.graduationYearTo)
    }
    
    if (filter.onlyActive) {
      query = query.eq('profiles.verification_status', 'verified')
    }

    if (filter.excludeUserIds?.length) {
      query = query.not('id', 'in', `(${filter.excludeUserIds.join(',')})`)
    }

    // Exclude unverified users from matching pool
    query = query.not('email_confirmed_at', 'is', null)

    if (filter.limit) {
      query = query.limit(filter.limit)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to load candidates: ${error.message}`)
    }

    // Transform the data into Candidate format
    return (data || [])
      .map((user: any) => {
        const profile = user.profiles?.[0]
        const academic = user.user_academic?.[0]
        const responses = user.responses || []
        const vector = user.user_vectors?.[0]?.vector

        // Convert responses array to answers object
        const answers = responses.reduce((acc: Record<string, any>, response: any) => {
          acc[response.question_key] = response.value
          return acc
        }, {})

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
      .filter(candidate => {
        // Filter out users without complete responses
        if (!isEligibleForMatching(candidate.answers)) {
          return false
        }
        
        // Filter out users without vectors
        if (!candidate.vector) {
          return false
        }
        
        return true
      })
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
