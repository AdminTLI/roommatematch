export type SectionKey =
  | 'personality-values'
  | 'sleep-circadian'
  | 'noise-sensory'
  | 'home-operations'
  | 'social-hosting-language'
  | 'communication-conflict'
  | 'privacy-territoriality'
  | 'reliability-logistics'
  | 'location-commute'

export type LikertScaleKind = 'agreement' | 'frequency' | 'comfort'

export type Item = {
  id: string
  section: SectionKey
  kind: 'likert' | 'bipolar' | 'mcq' | 'toggle' | 'timeRange' | 'number'
  label: string
  scale?: LikertScaleKind
  dbEligible?: boolean
  options?: { value: string; label: string }[]
  bipolarLabels?: { left: string; right: string }
  min?: number
  max?: number
  optionsFrom?: 'nl-institutions' | 'nl-campuses'
}


