'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { IndividualCompatibilityDisplay } from './individual-compatibility-display'

interface CompatibilityData {
  compatibility_score: number
  personality_score: number
  schedule_score: number
  lifestyle_score: number
  social_score: number
  academic_bonus: number
  penalty?: number
  top_alignment?: string | null
  watch_out?: string | null
  house_rules_suggestion?: string | null
  academic_details?: any
  personalized_explanation?: string
  // New fields from compatibility algorithm v1.0
  harmony_score?: number | null
  context_score?: number | null
  dimension_scores_json?: { [key: string]: number } | null
  is_valid_match?: boolean
  algorithm_version?: string
}

interface CompatibilityPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  compatibility: CompatibilityData | null
  isLoading?: boolean
}

export function CompatibilityPanel({
  open,
  onOpenChange,
  compatibility,
  isLoading = false
}: CompatibilityPanelProps) {
  if (!open) return null

  return (
    <div className="flex flex-col h-full w-full bg-bg-surface overflow-hidden">
      {/* Header with Back Button */}
      <div className="flex-shrink-0 bg-bg-surface border-b border-border-subtle shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 w-9 p-0 rounded-lg hover:bg-bg-surface-alt"
      >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to chat</span>
            </Button>
            <h1 className="text-xl font-bold text-text-primary">Compatibility Details</h1>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isLoading ? (
            <div className="space-y-6">
              <div className="h-32 bg-bg-surface-alt rounded-lg animate-pulse"></div>
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-bg-surface-alt rounded animate-pulse w-3/4"></div>
                    <div className="h-2 bg-bg-surface-alt rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : compatibility ? (
            <IndividualCompatibilityDisplay compatibility={compatibility} />
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-text-muted">
                Unable to load compatibility data. Please try again later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
