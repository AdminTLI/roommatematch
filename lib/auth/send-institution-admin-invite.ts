import type { SupabaseClient } from '@supabase/supabase-js'
import { readFile } from 'fs/promises'
import path from 'path'
import { getAcceptInvitationUrl } from '@/lib/auth/app-url'
import { getAdminInviteRedirectUrl } from '@/lib/auth/institution-invite'
import { promotePendingRoleAssignment } from '@/lib/auth/promote-pending-role-assignment'
import { sendEmail } from '@/lib/email/workflows'
import { safeLogger } from '@/lib/utils/logger'

export type InstitutionInviteMetadata = {
  invited_role: string
  invited_institution_id: string | null
  invited_first_name: string | null
  invited_last_name: string | null
}

export type SendInstitutionAdminInviteResult = {
  ok: boolean
  userId?: string
  error?: string
  /** Supabase Auth SMTP vs app Mailjet fallback for existing auth users */
  delivery?: 'supabase' | 'mailjet'
}

type LinkOtpType = 'magiclink' | 'recovery'

async function tryExistingUserInviteLink(
  admin: SupabaseClient,
  email: string,
  metadata: InstitutionInviteMetadata,
  verifyType: LinkOtpType,
  linkParams:
    | {
        type: 'magiclink'
        email: string
        options: { redirectTo: string; data: InstitutionInviteMetadata }
      }
    | {
        type: 'recovery'
        email: string
        options: { redirectTo: string }
      }
): Promise<SendInstitutionAdminInviteResult | null> {
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink(linkParams)

  if (linkError) {
    safeLogger.warn('[Admin] generateLink failed for existing user', {
      error: linkError,
      email,
      generateType: linkParams.type,
    })
    return null
  }

  const hashedToken = linkData?.properties?.hashed_token
  if (!hashedToken) {
    return null
  }

  const userId = linkData.user?.id
  if (userId) {
    await syncInviteMetadata(admin, userId, metadata)
    await promotePendingRoleAssignment(admin, userId, email)
  }

  const acceptUrl = `${getAcceptInvitationUrl()}?token_hash=${encodeURIComponent(hashedToken)}&type=${verifyType}`
  const sent = await sendBrandedInviteEmail(email, acceptUrl, metadata.invited_first_name)

  if (!sent) {
    return {
      ok: false,
      error:
        'Sign-in link was generated but the email could not be sent. Check Mailjet configuration.',
      delivery: 'mailjet',
    }
  }

  return { ok: true, userId, delivery: 'mailjet' }
}

function isExistingAuthUserError(message: string, code?: string): boolean {
  if (code === 'email_exists') return true
  const m = message.toLowerCase()
  return (
    m.includes('already') ||
    m.includes('registered') ||
    m.includes('exists') ||
    m.includes('user already')
  )
}

async function sendBrandedInviteEmail(
  email: string,
  acceptUrl: string,
  firstName: string | null
): Promise<boolean> {
  const templatePath = path.join(
    process.cwd(),
    'lib/email/templates/supabase/invite-user.html'
  )
  let html: string
  try {
    html = await readFile(templatePath, 'utf8')
  } catch {
    html = `<p>You have been invited to Domu Match. <a href="${acceptUrl}">Accept invitation</a></p>`
  }

  const brandedHtml = html
    .replace(
      /\{\{\s*\.SiteURL\s*\}\}\/auth\/accept-invitation\?token_hash=\{\{\s*\.TokenHash\s*\}\}&amp;type=invite/g,
      acceptUrl
    )
    .replace(/\{\{\s*\.Email\s*\}\}/g, email)
    .replace(/\{\{\s*\.SiteURL\s*\}\}/g, new URL(acceptUrl).origin)

  const greeting = firstName ? `Hi ${firstName},` : 'Hi,'
  const htmlWithGreeting = html.includes('{{ .Email }}')
    ? brandedHtml
    : `${greeting}<br/><br/>${brandedHtml}`

  return sendEmail(
    {
      to: email,
      subject: "You're invited to Domu Match",
      html: htmlWithGreeting,
      text: `You've been invited to Domu Match. Open this link to accept: ${acceptUrl}`,
    },
    { skipPlatformGate: true }
  )
}

async function syncInviteMetadata(
  admin: SupabaseClient,
  userId: string,
  metadata: InstitutionInviteMetadata
): Promise<void> {
  const { error } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: metadata,
  })
  if (error) {
    safeLogger.warn('[Admin] Failed to sync invite user_metadata', { error, userId })
  }
}

/**
 * Auth user already exists (partial invite, expired link, etc.).
 * `generateLink` type `invite` returns email_exists — use magiclink or recovery instead.
 */
async function sendExistingUserInstitutionInvite(
  admin: SupabaseClient,
  email: string,
  metadata: InstitutionInviteMetadata
): Promise<SendInstitutionAdminInviteResult> {
  const redirectTo = getAdminInviteRedirectUrl()

  const magiclinkResult = await tryExistingUserInviteLink(
    admin,
    email,
    metadata,
    'magiclink',
    { type: 'magiclink', email, options: { redirectTo, data: metadata } }
  )
  if (magiclinkResult) {
    return magiclinkResult
  }

  const recoveryResult = await tryExistingUserInviteLink(
    admin,
    email,
    metadata,
    'recovery',
    { type: 'recovery', email, options: { redirectTo } }
  )
  if (recoveryResult) {
    return recoveryResult
  }

  return {
    ok: false,
    error:
      'This email already has an account. We could not generate a new sign-in link — contact support or use a different email.',
    delivery: 'mailjet',
  }
}

/**
 * Send (or re-send) an institution admin invite.
 * Uses Supabase Auth email for new users; Mailjet + branded link when the auth user already exists.
 */
export async function sendInstitutionAdminInvite(
  admin: SupabaseClient,
  email: string,
  metadata: InstitutionInviteMetadata
): Promise<SendInstitutionAdminInviteResult> {
  const redirectTo = getAdminInviteRedirectUrl()

  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: metadata,
  })

  if (!inviteError) {
    const userId = inviteData?.user?.id
    if (userId) {
      await promotePendingRoleAssignment(admin, userId, email)
    }
    return { ok: true, userId, delivery: 'supabase' }
  }

  if (!isExistingAuthUserError(inviteError.message, inviteError.code)) {
    return { ok: false, error: inviteError.message, delivery: 'supabase' }
  }

  return sendExistingUserInstitutionInvite(admin, email, metadata)
}
