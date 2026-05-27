import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import {
  BLOG_HERO_IMAGE_KEYS,
  type BlogHeroImageKey,
} from './approved-images'

export type BlogPostCategory =
  | 'Housing'
  | 'Retention'
  | 'Integration'
  | 'Wellbeing'
  | 'Compatibility'
  | 'Boundaries'
  | 'Health'
  | 'Safety'
  | 'Technology'
  | 'Finance'
  | string

const REGISTRY_PATH = join(process.cwd(), 'data/blog/hero-image-registry.json')

const CATEGORY_PREFERENCES: Record<string, BlogHeroImageKey[]> = {
  Housing: ['housingCityscape', 'cityBikeStudent', 'contractSigning'],
  Retention: ['housingCityscape', 'studentsCollaborating', 'internationalCampus'],
  Integration: ['internationalCampus', 'studentsCollaborating', 'cityBikeStudent'],
  Wellbeing: ['quietRoommate', 'studyLateNight', 'studentsCollaborating'],
  Compatibility: ['sharedKitchen', 'studentsCollaborating', 'quietRoommate'],
  Boundaries: ['quietRoommate', 'sharedKitchen', 'studentsCollaborating'],
  Health: ['studyLateNight', 'quietRoommate', 'studentsCollaborating'],
  Safety: ['contractSigning', 'housingCityscape', 'cityBikeStudent'],
  Technology: ['studyLateNight', 'studentsCollaborating', 'contractSigning'],
  Finance: ['housingCityscape', 'contractSigning', 'sharedKitchen'],
}

const DEFAULT_PREFERENCES: BlogHeroImageKey[] = [
  'studentsCollaborating',
  'housingCityscape',
  'internationalCampus',
  'quietRoommate',
  'sharedKitchen',
  'studyLateNight',
  'contractSigning',
  'cityBikeStudent',
]

type RegistryEntry = { slug: string; imageKey: string; date?: string }

type RegistryFile = { entries: RegistryEntry[] }

export function loadHeroImageRegistry(): RegistryEntry[] {
  if (!existsSync(REGISTRY_PATH)) return []
  try {
    const raw = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8')) as RegistryFile
    return Array.isArray(raw.entries) ? raw.entries : []
  } catch {
    return []
  }
}

export function getRecentlyUsedImageKeys(limit = 4): BlogHeroImageKey[] {
  const entries = loadHeroImageRegistry()
  const recent = entries.slice(-limit)
  return recent
    .map((e) => e.imageKey)
    .filter((k): k is BlogHeroImageKey =>
      BLOG_HERO_IMAGE_KEYS.includes(k as BlogHeroImageKey)
    )
}

export type SelectHeroImageOptions = {
  category: BlogPostCategory
  slug?: string
  excludeRecentCount?: number
  secondaryCategory?: BlogPostCategory
}

/**
 * Pick a hero image key for a new blog post, avoiding keys used in recent posts.
 */
export function selectHeroImageKey(options: SelectHeroImageOptions): BlogHeroImageKey {
  const { category, slug, excludeRecentCount = 4, secondaryCategory } = options
  const recent = new Set(getRecentlyUsedImageKeys(excludeRecentCount))

  if (slug) {
    const existing = loadHeroImageRegistry().find((e) => e.slug === slug)
    if (
      existing &&
      BLOG_HERO_IMAGE_KEYS.includes(existing.imageKey as BlogHeroImageKey)
    ) {
      return existing.imageKey as BlogHeroImageKey
    }
  }

  const preferred = [
    ...(CATEGORY_PREFERENCES[category] || []),
    ...(secondaryCategory ? CATEGORY_PREFERENCES[secondaryCategory] || [] : []),
    ...DEFAULT_PREFERENCES,
  ]

  const seen = new Set<BlogHeroImageKey>()
  const ordered: BlogHeroImageKey[] = []
  for (const key of preferred) {
    if (!seen.has(key)) {
      seen.add(key)
      ordered.push(key)
    }
  }
  for (const key of BLOG_HERO_IMAGE_KEYS) {
    if (!seen.has(key)) ordered.push(key)
  }

  const available = ordered.filter((k) => !recent.has(k))
  if (available.length > 0) return available[0]

  return ordered[0] ?? 'studentsCollaborating'
}
