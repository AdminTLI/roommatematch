/** Shared window to skip notification realtime invalidations during bulk mark-all-read. */
let suppressUntil = 0

export function bumpNotificationInvalidateSuppress(ms = 10_000) {
  suppressUntil = Math.max(suppressUntil, Date.now() + ms)
}

export function shouldSuppressNotificationInvalidate() {
  return Date.now() < suppressUntil
}

export function clearNotificationInvalidateSuppress() {
  suppressUntil = 0
}
