export interface ProfileAccessFlags {
  details_revealed_by_requestor: boolean
  picture_revealed_by_requestor: boolean
}

export interface ChatPrivacySnapshot {
  chat_id: string
  partner_user_id: string | null
  messages_exchanged_count: number
  /** @deprecated Legacy field; always false. Profile details are visible by default in 1:1 chats. */
  show_reveal_prompt: boolean
  viewer: ProfileAccessFlags
  partner: ProfileAccessFlags
  mutual_details: boolean
  mutual_picture: boolean
  /** True when the viewer has uploaded a private profile photo in Settings */
  viewer_has_uploaded_picture: boolean
  /** True when the chat partner has uploaded a private profile photo */
  partner_has_uploaded_picture: boolean
  partner_avatar_url: string | null
  partner_picture_signed_url: string | null
  partner_display_name: string
  /** How the current user appears to their match (programmatic avatar until mutual photo sharing) */
  viewer_avatar_url: string
}
