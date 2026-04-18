export interface ProfileAccessFlags {
  details_revealed_by_requestor: boolean
  picture_revealed_by_requestor: boolean
}

export interface ChatPrivacySnapshot {
  chat_id: string
  partner_user_id: string | null
  messages_exchanged_count: number
  /** True after 10 alternating messages and before both users have revealed details */
  show_reveal_prompt: boolean
  viewer: ProfileAccessFlags
  partner: ProfileAccessFlags
  mutual_details: boolean
  mutual_picture: boolean
  partner_avatar_url: string | null
  partner_picture_signed_url: string | null
  partner_display_name: string
  /** How the current user appears to their match (programmatic or signed self-photo when mirrored rules apply) */
  viewer_avatar_url: string
}
