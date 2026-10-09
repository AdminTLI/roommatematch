import Image from 'next/image'
import { BLOG_HERO_IMAGES, type BlogHeroImageKey } from '@/lib/blog/approved-images'

type BlogHeroImageProps = {
  imageKey: BlogHeroImageKey
  alt: string
  className?: string
  /** Set true for the primary above-the-fold article hero. */
  priority?: boolean
}

/** In-article hero image - always uses an approved, verified Unsplash URL. */
export function BlogHeroImage({
  imageKey,
  alt,
  className = 'w-full rounded-2xl',
  priority = false,
}: BlogHeroImageProps) {
  const { src, width, height } = BLOG_HERO_IMAGES[imageKey]
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes="(max-width: 768px) 100vw, min(100vw, 72rem)"
      priority={priority}
      className={className}
    />
  )
}
