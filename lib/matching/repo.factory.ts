// Repository factory for matching system
// Auto-detects and returns the appropriate repository implementation

import type { MatchRepo } from './repo'
import { SupabaseMatchRepo } from './repo.supabase'

export async function getMatchRepo(): Promise<MatchRepo> {
  // For now, always use Supabase repository
  // In the future, this could detect environment and choose appropriate implementation
  return new SupabaseMatchRepo()
}
