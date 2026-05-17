import type { ReactNode } from 'react'

export function SettingFieldHint({ children }: { children: ReactNode }) {
  return <p className="text-sm text-gray-500 dark:text-muted-foreground leading-relaxed">{children}</p>
}
