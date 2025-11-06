// Repository interfaces for matching system
// Defines the data layer abstraction for cohort selection, match persistence, and user management

import { MatchSuggestion } from './types';

export type CohortFilter = {
  campusCity?: string;
  institutionId?: string;
  degreeLevel?: 'bachelor' | 'premaster' | 'master' | 'phd' | 'exchange' | 'other';
  programmeId?: string;
  graduationYearFrom?: number;
  graduationYearTo?: number;
  onlyActive?: boolean;     // exclude users who opted out / completed housing
  excludeAlreadyMatched?: boolean; // exclude users locked into a match
  excludeUserIds?: string[]; // exclude specific users (for blocklist)
  limit?: number;
};

export type MatchRecord =
  | { 
      kind: 'pair'; 
      aId: string; 
      bId: string; 
      fit: number; 
      fitIndex: number; 
      sectionScores: Record<string, number>; 
      reasons: string[]; 
      runId: string; 
      locked: boolean; 
      createdAt: string 
    }
  | { 
      kind: 'group'; 
      memberIds: string[]; 
      avgFit: number; 
      fitIndex: number; 
      runId: string; 
      locked: boolean; 
      createdAt: string 
    };

export interface Candidate {
  id: string;
  email: string;
  firstName: string;
  universityId?: string;
  degreeLevel?: string;
  programmeId?: string;
  campusCity?: string;
  graduationYear?: number;
  answers: Record<string, any>; // section -> itemId -> value
  vector?: number[];
  isMatched?: boolean;
  createdAt: string;
}

export interface MatchRun {
  id: string;
  runId: string;
  mode: 'pairs' | 'groups';
  cohortFilter: CohortFilter;
  matchCount: number;
  createdAt: string;
}

export interface MatchRepo {
  // Cohort selection
  loadCandidates(filter: CohortFilter): Promise<Candidate[]>;
  getCandidateByUserId(userId: string): Promise<Candidate | null>;
  
  // Match runs
  saveMatchRun(run: Omit<MatchRun, 'id' | 'createdAt'>): Promise<void>;
  getMatchRun(runId: string): Promise<MatchRun | null>;
  listMatchRuns(limit?: number): Promise<MatchRun[]>;
  
  // Match records
  saveMatches(matches: MatchRecord[]): Promise<void>;
  listMatches(runId?: string, locked?: boolean): Promise<MatchRecord[]>;
  lockMatch(ids: string[], runId: string): Promise<void>; // lock a pair or a group
  
  // User management
  markUsersMatched(userIds: string[], runId: string): Promise<void>;
  isUserMatched(userId: string): Promise<boolean>;
  
  // Suggestions (student flow)
  createSuggestions(sugs: MatchSuggestion[]): Promise<void>;
  listSuggestionsForUser(userId: string, includeExpired?: boolean): Promise<MatchSuggestion[]>;
  listSuggestionsByRun(runId: string): Promise<MatchSuggestion[]>;
  getSuggestionById(id: string): Promise<MatchSuggestion | null>;
  updateSuggestion(s: MatchSuggestion): Promise<void>;
  expireOldSuggestionsForUser(userId: string): Promise<number>;
  
  // Blocklist
  getBlocklist(userId: string): Promise<string[]>;
  addToBlocklist(userId: string, otherId: string): Promise<void>;
}
