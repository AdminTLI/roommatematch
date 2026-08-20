/**
 * v2 dealbreaker / gate logic.
 *
 * Students can no longer set their own dealbreakers. The only hard gates are the
 * 4 platform-defined ones (M5_Q17, M8_Q14, M8_Q19, M8_Q11), evaluated at the
 * SQL layer by check_hard_constraints_v2.
 *
 * This module now operates on the output of compute_compatibility_score_v2 — it
 * interprets gate_conflicts and soft_gate_override rather than re-checking answers
 * in TypeScript.
 */

import { GATE_LABELS, HARD_GATE_IDS } from './item-weights.v2'

export interface DealBreakerResult {
  canMatch: boolean
  /** Shown as warning badges on the match card. */
  softOverride: boolean
  reasons: string[]
  conflicts: string[]
}

/**
 * Evaluate gate results coming from compute_compatibility_score_v2.
 *
 * @param gateConflicts - array of gate item IDs that failed (from SQL)
 * @param softGateOverride - true when 1 gate failed but overall score >= 0.70
 * @param overallScore - overall compatibility score (0–1)
 */
export function evaluateGateResult(
  gateConflicts: string[],
  softGateOverride: boolean,
  overallScore: number,
): DealBreakerResult {
  const nConflicts = gateConflicts.length

  if (nConflicts === 0) {
    return { canMatch: true, softOverride: false, reasons: [], conflicts: [] }
  }

  const conflictLabels = gateConflicts.map(
    (id) => GATE_LABELS[id as typeof HARD_GATE_IDS[number]] ?? id,
  )

  if (nConflicts === 1 && softGateOverride) {
    // Show with warning
    return {
      canMatch: true,
      softOverride: true,
      reasons: [],
      conflicts: conflictLabels,
    }
  }

  // 2+ conflicts, or 1 conflict with low score → hard block
  return {
    canMatch: false,
    softOverride: false,
    reasons: [],
    conflicts: conflictLabels,
  }
}

/**
 * Legacy v1 shim — kept for backward compatibility with the v1 orchestrator path.
 * Returns a permissive result so v1 pairs are not incorrectly blocked.
 */
export interface DealBreakerResultLegacy {
  canMatch: boolean
  reasons: string[]
  conflicts: string[]
}

export function checkDealBreakersLegacy(): DealBreakerResultLegacy {
  return { canMatch: true, reasons: [], conflicts: [] }
}
