export type OnboardingCompletionStage = 'context' | 'full'

/** Legacy NULL rows and 'full' both unlock harmony scores / accept. */
export function isFullQuestionnaireComplete(
  stage: string | null | undefined
): boolean {
  return stage === 'full' || stage == null
}

/** Context-only or full both unlock dashboard / matches. */
export function hasDashboardAccess(
  stage: string | null | undefined,
  hasSubmission: boolean
): boolean {
  if (!hasSubmission) return false
  return stage === 'context' || isFullQuestionnaireComplete(stage)
}

export function normalizeCompletionStage(
  stage: string | null | undefined
): OnboardingCompletionStage | null {
  if (stage === 'context' || stage === 'full') return stage
  if (stage == null) return 'full' // legacy
  return null
}
