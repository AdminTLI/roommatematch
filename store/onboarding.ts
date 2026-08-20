'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { SectionKey, V2SectionKey } from '@/types/questionnaire'
import { V2_SECTION_KEYS } from '@/types/questionnaire'

export type AnswerValue =
  | { kind: 'likert'; value: 1 | 2 | 3 | 4 | 5 }
  | { kind: 'bipolar'; value: 1 | 2 | 3 | 4 | 5 }
  | { kind: 'mcq'; value: string }
  | { kind: 'toggle'; value: boolean }
  | { kind: 'timeRange'; start: string; end: string }
  | { kind: 'number'; value: number }
  | { kind: 'date'; value: string }
  | { kind: 'stringArray'; value: string[] }

export type Answer = {
  itemId: string
  value: AnswerValue
  /** Legacy v1: user-marked dealbreaker on a dbEligible item. */
  dealBreaker?: boolean
  /** User signal: question matters to them (research only; not used for matching). Students cannot set dealbreakers. */
  marksImportant?: boolean
  /** User opted in to strict (dealbreaker) matching on this hard-gate item. */
  userSetGate?: boolean
}

type SectionAnswers = Record<string, Answer>

export interface OnboardingState {
  version: 'rmq-v2'
  sections: Record<SectionKey, SectionAnswers>
  lastSavedAt?: string
  setAnswer: (section: SectionKey, a: Answer) => void
  setDealBreaker: (section: SectionKey, itemId: string, isDB: boolean) => void
  setMarksImportant: (section: SectionKey, itemId: string, v: boolean) => void
  setLastSavedAt: (iso: string | undefined) => void
  computeProgress: () => number
  countAnsweredInSection: (section: SectionKey) => number
  clearSections: () => void
  isV2User: () => boolean
}

// v2: 5 new modules, 12 questions each = 60 total
const v2SectionKeys: V2SectionKey[] = V2_SECTION_KEYS

// Legacy v1 section keys (kept for backward compat — existing users keep their data)
const legacySectionKeys: SectionKey[] = [
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

const allSectionKeys: SectionKey[] = [...legacySectionKeys, ...v2SectionKeys]

function createEmptySections(): Record<SectionKey, SectionAnswers> {
  return allSectionKeys.reduce((acc, key) => {
    acc[key] = {}
    return acc
  }, {} as Record<SectionKey, SectionAnswers>)
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      version: 'rmq-v2',
      sections: createEmptySections(),
      lastSavedAt: undefined,
      setAnswer: (section, a) =>
        set((state) => {
          const prev = state.sections[section]?.[a.itemId]
          const merged: Answer = {
            itemId: a.itemId,
            value: a.value,
          }
          const dealBreaker = 'dealBreaker' in a ? a.dealBreaker : prev?.dealBreaker
          if (dealBreaker !== undefined) merged.dealBreaker = dealBreaker
          const marksImportant = 'marksImportant' in a ? a.marksImportant : prev?.marksImportant
          if (marksImportant !== undefined) merged.marksImportant = marksImportant
          const userSetGate = 'userSetGate' in a ? a.userSetGate : prev?.userSetGate
          if (userSetGate !== undefined) merged.userSetGate = userSetGate
          return {
            sections: {
              ...state.sections,
              [section]: {
                ...state.sections[section],
                [a.itemId]: merged,
              },
            },
          }
        }),
      setDealBreaker: (section, itemId, isDB) =>
        set((state) => {
          const existing = state.sections[section]?.[itemId]
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
      setMarksImportant: (section, itemId, v) =>
        set((state) => {
          const existing = state.sections[section]?.[itemId]
          if (!existing) return state
          return {
            sections: {
              ...state.sections,
              [section]: {
                ...state.sections[section],
                [itemId]: { ...existing, marksImportant: v },
              },
            },
          }
        }),
      setLastSavedAt: (iso) => set(() => ({ lastSavedAt: iso })),
      clearSections: () => set(() => ({ sections: createEmptySections(), lastSavedAt: undefined })),
      countAnsweredInSection: (section) => {
        const answers = get().sections[section] ?? {}
        return Object.values(answers).filter((a) => {
          if (!a || a.value == null) return false
          if (a.value.kind === 'stringArray') {
            return Array.isArray(a.value.value) && a.value.value.length > 0
          }
          if (a.value.kind === 'date') {
            return typeof a.value.value === 'string' && a.value.value.length > 0
          }
          if (a.value.kind === 'number') {
            return typeof a.value.value === 'number' && !Number.isNaN(a.value.value)
          }
          return true
        }).length
      },
      /** Returns true when the user has started any v2 section */
      isV2User: () => {
        return v2SectionKeys.some((key) => Object.keys(get().sections[key] ?? {}).length > 0)
      },
      computeProgress: () => {
        const isV2 = get().isV2User()
        if (isV2) {
          // v2: 12 required per section × 5 modules = 60 total
          const perSectionRequired = 12
          const totalRequired = v2SectionKeys.length * perSectionRequired
          const answered = v2SectionKeys.reduce(
            (sum, key) => sum + Math.min(get().countAnsweredInSection(key), perSectionRequired),
            0,
          )
          return Math.min(100, Math.round((answered / totalRequired) * 100))
        }
        // v1 legacy fallback: 25 per section × 8 + 1 for location
        const perSectionRequired: Partial<Record<SectionKey, number>> = {
          'location-commute': 1,
          'professional-context': 0,
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
        const answered = legacySectionKeys.reduce(
          (sum, key) => sum + Math.min(get().countAnsweredInSection(key), perSectionRequired[key] ?? 0),
          0,
        )
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


