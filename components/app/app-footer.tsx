'use client'

export function AppFooter() {
  return (
    <footer className="w-full border-t border-border bg-bg-surface py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © 2026 Domu Match. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a 
              href="/privacy" 
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </a>
            <a 
              href="/terms" 
              className="hover:text-foreground transition-colors"
            >
              Terms
            </a>
            <a 
              href="/accessibility" 
              className="hover:text-foreground transition-colors"
            >
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

