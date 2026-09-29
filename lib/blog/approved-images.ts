/**
 * Curated blog hero images. Only add URLs that return HTTP 200 from Unsplash
 * (run `npm run verify:blog-images` before merging).
 *
 * Do NOT invent photo IDs - broken IDs break next/image at runtime.
 */
export const BLOG_HERO_IMAGES = {
  /** Students working together - roommate matching, integration */
  studentsCollaborating: {
    src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
    width: 1200,
    height: 630,
  },
  /** Residential apartment buildings - shortage, retention, rent */
  housingCityscape: {
    src: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200&q=80',
    width: 1200,
    height: 630,
  },
  /** Kitchen / shared living - chores, conflict, household norms */
  sharedKitchen: {
    src: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=1200&q=80',
    width: 1200,
    height: 630,
  },
  /** Desk study / exam prep - sleep schedules, exams, winter blues */
  studyLateNight: {
    src: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200&q=80',
    width: 1200,
    height: 630,
  },
  /** Campus / graduation - international students, academic life */
  internationalCampus: {
    src: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=1200&q=80',
    width: 1200,
    height: 630,
  },
  /** Documents / writing - rental safety, scams, contracts */
  contractSigning: {
    src: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80',
    width: 1200,
    height: 630,
  },
  /** Quiet home / living room - introverts, boundaries, wellbeing */
  quietRoommate: {
    src: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
    width: 1200,
    height: 630,
  },
  /** Dutch student city (Amsterdam canal) - move-in, logistics */
  cityBikeStudent: {
    src: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=1200&q=80',
    width: 1200,
    height: 630,
  },
} as const

export type BlogHeroImageKey = keyof typeof BLOG_HERO_IMAGES

export const BLOG_HERO_IMAGE_KEYS = Object.keys(
  BLOG_HERO_IMAGES
) as BlogHeroImageKey[]

export function blogHeroSrc(key: BlogHeroImageKey): string {
  return BLOG_HERO_IMAGES[key].src
}
