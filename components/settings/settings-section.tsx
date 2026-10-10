import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Shared settings typography + spacing for the borderless layout.
 * Page title → tab title → section heading → field label → value / caption.
 */
export function SettingsSection({
  title,
  description,
  children,
  className,
  tone = 'default',
}: {
  title: string
  description?: ReactNode
  children: ReactNode
  className?: string
  tone?: 'default' | 'danger'
}) {
  return (
    <section className={cn('space-y-5 py-10 first:pt-0 last:pb-0', className)}>
      <header className="space-y-1.5">
        <h3
          className={cn(
            'text-lg font-semibold tracking-tight',
            tone === 'danger'
              ? 'text-red-600 dark:text-red-400'
              : 'text-zinc-900 dark:text-white'
          )}
        >
          {title}
        </h3>
        {description ? (
          <div className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {description}
          </div>
        ) : null}
      </header>
      {children}
    </section>
  )
}

export const settingsFieldLabelClass =
  'text-sm font-medium text-zinc-500 dark:text-zinc-400'

export const settingsFieldValueClass =
  'text-sm text-zinc-900 dark:text-zinc-100'

export const settingsEditableLabelClass =
  'text-sm font-medium text-zinc-800 dark:text-zinc-200'

export const settingsCaptionClass =
  'text-sm leading-relaxed text-zinc-500 dark:text-zinc-400'

export const settingsToggleLabelClass =
  'text-sm font-medium text-zinc-900 dark:text-white'

export const settingsToggleDescClass =
  'text-sm leading-relaxed text-zinc-500 dark:text-zinc-400'
