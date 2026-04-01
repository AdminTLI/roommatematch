'use client'

import { Telescope } from 'lucide-react'

/**
 * Shown on student and professional welcome pages next to special-category guidance.
 * Explains the telescope / “this topic matters more to me” optional tick used later in the questionnaire.
 */
export function WelcomeLensOnFutureCallout() {
  return (
    <div className="mt-5 space-y-3 rounded-2xl border border-sky-500/25 bg-[linear-gradient(105deg,rgba(14,165,233,0.08)_0%,transparent_50%)] px-4 py-4 dark:border-sky-400/20 dark:bg-[linear-gradient(105deg,rgba(56,189,248,0.1)_0%,transparent_55%)]">
      <h3 className="text-base font-semibold tracking-tight text-text-primary">Lens of The Future</h3>
      <div className="flex gap-3">
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sky-500/25 bg-sky-500/10 dark:bg-sky-400/15"
          aria-hidden
        >
          <Telescope className="h-4 w-4 text-sky-700 dark:text-sky-300" />
        </span>
        <p className="m-0 min-w-0 flex-1 text-sm leading-relaxed text-text-primary/90 sm:text-[15px]">
          When you see this icon beside a question later on, you can optionally tick &quot;This topic matters more to
          me.&quot; That is completely voluntary. It only helps us learn which questions feel most important so we can
          refine the questionnaire in the future. It does not affect your compatibility score, and you never have to use
          it.
        </p>
      </div>
    </div>
  )
}
