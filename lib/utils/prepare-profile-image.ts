/**
 * Client-side profile image prep for mobile uploads.
 * iPhone gallery photos are often HEIC and/or larger than Vercel's ~4.5MB body limit,
 * which otherwise fails before our API can return a useful error.
 */

const MAX_DIMENSION = 1600
const MAX_BYTES = 4 * 1024 * 1024 // stay under Vercel/serverless request body limits
const OUTPUT_TYPE = 'image/jpeg'
const OUTPUT_EXTENSION = 'jpg'

function extensionOf(name: string): string {
  const parts = name.split('.')
  return parts.length > 1 ? parts[parts.length - 1]!.toLowerCase() : ''
}

function isProbablyImage(file: File): boolean {
  if (file.type.startsWith('image/')) return true
  const ext = extensionOf(file.name)
  return ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'gif', 'tif', 'tiff'].includes(ext)
}

async function loadImageBitmap(file: File): Promise<ImageBitmap> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file)
    } catch {
      // Fall through to HTMLImageElement (some iOS HEIC cases)
    }
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Could not decode this image. Try a JPEG or PNG photo.'))
      el.src = objectUrl
    })
    return await createImageBitmap(img)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not process this image. Try a JPEG or PNG photo.'))
          return
        }
        resolve(blob)
      },
      OUTPUT_TYPE,
      quality
    )
  })
}

/**
 * Decode, downscale, and re-encode as JPEG under the upload size budget.
 */
export async function prepareProfileImage(file: File): Promise<File> {
  if (!isProbablyImage(file)) {
    throw new Error('Please choose a photo (JPEG, PNG, WebP, or HEIC).')
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await loadImageBitmap(file)
  } catch {
    throw new Error(
      'Could not read this photo. If it is an HEIC image, try exporting it as JPEG, or pick another photo.'
    )
  }

  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not process this image on this device.')
    }
    ctx.drawImage(bitmap, 0, 0, width, height)

    let quality = 0.85
    let blob = await canvasToBlob(canvas, quality)
    while (blob.size > MAX_BYTES && quality > 0.45) {
      quality -= 0.1
      blob = await canvasToBlob(canvas, quality)
    }

    if (blob.size > MAX_BYTES) {
      throw new Error('Photo is still too large after compression. Please choose a smaller image.')
    }

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'profile'
    return new File([blob], `${baseName}.${OUTPUT_EXTENSION}`, {
      type: OUTPUT_TYPE,
      lastModified: Date.now(),
    })
  } finally {
    bitmap.close()
  }
}
