import type { ArchetypeResult } from './archetype'

/** Casual share copy - invite a friend without sounding like a product dump. */
export function buildVibeShareText(_archetype: ArchetypeResult, shareUrl: string): string {
  return `Let's see if we'd actually survive living together. Take the Domu Match vibe check with me!\n${shareUrl}`
}

export function buildVibeShareSubject(_archetype: ArchetypeResult): string {
  return `Take the Domu Match vibe check with me`
}
