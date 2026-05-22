/** Normalize Supabase nested `users!inner(email)` join shapes (object or array). */
export type JoinedUserEmail = { email: string } | { email: string }[] | null | undefined

export function joinedUserEmail(users: JoinedUserEmail): string | undefined {
  if (users == null) return undefined
  if (Array.isArray(users)) return users[0]?.email
  return users.email
}
