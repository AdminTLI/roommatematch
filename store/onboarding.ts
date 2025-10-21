'use client'

import { create } from 'zustand'
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

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
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
    const totalRequired = 8 * 25
    const answered = sectionKeys.reduce((sum, key) => sum + get().countAnsweredInSection(key), 0)
    return Math.min(100, Math.round((answered / totalRequired) * 100))
  },
}))


