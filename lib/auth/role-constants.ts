/**
 * Client-safe role constants & types.
 *
 * Lives in its own file so client components can import `UserRole`,
 * `ROLE_LABELS`, etc. without pulling in `lib/auth/roles.ts` (which depends
 * on the server-only Supabase admin client through `lib/supabase/server`).
 */

export type UserRole = 'user' | 'admin' | 'super_admin' | 'moderator' | 'university_admin'

export const ELEVATED_ROLES: ReadonlyArray<Exclude<UserRole, 'user'>> = [
  'admin',
  'super_admin',
  'moderator',
  'university_admin',
] as const

export const ROLE_LABELS: Record<UserRole, string> = {
  user: 'User',
  admin: 'Admin',
  super_admin: 'Super Admin',
  moderator: 'Moderator',
  university_admin: 'University Admin',
}
