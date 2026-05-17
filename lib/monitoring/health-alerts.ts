import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/workflows'
import { safeLogger } from '@/lib/utils/logger'
import type { HealthServiceKey, HealthStatus } from '@/lib/monitoring/system-health'

interface EvaluateHealthAlertsInput {
  service: HealthServiceKey
  label: string
  status: HealthStatus
  statusReason: string
  firstNonGreenAt: string | null
  lastAlertSentAt: string | null
}

function getAlertAfterMinutes(): number {
  const raw = process.env.SYSTEM_HEALTH_ALERT_AFTER_MINUTES
  const parsed = raw ? parseInt(raw, 10) : 5
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5
}

function getOpsAlertEmails(): string[] {
  const raw = process.env.OPS_ALERT_EMAIL ?? ''
  return raw
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)
}

function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    'https://domumatch.com'
  ).replace(/\/$/, '')
}

export async function evaluateHealthAlerts(
  input: EvaluateHealthAlertsInput
): Promise<void> {
  const { getPlatformSettings } = await import('@/lib/platform-settings')
  const platformSettings = await getPlatformSettings()
  const emailEnabled =
    platformSettings.adminAlertsEnabled && process.env.ALERTS_EMAIL_ENABLED === 'true'
  const recipients = getOpsAlertEmails()

  if (!emailEnabled || recipients.length === 0) {
    return
  }

  const admin = createAdminClient()
  const now = new Date()

  if (input.status === 'online') {
    await admin
      .from('system_health_state')
      .update({
        first_non_green_at: null,
        last_alert_sent_at: null,
        updated_at: now.toISOString(),
      })
      .eq('service', input.service)
    return
  }

  if (!input.firstNonGreenAt) {
    return
  }

  const nonGreenSince = new Date(input.firstNonGreenAt)
  const minutesNonGreen = (now.getTime() - nonGreenSince.getTime()) / 60000
  const alertAfterMinutes = getAlertAfterMinutes()

  if (minutesNonGreen < alertAfterMinutes) {
    return
  }

  if (input.lastAlertSentAt) {
    return
  }

  const logsUrl = `${getAppBaseUrl()}/admin/logs`
  const subject = `[Domu Match] ${input.label} is ${input.status}`
  const html = `
    <h2>System health alert</h2>
    <p><strong>Service:</strong> ${input.label}</p>
    <p><strong>Status:</strong> ${input.status}</p>
    <p><strong>Reason:</strong> ${input.statusReason}</p>
    <p><strong>Non-green since:</strong> ${input.firstNonGreenAt}</p>
    <p><a href="${logsUrl}">View operations log</a></p>
  `
  const text = [
    `System health alert`,
    `Service: ${input.label}`,
    `Status: ${input.status}`,
    `Reason: ${input.statusReason}`,
    `Non-green since: ${input.firstNonGreenAt}`,
    `Logs: ${logsUrl}`,
  ].join('\n')

  for (const to of recipients) {
    await sendEmail({ to, subject, html, text }, { skipPlatformGate: true })
  }

  await admin
    .from('system_health_state')
    .update({
      last_alert_sent_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('service', input.service)

  safeLogger.info('[SystemHealth] Alert email sent', {
    service: input.service,
    status: input.status,
    recipients: recipients.length,
  })
}
