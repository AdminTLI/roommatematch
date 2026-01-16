'use client'

import { Button } from '@/components/ui/button'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'lg' | 'md'
}

export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  // Render placeholder during SSR and initial hydration to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size={size}
        className={cn("min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0", className)}
        aria-label="Toggle theme"
        disabled
      >
        <Moon className="h-5 w-5 text-text-primary dark:text-white" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={toggleTheme}
      className={cn("min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0", className)}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-text-primary dark:text-white" />
      ) : (
        <Sun className="h-5 w-5 text-text-primary dark:text-white" />
      )}
    </Button>
  )
}
