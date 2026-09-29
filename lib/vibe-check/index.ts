export { VIBE_CHECK_QUESTIONS, VIBE_MODULE_WEIGHTS, VIBE_MODULE_LABELS } from './questions'
export type { VibeQuestion, VibeModule } from './questions'
export { calculateArchetype, calculateModuleScores, selectArchetypeKey } from './archetype'
export type { ArchetypeResult } from './archetype'
export {
  VIBE_CHECK_SESSION_KEY,
  saveVibeCheckSession,
  loadVibeCheckSession,
  clearVibeCheckSession,
  universityDisplayName,
  cityForUniversity,
} from './session'
export type { VibeCheckSession, VibeUniversityChoice } from './session'
export { mapVibeAnswersToOnboarding } from './map-to-onboarding'
export {
  LIFESTYLE_FIT_THRESHOLD,
  LIFESTYLE_FIT_COUNT_OFFSET,
  computeOverallLifestyleFit,
  summarizeLifestyleFit,
} from './lifestyle-fit'
