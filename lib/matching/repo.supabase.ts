// Supabase implementation of MatchRepo
// Handles all database operations for the matching system

import { createClient } from '@/lib/supabase/server'
import type { MatchRepo, CohortFilter, MatchRecord, Candidate, MatchRun } from './repo'

export class SupabaseMatchRepo implements MatchRepo {
  private supabase = createClient()

  async loadCandidates(filter: CohortFilter): Promise<Candidate[]> {
    // Build query for users with their onboarding data
    let query = this.supabase
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
        onboarding_sections(
          section,
          answers
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

    if (filter.limit) {
      query = query.limit(filter.limit)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to load candidates: ${error.message}`)
    }

    // Transform the data into Candidate format
    return (data || []).map((user: any) => {
      const profile = user.profiles?.[0]
      const academic = user.user_academic?.[0]
      const sections = user.onboarding_sections || []
      const vector = user.user_vectors?.[0]?.vector

      // Combine all answers from different sections
      const answers = sections.reduce((acc: Record<string, any>, section: any) => {
        if (section.answers && Array.isArray(section.answers)) {
          section.answers.forEach((answer: any) => {
            acc[answer.itemId] = answer.value
          })
        }
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
  }

  async saveMatchRun(run: Omit<MatchRun, 'id' | 'createdAt'>): Promise<void> {
    const { error } = await this.supabase
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
    const { data, error } = await this.supabase
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
    const { data, error } = await this.supabase
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

    const { error } = await this.supabase
      .from('match_records')
      .insert(records)

    if (error) {
      throw new Error(`Failed to save matches: ${error.message}`)
    }
  }

  async listMatches(runId?: string, locked?: boolean): Promise<MatchRecord[]> {
    let query = this.supabase
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
    const { error } = await this.supabase
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
    const { error } = await this.supabase
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
    const { data, error } = await this.supabase
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
}
