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
  /** Residential / city housing - shortage, retention, rent */
  housingCityscape: {
    src: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200&q=80',
    width: 1200,
    height: 630,
  },
  /** Kitchen / shared living - chores, conflict, household norms */
  sharedKitchen: {
    src: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=1200&q=80',
    width: 1200,
    height: 630,
  },
  /** Late-night study - sleep schedules, exams, winter blues */
  studyLateNight: {
    src: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200&q=80',
    width: 1200,
    height: 630,
  },
  /** Campus / friends - international students, social integration */
  internationalCampus: {
    src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
    width: 1200,
    height: 630,
  },
  /** Documents / signing - rental safety, scams, contracts */
  contractSigning: {
    src: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80',
    width: 1200,
    height: 630,
  },
  /** Quiet home - introverts, boundaries, wellbeing */
  quietRoommate: {
    src: 'https://images.unsplash.com/photo-1515362778563-6a8d0e44bc0b?w=1200&q=80',
    width: 1200,
    height: 630,
  },
  /** City / move-in - Dutch student cities, logistics */
  cityBikeStudent: {
    src: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&q=80',
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
