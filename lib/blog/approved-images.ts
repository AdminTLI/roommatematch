/**
 * Curated blog hero images. Only add URLs that return HTTP 200 from Unsplash
 * (run `npm run verify:blog-images` before merging).
 *
 * Do NOT invent photo IDs — broken IDs break next/image at runtime.
 */
export const BLOG_HERO_IMAGES = {
  /** Students working together — used on how-to-find-a-great-roommate, introverts-survival-guide */
  studentsCollaborating: {
    src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
    width: 1200,
    height: 630,
  },
  /** Residential / city housing — used on student-housing-gap-retention-roi */
  housingCityscape: {
    src: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
    width: 1200,
    height: 630,
  },
} as const

export type BlogHeroImageKey = keyof typeof BLOG_HERO_IMAGES

export function blogHeroSrc(key: BlogHeroImageKey): string {
  return BLOG_HERO_IMAGES[key].src
}
