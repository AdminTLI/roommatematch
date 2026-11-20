/** Dutch / European formatting helpers for the housing experience */

const LOCALE = 'nl-NL'

/** 1200 → "1.200" */
export function formatNlNumber(value: number): string {
  if (!Number.isFinite(value)) return ''
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 }).format(
    value
  )
}

/** 1200 → "€ 1.200" (no decimals for whole euros) */
export function formatNlEuro(value: number, options?: { decimals?: boolean }): string {
  if (!Number.isFinite(value)) return ''
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: options?.decimals ? 2 : 0,
    maximumFractionDigits: options?.decimals ? 2 : 0,
  }).format(value)
}

/** Compact chip/summary: "€1.200" without the narrow space Intl sometimes inserts */
export function formatNlEuroCompact(value: number): string {
  return formatNlEuro(value).replace(/\u00a0/g, '').replace(/\s/g, '')
}

/** ISO date → "10 nov 2026" */
export function formatNlDate(
  iso?: string | null,
  options?: Intl.DateTimeFormatOptions
): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

/** Short range label: "10 nov – 1 dec" */
export function formatNlDateShort(iso: string): string {
  return (
    formatNlDate(iso, { day: 'numeric', month: 'short', year: undefined }) ||
    iso
  )
}

export function formatPriceRangeLabel(
  min?: number,
  max?: number
): string | undefined {
  if (min == null && max == null) return undefined
  if (min != null && max != null) {
    return `${formatNlEuroCompact(min)}–${formatNlEuroCompact(max)}`
  }
  if (min != null) return `From ${formatNlEuroCompact(min)}`
  return `Up to ${formatNlEuroCompact(max!)}`
}
