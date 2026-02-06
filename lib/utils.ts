import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCompatibilityScore(score: number): string {
  return `${Math.round(score * 100)}%`
}

export function getCompatibilityLabel(score: number): string {
  if (score >= 0.85) return 'Amazing'
  if (score >= 0.7) return 'Great'
  if (score >= 0.55) return 'Good'
  return 'Low'
}
