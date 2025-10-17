import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCompatibilityScore(score: number): string {
  return `${Math.round(score * 100)}%`
}

export function getCompatibilityLabel(score: number): string {
  if (score >= 0.9) return 'Excellent Match'
  if (score >= 0.8) return 'Great Match'
  if (score >= 0.7) return 'Good Match'
  if (score >= 0.6) return 'Fair Match'
  if (score >= 0.5) return 'Okay Match'
  return 'Poor Match'
}
