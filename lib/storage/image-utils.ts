/**
 * Image transformation utilities for Supabase Storage
 * Uses Supabase Pro Plan image transformation API for optimized image delivery
 */

interface ImageTransformOptions {
  width?: number
  height?: number
  quality?: number
  resize?: 'cover' | 'contain' | 'fill'
  format?: 'origin' | 'webp' | 'avif'
}

/**
 * Generate an optimized image URL with transformation parameters
 * @param bucket - Storage bucket name
 * @param path - Image path within the bucket
 * @param options - Transformation options
 * @returns Optimized image URL with transformation query parameters
 */
export function getOptimizedImageUrl(
  bucket: string,
  path: string,
  options: ImageTransformOptions = {}
): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }
  
  const { width, height, quality = 80, resize = 'cover', format = 'webp' } = options
  
  // Build transformation query params
  const params = new URLSearchParams()
  if (width) params.set('width', width.toString())
  if (height) params.set('height', height.toString())
  params.set('quality', quality.toString())
  params.set('resize', resize)
  params.set('format', format)
  
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}?${params.toString()}`
}

/**
 * Get optimized avatar image URL (200x200, high quality)
 * @param path - Image path within the avatars bucket
 * @returns Optimized avatar URL
 */
export function getAvatarUrl(path: string): string {
  return getOptimizedImageUrl('avatars', path, {
    width: 200,
    height: 200,
    quality: 85,
    resize: 'cover',
    format: 'webp'
  })
}

/**
 * Get optimized thumbnail image URL (400x400)
 * @param bucket - Storage bucket name
 * @param path - Image path within the bucket
 * @returns Optimized thumbnail URL
 */
export function getThumbnailUrl(bucket: string, path: string): string {
  return getOptimizedImageUrl(bucket, path, {
    width: 400,
    height: 400,
    quality: 80,
    resize: 'cover',
    format: 'webp'
  })
}

/**
 * Get responsive image URLs for different screen sizes
 * @param bucket - Storage bucket name
 * @param path - Image path within the bucket
 * @returns Object with URLs for different sizes
 */
export function getResponsiveImageUrls(bucket: string, path: string) {
  return {
    small: getOptimizedImageUrl(bucket, path, { width: 400, height: 400, format: 'webp' }),
    medium: getOptimizedImageUrl(bucket, path, { width: 800, height: 800, format: 'webp' }),
    large: getOptimizedImageUrl(bucket, path, { width: 1200, height: 1200, format: 'webp' }),
    original: getOptimizedImageUrl(bucket, path, { format: 'origin' })
  }
}

