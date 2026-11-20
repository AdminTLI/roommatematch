-- Per-chat member settings for group chats (mute + share photo in this chat only)
ALTER TABLE public.chat_members
  ADD COLUMN IF NOT EXISTS muted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_picture boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.chat_members.muted IS
  'When true, this member suppresses notifications for this chat.';
COMMENT ON COLUMN public.chat_members.share_picture IS
  'When true, this member shares their uploaded profile photo with other members of this chat only.';

CREATE INDEX IF NOT EXISTS idx_chat_members_chat_share_picture
  ON public.chat_members (chat_id)
  WHERE share_picture = true AND status = 'active';
