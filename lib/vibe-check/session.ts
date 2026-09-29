import type { ArchetypeResult } from './archetype'

export const VIBE_CHECK_SESSION_KEY = 'domu-vibe-check-v1'

export type VibeUniversityChoice = 'avans' | 'buas' | 'other'

export interface VibeCheckSession {
  university: VibeUniversityChoice
  universityOther?: string
  city: string
  answers: Record<string, number>
  archetype: ArchetypeResult
  matchCount: number
  lifestyleFitPercent?: number
  email?: string
  completedAt: string
}

export function universityDisplayName(
  choice: VibeUniversityChoice,
  other?: string
): string {
  if (choice === 'avans') return 'Avans University of Applied Sciences'
  if (choice === 'buas') return 'Breda University of Applied Sciences'
  const trimmed = other?.trim()
  return trimmed || 'Other university'
}

export function cityForUniversity(
  choice: VibeUniversityChoice,
  other?: string
): string {
  if (choice === 'avans' || choice === 'buas') return 'Breda'
  const text = (other || '').toLowerCase()
  if (text.includes('tilburg')) return 'Tilburg'
  if (text.includes('breda')) return 'Breda'
  return 'Breda'
}

export function saveVibeCheckSession(data: VibeCheckSession): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(VIBE_CHECK_SESSION_KEY, JSON.stringify(data))
  } catch {
    // quota / private mode
  }
}

export function loadVibeCheckSession(): VibeCheckSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(VIBE_CHECK_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as VibeCheckSession
  } catch {
    return null
  }
}

export function clearVibeCheckSession(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(VIBE_CHECK_SESSION_KEY)
  } catch {
    // ignore
  }
}
