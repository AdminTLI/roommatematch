import Image from 'next/image'
import { BLOG_HERO_IMAGES, type BlogHeroImageKey } from '@/lib/blog/approved-images'

type BlogHeroImageProps = {
  imageKey: BlogHeroImageKey
  alt: string
  className?: string
}

/** In-article hero image — always uses an approved, verified Unsplash URL. */
export function BlogHeroImage({ imageKey, alt, className = 'w-full rounded-2xl' }: BlogHeroImageProps) {
  const { src, width, height } = BLOG_HERO_IMAGES[imageKey]
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  )
}
