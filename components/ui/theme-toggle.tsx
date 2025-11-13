'use client'

import { Button } from '@/components/ui/button'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/theme/theme-provider'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'lg' | 'md'
}

export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={toggleTheme}
      className={cn("min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0", className)}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-text-primary" />
      ) : (
        <Sun className="h-5 w-5 text-text-primary" />
      )}
    </Button>
  )
}
