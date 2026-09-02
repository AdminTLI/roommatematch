import type { LabWishStatus } from './types'

export interface LabWishAdminRow {
  id: string
  university_id: string
  title: string
  body: string
  status: LabWishStatus
  focus_group_opt_in: boolean
  vote_count: number
  use_this_count: number
  report_count: number
  created_at: string
  updated_at: string
  merged_into_id?: string | null
}

export interface LabWishAdminAuthorFields {
  user_id: string
  author_email: string | null
  author_name: string | null
}

export type LabWishAdminResponse = LabWishAdminRow &
  Partial<LabWishAdminAuthorFields> & {
    can_view_authors?: boolean
  }

type WishDbRow = {
  id: string
  user_id: string
  university_id: string
  title: string
  body: string
  status: LabWishStatus
  focus_group_opt_in: boolean
  vote_count: number
  use_this_count: number
  created_at: string
  updated_at: string
  merged_into_id?: string | null
}

export function toLabWishAdminRow(
  wish: WishDbRow,
  reportCount = 0
): LabWishAdminRow {
  return {
    id: wish.id,
    university_id: wish.university_id,
    title: wish.title,
    body: wish.body,
    status: wish.status,
    focus_group_opt_in: wish.focus_group_opt_in,
    vote_count: wish.vote_count,
    use_this_count: wish.use_this_count,
    report_count: reportCount,
    created_at: wish.created_at,
    updated_at: wish.updated_at,
    merged_into_id: wish.merged_into_id ?? null,
  }
}

export function withLabWishAuthor(
  row: LabWishAdminRow,
  wish: Pick<WishDbRow, 'user_id'>,
  author: { email: string; name: string } | null
): LabWishAdminRow & LabWishAdminAuthorFields {
  return {
    ...row,
    user_id: wish.user_id,
    author_email: author?.email ?? null,
    author_name: author?.name ?? null,
  }
}
