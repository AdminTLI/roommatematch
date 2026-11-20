import type { SupabaseClient } from '@supabase/supabase-js'
import { ensureDirectChat } from '@/lib/chat/ensure-direct-chat'
import {
  housingCoApplyPreviewText,
  type HousingCoApplyMessageMetadata,
} from '@/lib/chat/housing-co-apply-metadata'
import { safeLogger } from '@/lib/utils/logger'

type HousingCoApplyDmPayload = {
  listingId: string
  listingTitle: string
  listingCity: string | null
  listingRentMonthly: number | null
  listingPhoto: string | null
  applicationId: string
  applicantId: string
  applicantName: string | null
  groupSize: number
  coApplicantIds: string[]
}

/**
 * When someone applies to a listing with selected people (not via an existing
 * unanimous group chat), post an interactive card into each co-applicant's DM
 * with the applicant — same pattern as group invite cards.
 */
export async function sendHousingCoApplyDirectMessages(
  admin: SupabaseClient,
  payload: HousingCoApplyDmPayload
): Promise<void> {
  const recipients = [...new Set(payload.coApplicantIds)].filter(
    (id) => id && id !== payload.applicantId
  )

  for (const recipientId of recipients) {
    try {
      const { chatId: dmChatId } = await ensureDirectChat(
        admin,
        payload.applicantId,
        recipientId,
        {
          createdBy: payload.applicantId,
          welcome: true,
        }
      )

      const metadata: HousingCoApplyMessageMetadata = {
        type: 'housing_co_apply',
        listing_id: payload.listingId,
        listing_title: payload.listingTitle,
        listing_city: payload.listingCity,
        listing_rent_monthly: payload.listingRentMonthly,
        listing_photo: payload.listingPhoto,
        application_id: payload.applicationId,
        applicant_id: payload.applicantId,
        applicant_name: payload.applicantName,
        group_size: payload.groupSize,
      }

      const { error } = await admin.from('messages').insert({
        chat_id: dmChatId,
        user_id: payload.applicantId,
        content: housingCoApplyPreviewText(metadata),
        metadata,
      })

      if (error) {
        safeLogger.warn('Failed to insert housing co-apply DM', {
          error,
          dmChatId,
          recipientId,
        })
      }
    } catch (err) {
      safeLogger.warn('Failed to send housing co-apply DM', {
        error: err,
        recipientId,
        listingId: payload.listingId,
      })
    }
  }
}
