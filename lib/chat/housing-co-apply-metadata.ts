export const HOUSING_CO_APPLY_MESSAGE_TYPE = 'housing_co_apply' as const

export type HousingCoApplyMessageMetadata = {
  type: typeof HOUSING_CO_APPLY_MESSAGE_TYPE
  listing_id: string
  listing_title: string
  listing_city: string | null
  listing_rent_monthly: number | null
  listing_photo: string | null
  application_id: string
  applicant_id: string
  applicant_name: string | null
  group_size: number
}

export function isHousingCoApplyMetadata(
  value: unknown
): value is HousingCoApplyMessageMetadata {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    v.type === HOUSING_CO_APPLY_MESSAGE_TYPE &&
    typeof v.listing_id === 'string' &&
    typeof v.application_id === 'string'
  )
}

export function housingCoApplyPreviewText(
  meta: Pick<HousingCoApplyMessageMetadata, 'listing_title' | 'applicant_name'>
): string {
  const who = meta.applicant_name?.trim() || 'Someone'
  const place = meta.listing_title?.trim() || 'a listing'
  return `${who} applied for “${place}” with you`
}
