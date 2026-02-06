'use client'

export function AppFooter() {
  return (
    <footer className="w-full bg-white dark:bg-[#0f172a] px-4 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-center">
      <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 min-h-[44px] md:min-h-[56px]">
        <p className="text-sm text-foreground/70 dark:text-foreground/70 whitespace-nowrap text-center sm:text-left">
          © 2026 Domu Match. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-sm flex-shrink-0">
          <a 
            href="/privacy" 
            className="text-foreground/70 dark:text-foreground/70 hover:text-foreground dark:hover:text-foreground transition-colors whitespace-nowrap"
          >
            Privacy
          </a>
          <a 
            href="/terms" 
            className="text-foreground/70 dark:text-foreground/70 hover:text-foreground dark:hover:text-foreground transition-colors whitespace-nowrap"
          >
            Terms
          </a>
          <a 
            href="/accessibility" 
            className="text-foreground/70 dark:text-foreground/70 hover:text-foreground dark:hover:text-foreground transition-colors whitespace-nowrap"
          >
            Accessibility
          </a>
        </div>
      </div>
    </footer>
  )
}

