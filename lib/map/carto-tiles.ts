/**
 * CARTO basemap tile helpers for Leaflet (raster).
 * Appends the API key once; prefer non-retina templates to stay within monthly quota.
 */

const DEFAULT_RASTER_TEMPLATE =
  'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'

/** Strip key / retina markers so we control request volume in one place. */
function normalizeRasterTemplate(raw: string): string {
  let url = raw.trim()
  // Drop existing key query params; we re-append from env.
  url = url.replace(/([?&])key=[^&]*/gi, '$1').replace(/[?&]$/, '')
  // Prefer non-retina: remove {r} and @2x variants to avoid double tile requests.
  url = url.replace('{r}', '').replace('@2x', '')
  return url
}

function appendKey(url: string, key: string): string {
  if (!key) return url
  if (/[?&]key=/i.test(url)) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}key=${encodeURIComponent(key)}`
}

export function getCartoApiKey(): string {
  return (process.env.NEXT_PUBLIC_CARTO_API_KEY || '').trim()
}

/** Raster tile URL template for Leaflet L.tileLayer (includes key when set). */
export function getCartoRasterTileUrl(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_CARTO_RASTER_TILE_URL || '').trim()
  const template = normalizeRasterTemplate(fromEnv || DEFAULT_RASTER_TEMPLATE)
  return appendKey(template, getCartoApiKey())
}

/** Reserved for a future MapLibre migration; unused by Leaflet MapPane. */
export function getCartoVectorStyleUrl(): string | undefined {
  const style = (process.env.NEXT_PUBLIC_CARTO_VECTOR_STYLE_URL || '').trim()
  if (!style) return undefined
  return appendKey(style, getCartoApiKey())
}

export const CARTO_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

/** Leaflet TileLayer options tuned for fewer tile requests. */
export const CARTO_LEAFLET_TILE_OPTIONS = {
  attribution: CARTO_TILE_ATTRIBUTION,
  subdomains: 'abcd',
  maxNativeZoom: 18,
  maxZoom: 19,
  updateWhenZooming: false,
  updateWhenIdle: true,
  keepBuffer: 2,
} as const
