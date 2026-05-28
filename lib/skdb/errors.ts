export class SkdbApiAuthError extends Error {
  readonly status = 401

  constructor(message: string, hints: string[] = []) {
    super(
      hints.length > 0
        ? [message, ...hints.map((h) => `  • ${h}`)].join('\n')
        : message
    )
    this.name = 'SkdbApiAuthError'
  }
}
