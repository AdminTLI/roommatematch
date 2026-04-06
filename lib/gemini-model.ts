/** Default for all Gemini calls in this app (Domu chat, match blurbs, etc.). */
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash-lite' as const

/**
 * App-wide Gemini model id.
 * Override with GEMINI_MODEL, or GEMINI_DOMU_MODEL for backward compatibility.
 */
export function getGeminiModel(): string {
  const fromEnv =
    process.env.GEMINI_MODEL?.trim() || process.env.GEMINI_DOMU_MODEL?.trim()
  return fromEnv || DEFAULT_GEMINI_MODEL
}
