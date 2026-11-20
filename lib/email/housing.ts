/**
 * Housing marketplace transactional emails (Mailjet via sendEmail + Domu layout).
 */

import { sendEmail } from './workflows'
import { renderEmailLayout, renderButton, escapeHtml, nlToBr } from './layout'
import { URLS } from './brand'

const p = (text: string) =>
  `<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:#334155;">${text}</p>`

const h1 = (text: string) =>
  `<h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:1.3;color:#0f172a;font-weight:700;">${escapeHtml(text)}</h1>`

async function sendHousingEmail(opts: {
  to: string
  subject: string
  preheader: string
  title: string
  bodyHtml: string
}): Promise<boolean> {
  const html = renderEmailLayout({
    preheader: opts.preheader,
    title: opts.subject,
    bodyHtml: `${h1(opts.title)}${opts.bodyHtml}`,
    recipientEmail: opts.to,
  })
  const text = opts.preheader
  return sendEmail({ to: opts.to, subject: opts.subject, html, text }, { skipPlatformGate: true })
}

export async function emailHostNewApplication(opts: {
  to: string
  listingTitle: string
  scorePct: number
  isGroup?: boolean
  groupSize?: number
}) {
  const subject = opts.isGroup
    ? `Group application (${opts.groupSize ?? ''} people) for ${opts.listingTitle}`
    : `New compatible applicant for ${opts.listingTitle}`
  return sendHousingEmail({
    to: opts.to,
    subject,
    preheader: `New application ranked ${opts.scorePct}% fit. Identity hidden until you make an offer.`,
    title: 'New application',
    bodyHtml: [
      p(
        `You have a new ${opts.isGroup ? 'group ' : ''}application for <strong>${escapeHtml(opts.listingTitle)}</strong> ranked <strong>${opts.scorePct}%</strong> fit.`
      ),
      p(
        'Review the anonymous compatibility breakdown in your dashboard. Identity stays hidden until you make an offer.'
      ),
      renderButton('Review applications', `${URLS.app}/host/applications`),
    ].join(''),
  })
}

export async function emailStudentApplicationReceived(opts: {
  to: string
  listingTitle: string
}) {
  return sendHousingEmail({
    to: opts.to,
    subject: `We sent your application for ${opts.listingTitle}`,
    preheader: 'The host sees compatibility only, not your name or photo, until they make an offer.',
    title: 'Application sent',
    bodyHtml: [
      p(
        `Your application for <strong>${escapeHtml(opts.listingTitle)}</strong> is in. The host sees compatibility only until they make an offer.`
      ),
      renderButton('Track application', `${URLS.app}/housing/applications`),
    ].join(''),
  })
}

export async function emailStudentShortlisted(opts: { to: string; listingTitle: string }) {
  return sendHousingEmail({
    to: opts.to,
    subject: `You’ve been shortlisted for ${opts.listingTitle}`,
    preheader: 'The host shortlisted you based on compatibility.',
    title: 'Shortlisted',
    bodyHtml: [
      p(
        `Good news: you’ve been shortlisted for <strong>${escapeHtml(opts.listingTitle)}</strong>. We’ll notify you about viewings or an offer.`
      ),
      renderButton('View status', `${URLS.app}/housing/applications`),
    ].join(''),
  })
}

export async function emailViewingRequestedHost(opts: {
  to: string
  listingTitle: string
  datetime: string
}) {
  return sendHousingEmail({
    to: opts.to,
    subject: `Viewing request for ${opts.listingTitle}`,
    preheader: `An applicant requested ${opts.datetime}.`,
    title: 'Viewing request',
    bodyHtml: [
      p(
        `An applicant requested a viewing for <strong>${escapeHtml(opts.listingTitle)}</strong> on <strong>${escapeHtml(opts.datetime)}</strong>. Confirm or propose another slot.`
      ),
      renderButton('Manage viewing', `${URLS.app}/host/viewings`),
    ].join(''),
  })
}

export async function emailViewingInviteStudent(opts: {
  to: string
  listingTitle: string
  datetime: string
}) {
  return sendHousingEmail({
    to: opts.to,
    subject: `Viewing invite: ${opts.listingTitle} on ${opts.datetime}`,
    preheader: 'Confirm attendance. Your full profile stays hidden in-app until an offer.',
    title: 'Viewing invite',
    bodyHtml: [
      p(
        `You’re invited to view <strong>${escapeHtml(opts.listingTitle)}</strong> on <strong>${escapeHtml(opts.datetime)}</strong>. Your full profile stays hidden in-app until an offer.`
      ),
      renderButton('Manage viewing', `${URLS.app}/housing/viewings`),
    ].join(''),
  })
}

export async function emailOfferReceived(opts: { to: string; listingTitle: string }) {
  return sendHousingEmail({
    to: opts.to,
    subject: `Offer for ${opts.listingTitle}`,
    preheader: 'Profiles are now shared so you can decide. This is not a legal lease.',
    title: 'You received an offer',
    bodyHtml: [
      p(
        `The host made an offer on <strong>${escapeHtml(opts.listingTitle)}</strong>. Profiles are now shared so you can decide. This is not a legal lease.`
      ),
      renderButton('Review offer', `${URLS.app}/housing/applications`),
    ].join(''),
  })
}

export async function emailOfferAcceptedHost(opts: { to: string; listingTitle: string }) {
  return sendHousingEmail({
    to: opts.to,
    subject: `${opts.listingTitle}: your offer was accepted`,
    preheader: 'Next steps: share lease process off-platform as needed. Domu is not your rental agency.',
    title: 'Offer accepted',
    bodyHtml: [
      p(
        `Great news: your offer for <strong>${escapeHtml(opts.listingTitle)}</strong> was accepted. Domu Match is not a rental agency; continue the lease process directly as appropriate.`
      ),
      renderButton('Open listing', `${URLS.app}/host/listings`),
    ].join(''),
  })
}

export async function emailStudentNotSelected(opts: { to: string; listingTitle: string }) {
  return sendHousingEmail({
    to: opts.to,
    subject: `Update on ${opts.listingTitle}`,
    preheader: 'The host moved forward with other applicants.',
    title: 'Application update',
    bodyHtml: [
      p(
        `The host moved forward with other applicants for <strong>${escapeHtml(opts.listingTitle)}</strong>. Keep applying. Verified profiles and group applications tend to convert better.`
      ),
      renderButton('Browse more listings', `${URLS.app}/housing`),
    ].join(''),
  })
}

export async function emailGroupListingPinned(opts: {
  to: string
  memberName: string
  listingTitle: string
}) {
  return sendHousingEmail({
    to: opts.to,
    subject: `${opts.memberName} pinned ${opts.listingTitle} for the group`,
    preheader: 'Vote so your group can apply together.',
    title: 'Listing pinned',
    bodyHtml: [
      p(
        `<strong>${escapeHtml(opts.memberName)}</strong> pinned <strong>${escapeHtml(opts.listingTitle)}</strong>. Everyone must approve before you can apply as a group.`
      ),
      renderButton('Open chat', `${URLS.app}/chat`),
    ].join(''),
  })
}

export async function emailGroupVoteNeeded(opts: { to: string; listingTitle: string }) {
  return sendHousingEmail({
    to: opts.to,
    subject: `Vote to apply: ${opts.listingTitle}`,
    preheader: 'Everyone must approve before the group can apply.',
    title: 'Your vote is needed',
    bodyHtml: [
      p(
        `Cast your vote on <strong>${escapeHtml(opts.listingTitle)}</strong>. Everyone must approve before the group can apply.`
      ),
      renderButton('Vote now', `${URLS.app}/chat`),
    ].join(''),
  })
}

export async function emailGroupUnanimousReady(opts: { to: string; listingTitle: string }) {
  return sendHousingEmail({
    to: opts.to,
    subject: `Your group agreed on ${opts.listingTitle}`,
    preheader: 'Submit your group application when ready.',
    title: 'Ready to apply',
    bodyHtml: [
      p(
        `Your group unanimously approved <strong>${escapeHtml(opts.listingTitle)}</strong>. Submit the group application when you’re ready.`
      ),
      renderButton('Submit group application', `${URLS.app}/housing`),
    ].join(''),
  })
}

// silence unused import if tree-shaken oddly
void nlToBr
