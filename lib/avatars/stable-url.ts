function isProgrammaticAvatarUrl(url: string): boolean {
  return url.includes("/api/avatar/programmatic")
}

/**
 * Prefer the previous avatar URL when the next value is missing (transient refetch gaps).
 * Never replace a real photo with a programmatic avatar — privacy/profile refetches
 * often briefly return only the DiceBear URL and would otherwise flicker two faces.
 */
export function preferStableAvatarUrl(
  previous: string | undefined,
  next: string | undefined,
): string | undefined {
  if (!next) return previous
  if (!previous) return next
  if (isProgrammaticAvatarUrl(next) && !isProgrammaticAvatarUrl(previous)) {
    return previous
  }
  return next
}
