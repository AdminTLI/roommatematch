'use client'

import { Toaster } from 'sonner'
import { useTheme } from 'next-themes'

/** Sonner toasts synced with next-themes so copy stays readable in dark mode. */
export function AppToaster() {
  const { resolvedTheme } = useTheme()

  return (
    <Toaster
      position="top-right"
      richColors
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      toastOptions={{
        classNames: {
          toast:
            'dark:!bg-slate-900 dark:!text-slate-50 dark:!border-white/10 [&_[data-description]]:dark:!text-slate-300',
        },
      }}
    />
  )
}
