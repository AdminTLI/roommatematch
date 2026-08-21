/**
 * Client-side diagnostic ring buffers for bug reports.
 * No screenshots — text/JSON only, size-capped.
 */

const MAX_ENTRIES = 30
const MAX_STRING = 500
const MAX_PAYLOAD_BYTES = 80_000

export type DiagnosticLogLevel = 'error' | 'warn' | 'uncaught' | 'unhandledrejection'

export interface DiagnosticLogEntry {
  ts: string
  level: DiagnosticLogLevel
  message: string
  stack?: string
}

export interface DiagnosticNetworkEntry {
  ts: string
  method: string
  url: string
  status: number
  statusText?: string
}

export interface BugDiagnosticsSnapshot {
  capturedAt: string
  url: string
  pathname: string
  search: string
  referrer: string
  userAgent: string
  language: string
  languages?: string[]
  platform: string
  viewport: { width: number; height: number }
  screen: { width: number; height: number; availWidth?: number; availHeight?: number }
  devicePixelRatio: number
  timezone: string
  online: boolean
  theme: string | null
  console: DiagnosticLogEntry[]
  network: DiagnosticNetworkEntry[]
  memory?: { jsHeapSizeLimit?: number; totalJSHeapSize?: number; usedJSHeapSize?: number }
  server?: Record<string, unknown>
}

let installed = false
const consoleBuffer: DiagnosticLogEntry[] = []
const networkBuffer: DiagnosticNetworkEntry[] = []

function pushRing<T>(buf: T[], item: T, max = MAX_ENTRIES) {
  buf.push(item)
  if (buf.length > max) buf.splice(0, buf.length - max)
}

function truncate(s: unknown, max = MAX_STRING): string {
  const str = typeof s === 'string' ? s : String(s ?? '')
  return str.length > max ? `${str.slice(0, max)}…` : str
}

function formatArgs(args: unknown[]): string {
  return args
    .map((a) => {
      if (a instanceof Error) return `${a.name}: ${a.message}`
      if (typeof a === 'object' && a !== null) {
        try {
          return truncate(JSON.stringify(a))
        } catch {
          return truncate(String(a))
        }
      }
      return truncate(a)
    })
    .join(' ')
}

export function installBugDiagnosticsCapture(): () => void {
  if (typeof window === 'undefined' || installed) {
    return () => {}
  }
  installed = true

  const originalError = console.error.bind(console)
  const originalWarn = console.warn.bind(console)

  console.error = (...args: unknown[]) => {
    pushRing(consoleBuffer, {
      ts: new Date().toISOString(),
      level: 'error',
      message: formatArgs(args),
      stack: args.find((a) => a instanceof Error)?.stack
        ? truncate((args.find((a) => a instanceof Error) as Error).stack, 1000)
        : undefined,
    })
    originalError(...args)
  }

  console.warn = (...args: unknown[]) => {
    pushRing(consoleBuffer, {
      ts: new Date().toISOString(),
      level: 'warn',
      message: formatArgs(args),
    })
    originalWarn(...args)
  }

  const onError = (event: ErrorEvent) => {
    pushRing(consoleBuffer, {
      ts: new Date().toISOString(),
      level: 'uncaught',
      message: truncate(event.message || 'Uncaught error'),
      stack: event.error?.stack ? truncate(event.error.stack, 1000) : undefined,
    })
  }

  const onRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason
    const message =
      reason instanceof Error
        ? `${reason.name}: ${reason.message}`
        : truncate(reason)
    pushRing(consoleBuffer, {
      ts: new Date().toISOString(),
      level: 'unhandledrejection',
      message,
      stack: reason instanceof Error && reason.stack ? truncate(reason.stack, 1000) : undefined,
    })
  }

  window.addEventListener('error', onError)
  window.addEventListener('unhandledrejection', onRejection)

  const originalFetch = window.fetch.bind(window)
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase()
    let url = ''
    try {
      if (typeof input === 'string') url = input
      else if (input instanceof URL) url = input.toString()
      else if (input instanceof Request) url = input.url
    } catch {
      url = '[unknown]'
    }

    try {
      const response = await originalFetch(input, init)
      if (response.status >= 400) {
        pushRing(networkBuffer, {
          ts: new Date().toISOString(),
          method,
          url: truncate(url, 300),
          status: response.status,
          statusText: truncate(response.statusText, 100),
        })
      }
      return response
    } catch (err) {
      pushRing(networkBuffer, {
        ts: new Date().toISOString(),
        method,
        url: truncate(url, 300),
        status: 0,
        statusText: err instanceof Error ? truncate(err.message) : 'network_error',
      })
      throw err
    }
  }

  return () => {
    console.error = originalError
    console.warn = originalWarn
    window.removeEventListener('error', onError)
    window.removeEventListener('unhandledrejection', onRejection)
    window.fetch = originalFetch
    installed = false
  }
}

function getTheme(): string | null {
  if (typeof document === 'undefined') return null
  const root = document.documentElement
  return (
    root.getAttribute('data-theme') ||
    root.getAttribute('data-mode') ||
    (root.classList.contains('dark') ? 'dark' : root.classList.contains('light') ? 'light' : null)
  )
}

function getMemory(): BugDiagnosticsSnapshot['memory'] | undefined {
  try {
    const perf = performance as Performance & {
      memory?: { jsHeapSizeLimit: number; totalJSHeapSize: number; usedJSHeapSize: number }
    }
    if (!perf.memory) return undefined
    return {
      jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
      totalJSHeapSize: perf.memory.totalJSHeapSize,
      usedJSHeapSize: perf.memory.usedJSHeapSize,
    }
  } catch {
    return undefined
  }
}

export function collectBugDiagnosticsSnapshot(): BugDiagnosticsSnapshot {
  const loc = typeof window !== 'undefined' ? window.location : null
  const nav = typeof navigator !== 'undefined' ? navigator : null

  return {
    capturedAt: new Date().toISOString(),
    url: loc?.href ?? '',
    pathname: loc?.pathname ?? '',
    search: loc?.search ?? '',
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    userAgent: nav?.userAgent ?? '',
    language: nav?.language ?? '',
    languages: nav?.languages ? Array.from(nav.languages).slice(0, 8) : undefined,
    platform: nav?.platform ?? '',
    viewport: {
      width: typeof window !== 'undefined' ? window.innerWidth : 0,
      height: typeof window !== 'undefined' ? window.innerHeight : 0,
    },
    screen: {
      width: typeof screen !== 'undefined' ? screen.width : 0,
      height: typeof screen !== 'undefined' ? screen.height : 0,
      availWidth: typeof screen !== 'undefined' ? screen.availWidth : undefined,
      availHeight: typeof screen !== 'undefined' ? screen.availHeight : undefined,
    },
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    timezone: (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone
      } catch {
        return ''
      }
    })(),
    online: nav?.onLine ?? true,
    theme: getTheme(),
    console: consoleBuffer.slice(-MAX_ENTRIES),
    network: networkBuffer.slice(-MAX_ENTRIES),
    memory: getMemory(),
  }
}

/** Ensure payload stays under size cap by trimming buffers if needed. */
export function capDiagnosticsPayload(snapshot: BugDiagnosticsSnapshot): BugDiagnosticsSnapshot {
  let result = { ...snapshot, console: [...snapshot.console], network: [...snapshot.network] }
  let json = JSON.stringify(result)

  while (json.length > MAX_PAYLOAD_BYTES && (result.console.length > 0 || result.network.length > 0)) {
    if (result.console.length >= result.network.length && result.console.length > 0) {
      result.console.shift()
    } else if (result.network.length > 0) {
      result.network.shift()
    } else {
      break
    }
    json = JSON.stringify(result)
  }

  if (json.length > MAX_PAYLOAD_BYTES) {
    result = {
      ...result,
      console: result.console.slice(-5),
      network: result.network.slice(-5),
    }
  }

  return result
}
