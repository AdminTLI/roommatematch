'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { SectionKey } from '@/types/questionnaire'

export type AnswerValue =
  | { kind: 'likert'; value: 1 | 2 | 3 | 4 | 5 }
  | { kind: 'bipolar'; value: 1 | 2 | 3 | 4 | 5 }
  | { kind: 'mcq'; value: string }
  | { kind: 'toggle'; value: boolean }
  | { kind: 'timeRange'; start: string; end: string }
  | { kind: 'number'; value: number }

export type Answer = { itemId: string; value: AnswerValue; dealBreaker?: boolean }

type SectionAnswers = Record<string, Answer>

export interface OnboardingState {
  version: 'rmq-v1'
  sections: Record<SectionKey, SectionAnswers>
  lastSavedAt?: string
  setAnswer: (section: SectionKey, a: Answer) => void
  setDealBreaker: (section: SectionKey, itemId: string, isDB: boolean) => void
  setLastSavedAt: (iso: string | undefined) => void
  computeProgress: () => number
  countAnsweredInSection: (section: SectionKey) => number
}

const sectionKeys: SectionKey[] = [
  'location-commute',
  'personality-values',
  'sleep-circadian',
  'noise-sensory',
  'home-operations',
  'social-hosting-language',
  'communication-conflict',
  'privacy-territoriality',
  'reliability-logistics',
]

function createEmptySections(): Record<SectionKey, SectionAnswers> {
  return sectionKeys.reduce((acc, key) => {
    acc[key] = {}
    return acc
  }, {} as Record<SectionKey, SectionAnswers>)
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      version: 'rmq-v1',
      sections: createEmptySections(),
      lastSavedAt: undefined,
      setAnswer: (section, a) =>
        set((state) => ({
          sections: {
            ...state.sections,
            [section]: {
              ...state.sections[section],
              [a.itemId]: a,
            },
          },
        })),
      setDealBreaker: (section, itemId, isDB) =>
        set((state) => {
          const existing = state.sections[section][itemId]
          if (!existing) return state
          return {
            sections: {
              ...state.sections,
              [section]: {
                ...state.sections[section],
                [itemId]: { ...existing, dealBreaker: isDB },
              },
            },
          }
        }),
      setLastSavedAt: (iso) => set(() => ({ lastSavedAt: iso })),
      countAnsweredInSection: (section) => {
        const answers = get().sections[section]
        return Object.values(answers).filter((a) => a && a.value != null).length
      },
      computeProgress: () => {
        // Dynamic: use 25 required per of the 8 main sections + 1 for location step (min 1 now)
        const perSectionRequired: Record<SectionKey, number> = {
          'location-commute': 1,
          'personality-values': 25,
          'sleep-circadian': 25,
          'noise-sensory': 25,
          'home-operations': 25,
          'social-hosting-language': 25,
          'communication-conflict': 25,
          'privacy-territoriality': 25,
          'reliability-logistics': 25,
        }
        const totalRequired = Object.values(perSectionRequired).reduce((a, b) => a + b, 0)
        const answered = sectionKeys.reduce((sum, key) => sum + Math.min(get().countAnsweredInSection(key), perSectionRequired[key]), 0)
        return Math.min(100, Math.round((answered / totalRequired) * 100))
      },
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sections: state.sections,
        version: state.version,
      }),
    }
  )
)


